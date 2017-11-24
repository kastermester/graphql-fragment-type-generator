import * as AggregateError from 'aggregate-error';
import {
	validate,
	visit,
	visitWithTypeInfo,
	DirectiveNode,
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
import { mapSchema, transformType } from './FragmentMapperUtilities';
import * as T from './Types';
import { validateMultiFragmentAST } from './Validator';

export function mapMultiFragmentType(
	schema: GraphQLSchema,
	ast: DocumentNode,
	rootFragmentName: string,
	removeFieldsNamed?: string[],
	allowUndefinedFragmentSpread: boolean = false,
): T.ObjectType {
	const schemaWithDirective = mapSchema(schema);
	const errors = validateMultiFragmentAST(schema, ast, rootFragmentName);
	if (errors.length > 0) {
		if (errors.length === 1) {
			throw errors[0];
		}
		throw new AggregateError(errors);
	}
	const fragmentNode = ast.definitions.find(
		v => v.kind === 'FragmentDefinition' && v.name.value === rootFragmentName,
	) as FragmentDefinitionNode | undefined;
	if (fragmentNode == null) {
		throw new Error('Unable to find fragment named: ' + rootFragmentName);
	}
	return mapType(schema, ast, fragmentNode, removeFieldsNamed, allowUndefinedFragmentSpread);
}

function getExportName(directives: DirectiveNode[] | undefined): string | null {
	if (directives == null) {
		return null;
	}

	const directive = directives.find(v => v.name.value === 'exportType');
	if (directive == null || directive.arguments == null) {
		return null;
	}

	const arg = directive.arguments.find(a => a.name.value === 'name');

	if (arg == null || arg.value.kind !== 'StringValue') {
		return null;
	}
	return arg.value.value;
}

export function mapType(
	schema: GraphQLSchema,
	ast: DocumentNode,
	rootNode: FragmentDefinitionNode | OperationDefinitionNode,
	removeFieldsNamed?: string[],
	allowUndefinedFragmentSpread: boolean = false,
): T.ObjectType {
	const ignoredNames = removeFieldsNamed == null ? new Set<string>() : new Set<string>(removeFieldsNamed);
	const fragmentDefinitions = ast.definitions.reduce(
		(carry, d) => {
			if (d.kind === 'FragmentDefinition') {
				carry[d.name.value] = d;
			}
			return carry;
		},
		{} as { [fragmentName: string]: FragmentDefinitionNode },
	);

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
					const exportName = getExportName(field.directives);
					const fieldName = field.name.value;
					const resultFieldName = field.alias != null ? field.alias.value : field.name.value;
					if (ignoredNames.has(resultFieldName)) {
						return;
					}
					if (field.selectionSet != null) {
						const fieldTypeInfo = transformType(type as GraphQLObjectType);
						stack.push(fieldTypeInfo.leafType as T.ObjectType);
						currentType.fields.push({
							exportName: exportName,
							fieldName: fieldName,
							resultFieldName: resultFieldName,
							schemaType: type,
							type: fieldTypeInfo.fragmentType,
						});
					} else {
						currentType.fields.push({
							exportName: exportName,
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
					let objectType: T.ObjectType;
					if (allowUndefinedFragmentSpread) {
						const type = getOptionalFragmentType(fragmentSpread.name.value);
						if (type == null) {
							return;
						}
						objectType = type;
					} else {
						objectType = getFragmentType(fragmentSpread.name.value);
					}
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
		const fragmentType = getOptionalFragmentType(name);
		if (fragmentType == null) {
			throw new Error('Fragment with name: ' + name + ' could not be found');
		}

		return fragmentType;
	};

	const getOptionalFragmentType = (name: string): T.ObjectType | null => {
		const fragmentDefinition = fragmentDefinitions[name];
		if (fragmentDefinition == null) {
			return null;
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
		const rootType =
			opName === 'query'
				? schema.getQueryType()
				: opName === 'mutation' ? schema.getMutationType() : schema.getSubscriptionType();

		if (rootType == null) {
			throw new Error('Root type cannot be null or undefined');
		}

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
