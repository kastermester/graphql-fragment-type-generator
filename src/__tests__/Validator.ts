import * as fs from 'fs';
import { buildClientSchema, parse, DocumentNode, Source } from 'graphql';
import * as path from 'path';
import { validateAST } from '../Validator';

function textToAST(text: string): DocumentNode {
	return parse(new Source(text));
}

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

test('Should reject a full query', () => {
	const doc = textToAST(`query { allPlanets { planets { name } } }`);

	const errors = validateAST(schema, doc);

	expect(errors.length).toBe(1);
	expect(errors[0].message).toBe('Expected the Document to contain only a single FragmentDefinition');
});

test('It should accept a single fragment', () => {
	const doc = textToAST(`fragment P on Planet { name }`);

	const errors = validateAST(schema, doc);

	expect(errors.length).toBe(0);
});

test('It should reject two fragments', () => {
	const doc = textToAST(`fragment P on Planet { name } fragment P2 on Planet { name }`);

	const errors = validateAST(schema, doc);

	expect(errors.length).toBe(1);
	expect(errors[0].message).toBe('Expected the Document to contain only a single FragmentDefinition');
});
