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
import { decorateWithTypeBrands, getTypeBrandNames } from '../TypeBrandDecorator';
import { FlattenedObjectType } from '../Types';
import { validateSingleFragmentAST } from '../Validator';

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

test('Can decorate super simple fragment', () => {
	const type: FlattenedObjectType = {
		fields: [
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
		fragmentSpreads: null,
		kind: 'Object',
		objectKind: 'Single',
		schemaTypes: [schema.getType('Planet') as GraphQLObjectType],
	};

	const decorated = decorateWithTypeBrands(type);
	const expected: typeof type = {
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
		fragmentSpreads: null,
		kind: 'Object',
		objectKind: 'Single',
		schemaTypes: [schema.getType('Planet') as GraphQLObjectType],
	};
	expect(decorated).toEqual(expected);
	const brandNames = getTypeBrandNames(type);
	const expectedBrandNames: typeof brandNames = {
		allRequiredNames: ['Planet'],
		fragmentTypeNames: ['Planet'],
	};
	expect(brandNames).toEqual(expectedBrandNames);
});

test('Can decorate inline fragment spreads', () => {
	const type: FlattenedObjectType = {
		fields: null,
		fragmentSpreads: [
			{
				fields: [
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
	const decorated = decorateWithTypeBrands(type);
	const expected: typeof type = {
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
				kind: 'SpecificObject',
				schemaType: schema.getType('Film') as GraphQLObjectType,
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
				kind: 'SpecificObject',
				schemaType: schema.getType('Person') as GraphQLObjectType,
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
				kind: 'SpecificObject',
				schemaType: schema.getType('Species') as GraphQLObjectType,
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
				kind: 'SpecificObject',
				schemaType: schema.getType('Starship') as GraphQLObjectType,
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
				kind: 'SpecificObject',
				schemaType: schema.getType('Vehicle') as GraphQLObjectType,
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
	expect(decorated).toEqual(expected);

	const brandNames = getTypeBrandNames(decorated);
	const expectedBrandNames: typeof brandNames = {
		allRequiredNames: ['Film', 'Person', 'Planet', 'Species', 'Starship', 'Vehicle'],
		fragmentTypeNames: ['Film', 'Person', 'Planet', 'Species', 'Starship', 'Vehicle'],
	};
	expect(brandNames).toEqual(expectedBrandNames);
});
