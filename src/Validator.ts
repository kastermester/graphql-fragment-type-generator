import { validate, DocumentNode, GraphQLError, GraphQLSchema, ValidationContext } from 'graphql';
import { ArgumentsOfCorrectType } from 'graphql/validation/rules/ArgumentsOfCorrectType';
import { FieldsOnCorrectType } from 'graphql/validation/rules/FieldsOnCorrectType';
import { FragmentsOnCompositeTypes } from 'graphql/validation/rules/FragmentsOnCompositeTypes';
import { KnownArgumentNames } from 'graphql/validation/rules/KnownArgumentNames';
import { KnownTypeNames } from 'graphql/validation/rules/KnownTypeNames';
import { OverlappingFieldsCanBeMerged } from 'graphql/validation/rules/OverlappingFieldsCanBeMerged';
import { PossibleFragmentSpreads } from 'graphql/validation/rules/PossibleFragmentSpreads';
import { ProvidedNonNullArguments } from 'graphql/validation/rules/ProvidedNonNullArguments';
import { ScalarLeafs } from 'graphql/validation/rules/ScalarLeafs';
import { UniqueArgumentNames } from 'graphql/validation/rules/UniqueArgumentNames';
import { UniqueDirectivesPerLocation } from 'graphql/validation/rules/UniqueDirectivesPerLocation';
import { UniqueInputFieldNames } from 'graphql/validation/rules/UniqueInputFieldNames';
import { VariablesInAllowedPosition } from 'graphql/validation/rules/VariablesInAllowedPosition';

const rules = [
	ArgumentsOfCorrectType,
	FieldsOnCorrectType,
	FragmentsOnCompositeTypes,
	KnownArgumentNames,
	KnownTypeNames,
	OverlappingFieldsCanBeMerged,
	PossibleFragmentSpreads,
	ProvidedNonNullArguments,
	ScalarLeafs,
	UniqueArgumentNames,
	UniqueDirectivesPerLocation,
	UniqueInputFieldNames,
	VariablesInAllowedPosition,
	// Custom rules
	DocumentContainsSingleFragment,
];

function DocumentContainsSingleFragment(context: ValidationContext): any {
	return {
		Document(doc: DocumentNode) {
			if (doc.definitions.length !== 1 || doc.definitions[0].kind !== 'FragmentDefinition') {
				context.reportError(new GraphQLError('Expected the Document to contain only a single FragmentDefinition', [doc]));
			}

			return false;
		},
	};
}

export function validateAST(schema: GraphQLSchema, document: DocumentNode): GraphQLError[] {
	return validate(schema, document, rules);
}
