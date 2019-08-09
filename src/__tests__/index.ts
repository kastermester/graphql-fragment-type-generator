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

	expect(result).toMatchInlineSnapshot(`
		Object {
		  "brandsToImport": Array [
		    "Planet",
		  ],
		  "fragmentTypeBrandText": "{
		  '': Planet;
		}",
		  "fragmentTypeText": "{
		  '': Planet;

		  ' $fragmentRefs': any;

		  /**
		   * The name of this planet.
		   */
		  name: string | null;
		}",
		}
	`);
});

test('Should print type definition on valid input (plural)', () => {
	const text = 'fragment P on Planet @relay(plural: true) { name }';

	const result = getFragmentTextBrandedTypeDefinition(schema, text);

	expect(result).toMatchInlineSnapshot(`
		Object {
		  "brandsToImport": Array [
		    "Planet",
		  ],
		  "fragmentTypeBrandText": "({
		  '': Planet;
		} | null)[]",
		  "fragmentTypeText": "({
		  '': Planet;

		  ' $fragmentRefs': any;

		  /**
		   * The name of this planet.
		   */
		  name: string | null;
		} | null)[]",
		}
	`);
});

test('Should print as big union when querying interface type', () => {
	const text = 'fragment N on Node { id }';

	const result = getFragmentTextBrandedTypeDefinition(schema, text);
	expect(result).toMatchInlineSnapshot(`
		Object {
		  "brandsToImport": Array [
		    "Film",
		    "Person",
		    "Planet",
		    "Species",
		    "Starship",
		    "Vehicle",
		  ],
		  "fragmentTypeBrandText": "{
		  '': Film | Person | Planet | Species | Starship | Vehicle;
		}",
		  "fragmentTypeText": "{
		  '': Film;

		  ' $fragmentRefs': any;

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Person;

		  ' $fragmentRefs': any;

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Planet;

		  ' $fragmentRefs': any;

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Species;

		  ' $fragmentRefs': any;

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Starship;

		  ' $fragmentRefs': any;

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Vehicle;

		  ' $fragmentRefs': any;

		  /**
		   * The ID of an object
		   */
		  id: string;
		}",
		}
	`);
});

test('Should print as big union with typenames when querying interface type', () => {
	const text = 'fragment N on Node { id __typename }';

	const result = getFragmentTextBrandedTypeDefinition(schema, text);
	expect(result).toMatchInlineSnapshot(`
		Object {
		  "brandsToImport": Array [
		    "Film",
		    "Person",
		    "Planet",
		    "Species",
		    "Starship",
		    "Vehicle",
		  ],
		  "fragmentTypeBrandText": "{
		  '': Film | Person | Planet | Species | Starship | Vehicle;
		}",
		  "fragmentTypeText": "{
		  '': Film;

		  ' $fragmentRefs': any;

		  __typename: \\"Film\\";

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Person;

		  ' $fragmentRefs': any;

		  __typename: \\"Person\\";

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Planet;

		  ' $fragmentRefs': any;

		  __typename: \\"Planet\\";

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Species;

		  ' $fragmentRefs': any;

		  __typename: \\"Species\\";

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Starship;

		  ' $fragmentRefs': any;

		  __typename: \\"Starship\\";

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Vehicle;

		  ' $fragmentRefs': any;

		  __typename: \\"Vehicle\\";

		  /**
		   * The ID of an object
		   */
		  id: string;
		}",
		}
	`);
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

	expect(result).toMatchInlineSnapshot(`
		Object {
		  "brandsToImport": Array [
		    "Person",
		    "Planet",
		    "PlanetResidentsConnection",
		    "PlanetResidentsEdge",
		  ],
		  "fragmentTypeBrandText": "{
		  '': Planet;
		}",
		  "fragmentTypeText": "{
		  '': Planet;

		  ' $fragmentRefs': any;

		  __typename: \\"Planet\\";

		  residentConnection: {
		      '': PlanetResidentsConnection;

		      ' $fragmentRefs': any;

		      __typename: \\"PlanetResidentsConnection\\";

		      /**
		       * A list of edges.
		       */
		      edges: ({
		          '': PlanetResidentsEdge;

		          ' $fragmentRefs': any;

		          __typename: \\"PlanetResidentsEdge\\";

		          /**
		           * The item at the end of the edge
		           */
		          node: {
		              '': Person;

		              ' $fragmentRefs': any;

		              __typename: \\"Person\\";

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
		}",
		}
	`);
});

