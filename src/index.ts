import * as AggregateError from 'aggregate-error';
import { buildClientSchema, parse, validate, GraphQLSchema, Source } from 'graphql';
import { extractNamedTypes } from './ExtractNamedTypes';
import { mapFragmentType } from './FragmentMapper';
import { mapMultiFragmentType } from './MultiFragmentMapper';
import { mapOperationType } from './OperationMapper';
import { printType } from './Printer';
import { decorateTypeWithTypeBrands, decorateWithTypeBrands, getTypeBrandNames } from './TypeBrandDecorator';
import { normalizeType } from './TypeNormalizer';
import * as T from './Types';
import {
	validateMultiFragmentAST,
	validateSingleFragmentAST,
} from './Validator';

export function getNormalizedAst(
	schema: GraphQLSchema,
	fragmentText: string,
	fieldsToIgnore?: string[],
): T.FlattenedObjectType {
	const gqlAst = parse(new Source(fragmentText));
	const ast = mapFragmentType(schema, gqlAst, fieldsToIgnore);
	return normalizeType(schema, ast);
}

export function getNormalizedMultiFragmentAst(
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

export function getNormalizedOperationAst(
	schema: GraphQLSchema,
	queryText: string,
	fieldsToIgnore?: string[],
): T.FlattenedObjectType {
	const gqlAst = parse(new Source(queryText));
	const errors = validate(schema, gqlAst);

	if (errors.length > 0) {
		if (errors.length === 1) {
			throw errors[0];
		}
		throw new AggregateError(errors);
	}

	const ast = mapOperationType(schema, gqlAst, fieldsToIgnore);
	return normalizeType(schema, ast);
}

export function getFragmentTextTypeDefinition(
	schema: GraphQLSchema,
	fragmentText: string,
	fieldsToIgnore?: string[],
	indentSpaces?: number,
): string {
	const ast = getNormalizedAst(schema, fragmentText, fieldsToIgnore);
	return printType(false, ast, false, indentSpaces);
}

export function getMultiFragmentTextTypeDefinition(
	schema: GraphQLSchema,
	fragmentText: string,
	rootFragmentName: string,
	fieldsToIgnore?: string[],
	indentSpaces?: number,
): string {
	const ast = getNormalizedMultiFragmentAst(schema, fragmentText, rootFragmentName, fieldsToIgnore);
	return printType(false, ast, false, indentSpaces);
}

export function getOperationTypeDefinition(
	schema: GraphQLSchema,
	queryText: string,
	fieldsToIgnore?: string[],
	indentSpaces?: number,
): string {
	const ast = getNormalizedOperationAst(schema, queryText, fieldsToIgnore);
	return printType(false, ast, false, indentSpaces);
}

export interface BrandedTypeResult {
	fragmentTypeText: string;
	brandsToImport: string[];
	fragmentTypeBrandText: string;
}

export interface NamedBrandedTypeResult {
	exportNamesTypeScriptCode: string;
	fragmentTypeText: string;
	fragmentTypeBrandText: string;
	brandsToImport: string[];
}

export function getFragmentTextBrandedTypeDefinition(
	schema: GraphQLSchema,
	fragmentText: string,
	fieldsToIgnore?: string[],
	indentSpaces?: number,
): BrandedTypeResult {
	const normalizedAst = getNormalizedAst(schema, fragmentText, fieldsToIgnore);
	return getTypeBrandedTypeDefinition(normalizedAst, false, indentSpaces);
}

export function getMultiFragmentTextBrandedTypeDefinition(
	schema: GraphQLSchema,
	fragmentText: string,
	rootFragmentName: string,
	fieldsToIgnore?: string[],
	indentSpaces?: number,
): BrandedTypeResult {
	const normalizedAst = getNormalizedMultiFragmentAst(schema, fragmentText, rootFragmentName, fieldsToIgnore);
	return getTypeBrandedTypeDefinition(normalizedAst, false, indentSpaces);
}

export function getOperationBrandedTypeDefinition(
	schema: GraphQLSchema,
	queryText: string,
	fieldsToIgnore?: string[],
	indentSpaces?: number,
): BrandedTypeResult {
	const normalizedAst = getNormalizedOperationAst(schema, queryText, fieldsToIgnore);
	return getTypeBrandedTypeDefinition(normalizedAst, false, indentSpaces);
}

export function getFragmentTextBrandedTypeWithNamesDefinition(
	schema: GraphQLSchema,
	fragmentText: string,
	fieldsToIgnore?: string[],
	indentSpaces?: number,
): NamedBrandedTypeResult {
	const normalizedAst = getNormalizedAst(schema, fragmentText, fieldsToIgnore);
	return getNamedTypeBrandedTypeDefinitions(normalizedAst, indentSpaces);
}

export function getMultiFragmentTextBrandedTypeWithNamesDefinition(
	schema: GraphQLSchema,
	fragmentText: string,
	rootFragmentName: string,
	fieldsToIgnore?: string[],
	indentSpaces?: number,
): NamedBrandedTypeResult {
	const normalizedAst = getNormalizedMultiFragmentAst(schema, fragmentText, rootFragmentName, fieldsToIgnore);
	return getNamedTypeBrandedTypeDefinitions(normalizedAst, indentSpaces);
}

export function getOperationBrandedTypeWithNamesDefinition(
	schema: GraphQLSchema,
	queryText: string,
	fieldsToIgnore?: string[],
	indentSpaces?: number,
): NamedBrandedTypeResult {
	const normalizedAst = getNormalizedOperationAst(schema, queryText, fieldsToIgnore);
	return getNamedTypeBrandedTypeDefinitions(normalizedAst, indentSpaces);
}

function getTypeBrandedTypeDefinition(
	normalizedAst: T.FlattenedObjectType,
	withNames: boolean,
	indentSpaces?: number,
): BrandedTypeResult {
	const brandedAst = decorateWithTypeBrands(normalizedAst);

	const names = getTypeBrandNames(brandedAst);

	const brandsToImport = names.allRequiredNames;
	const fragmentTypeBrandText = getFragmentTypeBrandText(names.fragmentTypeNames);

	const typeText = printType(false, brandedAst, withNames, indentSpaces);

	return {
		brandsToImport: brandsToImport,
		fragmentTypeBrandText: fragmentTypeBrandText,
		fragmentTypeText: typeText,
	};
}

function getFragmentTypeBrandText(names: string[], indentSpaces?: number): string {
	if (indentSpaces == null) {
		indentSpaces = 0;
	}
	return `{
${' '.repeat(indentSpaces + 2)}'': ${names.join(' | ')};
${' '.repeat(indentSpaces)}}`;
}

function getNamedTypeBrandedTypeDefinitions(
	normalizedAst: T.FlattenedObjectType,
	indentSpaces?: number,
): NamedBrandedTypeResult {
	const res = getTypeBrandedTypeDefinition(normalizedAst, true, indentSpaces);
	const extractedNames = extractNamedTypes(normalizedAst);

	const tsChunks: string[] = [];

	extractedNames.forEach((type, name) => {
		const decorated = decorateTypeWithTypeBrands(type);

		const def = printType(false, decorated, true, 0);
		tsChunks.push(`export type ${name} = ${def};`);
	});

	return {
		...res,
		exportNamesTypeScriptCode: tsChunks.join('\n'),
	};
}

export function getClientSchema(schemaData: any): GraphQLSchema {
	return buildClientSchema(schemaData);
}
