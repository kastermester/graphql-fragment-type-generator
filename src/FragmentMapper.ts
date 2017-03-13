import * as AggregateError from 'aggregate-error';
import {
	validate,
	visit,
	visitWithTypeInfo,
	DocumentNode,
	FieldNode,
	FragmentDefinitionNode,
	FragmentSpreadNode,
	GraphQLInterfaceType,
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLUnionType,
	InlineFragmentNode,
	OperationDefinitionNode,
	TypeInfo,
} from 'graphql';
import { transformType } from './FragmentMapperUtilities';
import { mapMultiFragmentType } from './MultiFragmentMapper';
import * as T from './Types';
import { validateSingleFragmentAST } from './Validator';

export function mapFragmentType(schema: GraphQLSchema, ast: DocumentNode, removeFieldsNamed?: string[]): T.ObjectType {
	const errors = validateSingleFragmentAST(schema, ast);
	if (errors.length > 0) {
		if (errors.length === 1) {
			throw errors[0];
		}
		throw new AggregateError(errors);
	}

	const fragmentDefinition = ast.definitions[0] as FragmentDefinitionNode;

	return mapType(schema, ast, fragmentDefinition, removeFieldsNamed);
}

export function mapType(
	schema: GraphQLSchema,
	ast: DocumentNode,
	rootNode: FragmentDefinitionNode | OperationDefinitionNode,
	removeFieldsNamed?: string[],
): T.ObjectType {
	const ignoredNames = removeFieldsNamed == null ? new Set<string>() : new Set<string>(removeFieldsNamed);
	const fragmentDefinitions = ast.definitions.reduce((carry, d) => {
		if (d.kind === 'FragmentDefinition') {
			carry[d.name.value] = d;
		}
		return carry;
	}, {} as { [fragmentName: string]: FragmentDefinitionNode });

	const fragmentDefinitionCache: { [fragmentName: string]: T.ObjectType } = {};
	const visitor = (typeInfo: TypeInfo, stack: T.ObjectType[]) => {
		const getCurrentType = () => {
			if (stack.length === 0) {
				throw new Error('Expected a non empty stack');
			}
			return stack[stack.length - 1];
		};
		return {
			Field: {
				enter(field: FieldNode) {
					const currentType = getCurrentType();
					const type = typeInfo.getType();
					const fieldName = field.name.value;
					const resultFieldName = field.alias != null ? field.alias.value : field.name.value;
					if (ignoredNames.has(resultFieldName)) {
						return;
					}
					if (field.selectionSet != null) {
						const fieldTypeInfo = transformType(type as GraphQLObjectType);
						stack.push(fieldTypeInfo.leafType as T.ObjectType);
						currentType.fields.push({
							fieldName: fieldName,
							resultFieldName: resultFieldName,
							schemaType: type,
							type: fieldTypeInfo.fragmentType,
						});
					} else {
						currentType.fields.push({
							fieldName: fieldName,
							resultFieldName: resultFieldName,
							schemaType: type,
							type: transformType(type).fragmentType,
						});
					}
				},
				leave(field: FieldNode) {
					if (field.selectionSet != null) {
						stack.pop();
					}
				},
			},
			FragmentDefinition: {
				enter(fragment: FragmentDefinitionNode) {
					if (stack.length !== 0) {
						throw new Error('Expected a single fragment');
					}
					stack.push({
						fields: [],
						fragmentSpreads: [],
						kind: 'Object',
						schemaType: typeInfo.getType() as GraphQLObjectType,
					});
				},
			},
			FragmentSpread: {
				enter(fragmentSpread: FragmentSpreadNode) {
					const objectType = getFragmentType(fragmentSpread.name.value);
					const currentType = getCurrentType();
					currentType.fragmentSpreads.push(objectType);
				},
			},
			InlineFragment: {
				enter(fragmentSpread: InlineFragmentNode) {
					const objectType: T.ObjectType = {
						fields: [],
						fragmentSpreads: [],
						kind: 'Object',
						schemaType: typeInfo.getType() as GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType,
					};
					const currentType = getCurrentType();
					currentType.fragmentSpreads.push(objectType);
					stack.push(objectType);
				},
				leave(fragmentSpread: InlineFragmentNode) {
					stack.pop();
				},
			},
		};
	};

	const getFragmentType = (name: string): T.ObjectType => {
		const fragmentDefinition = fragmentDefinitions[name];
		if (fragmentDefinition == null) {
			throw new Error('Fragment with name: ' + name + ' could not be found');
		}

		const cached = fragmentDefinitionCache[name];
		if (cached != null) {
			return cached;
		}
		const typeInfo = new TypeInfo(schema);
		const stack: T.ObjectType[] = [];
		visit(fragmentDefinition, visitWithTypeInfo(typeInfo, visitor(typeInfo, stack)), null);

		if (stack.length !== 1) {
			throw new Error('Expected to find single fragment in fragment text');
		}

		const res = stack[0];
		fragmentDefinitionCache[name] = res;

		return res;
	};

	if (rootNode.kind === 'FragmentDefinition') {
		return getFragmentType(rootNode.name.value);
	} else {
		const typeInfo = new TypeInfo(schema);
		const rootStack: T.ObjectType[] = [];
		const opName = rootNode.operation;
		const rootType = opName === 'query' ?
			schema.getQueryType() :
			(opName === 'mutation' ? schema.getMutationType() : schema.getSubscriptionType());

		const res: T.ObjectType = {
			fields: [],
			fragmentSpreads: [],
			kind: 'Object',
			schemaType: rootType,
		};
		rootStack.push(res);
		visit(rootNode, visitWithTypeInfo(typeInfo, visitor(typeInfo, rootStack)), null);
		return res;
	}
}