test('Should throw on syntax errors', () => {
	const text = 'fragment on Planet { name }';

	expect(() => getMultiFragmentTextBrandedTypeDefinition(schema, text, 'P')).toThrowError(GraphQLError);
});

test('Should print type definition on valid input - in multi fragment mode', () => {
	const text = 'fragment N on Node { __typename id ...P } fragment P on Planet { name }';

	const result = getMultiFragmentTextBrandedTypeDefinition(schema, text, 'N');

	expect(result).toMatchInlineSnapshot(`
		Object {
		  "brandsToImport": Array [
		    "Film",
		    "Person",
		    "Planet",
		    "Species",
		    "Starship",
		    "Vehicle",
		  ],
		  "fragmentTypeBrandText": "{
		  '': Film | Person | Planet | Species | Starship | Vehicle;
		}",
		  "fragmentTypeText": "{
		  '': Film;

		  ' $fragmentRefs': any;

		  __typename: \\"Film\\";

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Person;

		  ' $fragmentRefs': any;

		  __typename: \\"Person\\";

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Planet;

		  ' $fragmentRefs': any;

		  __typename: \\"Planet\\";

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

		  ' $fragmentRefs': any;

		  __typename: \\"Species\\";

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Starship;

		  ' $fragmentRefs': any;

		  __typename: \\"Starship\\";

		  /**
		   * The ID of an object
		   */
		  id: string;
		} | {
		  '': Vehicle;

		  ' $fragmentRefs': any;

		  __typename: \\"Vehicle\\";

		  /**
		   * The ID of an object
		   */
		  id: string;
		}",
		}
	`);
});

test('Should print type definition on valid input - in multi fragment mode', () => {
	const text = 'fragment N on Node { __typename id ...P } fragment P on Planet { name }';

	const result = getMultiFragmentTextTypeDefinition(schema, text, 'N');

	expect(result).toMatchInlineSnapshot(`
								"{
								  __typename: \\"Planet\\";

								  /**
								   * The ID of an object
								   */
								  id: string;

								  /**
								   * The name of this planet.
								   */
								  name: string | null;
								} | {
								  __typename: \\"Film\\" | \\"Person\\" | \\"Species\\" | \\"Starship\\" | \\"Vehicle\\";

								  /**
								   * The id of the object.
								   */
								  id: string;
								}"
				`);
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

	expect(res).toMatchInlineSnapshot(`
		Object {
		  "brandsToImport": Array [
		    "Film",
		    "Person",
		    "PersonFilmsConnection",
		    "PersonFilmsEdge",
		    "Planet",
		    "PlanetResidentsConnection",
		    "PlanetResidentsEdge",
		  ],
		  "exportNamesTypeScriptCode": "export type NodeType = {
		  '': Person;

		  ' $fragmentRefs': any;

		  /**
		   * The name of this person.
		   */
		  name: string | null;

		  filmConnection: FilmType | null;
		};
		export type FilmType = {
		  '': PersonFilmsConnection;

		  ' $fragmentRefs': any;

		  /**
		   * A list of edges.
		   */
		  edges: ({
		      '': PersonFilmsEdge;

		      ' $fragmentRefs': any;

		      /**
		       * The item at the end of the edge
		       */
		      node: {
		          '': Film;

		          ' $fragmentRefs': any;

		          /**
		           * The ID of an object
		           */
		          id: string;
		        } | null;
		    } | null)[] | null;
		};",
		  "fragmentTypeBrandText": "{
		  '': Planet;
		}",
		  "fragmentTypeText": "{
		  '': Planet;

		  ' $fragmentRefs': any;

		  residentConnection: {
		      '': PlanetResidentsConnection;

		      ' $fragmentRefs': any;

		      /**
		       * A list of edges.
		       */
		      edges: ({
		          '': PlanetResidentsEdge;

		          ' $fragmentRefs': any;

		          /**
		           * The item at the end of the edge
		           */
		          node: NodeType | null;
		        } | null)[] | null;
		    } | null;
		}",
		}
	`);
});
