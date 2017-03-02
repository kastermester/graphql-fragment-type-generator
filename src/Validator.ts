import {
	validate,
	visit,
	DocumentNode,
	FragmentDefinitionNode,
	FragmentSpreadNode,
	GraphQLError,
	GraphQLSchema,
	ValidationContext,
} from 'graphql';
import { ArgumentsOfCorrectType } from 'graphql/validation/rules/ArgumentsOfCorrectType';
import { FieldsOnCorrectType } from 'graphql/validation/rules/FieldsOnCorrectType';
import { FragmentsOnCompositeTypes } from 'graphql/validation/rules/FragmentsOnCompositeTypes';
import { KnownArgumentNames } from 'graphql/validation/rules/KnownArgumentNames';
import { KnownFragmentNames } from 'graphql/validation/rules/KnownFragmentNames';
import { KnownTypeNames } from 'graphql/validation/rules/KnownTypeNames';
import { NoFragmentCycles } from 'graphql/validation/rules/NoFragmentCycles';
import { OverlappingFieldsCanBeMerged } from 'graphql/validation/rules/OverlappingFieldsCanBeMerged';
import { PossibleFragmentSpreads } from 'graphql/validation/rules/PossibleFragmentSpreads';
import { ProvidedNonNullArguments } from 'graphql/validation/rules/ProvidedNonNullArguments';
import { ScalarLeafs } from 'graphql/validation/rules/ScalarLeafs';
import { UniqueArgumentNames } from 'graphql/validation/rules/UniqueArgumentNames';
import { UniqueDirectivesPerLocation } from 'graphql/validation/rules/UniqueDirectivesPerLocation';
import { UniqueInputFieldNames } from 'graphql/validation/rules/UniqueInputFieldNames';
import { VariablesInAllowedPosition } from 'graphql/validation/rules/VariablesInAllowedPosition';

const singleFragmentRules = [
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

const multiFragmentRules = [
	ArgumentsOfCorrectType,
	FieldsOnCorrectType,
	FragmentsOnCompositeTypes,
	KnownArgumentNames,
	KnownFragmentNames,
	KnownTypeNames,
	NoFragmentCycles,
	OverlappingFieldsCanBeMerged,
	PossibleFragmentSpreads,
	ProvidedNonNullArguments,
	ScalarLeafs,
	UniqueArgumentNames,
	UniqueDirectivesPerLocation,
	UniqueInputFieldNames,
	VariablesInAllowedPosition,
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

function DocumentIsMultipleFragmentsWithRootNamed(rootFragmentName: string): any {
	return (context: ValidationContext) => ({
		Document(doc: DocumentNode) {
			const nonFragment = doc.definitions.find(d => d.kind !== 'FragmentDefinition');

			if (nonFragment != null) {
				context.reportError(new GraphQLError('Expected the Document to only contain fragment definitions'));
				return false;
			}

			const definitions = doc.definitions as FragmentDefinitionNode[];

			const rootFragment = definitions.find(d => d.name.value === rootFragmentName);

			if (rootFragment == null) {
				context.reportError(new GraphQLError('Could not find root fragment with name: ' + rootFragment));
				return false;
			}

			const referencedFragmentNames: Map<string, Set<string>> = new Map();
			const getReferencedNames = (fragmentDefinition: FragmentDefinitionNode): Set<string> => {
				const key = fragmentDefinition.name.value;
				let names = referencedFragmentNames.get(key);
				if (names == null) {
					names = new Set<string>();
					referencedFragmentNames.set(key, names);
				}
				return names;
			};
			const generateVisitor = (definition: FragmentDefinitionNode) => ({
				FragmentSpread(fragmentSpread: FragmentSpreadNode) {
					const referencedNames = getReferencedNames(definition);
					referencedNames.add(fragmentSpread.name.value);
				},
			});

			const fragmentNames = new Set<string>();
			definitions.forEach(d => {
				fragmentNames.add(d.name.value);
				visit(d, generateVisitor(d), null);
			});

			const namesVisited = new Set<string>();
			const toVisit: string[] = [rootFragmentName];
			const unknownFragments = new Set<string>();

			while (toVisit.length > 0) {
				const nameToVisit = toVisit.pop() as string;
				if (namesVisited.has(nameToVisit)) {
					continue;
				}
				namesVisited.add(nameToVisit);

				const referencedNames = referencedFragmentNames.get(nameToVisit);

				if (referencedNames != null) {
					referencedNames.forEach(n => {
						if (n === rootFragmentName) {
							context.reportError(new GraphQLError(`Reference to root fragment ${rootFragmentName} is disallowed.`));
						}
						if (!fragmentNames.has(n)) {
							unknownFragments.add(n);
							return;
						}
						if (!namesVisited.has(n)) {
							toVisit.push(n);
						}
					});
				}
			}

			if (unknownFragments.size > 0) {
				context.reportError(
					new GraphQLError(
						`The following fragments were referenced but not defined: ${Array.from(unknownFragments.values()).join(', ')}`,
					),
				);
			}

			const unreferencedFragments = Array.from(fragmentNames.values()).filter(n => !namesVisited.has(n));
			if (unreferencedFragments.length > 0) {
				context.reportError(
					new GraphQLError(
						`The following fragment were defined but never referenced: ${unreferencedFragments.join(', ')}`,
					),
				);
			}

			return false;
		},
	});
}

export function validateSingleFragmentAST(schema: GraphQLSchema, document: DocumentNode): GraphQLError[] {
	return validate(schema, document, singleFragmentRules);
}

export function validateMultiFragmentAST(
	schema: GraphQLSchema,
	document: DocumentNode,
	rootFragmentName: string,
): GraphQLError[] {
	return validate(
		schema,
		document,
		multiFragmentRules.concat([DocumentIsMultipleFragmentsWithRootNamed(rootFragmentName)]),
	);
}
