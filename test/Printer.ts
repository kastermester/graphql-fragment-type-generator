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
import { printType } from '../src/Printer';
import { FlattenedObjectType } from '../src/Types';
import { validateAST } from '../src/Validator';

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

describe('Printer', () => {
	it('Can print super simple fragment', () => {
		const type: FlattenedObjectType = {
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

		const printed = printType(false, type);
		const expected = `{
  name: string | null;
}`;
		assert.deepEqual(printed, expected);
	});

	it('Can print aliases', () => {
		const type: FlattenedObjectType = {
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
		const printed = printType(false, type);
		const expected = `{
  newName: string | null;
}`;
		assert.deepEqual(printed, expected);
	});

	it('Can print inline fragment spreads', () => {
		const type: FlattenedObjectType = {
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
		const printed = printType(false, type);
		const expected = `{
  name: string | null;
} | {}`;
		assert.deepEqual(printed, expected);
	});

	it('Can print multiple inline fragment spreads', () => {
		const type: FlattenedObjectType = {
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
		const printed = printType(false, type);
		const expected = `{
  birthYear: string | null;
  gender: string | null;
} | {
  name: string | null;
} | {}`;
		assert.deepEqual(printed, expected);
	});

	it('Can print normalized type with mixed field selections and fragment spreads', () => {
		const normalized: FlattenedObjectType = {
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

		const printed = printType(false, normalized);
		const expected = `{
  __typename: "Person";
  birthYear: string | null;
  gender: string | null;
  id: string;
} | {
  __typename: "Planet";
  id: string;
  name: string | null;
} | {
  __typename: "Film" | "Species" | "Starship" | "Vehicle";
  id: string;
}`;
		assert.equal(printed, expected);
	});
	it('Can print branded types', () => {

		const type: FlattenedObjectType = {
			fields: null,
			fragmentSpreads: [
				{
					fields: [
						{
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
							fieldName: '',
							resultFieldName: '',
							schemaType: new GraphQLNonNull(GraphQLString),
							type: {
								kind: 'NonNull',
								nullableType: {
									kind: 'Reference',
									names: ['Film', 'Species', 'Person', 'Starship', 'Vehicle'],
								},
								schemaType: new GraphQLNonNull(GraphQLString),
							},
						},
					],
					kind: 'RestObject',
					schemaTypes: [
						schema.getType('Film') as GraphQLObjectType,
						schema.getType('Species') as GraphQLObjectType,
						schema.getType('Person') as GraphQLObjectType,
						schema.getType('Starship') as GraphQLObjectType,
						schema.getType('Vehicle') as GraphQLObjectType,
					],
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

		const printed = printType(false, type);
		const expected = `{
  '': Planet;
  name: string | null;
} | {
  '': Film | Species | Person | Starship | Vehicle;
}`;
		assert.equal(printed, expected);
	});
});
