import * as AggregateError from 'aggregate-error';
import { parse, GraphQLSchema, Source } from 'graphql';
import { mapFragmentType } from './FragmentMapper';
import { printType } from './Printer';
import { decorateWithTypeBrands, getTypeBrandNames } from './TypeBrandDecorator';
import { normalizeType } from './TypeNormalizer';
import * as T from './Types';
import { validateAST } from './Validator';

function getNormalizedAst(
	schema: GraphQLSchema,
	fragmentText: string,
): T.FlattenedObjectType {
	const gqlAst = parse(new Source(fragmentText));
	const errors = validateAST(schema, gqlAst);

	if (errors.length > 0) {
		if (errors.length === 1) {
			throw errors[0];
		}
		throw new AggregateError(errors);
	}

	const ast = mapFragmentType(schema, gqlAst);
	return normalizeType(schema, ast);
}

export function getFragmentTextTypeDefinition(
	schema: GraphQLSchema,
	fragmentText: string,
	indentSpaces?: number,
): string {
	const ast = getNormalizedAst(schema, fragmentText);
	return printType(false, ast, indentSpaces);
}

export interface BrandedTypeResult {
	fragmentTypeText: string;
	brandsToImport: string[];
	fragmentTypeBrandText: string;
}

export function getFragmentTextBrandedTypeDefinition(
	schema: GraphQLSchema,
	fragmentText: string,
	indentSpaces?: number,
): BrandedTypeResult {
	const normalizedAst = getNormalizedAst(schema, fragmentText);
	const brandedAst = decorateWithTypeBrands(normalizedAst);

	const names = getTypeBrandNames(brandedAst);

	const brandsToImport = names.allRequiredNames;
	if (indentSpaces == null) {
		indentSpaces = 0;
	}
	const framgnetTypeBrandText = `{
${' '.repeat(indentSpaces + 2)}'': ${names.fragmentTypeNames.join(' | ')}
}`;

	const typeText = printType(false, brandedAst, indentSpaces);

	return {
		brandsToImport: brandsToImport,
		fragmentTypeBrandText: framgnetTypeBrandText,
		fragmentTypeText: typeText,
	};
}
