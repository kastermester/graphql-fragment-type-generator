import * as fs from 'fs';
import { buildClientSchema, GraphQLError } from 'graphql';
import * as path from 'path';
import { mapSchema } from '../FragmentMapperUtilities';
import {
	getFragmentTextBrandedTypeDefinition,
	getFragmentTextBrandedTypeWithNamesDefinition,
	getMultiFragmentTextBrandedTypeDefinition,
	getMultiFragmentTextTypeDefinition,
} from '../index';

const schema = mapSchema(
	buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data),
);

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

test('Should print as big union when querying interface type', () => {
	const text = 'fragment N on Node { id }';

	const result = getFragmentTextBrandedTypeDefinition(schema, text);

	const fragmentText = `{
  '': Film;

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Person;

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Planet;

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Species;

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Starship;

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Vehicle;

  /**
   * The ID of an object
   */
  id: string;
}`;
	const brandsToImport = ['Film', 'Person', 'Planet', 'Species', 'Starship', 'Vehicle'];
	const brandText = `{
  '': Film | Person | Planet | Species | Starship | Vehicle;
}`;
	const expected: typeof result = {
		brandsToImport: brandsToImport,
		fragmentTypeBrandText: brandText,
		fragmentTypeText: fragmentText,
	};
	expect(result).toEqual(expected);
});

test('Should print as big union with typenames when querying interface type', () => {
	const text = 'fragment N on Node { id __typename }';

	const result = getFragmentTextBrandedTypeDefinition(schema, text);

	const fragmentText = `{
  '': Film;

  __typename: "Film";

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Person;

  __typename: "Person";

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Planet;

  __typename: "Planet";

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Species;

  __typename: "Species";

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Starship;

  __typename: "Starship";

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Vehicle;

  __typename: "Vehicle";

  /**
   * The ID of an object
   */
  id: string;
}`;
	const brandsToImport = ['Film', 'Person', 'Planet', 'Species', 'Starship', 'Vehicle'];
	const brandText = `{
  '': Film | Person | Planet | Species | Starship | Vehicle;
}`;
	const expected: typeof result = {
		brandsToImport: brandsToImport,
		fragmentTypeBrandText: brandText,
		fragmentTypeText: fragmentText,
	};
	expect(result).toEqual(expected);
});

test('Should recurse down into connection fields with type brands', () => {
	const text = `fragment P on Planet {
	__typename
		residentConnection {
		__typename
		edges {
			__typename
			node {
				__typename
				id
				name
			}
		}
	}
}`;
	const result = getFragmentTextBrandedTypeDefinition(schema, text);

	const fragmentText = `{
  '': Planet;

  __typename: "Planet";

  residentConnection: {
      '': PlanetResidentsConnection;

      __typename: "PlanetResidentsConnection";

      /**
       * A list of edges.
       */
      edges: ({
          '': PlanetResidentsEdge;

          __typename: "PlanetResidentsEdge";

          /**
           * The item at the end of the edge
           */
          node: {
              '': Person;

              __typename: "Person";

              /**
               * The ID of an object
               */
              id: string;

              /**
               * The name of this person.
               */
              name: string | null;
            } | null;
        } | null)[] | null;
    } | null;
}`;

	expect(result.fragmentTypeText).toEqual(fragmentText);
	expect(result.brandsToImport).toEqual([
		'Person',
		'Planet',
		'PlanetResidentsConnection',
		'PlanetResidentsEdge',
	]);
	const brandedType = `{
  '': Planet;
}`;
	expect(result.fragmentTypeBrandText).toEqual(brandedType);
});

test('Should throw on syntax errors', () => {
	const text = 'fragment on Planet { name }';

	expect(() => getMultiFragmentTextBrandedTypeDefinition(schema, text, 'P')).toThrowError(GraphQLError);
});

test('Should print type definition on valid input - in multi fragment mode', () => {
	const text = 'fragment N on Node { __typename id ...P } fragment P on Planet { name }';

	const result = getMultiFragmentTextBrandedTypeDefinition(schema, text, 'N');

	const fragmentText = `{
  '': Film;

  __typename: "Film";

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Person;

  __typename: "Person";

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Planet;

  __typename: "Planet";

  /**
   * The ID of an object
   */
  id: string;

  /**
   * The name of this planet.
   */
  name: string | null;
} | {
  '': Species;

  __typename: "Species";

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Starship;

  __typename: "Starship";

  /**
   * The ID of an object
   */
  id: string;
} | {
  '': Vehicle;

  __typename: "Vehicle";

  /**
   * The ID of an object
   */
  id: string;
}`;
	const brandsToImport = ['Film', 'Person', 'Planet', 'Species', 'Starship', 'Vehicle'];
	const brandText = `{
  '': Film | Person | Planet | Species | Starship | Vehicle;
}`;
	const expected: typeof result = {
		brandsToImport: brandsToImport,
		fragmentTypeBrandText: brandText,
		fragmentTypeText: fragmentText,
	};
	expect(result).toEqual(expected);
});

test('Should print type definition on valid input - in multi fragment mode', () => {
	const text = 'fragment N on Node { __typename id ...P } fragment P on Planet { name }';

	const result = getMultiFragmentTextTypeDefinition(schema, text, 'N');

	const fragmentText = `{
  __typename: "Planet";

  /**
   * The ID of an object
   */
  id: string;

  /**
   * The name of this planet.
   */
  name: string | null;
} | {
  __typename: "Film" | "Person" | "Species" | "Starship" | "Vehicle";

  /**
   * The id of the object.
   */
  id: string;
}`;
	expect(result).toBe(fragmentText);
});

test('Should be able to print type with exported names', () => {
	const text = `
fragment P on Planet {
	residentConnection {
		edges {
			node @exportType(name: "NodeType") {
				name
				filmConnection @exportType(name: "FilmType") {
					edges {
						node {
							id
						}
					}
				}
			}
		}
	}
}
`;

	const res = getFragmentTextBrandedTypeWithNamesDefinition(schema, text);

	//tslint:disable
	console.log(res.fragmentTypeText);
	console.log(res.exportNamesTypeScriptCode);
});
