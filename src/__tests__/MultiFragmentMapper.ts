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
import { mapMultiFragmentType } from '../MultiFragmentMapper';

function textToAST(text: string): DocumentNode {
	return parse(new Source(text));
}

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

test('Can remove ignored fields', () => {
	const ast = textToAST('fragment P on Planet { ignoredName: __typename }');

	const mapped = mapMultiFragmentType(schema, ast, 'P', ['ignoredName']);

	expect(mapped).toMatchInlineSnapshot(`
		Object {
		  "fields": Array [],
		  "fragmentSpreads": Array [],
		  "kind": "Object",
		  "schemaType": "Planet",
		}
	`);
});
test('Can map super simple fragment', () => {
	const ast = textToAST('fragment P on Planet { name }');

	const mapped = mapMultiFragmentType(schema, ast, 'P');

	expect(mapped).toMatchInlineSnapshot(`
		Object {
		  "fields": Array [
		    Object {
		      "exportName": null,
		      "fieldName": "name",
		      "resultFieldName": "name",
		      "schemaType": "String",
		      "type": Object {
		        "kind": "Scalar",
		        "knownPossibleValues": null,
		        "schemaType": "String",
		      },
		    },
		  ],
		  "fragmentSpreads": Array [],
		  "kind": "Object",
		  "schemaType": "Planet",
		}
	`);
});

test('Can map aliases', () => {
	const ast = textToAST('fragment P on Planet { newName: name }');

	const mapped = mapMultiFragmentType(schema, ast, 'P');

	expect(mapped).toMatchInlineSnapshot(`
		Object {
		  "fields": Array [
		    Object {
		      "exportName": null,
		      "fieldName": "name",
		      "resultFieldName": "newName",
		      "schemaType": "String",
		      "type": Object {
		        "kind": "Scalar",
		        "knownPossibleValues": null,
		        "schemaType": "String",
		      },
		    },
		  ],
		  "fragmentSpreads": Array [],
		  "kind": "Object",
		  "schemaType": "Planet",
		}
	`);
});

test('Can map inline fragment spreads', () => {
	const ast = textToAST('fragment P on Node { ... on Planet { name } }');

	const mapped = mapMultiFragmentType(schema, ast, 'P');

	expect(mapped).toMatchInlineSnapshot(`
		Object {
		  "fields": Array [],
		  "fragmentSpreads": Array [
		    Object {
		      "fields": Array [
		        Object {
		          "exportName": null,
		          "fieldName": "name",
		          "resultFieldName": "name",
		          "schemaType": "String",
		          "type": Object {
		            "kind": "Scalar",
		            "knownPossibleValues": null,
		            "schemaType": "String",
		          },
		        },
		      ],
		      "fragmentSpreads": Array [],
		      "kind": "Object",
		      "schemaType": "Planet",
		    },
		  ],
		  "kind": "Object",
		  "schemaType": "Node",
		}
	`);
});

test('Can map multiple inline fragment spreads', () => {
	const ast = textToAST('fragment P on Node { ... on Planet { name } ... on Person { gender birthYear } }');

	const mapped = mapMultiFragmentType(schema, ast, 'P');

	expect(mapped).toMatchInlineSnapshot(`
		Object {
		  "fields": Array [],
		  "fragmentSpreads": Array [
		    Object {
		      "fields": Array [
		        Object {
		          "exportName": null,
		          "fieldName": "name",
		          "resultFieldName": "name",
		          "schemaType": "String",
		          "type": Object {
		            "kind": "Scalar",
		            "knownPossibleValues": null,
		            "schemaType": "String",
		          },
		        },
		      ],
		      "fragmentSpreads": Array [],
		      "kind": "Object",
		      "schemaType": "Planet",
		    },
		    Object {
		      "fields": Array [
		        Object {
		          "exportName": null,
		          "fieldName": "gender",
		          "resultFieldName": "gender",
		          "schemaType": "String",
		          "type": Object {
		            "kind": "Scalar",
		            "knownPossibleValues": null,
		            "schemaType": "String",
		          },
		        },
		        Object {
		          "exportName": null,
		          "fieldName": "birthYear",
		          "resultFieldName": "birthYear",
		          "schemaType": "String",
		          "type": Object {
		            "kind": "Scalar",
		            "knownPossibleValues": null,
		            "schemaType": "String",
		          },
		        },
		      ],
		      "fragmentSpreads": Array [],
		      "kind": "Object",
		      "schemaType": "Person",
		    },
		  ],
		  "kind": "Object",
		  "schemaType": "Node",
		}
	`);
});

