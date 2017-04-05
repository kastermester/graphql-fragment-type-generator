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
import { mapFragmentType } from '../FragmentMapper';

function textToAST(text: string): DocumentNode {
	return parse(new Source(text));
}

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

test('Can remove ignored fields', () => {
	const ast = textToAST('fragment P on Planet { ignoredName: __typename }');

	const mapped = mapFragmentType(schema, ast, ['ignoredName']);

	const expected: typeof mapped = {
		fields: [],
		fragmentSpreads: [],
		kind: 'Object',
		schemaType: schema.getType('Planet') as GraphQLObjectType,
	};
	expect(mapped).toEqual(expected);
});
test('Can map super simple fragment', () => {
	const ast = textToAST('fragment P on Planet { name }');

	const mapped = mapFragmentType(schema, ast);

	const expected: typeof mapped = {
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
	expect(mapped).toEqual(expected);
});

test('Can map aliases', () => {
	const ast = textToAST('fragment P on Planet { newName: name }');

	const mapped = mapFragmentType(schema, ast);

	const expected: typeof mapped = {
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
	expect(mapped).toEqual(expected);
});

test('Can map export names', () => {
	const ast = textToAST('fragment P on Planet { name @exportType(name: "MyName") }');

	const mapped = mapFragmentType(schema, ast);

	const expected: typeof mapped = {
		fields: [
			{
				exportName: 'MyName',
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
	expect(mapped).toEqual(expected);
});

test('Can map inline fragment spreads', () => {
	const ast = textToAST('fragment P on Node { ... on Planet { name } }');

	const mapped = mapFragmentType(schema, ast);

	const expected: typeof mapped = {
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
	expect(mapped).toEqual(expected);
});

test('Can map multiple inline fragment spreads', () => {
	const ast = textToAST('fragment P on Node { ... on Planet { name } ... on Person { gender birthYear } }');

	const mapped = mapFragmentType(schema, ast);

	const expected: typeof mapped = {
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
	expect(mapped).toEqual(expected);
});

test('Can map mixes between field selections and fragments', () => {
	const ast = textToAST('fragment P on Node { id ... on Planet { name } ... on Person { gender birthYear } }');

	const mapped = mapFragmentType(schema, ast);

	const expected: typeof mapped = {
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
	expect(mapped).toEqual(expected);
});
