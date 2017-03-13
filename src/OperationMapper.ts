import * as AggregateError from 'aggregate-error';
import { validate, DocumentNode, GraphQLSchema, OperationDefinitionNode } from 'graphql';
import { mapType } from './FragmentMapper';
import * as T from './Types';

export function mapOperationType(
	schema: GraphQLSchema,
	ast: DocumentNode,
	removeFieldsNamed?: string[],
): T.ObjectType {
	const errors = validate(schema, ast);
	if (errors.length > 0) {
		if (errors.length === 1) {
			throw errors[0];
		}
		throw new AggregateError(errors);
	}

	const rootNode = ast.definitions.find(v => v.kind === 'OperationDefinition') as OperationDefinitionNode | undefined;
	if (rootNode == null) {
		throw new Error('Could not find operation node');
	}
	return mapType(schema, ast, rootNode, removeFieldsNamed);
}