test('Can map multiple named fragment spreads', () => {
	const ast = textToAST(`
	fragment Planet on Planet { name }
	fragment Person on Person { gender birthYear }
	fragment Root on Node { ...Planet ...Person }
	`);

	const mapped = mapMultiFragmentType(schema, ast, 'Root');

	expect(mapped).toMatchInlineSnapshot(`
		Object {
		  "fields": Array [],
		  "fragmentSpreads": Array [
		    Object {
		      "fields": Array [
		        Object {
		          "exportName": null,
		          "fieldName": "name",
		          "resultFieldName": "name",
		          "schemaType": "String",
		          "type": Object {
		            "kind": "Scalar",
		            "knownPossibleValues": null,
		            "schemaType": "String",
		          },
		        },
		      ],
		      "fragmentSpreads": Array [],
		      "kind": "Object",
		      "schemaType": "Planet",
		    },
		    Object {
		      "fields": Array [
		        Object {
		          "exportName": null,
		          "fieldName": "gender",
		          "resultFieldName": "gender",
		          "schemaType": "String",
		          "type": Object {
		            "kind": "Scalar",
		            "knownPossibleValues": null,
		            "schemaType": "String",
		          },
		        },
		        Object {
		          "exportName": null,
		          "fieldName": "birthYear",
		          "resultFieldName": "birthYear",
		          "schemaType": "String",
		          "type": Object {
		            "kind": "Scalar",
		            "knownPossibleValues": null,
		            "schemaType": "String",
		          },
		        },
		      ],
		      "fragmentSpreads": Array [],
		      "kind": "Object",
		      "schemaType": "Person",
		    },
		  ],
		  "kind": "Object",
		  "schemaType": "Node",
		}
	`);
});

test('Can map mixes between field selections and fragments', () => {
	const ast = textToAST('fragment P on Node { id ... on Planet { name } ... on Person { gender birthYear } }');

	const mapped = mapMultiFragmentType(schema, ast, 'P');

	expect(mapped).toMatchInlineSnapshot(`
		Object {
		  "fields": Array [
		    Object {
		      "exportName": null,
		      "fieldName": "id",
		      "resultFieldName": "id",
		      "schemaType": "ID!",
		      "type": Object {
		        "kind": "NonNull",
		        "nullableType": Object {
		          "kind": "Scalar",
		          "knownPossibleValues": null,
		          "schemaType": "ID",
		        },
		        "schemaType": "ID!",
		      },
		    },
		  ],
		  "fragmentSpreads": Array [
		    Object {
		      "fields": Array [
		        Object {
		          "exportName": null,
		          "fieldName": "name",
		          "resultFieldName": "name",
		          "schemaType": "String",
		          "type": Object {
		            "kind": "Scalar",
		            "knownPossibleValues": null,
		            "schemaType": "String",
		          },
		        },
		      ],
		      "fragmentSpreads": Array [],
		      "kind": "Object",
		      "schemaType": "Planet",
		    },
		    Object {
		      "fields": Array [
		        Object {
		          "exportName": null,
		          "fieldName": "gender",
		          "resultFieldName": "gender",
		          "schemaType": "String",
		          "type": Object {
		            "kind": "Scalar",
		            "knownPossibleValues": null,
		            "schemaType": "String",
		          },
		        },
		        Object {
		          "exportName": null,
		          "fieldName": "birthYear",
		          "resultFieldName": "birthYear",
		          "schemaType": "String",
		          "type": Object {
		            "kind": "Scalar",
		            "knownPossibleValues": null,
		            "schemaType": "String",
		          },
		        },
		      ],
		      "fragmentSpreads": Array [],
		      "kind": "Object",
		      "schemaType": "Person",
		    },
		  ],
		  "kind": "Object",
		  "schemaType": "Node",
		}
	`);
});
