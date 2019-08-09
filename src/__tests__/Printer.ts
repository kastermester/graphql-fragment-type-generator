import * as fs from 'fs';
import { buildClientSchema, GraphQLID, GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import * as path from 'path';
import { printType } from '../Printer';
import { FlattenedListType, FlattenedObjectType } from '../Types';

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

test('Can print super simple fragment', () => {
	const type: FlattenedObjectType = {
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

	const printed = printType(false, type, false);

	expect(printed).toMatchInlineSnapshot(`
		"{
		  /**
		   * The name of this planet.
		   */
		  name: string | null;
		}"
	`);
});

test('Can print aliases', () => {
	const type: FlattenedObjectType = {
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
	const printed = printType(false, type, false);
	expect(printed).toMatchInlineSnapshot(`
		"{
		  /**
		   * The name of this planet.
		   */
		  newName: string | null;
		}"
	`);
});

test('Can print inline fragment spreads', () => {
	const type: FlattenedObjectType = {
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
	const printed = printType(false, type, false);
	expect(printed).toMatchInlineSnapshot(`
		"{
		  /**
		   * The name of this planet.
		   */
		  name: string | null;
		} | {}"
	`);
});

test('Can print multiple inline fragment spreads', () => {
	const type: FlattenedObjectType = {
		fields: null,
		fragmentSpreads: [
			{
				fields: [
					{
						deprecationReason: null,
						description: null,
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
							'The gender of this person. Either "Male", "Female" or "unknown",\n' +
							'"n/a" if the person does not have a gender.',
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
	const printed = printType(false, type, false);
	expect(printed).toMatchInlineSnapshot(`
		"{
		  birthYear: string | null;

		  /**
		   * The gender of this person. Either \\"Male\\", \\"Female\\" or \\"unknown\\",
		   * \\"n/a\\" if the person does not have a gender.
		   */
		  gender: string | null;
		} | {
		  /**
		   * The name of this planet.
		   */
		  name: string | null;
		} | {}"
	`);
});

test('Can print normalized type with mixed field selections and fragment spreads', () => {
	const normalized: FlattenedObjectType = {
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
						description: null,
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
						description: null,
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
						description: null,
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
						deprecationReason: 'Test deprecation reason no description',
						description: null,
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
						deprecationReason: 'Test deprecation reason',
						description: 'The name of the planet.',
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

	const printed = printType(false, normalized, false);
	expect(printed).toMatchInlineSnapshot(`
		"{
		  __typename: \\"Person\\";

		  birthYear: string | null;

		  gender: string | null;

		  id: string;
		} | {
		  __typename: \\"Planet\\";

		  /**
		   * @deprecated Test deprecation reason no description
		   */
		  id: string;

		  /**
		   * The name of the planet.
		   * @deprecated Test deprecation reason
		   */
		  name: string | null;
		} | {
		  __typename: \\"Film\\" | \\"Species\\" | \\"Starship\\" | \\"Vehicle\\";

		  /**
		   * The ID of an object
		   */
		  id: string;
		}"
	`);
});
test('Can print branded types', () => {
	const type: FlattenedObjectType = {
		fields: null,
		fragmentSpreads: [
			{
				fields: [
					{
						deprecationReason: null,
						description: null,
						exportName: null,
						fieldName: '',
						resultFieldName: '',
						schemaType: new GraphQLNonNull(GraphQLString),
						type: {
							kind: 'NonNull',
							nullableType: {
								kind: 'Reference',
								names: ['Film'],
							},
							schemaType: new GraphQLNonNull(GraphQLString),
						},
					},
				],
				kind: 'RestObject',
				schemaTypes: [schema.getType('Film') as GraphQLObjectType],
			},
			{
				fields: [
					{
						deprecationReason: null,
						description: null,
						exportName: null,
						fieldName: '',
						resultFieldName: '',
						schemaType: new GraphQLNonNull(GraphQLString),
						type: {
							kind: 'NonNull',
							nullableType: {
								kind: 'Reference',
								names: ['Person'],
							},
							schemaType: new GraphQLNonNull(GraphQLString),
						},
					},
				],
				kind: 'RestObject',
				schemaTypes: [schema.getType('Person') as GraphQLObjectType],
			},
			{
				fields: [
					{
						deprecationReason: null,
						description: null,
						exportName: null,
						fieldName: '',
						resultFieldName: '',
						schemaType: new GraphQLNonNull(GraphQLString),
						type: {
							kind: 'NonNull',
							nullableType: {
								kind: 'Reference',
								names: ['Planet'],
							},
							schemaType: new GraphQLNonNull(GraphQLString),
						},
					},
					{
						deprecationReason: null,
						description: null,
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
						fieldName: '',
						resultFieldName: '',
						schemaType: new GraphQLNonNull(GraphQLString),
						type: {
							kind: 'NonNull',
							nullableType: {
								kind: 'Reference',
								names: ['Species'],
							},
							schemaType: new GraphQLNonNull(GraphQLString),
						},
					},
				],
				kind: 'RestObject',
				schemaTypes: [schema.getType('Species') as GraphQLObjectType],
			},
			{
				fields: [
					{
						deprecationReason: null,
						description: null,
						exportName: null,
						fieldName: '',
						resultFieldName: '',
						schemaType: new GraphQLNonNull(GraphQLString),
						type: {
							kind: 'NonNull',
							nullableType: {
								kind: 'Reference',
								names: ['Starship'],
							},
							schemaType: new GraphQLNonNull(GraphQLString),
						},
					},
				],
				kind: 'RestObject',
				schemaTypes: [schema.getType('Starship') as GraphQLObjectType],
			},
			{
				fields: [
					{
						deprecationReason: null,
						description: null,
						exportName: null,
						fieldName: '',
						resultFieldName: '',
						schemaType: new GraphQLNonNull(GraphQLString),
						type: {
							kind: 'NonNull',
							nullableType: {
								kind: 'Reference',
								names: ['Vehicle'],
							},
							schemaType: new GraphQLNonNull(GraphQLString),
						},
					},
				],
				kind: 'RestObject',
				schemaTypes: [schema.getType('Vehicle') as GraphQLObjectType],
			},
		],
		kind: 'Object',
		objectKind: 'Spread',
		schemaTypes: [
			schema.getType('Film') as GraphQLObjectType,
			schema.getType('Species') as GraphQLObjectType,
			schema.getType('Planet') as GraphQLObjectType,
			schema.getType('Person') as GraphQLObjectType,
			schema.getType('Starship') as GraphQLObjectType,
			schema.getType('Vehicle') as GraphQLObjectType,
		],
	};

	const printed = printType(false, type, false);
	expect(printed).toMatchInlineSnapshot(`
		"{
		  '': Film;
		} | {
		  '': Person;
		} | {
		  '': Planet;

		  name: string | null;
		} | {
		  '': Species;
		} | {
		  '': Starship;
		} | {
		  '': Vehicle;
		}"
	`);
});

test('encapsulation of ({comlex} | {union type})[] lists with parens', () => {
	const type = {
		elementType: {
			kind: 'NonNull',
			nullableType: {
				fragmentSpreads: [
					{
						fields: [
							{
								deprecationReason: null,
								description: null,
								exportName: null,
								fieldName: '',
								resultFieldName: '',
								schemaType: new GraphQLNonNull(GraphQLString),
								type: {
									kind: 'NonNull',
									nullableType: {
										kind: 'Reference',
										names: ['Film'],
									},
									schemaType: new GraphQLNonNull(GraphQLString),
								},
							},
						],
						kind: 'RestObject',
						schemaTypes: [schema.getType('Film') as GraphQLObjectType],
					},
					{
						fields: [
							{
								deprecationReason: null,
								description: null,
								exportName: null,
								fieldName: '',
								resultFieldName: '',
								schemaType: new GraphQLNonNull(GraphQLString),
								type: {
									kind: 'NonNull',
									nullableType: {
										kind: 'Reference',
										names: ['Person'],
									},
									schemaType: new GraphQLNonNull(GraphQLString),
								},
							},
						],
						kind: 'RestObject',
						schemaTypes: [schema.getType('Person') as GraphQLObjectType],
					},
				],
				kind: 'Object',
				objectKind: 'Spread',
				schemaTypes: [
					schema.getType('Film') as GraphQLObjectType,
					schema.getType('Person') as GraphQLObjectType,
				],
			},
			schemaType: new GraphQLNonNull(GraphQLString),
		},
		kind: 'List',
		schemaType: new GraphQLNonNull(GraphQLString),
	} as FlattenedListType;

	const printed = printType(false, type, false);
	expect(printed).toMatchInlineSnapshot(`
		"({
		    '': Film;
		  } | {
		    '': Person;
		  })[]"
	`);
});

test('encapsulation of multiple reference types list', () => {
	const type = {
		elementType: {
			kind: 'NonNull',
			nullableType: {
				kind: 'Reference',
				names: ['Film', 'Person'],
			},
			schemaType: new GraphQLNonNull(GraphQLString),
		},
		kind: 'List',
		schemaType: new GraphQLNonNull(GraphQLString),
	} as FlattenedListType;

	const printed = printType(false, type, false);
	expect(printed).toMatchInlineSnapshot(`"(Film | Person)[]"`);
});
