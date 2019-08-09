import * as fs from 'fs';
import {
	buildClientSchema,
	parse,
	DocumentNode,
	GraphQLInt,
	GraphQLInterfaceType,
	GraphQLID,
	GraphQLList,
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

	const mapped = mapFragmentType(schema, ast);

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

test('Can map super simple fragment - with undefined other fragment', () => {
	const ast = textToAST('fragment P on Planet { name ... OtherFragment }');

	const mapped = mapFragmentType(schema, ast);

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

test('Can map super simple plural fragment', () => {
	const ast = textToAST('fragment P on Planet @relay(plural: true) { name }');

	const mapped = mapFragmentType(schema, ast);

	expect(mapped).toMatchInlineSnapshot(`
		Object {
		  "elementType": Object {
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
		  "kind": "List",
		  "schemaType": "[Planet]",
		}
	`);
});

test('Can map aliases', () => {
	const ast = textToAST('fragment P on Planet { newName: name }');

	const mapped = mapFragmentType(schema, ast);

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

test('Can map export names', () => {
	const ast = textToAST('fragment P on Planet { name @exportType(name: "MyName") }');

	const mapped = mapFragmentType(schema, ast);

	expect(mapped).toMatchInlineSnapshot(`
		Object {
		  "fields": Array [
		    Object {
		      "exportName": "MyName",
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

test('Can map inline fragment spreads', () => {
	const ast = textToAST('fragment P on Node { ... on Planet { name } }');

	const mapped = mapFragmentType(schema, ast);

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

	const mapped = mapFragmentType(schema, ast);

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

	const mapped = mapFragmentType(schema, ast);

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
