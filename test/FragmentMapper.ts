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
import { mapFragmentType } from '../src/FragmentMapper';
import { validateAST } from '../src/Validator';

function textToAST(text: string): DocumentNode {
	return parse(new Source(text));
}

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

describe('FragmentMapper', () => {
	it('Can remove ignored fields', () => {
		const ast = textToAST('fragment P on Planet { ignoredName: __typename }');

		const mapped = mapFragmentType(schema, ast, ['ignoredName']);

		const expected: typeof mapped = {
			fields: [],
			fragmentSpreads: [],
			kind: 'Object',
			schemaType: schema.getType('Planet') as GraphQLObjectType,
		};
		assert.deepEqual(mapped, expected);
	});
	it('Can map super simple fragment', () => {
		const ast = textToAST('fragment P on Planet { name }');

		const mapped = mapFragmentType(schema, ast);

		const expected: typeof mapped = {
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
		assert.deepEqual(mapped, expected);
	});

	it('Can map aliases', () => {
		const ast = textToAST('fragment P on Planet { newName: name }');

		const mapped = mapFragmentType(schema, ast);

		const expected: typeof mapped = {
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
		assert.deepEqual(mapped, expected);
	});

	it('Can map inline fragment spreads', () => {
		const ast = textToAST('fragment P on Node { ... on Planet { name } }');

		const mapped = mapFragmentType(schema, ast);

		const expected: typeof mapped = {
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
		assert.deepEqual(mapped, expected);
	});

	it('Can map multiple inline fragment spreads', () => {
		const ast = textToAST('fragment P on Node { ... on Planet { name } ... on Person { gender birthYear } }');

		const mapped = mapFragmentType(schema, ast);

		const expected: typeof mapped = {
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
		assert.deepEqual(mapped, expected);
	});

	it('Can map mixes between field selections and fragments', () => {
		const ast = textToAST('fragment P on Node { id ... on Planet { name } ... on Person { gender birthYear } }');

		const mapped = mapFragmentType(schema, ast);

		const expected: typeof mapped = {
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
		assert.deepEqual(mapped, expected);
	});
});
