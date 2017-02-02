"use strict";
const graphql_1 = require("graphql");
function transformType(type) {
    let leafGraphQLType = type;
    const transformType = [];
    while (true) {
        const currentType = leafGraphQLType;
        if (currentType instanceof graphql_1.GraphQLNonNull) {
            transformType.push((innerType) => ({
                kind: 'NonNull',
                nullableType: innerType,
                schemaType: currentType,
            }));
            leafGraphQLType = currentType.ofType;
            continue;
        }
        if (currentType instanceof graphql_1.GraphQLList) {
            transformType.push((innerType) => ({
                elementType: innerType,
                kind: 'List',
                schemaType: currentType,
            }));
            leafGraphQLType = currentType.ofType;
            continue;
        }
        if ((leafGraphQLType instanceof graphql_1.GraphQLObjectType) || (leafGraphQLType instanceof graphql_1.GraphQLScalarType)) {
            break;
        }
    }
    const leafType = leafGraphQLType instanceof graphql_1.GraphQLObjectType ? {
        displayableName: null,
        fields: [],
        kind: 'Object',
        schemaType: leafGraphQLType,
    } : {
        kind: 'Scalar',
        schemaType: leafGraphQLType,
    };
    const fragmentType = transformType.reverse().reduce((t, transformer) => transformer(t), leafType);
    return {
        fragmentType: fragmentType,
        leafType: leafType,
    };
}
function mapFragmentType(schema, fragmentText) {
    const ast = graphql_1.parse(new graphql_1.Source(fragmentText.replace(/fragment\s+on\s+/, 'fragment RootFragment on '), 'Fragment'));
    const stack = [];
    const getCurrentType = () => {
        if (stack.length === 0) {
            throw new Error('Expected a non empty stack');
        }
        return stack[stack.length - 1];
    };
    const typeInfo = new graphql_1.TypeInfo(schema);
    const visitor = {
        Field: {
            enter(field) {
                const currentType = getCurrentType();
                const type = typeInfo.getType();
                const fieldName = field.name.value;
                const resultFieldName = field.alias != null ? field.alias.value : field.name.value;
                if (field.selectionSet != null) {
                    const fieldTypeInfo = transformType(type);
                    stack.push(fieldTypeInfo.leafType);
                    currentType.fields.push({
                        fieldName: fieldName,
                        resultFieldName: resultFieldName,
                        schemaType: type,
                        type: fieldTypeInfo.fragmentType,
                    });
                }
                else {
                    currentType.fields.push({
                        fieldName: fieldName,
                        resultFieldName: resultFieldName,
                        schemaType: type,
                        type: transformType(type).fragmentType,
                    });
                }
            },
            leave(field) {
                if (field.selectionSet != null) {
                    stack.pop();
                }
            },
        },
        FragmentDefinition: {
            enter(fragment) {
                if (stack.length !== 0) {
                    throw new Error('Expected a single fragment');
                }
                stack.push({
                    displayableName: fragment.name.value,
                    fields: [],
                    kind: 'Object',
                    schemaType: typeInfo.getType(),
                });
            },
        },
    };
    graphql_1.visit(ast, graphql_1.visitWithTypeInfo(typeInfo, visitor), null);
    if (stack.length !== 1) {
        throw new Error('Expected to find single fragment in fragment text');
    }
    return stack[0];
}
exports.mapFragmentType = mapFragmentType;
