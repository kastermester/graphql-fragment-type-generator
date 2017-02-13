import { assert } from 'chai';
import * as fs from 'fs';
import { buildClientSchema, parse, DocumentNode, Source } from 'graphql';
import * as path from 'path';
import { validateAST } from '../src/Validator';

function textToAST(text: string): DocumentNode {
	return parse(new Source(text));
}

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

describe('Validation', () => {
	it('Should reject a full query', () => {
		const doc = textToAST(`query { allPlanets { planets { name } } }`);

		const errors = validateAST(schema, doc);

		assert.equal(errors.length, 1);
		assert.equal(
			'Expected the Document to contain only a single FragmentDefinition',
			errors[0].message,
		);
	});

	it('It should accept a single fragment', () => {
		const doc = textToAST(`fragment P on Planet { name }`);

		const errors = validateAST(schema, doc);

		assert.equal(errors.length, 0);
	});

	it('It should reject two fragments', () => {
		const doc = textToAST(`fragment P on Planet { name } fragment P2 on Planet { name }`);

		const errors = validateAST(schema, doc);

		assert.equal(errors.length, 1);
		assert.equal(
			'Expected the Document to contain only a single FragmentDefinition',
			errors[0].message,
		);
	});
});
