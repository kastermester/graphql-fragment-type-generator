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
import { normalizeType } from '../TypeNormalizer';
import { ObjectType } from '../Types';
import { validateSingleFragmentAST } from '../Validator';

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

test('Can normalize super simple fragment', () => {
	const type: ObjectType = {
		fields: [
			{
				exportName: null,
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
				deprecationReason: null,
				description: 'The name of this planet.',
				exportName: null,
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
	expect(normalized).toEqual(expected);
});

test('Can normalize aliases', () => {
	const type: ObjectType = {
		fields: [
			{
				exportName: null,
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
				deprecationReason: null,
				description: 'The name of this planet.',
				exportName: null,
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
	expect(normalized).toEqual(expected);
});

test('Can normalize inline fragment spreads', () => {
	const type: ObjectType = {
		fields: [],
		fragmentSpreads: [
			{
				fields: [
					{
						exportName: null,
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
						deprecationReason: null,
						description: 'The name of this planet.',
						exportName: null,
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
	expect(normalized).toEqual(expected);
});

test('Can normalize multiple inline fragment spreads', () => {
	const type: ObjectType = {
		fields: [],
		fragmentSpreads: [
			{
				fields: [
					{
						exportName: null,
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
						exportName: null,
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
						exportName: null,
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
						deprecationReason: null,
						description:
						'The birth year of the person, using the in-universe standard of BBY or ABY -\nBefore the Battle of ' +
						'Yavin or After the Battle of Yavin. The Battle of Yavin is\na battle that occurs at the end of Star Wars ' +
						'episode IV: A New Hope.',
						exportName: null,
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
						deprecationReason: null,
						description:
						'The gender of this person. Either "Male", "Female" or "unknown",\n"n/a" ' +
						'if the person does not have a gender.',
						exportName: null,
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
						deprecationReason: null,
						description: 'The name of this planet.',
						exportName: null,
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
	expect(normalized).toEqual(expected);
});

test('Can normalize mixes between field selections and fragments', () => {
	const type: ObjectType = {
		fields: [
			{
				exportName: null,
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
				exportName: null,
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
						exportName: null,
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
						exportName: null,
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
						exportName: null,
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
						deprecationReason: null,
						description: null,
						exportName: null,
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
						deprecationReason: null,
						description:
						'The birth year of the person, using the in-universe standard of BBY or ABY -\nBefore the Battle of ' +
						'Yavin or After the Battle of Yavin. The Battle of Yavin is\na battle that occurs at the end of Star Wars ' +
						'episode IV: A New Hope.',
						exportName: null,
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
						deprecationReason: null,
						description:
						'The gender of this person. Either "Male", "Female" or "unknown",\n"n/a" ' +
						'if the person does not have a gender.',
						exportName: null,
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
						deprecationReason: null,
						description: 'The ID of an object',
						exportName: null,
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
						deprecationReason: null,
						description: null,
						exportName: null,
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
						deprecationReason: null,
						description: 'The ID of an object',
						exportName: null,
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
						deprecationReason: null,
						description: 'The name of this planet.',
						exportName: null,
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
						deprecationReason: null,
						description: null,
						exportName: null,
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
						deprecationReason: null,
						description: 'The id of the object.',
						exportName: null,
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
	expect(normalized).toEqual(expected);
});
