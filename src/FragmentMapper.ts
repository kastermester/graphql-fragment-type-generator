import * as AggregateError from 'aggregate-error';
import {
	DocumentNode,
	FragmentDefinitionNode,
	GraphQLList,
	GraphQLSchema,
} from 'graphql';
import { isPluralFragmentDefinition, mapSchema } from './FragmentMapperUtilities';
import { mapType } from './MultiFragmentMapper';
import * as T from './Types';
import { validateSingleFragmentAST } from './Validator';

export function mapFragmentType(
	schema: GraphQLSchema,
	ast: DocumentNode,
	removeFieldsNamed?: string[],
): T.ObjectType | T.ListType {
	const schemaWithDirective = mapSchema(schema);
	const errors = validateSingleFragmentAST(schemaWithDirective, ast);
	if (errors.length > 0) {
		if (errors.length === 1) {
			throw errors[0];
		}
		throw new AggregateError(errors);
	}

	const fragmentDefinition = ast.definitions[0] as FragmentDefinitionNode;

	const plural = isPluralFragmentDefinition(fragmentDefinition);

	const singularType = mapType(
		schema,
		ast,
		fragmentDefinition,
		removeFieldsNamed,
		/* allow unreferenced fragments */ true,
	);

	if (plural) {
		return {
			elementType: singularType,
			kind: 'List',
			schemaType: new GraphQLList(singularType.schemaType),
		};
	}
	return singularType;
}
