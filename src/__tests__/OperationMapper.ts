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
import { mapOperationType } from '../OperationMapper';

function textToAST(text: string): DocumentNode {
	return parse(new Source(text));
}

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

test('Can remove ignored fields', () => {
	const ast = textToAST(`query {
	person(personID: 4) {
		ignoredName: __typename
		name
	}
}`);

	const mapped = mapOperationType(schema, ast, ['ignoredName']);

	expect(mapped).toMatchInlineSnapshot(`
		Object {
		  "fields": Array [
		    Object {
		      "exportName": null,
		      "fieldName": "person",
		      "resultFieldName": "person",
		      "schemaType": "Person",
		      "type": Object {
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
		        "schemaType": "Person",
		      },
		    },
		  ],
		  "fragmentSpreads": Array [],
		  "kind": "Object",
		  "schemaType": "Root",
		}
	`);
});
