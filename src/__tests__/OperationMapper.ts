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

	const expected: typeof mapped = {
		fields: [
			{
				fieldName: 'person',
				resultFieldName: 'person',
				schemaType: schema.getType('Person') as GraphQLObjectType,
				type: {
					fields: [
						{
							fieldName: 'name',
							resultFieldName: 'name',
							schemaType: GraphQLString,
							type: {
								kind: 'Scalar',
								knownPossibleValues: null,
								schemaType: GraphQLString,
							},
						},
					],
					fragmentSpreads: [],
					kind: 'Object',
					schemaType: schema.getType('Person') as GraphQLObjectType,
				},
			},
		],
		fragmentSpreads: [],
		kind: 'Object',
		schemaType: schema.getQueryType(),
	};
	expect(mapped).toEqual(expected);
});
