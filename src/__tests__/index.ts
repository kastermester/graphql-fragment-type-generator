import * as fs from 'fs';
import { buildClientSchema, GraphQLError } from 'graphql';
import * as path from 'path';
import { getFragmentTextBrandedTypeDefinition } from '../index';

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

test('Should throw on syntax errors', () => {
	const text = 'fragment on Planet { name }';

	expect(() => getFragmentTextBrandedTypeDefinition(schema, text)).toThrowError(GraphQLError);
});

test('Should print type definition on valid input', () => {
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
	expect(result).toEqual(expected);
});
