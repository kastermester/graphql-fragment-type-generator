import {
	DirectiveLocation,
	FragmentDefinitionNode,
	GraphQLDirective,
	GraphQLEnumType,
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLOutputType,
	GraphQLScalarType,
	GraphQLSchema,
	GraphQLString,
} from 'graphql';
import * as T from './Types';

export const typeNameDirective = new GraphQLDirective({
	args: {
		name: {
			description: 'The name this type should be exported with',
			type: new GraphQLNonNull(GraphQLString),
		},
	},
	description: 'Marks the given type to be exported in the generated file',
	locations: [DirectiveLocation.FIELD],
	name: 'exportType',
});

export function mapSchema(schema: GraphQLSchema): GraphQLSchema {

	return new GraphQLSchema({
		directives: [typeNameDirective],
		mutation: schema.getMutationType(),
		query: schema.getQueryType(),
		subscription: schema.getSubscriptionType(),
	});
}

export function transformType(
	type: GraphQLOutputType,
): {
	leafType: T.FragmentType;
	fragmentType: T.FragmentType;
} {
	let leafGraphQLType = type;
	const transformType: ((innerType: T.FragmentType) => T.FragmentType)[] = [];
	let isScalarType = false;
	let knownValues = null;
	while (true) {
		const currentType = leafGraphQLType;
		if (currentType instanceof GraphQLNonNull) {
			transformType.push(innerType => ({
				kind: 'NonNull',
				nullableType: innerType as T.NullableFragmentType,
				schemaType: currentType,
			}));
			leafGraphQLType = currentType.ofType;
			continue;
		}
		if (currentType instanceof GraphQLList) {
			transformType.push(innerType => ({
				elementType: innerType,
				kind: 'List',
				schemaType: currentType,
			}));
			leafGraphQLType = currentType.ofType;
			continue;
		}
		if (currentType instanceof GraphQLScalarType) {
			isScalarType = true;
		}
		if (currentType instanceof GraphQLEnumType) {
			isScalarType = true;
			knownValues = currentType.getValues().map(v => v.name);
		}
		break;
	}

	const leafType: T.ScalarType | T.ObjectType = !isScalarType
		? {
				fields: [],
				fragmentSpreads: [],
				kind: 'Object',
				schemaType: leafGraphQLType as GraphQLObjectType,
			}
		: {
				kind: 'Scalar',
				knownPossibleValues: knownValues,
				schemaType: leafGraphQLType as GraphQLScalarType,
			};
	const fragmentType = transformType.reverse().reduce((t, transformer) => transformer(t), leafType as T.FragmentType);
	return {
		fragmentType: fragmentType,
		leafType: leafType,
	};
}

export function isPluralFragmentDefinition(fragmentDefinition: FragmentDefinitionNode): boolean {
	if (fragmentDefinition.directives == null) {
		return false;
	}

	const relayDirective = fragmentDefinition.directives.find(v => v.name.value === 'relay');

	if (relayDirective == null || relayDirective.arguments == null) {
		return false;
	}
	const pluralArg = relayDirective.arguments.find(v => v.name.value === 'plural');

	if (pluralArg == null) {
		return false;
	}

	return pluralArg.value.kind === 'BooleanValue' && pluralArg.value.value;
}
