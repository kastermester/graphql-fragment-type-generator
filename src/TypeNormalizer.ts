import {
	GraphQLInterfaceType,
	GraphQLObjectType,
	GraphQLSchema,
	GraphQLUnionType,
} from 'graphql';
import * as T from './Types';

type StackType = GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType;

function possibleTypesForType(schema: GraphQLSchema, type: StackType): GraphQLObjectType[] {
	if (type instanceof GraphQLObjectType) {
		return [type];
	}

	return schema.getPossibleTypes(type);
}

function intersectPossibleTypes(
	outerPossibleTypes: GraphQLObjectType[],
	innerPossibleTypes: GraphQLObjectType[],
): GraphQLObjectType[] {
	return innerPossibleTypes.filter(t => outerPossibleTypes.indexOf(t) >= 0);
}

function flattenFragmentSpread(
	schema: GraphQLSchema,
	type: T.ObjectType,
	possibleTypes: GraphQLObjectType[],
): T.FlattenedSpecificObjectType[] {
	return type.fragmentSpreads.reduce((carry, spread) => {
		const possibleSpreadTypes = intersectPossibleTypes(
			possibleTypes,
			possibleTypesForType(schema, spread.schemaType),
		);
		spread.fragmentSpreads.forEach(s => {
			const possibleInnerSpreadTypes = intersectPossibleTypes(
				possibleSpreadTypes,
				possibleTypesForType(schema, s.schemaType),
			);
			const innerFragmentSpreads = flattenFragmentSpread(schema, s, possibleSpreadTypes);
			innerFragmentSpreads.forEach(t => carry.push(t));
			const fields = s.fields.map(f => ({
				fieldName: f.fieldName,
				resultFieldName: f.resultFieldName,
				schemaType: f.schemaType,
				type: normalizeWrappedType(schema, f.type),
			}));
			for (const t of possibleInnerSpreadTypes) {
				carry.push({
					fields: fields,
					kind: 'SpecificObject',
					schemaType: t,
				});
			}
		});

		const fields = spread.fields.map(f => ({
			fieldName: f.fieldName,
			resultFieldName: f.resultFieldName,
			schemaType: f.schemaType,
			type: normalizeWrappedType(schema, f.type),
		}));
		for (const t of possibleSpreadTypes) {
			carry.push({
				fields: fields,
				kind: 'SpecificObject',
				schemaType: t,
			});
		}
		return carry;
	}, [] as T.FlattenedSpecificObjectType[]);
}

export function normalizeType(schema: GraphQLSchema, type: T.ObjectType): T.FlattenedObjectType {
	const possibleTypes = possibleTypesForType(schema, type.schemaType);
	return {
		fields: type.fields.map(f => {
			return {
				fieldName: f.fieldName,
				resultFieldName: f.resultFieldName,
				schemaType: f.schemaType,
				type: normalizeWrappedType(schema, f.type),
			};
		}),
		fragmentSpreads: flattenFragmentSpread(
			schema,
			type,
			possibleTypes,
		),
		kind: 'Object',
		schemaTypes: possibleTypes,
	};
}

function normalizeWrappedType(schema: GraphQLSchema, type: T.FragmentType): T.FlattenedType {
	switch (type.kind) {
		case 'Object':
			return normalizeType(schema, type);
		case 'NonNull':
			return {
				kind: 'NonNull',
				nullableType: normalizeWrappedType(schema, type.nullableType) as T.FlattenedNullableType,
				schemaType: type.schemaType,
			};
		case 'List':
			return {
				elementType: normalizeWrappedType(schema, type.elementType),
				kind: 'List',
				schemaType: type.schemaType,
			};
		case 'Scalar':
			return type;
		default:
			throw new Error('Unexpected type kind');
	}
}