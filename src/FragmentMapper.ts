import * as AggregateError from 'aggregate-error';
import {
	DocumentNode,
	FragmentDefinitionNode,
	GraphQLSchema,
} from 'graphql';
import { mapSchema } from './FragmentMapperUtilities';
import { mapType } from './MultiFragmentMapper';
import * as T from './Types';
import { validateSingleFragmentAST } from './Validator';

export function mapFragmentType(schema: GraphQLSchema, ast: DocumentNode, removeFieldsNamed?: string[]): T.ObjectType {
	const schemaWithDirective = mapSchema(schema);
	const errors = validateSingleFragmentAST(schemaWithDirective, ast);
	if (errors.length > 0) {
		if (errors.length === 1) {
			throw errors[0];
		}
		throw new AggregateError(errors);
	}

	const fragmentDefinition = ast.definitions[0] as FragmentDefinitionNode;

	return mapType(schema, ast, fragmentDefinition, removeFieldsNamed);
}
