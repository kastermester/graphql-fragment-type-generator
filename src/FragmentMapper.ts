import {
	getNullableType,
	parse,
	validate,
	visit,
	visitWithTypeInfo,
	DocumentNode,
	FieldNode,
	FragmentDefinitionNode,
	GraphQLEnumType,
	GraphQLInterfaceType,
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLOutputType,
	GraphQLScalarType,
	GraphQLSchema,
	GraphQLUnionType,
	InlineFragmentNode,
	Source,
	TypeInfo,
} from 'graphql';
import { transformType } from './FragmentMapperUtilities';
import * as T from './Types';

export function mapFragmentType(schema: GraphQLSchema, ast: DocumentNode, removeFieldsNamed?: string[]): T.ObjectType {
	const stack: T.ObjectType[] = [];
	const getCurrentType = () => {
		if (stack.length === 0) {
			throw new Error('Expected a non empty stack');
		}
		return stack[stack.length - 1];
	};
	const typeInfo = new TypeInfo(schema);
	const ignoredNames = removeFieldsNamed == null ? new Set<string>() : new Set<string>(removeFieldsNamed);
	const visitor = {
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

	visit(ast, visitWithTypeInfo(typeInfo, visitor), null);
	if (stack.length !== 1) {
		throw new Error('Expected to find single fragment in fragment text');
	}

	return stack[0];
}
