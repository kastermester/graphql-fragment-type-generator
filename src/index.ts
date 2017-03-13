import * as AggregateError from 'aggregate-error';
import { buildClientSchema, parse, GraphQLSchema, Source } from 'graphql';
import { mapFragmentType } from './FragmentMapper';
import { mapMultiFragmentType } from './MultiFragmentMapper';
import { printType } from './Printer';
import { decorateWithTypeBrands, getTypeBrandNames } from './TypeBrandDecorator';
import { normalizeType } from './TypeNormalizer';
import * as T from './Types';
import {
	validateMultiFragmentAST,
	validateSingleFragmentAST,
} from './Validator';

function getNormalizedAst(
	schema: GraphQLSchema,
	fragmentText: string,
	fieldsToIgnore?: string[],
): T.FlattenedObjectType {
	const gqlAst = parse(new Source(fragmentText));
	const ast = mapFragmentType(schema, gqlAst, fieldsToIgnore);
	return normalizeType(schema, ast);
}

function getNormalizedMultiFragmentAst(
	schema: GraphQLSchema,
	fragmentText: string,
	rootFragmentName: string,
	fieldsToIgnore?: string[],
): T.FlattenedObjectType {
	const gqlAst = parse(new Source(fragmentText));
	const errors = validateMultiFragmentAST(schema, gqlAst, rootFragmentName);

	if (errors.length > 0) {
		if (errors.length === 1) {
			throw errors[0];
		}
		throw new AggregateError(errors);
	}

	const ast = mapMultiFragmentType(schema, gqlAst, rootFragmentName, fieldsToIgnore);
	return normalizeType(schema, ast);
}

export function getFragmentTextTypeDefinition(
	schema: GraphQLSchema,
	fragmentText: string,
	fieldsToIgnore?: string[],
	indentSpaces?: number,
): string {
	const ast = getNormalizedAst(schema, fragmentText, fieldsToIgnore);
	return printType(false, ast, indentSpaces);
}

export function getMultiFragmentTextTypeDefinition(
	schema: GraphQLSchema,
	fragmentText: string,
	rootFragmentName: string,
	fieldsToIgnore?: string[],
	indentSpaces?: number,
): string {
	const ast = getNormalizedMultiFragmentAst(schema, fragmentText, rootFragmentName, fieldsToIgnore);
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
	fieldsToIgnore?: string[],
	indentSpaces?: number,
): BrandedTypeResult {
	const normalizedAst = getNormalizedAst(schema, fragmentText, fieldsToIgnore);
	return getTypeBrandedTypeDefinition(normalizedAst, indentSpaces);
}

export function getMultiFragmentTextBrandedTypeDefinition(
	schema: GraphQLSchema,
	fragmentText: string,
	rootFragmentName: string,
	fieldsToIgnore?: string[],
	indentSpaces?: number,
): BrandedTypeResult {
	const normalizedAst = getNormalizedMultiFragmentAst(schema, fragmentText, rootFragmentName, fieldsToIgnore);
	return getTypeBrandedTypeDefinition(normalizedAst, indentSpaces);
}

function getTypeBrandedTypeDefinition(
	normalizedAst: T.FlattenedObjectType,
	indentSpaces?: number,
): BrandedTypeResult {
	const brandedAst = decorateWithTypeBrands(normalizedAst);

	const names = getTypeBrandNames(brandedAst);

	const brandsToImport = names.allRequiredNames;
	if (indentSpaces == null) {
		indentSpaces = 0;
	}
	const framgnetTypeBrandText = `{
${' '.repeat(indentSpaces + 2)}'': ${names.fragmentTypeNames.join(' | ')};
${' '.repeat(indentSpaces)}}`;

	const typeText = printType(false, brandedAst, indentSpaces);

	return {
		brandsToImport: brandsToImport,
		fragmentTypeBrandText: framgnetTypeBrandText,
		fragmentTypeText: typeText,
	};
}

export function getClientSchema(schemaData: any): GraphQLSchema {
	return buildClientSchema(schemaData);
}
