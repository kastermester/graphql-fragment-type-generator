import { GraphQLNamedType, GraphQLObjectType, GraphQLSchema, GraphQLUnionType } from 'graphql';

interface TypeMap {
	[name: string]: GraphQLNamedType;
}

export function getTypeBrands(schema: GraphQLSchema): string {
	const queryType = schema.getQueryType();
	const objectTypes = new Set<GraphQLObjectType>();

	// The version of @types/graphql I'm using thinks this is a single type?
	const types: TypeMap = schema.getTypeMap() as any;
	const rootType = schema.getQueryType();
	const mutationType = schema.getMutationType();
	const subscriptionType = schema.getSubscriptionType();

	for (const typeName of Object.keys(types)) {
		const type = types[typeName];
		if (type instanceof GraphQLObjectType) {
			if (type === rootType || type === mutationType || type === subscriptionType || type.name.startsWith('__')) {
				continue;
			}
			objectTypes.add(type);
		}
	}

	const sortedNames = Array.from(objectTypes.values())
		.map(t => `export enum ${t.name} {};`)
		.sort();

	return sortedNames.join('\n');
}
