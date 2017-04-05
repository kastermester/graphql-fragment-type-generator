import * as fs from 'fs';
import { buildClientSchema, parse, DocumentNode, Source } from 'graphql';
import * as path from 'path';
import { mapSchema } from '../FragmentMapperUtilities';
import { validateMultiFragmentAST, validateSingleFragmentAST } from '../Validator';

function textToAST(text: string): DocumentNode {
	return parse(new Source(text));
}

const schema = mapSchema(
	buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data),
);
describe('Single', () => {
	test('Should reject a full query', () => {
		const doc = textToAST(`query { allPlanets { planets { name } } }`);

		const errors = validateSingleFragmentAST(schema, doc);

		expect(errors.length).toBe(1);
		expect(errors[0].message).toBe('Expected the Document to contain only a single FragmentDefinition');
	});

	test('It should accept a single fragment', () => {
		const doc = textToAST(`fragment P on Planet { name }`);

		const errors = validateSingleFragmentAST(schema, doc);

		expect(errors.length).toBe(0);
	});

	test('It should reject two fragments', () => {
		const doc = textToAST(`fragment P on Planet { name } fragment P2 on Planet { name }`);

		const errors = validateSingleFragmentAST(schema, doc);

		expect(errors.length).toBe(1);
		expect(errors[0].message).toBe('Expected the Document to contain only a single FragmentDefinition');
	});
});

describe('Multi fragment', () => {
	test('Should reject a full query', () => {
		const doc = textToAST(`query { allPlanets { planets { name } } }`);

		const errors = validateMultiFragmentAST(schema, doc, 'F');

		expect(errors.length).toBe(1);
		expect(errors[0].message).toBe('Expected the Document to only contain fragment definitions');
	});

	test('It should accept a single fragment', () => {
		const doc = textToAST(`fragment P on Planet { name @typeName(name: "MyStringName") }`);

		const errors = validateMultiFragmentAST(schema, doc, 'P');

		expect(errors.length).toBe(0);
	});

	test('It should detect unreferenced fragment', () => {
		const doc = textToAST(`fragment P on Planet { name } fragment P2 on Planet { name }`);

		const errors = validateMultiFragmentAST(schema, doc, 'P');

		expect(errors.length).toBe(1);
		expect(errors[0].message).toBe('The following fragment were defined but never referenced: P2');
	});

	test('It should allow an extra referenced fragment', () => {
		const doc = textToAST(`fragment P on Planet { name ...P2 } fragment P2 on Planet { name }`);

		const errors = validateMultiFragmentAST(schema, doc, 'P');

		expect(errors.length).toBe(0);
	});

	test('It should disallow spreading a Person into a Planet', () => {
		const doc = textToAST(`fragment P on Planet { name ...P2 } fragment P2 on Person { name }`);

		const errors = validateMultiFragmentAST(schema, doc, 'P');

		expect(errors.length).toBe(1);
		expect(errors[0].message).toBe(
			'Fragment "P2" cannot be spread here as objects of type "Planet" can never be of type "Person".',
		);
	});

	// For some reason the OverlappingFieldsCanBeMerged rule breaks on this fragment,
	// perhaps file an issue?
	test.skip('It should disallow spreading a fragment referencing the root fragment', () => {
		const doc = textToAST(`fragment P111 on Planet { ...P2 } fragment P2 on Planet { ...P }`);

		const errors = validateMultiFragmentAST(schema, doc, 'P');

		expect(errors.length).toBe(1);
		expect(errors[0].message).toBe(
			'Fragment "P2" cannot be spread here as objects of type "Planet" can never be of type "Person".',
		);
	});

	test('It should disallow documents with unreferenced fragments', () => {
		const doc = textToAST(`fragment P on Planet { name } fragment P2 on Planet { name } `);

		const errors = validateMultiFragmentAST(schema, doc, 'P');

		expect(errors.length).toBe(1);
		expect(errors[0].message).toBe(
			'The following fragment were defined but never referenced: P2',
		);
	});
});
