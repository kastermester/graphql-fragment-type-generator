import {
	getNullableType,
	parse,
	visit,
	visitWithTypeInfo,
	FieldNode,
	FragmentDefinitionNode,
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
import * as T from './Types';

function transformType(type: GraphQLOutputType): {
	leafType: T.FragmentType;
	fragmentType: T.FragmentType;
} {
	let leafGraphQLType = type;
	const transformType: ((innerType: T.FragmentType) => T.FragmentType)[] = [];
	let isScalarType = false;
	while (true) {
		const currentType = leafGraphQLType;
		if (currentType instanceof GraphQLNonNull) {
			transformType.push((innerType) => ({
				kind: 'NonNull',
				nullableType: innerType as T.NullableFragmentType,
				schemaType: currentType,
			}));
			leafGraphQLType = currentType.ofType;
			continue;
		}
		if (currentType instanceof GraphQLList) {
			transformType.push((innerType) => ({
				elementType: innerType,
				kind: 'List',
				schemaType: currentType,
			}));
			leafGraphQLType = currentType.ofType;
			continue;
		}
		if (leafGraphQLType instanceof GraphQLScalarType) {
			isScalarType = true;
		}
		break;
	}

	const leafType: T.ScalarType | T.ObjectType = !isScalarType ? {
		fields: [],
		fragmentSpreads: [],
		kind: 'Object',
		schemaType: leafGraphQLType as GraphQLObjectType,
	} : {
			kind: 'Scalar',
			schemaType: leafGraphQLType as GraphQLScalarType,
		};
	const fragmentType = transformType.reverse().reduce(
		(t, transformer) => transformer(t),
		leafType as T.FragmentType,
	);
	return {
		fragmentType: fragmentType,
		leafType: leafType,
	};
}

export function mapFragmentType(schema: GraphQLSchema, fragmentText: string): T.ObjectType {
	const ast = parse(new Source(fragmentText.replace(/fragment\s+on\s+/, 'fragment RootFragment on '), 'Fragment'));
	const stack: T.ObjectType[] = [];
	const getCurrentType = () => {
		if (stack.length === 0) {
			throw new Error('Expected a non empty stack');
		}
		return stack[stack.length - 1];
	}
	const typeInfo = new TypeInfo(schema);
	const visitor = {
		Field: {
			enter(field: FieldNode) {
				const currentType = getCurrentType();
				const type = typeInfo.getType();
				const fieldName = field.name.value;
				const resultFieldName = field.alias != null ? field.alias.value : field.name.value;

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
					})
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
				})
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
