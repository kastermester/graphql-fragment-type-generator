import * as AggregateError from 'aggregate-error';
import {
	DocumentNode,
	FieldNode,
	FragmentDefinitionNode,
	GraphQLSchema,
} from 'graphql';
import { FragmentSpreadNode } from 'graphql/language';
import { mapType } from './FragmentMapper';
import * as T from './Types';
import { validateMultiFragmentAST } from './Validator';

export function mapMultiFragmentType(
	schema: GraphQLSchema,
	ast: DocumentNode,
	rootFragmentName: string,
	removeFieldsNamed?: string[],
): T.ObjectType {
	const errors = validateMultiFragmentAST(schema, ast, rootFragmentName);
	if (errors.length > 0) {
		if (errors.length === 1) {
			throw errors[0];
		}
		throw new AggregateError(errors);
	}
	const fragmentNode = ast.definitions.find(
		v => v.kind === 'FragmentDefinition' && v.name.value === rootFragmentName,
	) as FragmentDefinitionNode | undefined;
	if (fragmentNode == null) {
		throw new Error('Unable to find fragment named: ' + rootFragmentName);
	}
	return mapType(
		schema,
		ast,
		fragmentNode,
		removeFieldsNamed,
	);
}
