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
import { decorateWithTypeBrands, getTypeBrandNames } from '../src/TypeBrandDecorator';
import { FlattenedObjectType } from '../src/Types';
import { validateAST } from '../src/Validator';

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

describe('TypeBrandDecorator', () => {
	it('Can decorate super simple fragment', () => {
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

		const decorated = decorateWithTypeBrands(type);
		const expected: typeof type = {
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
			fragmentSpreads: null,
			kind: 'Object',
			objectKind: 'Single',
			schemaTypes: [schema.getType('Planet') as GraphQLObjectType],
		};
		assert.deepEqual(decorated, expected);
		const brandNames = getTypeBrandNames(type);
		const expectedBrandNames: typeof brandNames = {
			allRequiredNames: ['Planet'],
			fragmentTypeNames: ['Planet'],
		};
		assert.deepEqual(brandNames, expectedBrandNames);
	});

	it('Can decorate inline fragment spreads', () => {
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
		const decorated = decorateWithTypeBrands(type);
		const expected: typeof type = {
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
							}
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
		assert.deepEqual(decorated, expected);

		const brandNames = getTypeBrandNames(decorated);
		const expectedBrandNames: typeof brandNames = {
			allRequiredNames: ['Film', 'Person', 'Planet', 'Species', 'Starship', 'Vehicle'],
			fragmentTypeNames: ['Film', 'Person', 'Planet', 'Species', 'Starship', 'Vehicle'],
		};
		assert.deepEqual(brandNames, expectedBrandNames);
	});
});
