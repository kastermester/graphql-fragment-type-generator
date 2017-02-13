import { assert } from 'chai';
import * as fs from 'fs';
import {
	buildClientSchema,
	parse,
	DocumentNode,
	GraphQLInt,
	GraphQLInterfaceType,
	GraphQLID,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLString,
	Source,
} from 'graphql';
import * as path from 'path';
import { normalizeType } from '../src/TypeNormalizer';
import { ObjectType } from '../src/Types';
import { validateAST } from '../src/Validator';

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

describe('TypeNormalizer', () => {
	it('Can normalize super simple fragment', () => {
		const type: ObjectType = {
			fields: [
				{
					fieldName: 'name',
					resultFieldName: 'name',
					schemaType: GraphQLString,
					type: {
						kind: 'Scalar',
						knownPossibleValues: null,
						schemaType: GraphQLString,
					},
				},
			],
			fragmentSpreads: [],
			kind: 'Object',
			schemaType: schema.getType('Planet') as GraphQLObjectType,
		};

		const normalized = normalizeType(schema, type);

		const expected: typeof normalized = {
			fields: [
				{
					fieldName: 'name',
					resultFieldName: 'name',
					schemaType: GraphQLString,
					type: {
						kind: 'Scalar',
						knownPossibleValues: null,
						schemaType: GraphQLString,
					},
				},
			],
			fragmentSpreads: null,
			kind: 'Object',
			objectKind: 'Single',
			schemaTypes: [schema.getType('Planet') as GraphQLObjectType],
		};
		assert.deepEqual(normalized, expected);
	});

	it('Can normalize aliases', () => {
		const type: ObjectType = {
			fields: [
				{
					fieldName: 'name',
					resultFieldName: 'newName',
					schemaType: GraphQLString,
					type: {
						kind: 'Scalar',
						knownPossibleValues: null,
						schemaType: GraphQLString,
					},
				},
			],
			fragmentSpreads: [],
			kind: 'Object',
			schemaType: schema.getType('Planet') as GraphQLObjectType,
		};

		const normalized = normalizeType(schema, type);

		const expected: typeof normalized = {
			fields: [
				{
					fieldName: 'name',
					resultFieldName: 'newName',
					schemaType: GraphQLString,
					type: {
						kind: 'Scalar',
						knownPossibleValues: null,
						schemaType: GraphQLString,
					},
				},
			],
			fragmentSpreads: null,
			kind: 'Object',
			objectKind: 'Single',
			schemaTypes: [schema.getType('Planet') as GraphQLObjectType],
		};
		assert.deepEqual(normalized, expected);
	});

	it('Can normalize inline fragment spreads', () => {
		const type: ObjectType = {
			fields: [],
			fragmentSpreads: [
				{
					fields: [
						{
							fieldName: 'name',
							resultFieldName: 'name',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
					],
					fragmentSpreads: [],
					kind: 'Object',
					schemaType: schema.getType('Planet') as GraphQLObjectType,
				},
			],
			kind: 'Object',
			schemaType: schema.getType('Node') as GraphQLInterfaceType,
		};

		const normalized = normalizeType(schema, type);

		const expected: typeof normalized = {
			fields: null,
			fragmentSpreads: [
				{
					fields: [
						{
							fieldName: 'name',
							resultFieldName: 'name',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
					],
					kind: 'SpecificObject',
					schemaType: schema.getType('Planet') as GraphQLObjectType,
				},
				{
					fields: [],
					kind: 'RestObject',
					schemaTypes: [
						schema.getType('Film') as GraphQLObjectType,
						schema.getType('Person') as GraphQLObjectType,
						schema.getType('Species') as GraphQLObjectType,
						schema.getType('Starship') as GraphQLObjectType,
						schema.getType('Vehicle') as GraphQLObjectType,
					],
				},
			],
			kind: 'Object',
			objectKind: 'Spread',
			schemaTypes: [
				schema.getType('Film') as GraphQLObjectType,
				schema.getType('Person') as GraphQLObjectType,
				schema.getType('Planet') as GraphQLObjectType,
				schema.getType('Species') as GraphQLObjectType,
				schema.getType('Starship') as GraphQLObjectType,
				schema.getType('Vehicle') as GraphQLObjectType,
			],
		};
		assert.deepEqual(normalized, expected);
	});

	it('Can normalize multiple inline fragment spreads', () => {
		const type: ObjectType = {
			fields: [],
			fragmentSpreads: [
				{
					fields: [
						{
							fieldName: 'name',
							resultFieldName: 'name',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
					],
					fragmentSpreads: [],
					kind: 'Object',
					schemaType: schema.getType('Planet') as GraphQLObjectType,
				},
				{
					fields: [
						{
							fieldName: 'gender',
							resultFieldName: 'gender',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
						{
							fieldName: 'birthYear',
							resultFieldName: 'birthYear',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
					],
					fragmentSpreads: [],
					kind: 'Object',
					schemaType: schema.getType('Person') as GraphQLObjectType,
				},
			],
			kind: 'Object',
			schemaType: schema.getType('Node') as GraphQLInterfaceType,
		};

		const normalized = normalizeType(schema, type);

		const expected: typeof normalized = {
			fields: null,
			fragmentSpreads: [
				{
					fields: [
						{
							fieldName: 'birthYear',
							resultFieldName: 'birthYear',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
						{
							fieldName: 'gender',
							resultFieldName: 'gender',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
					],
					kind: 'SpecificObject',
					schemaType: schema.getType('Person') as GraphQLObjectType,
				},
				{
					fields: [
						{
							fieldName: 'name',
							resultFieldName: 'name',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
					],
					kind: 'SpecificObject',
					schemaType: schema.getType('Planet') as GraphQLObjectType,
				},
				{
					fields: [],
					kind: 'RestObject',
					schemaTypes: [
						schema.getType('Film') as GraphQLObjectType,
						schema.getType('Species') as GraphQLObjectType,
						schema.getType('Starship') as GraphQLObjectType,
						schema.getType('Vehicle') as GraphQLObjectType,
					],
				},
			],
			kind: 'Object',
			objectKind: 'Spread',
			schemaTypes: [
				schema.getType('Film') as GraphQLObjectType,
				schema.getType('Person') as GraphQLObjectType,
				schema.getType('Planet') as GraphQLObjectType,
				schema.getType('Species') as GraphQLObjectType,
				schema.getType('Starship') as GraphQLObjectType,
				schema.getType('Vehicle') as GraphQLObjectType,
			],
		};
		assert.deepEqual(normalized, expected);
	});

	it('Can normalize mixes between field selections and fragments', () => {
		const type: ObjectType = {
			fields: [
				{
					fieldName: 'id',
					resultFieldName: 'id',
					schemaType: new GraphQLNonNull(GraphQLID),
					type: {
						kind: 'NonNull',
						nullableType: {
							kind: 'Scalar',
							knownPossibleValues: null,
							schemaType: GraphQLID,
						},
						schemaType: new GraphQLNonNull(GraphQLID),
					},
				},
				{
					fieldName: '__typename',
					resultFieldName: '__typename',
					schemaType: new GraphQLNonNull(GraphQLString),
					type: {
						kind: 'NonNull',
						nullableType: {
							kind: 'Scalar',
							knownPossibleValues: null,
							schemaType: GraphQLString,
						},
						schemaType: new GraphQLNonNull(GraphQLString),
					},
				},
			],
			fragmentSpreads: [
				{
					fields: [
						{
							fieldName: 'name',
							resultFieldName: 'name',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
					],
					fragmentSpreads: [],
					kind: 'Object',
					schemaType: schema.getType('Planet') as GraphQLObjectType,
				},
				{
					fields: [
						{
							fieldName: 'gender',
							resultFieldName: 'gender',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
						{
							fieldName: 'birthYear',
							resultFieldName: 'birthYear',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
					],
					fragmentSpreads: [],
					kind: 'Object',
					schemaType: schema.getType('Person') as GraphQLObjectType,
				},
			],
			kind: 'Object',
			schemaType: schema.getType('Node') as GraphQLInterfaceType,
		};

		const normalized = normalizeType(schema, type);

		const expected: typeof normalized = {
			fields: null,
			fragmentSpreads: [
				{
					fields: [
						{
							fieldName: '__typename',
							resultFieldName: '__typename',
							schemaType: new GraphQLNonNull(GraphQLString),
							type: {
								kind: 'NonNull',
								nullableType: {
									kind: 'Scalar',
									knownPossibleValues: ['Person'],
									schemaType: GraphQLString,
								},
								schemaType: new GraphQLNonNull(GraphQLString),
							},
						},
						{
							fieldName: 'birthYear',
							resultFieldName: 'birthYear',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
						{
							fieldName: 'gender',
							resultFieldName: 'gender',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
						{
							fieldName: 'id',
							resultFieldName: 'id',
							schemaType: new GraphQLNonNull(GraphQLID),
							type: {
								kind: 'NonNull',
								nullableType: {
									kind: 'Scalar',
									knownPossibleValues: null,
									schemaType: GraphQLID,
								},
								schemaType: new GraphQLNonNull(GraphQLID),
							},
						},
					],
					kind: 'SpecificObject',
					schemaType: schema.getType('Person') as GraphQLObjectType,
				},
				{
					fields: [
						{
							fieldName: '__typename',
							resultFieldName: '__typename',
							schemaType: new GraphQLNonNull(GraphQLString),
							type: {
								kind: 'NonNull',
								nullableType: {
									kind: 'Scalar',
									knownPossibleValues: ['Planet'],
									schemaType: GraphQLString,
								},
								schemaType: new GraphQLNonNull(GraphQLString),
							},
						},
						{
							fieldName: 'id',
							resultFieldName: 'id',
							schemaType: new GraphQLNonNull(GraphQLID),
							type: {
								kind: 'NonNull',
								nullableType: {
									kind: 'Scalar',
									knownPossibleValues: null,
									schemaType: GraphQLID,
								},
								schemaType: new GraphQLNonNull(GraphQLID),
							},
						},
						{
							fieldName: 'name',
							resultFieldName: 'name',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
					],
					kind: 'SpecificObject',
					schemaType: schema.getType('Planet') as GraphQLObjectType,
				},
				{
					fields: [
						{
							fieldName: '__typename',
							resultFieldName: '__typename',
							schemaType: new GraphQLNonNull(GraphQLString),
							type: {
								kind: 'NonNull',
								nullableType: {
									kind: 'Scalar',
									knownPossibleValues: ['Film', 'Species', 'Starship', 'Vehicle'],
									schemaType: GraphQLString,
								},
								schemaType: new GraphQLNonNull(GraphQLString),
							},
						},
						{
							fieldName: 'id',
							resultFieldName: 'id',
							schemaType: new GraphQLNonNull(GraphQLID),
							type: {
								kind: 'NonNull',
								nullableType: {
									kind: 'Scalar',
									knownPossibleValues: null,
									schemaType: GraphQLID,
								},
								schemaType: new GraphQLNonNull(GraphQLID),
							},
						},
					],
					kind: 'RestObject',
					schemaTypes: [
						schema.getType('Film') as GraphQLObjectType,
						schema.getType('Species') as GraphQLObjectType,
						schema.getType('Starship') as GraphQLObjectType,
						schema.getType('Vehicle') as GraphQLObjectType,
					],
				},
			],
			kind: 'Object',
			objectKind: 'Spread',
			schemaTypes: [
				schema.getType('Film') as GraphQLObjectType,
				schema.getType('Person') as GraphQLObjectType,
				schema.getType('Planet') as GraphQLObjectType,
				schema.getType('Species') as GraphQLObjectType,
				schema.getType('Starship') as GraphQLObjectType,
				schema.getType('Vehicle') as GraphQLObjectType,
			],
		};
		const as = assert;
		assert.deepEqual(normalized, expected);
	});
});
