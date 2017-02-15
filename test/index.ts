import { assert } from 'chai';
import * as fs from 'fs';
import { buildClientSchema, GraphQLError } from 'graphql';
import * as path from 'path';
import { getFragmentTextBrandedTypeDefinition } from '../src/index';

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

describe('Public API', () => {
	it('Should throw on syntax errors', () => {
		const text = 'fragment on Planet { name }';

		assert.throws(() => getFragmentTextBrandedTypeDefinition(schema, text), GraphQLError);
	});

	it('Should print type definition on valid input', () => {
		const text = 'fragment P on Planet { name }';

		const result = getFragmentTextBrandedTypeDefinition(schema, text);

		const fragmentText = `{
  '': Planet;

  /**
   * The name of this planet.
   */
  name: string | null;
}`;
		const brandsToImport = ['Planet'];
		const brandText = `{
  '': Planet;
}`;
		const expected: typeof result = {
			brandsToImport: brandsToImport,
			fragmentTypeBrandText: brandText,
			fragmentTypeText: fragmentText,
		};
		assert.deepEqual(result, expected);
	});
});
