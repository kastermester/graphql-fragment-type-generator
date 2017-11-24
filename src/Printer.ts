import { GraphQLBoolean, GraphQLFloat, GraphQLInt, GraphQLScalarType } from 'graphql';
import * as T from './Types';
// tslint:disable:no-console

export function printObjectType(type: T.ObjectType): void {
	console.log('Fragment on ' + type.schemaType.name + ' {');
	printObjectTypeFields(type, 2);
	console.log('}');
}

export function printFlattedObjectType(type: T.FlattenedObjectType): void {
	console.log('Fragment on ' + type.schemaTypes.map(t => t.name).join(' | ') + ' {');
	printFlattenedObjectTypeFields(type, 2);
	console.log('}');
}

function indent(level: number): string {
	return ' '.repeat(level);
}

function objecTypeOrNull(type: T.FragmentType): T.ObjectType | null {
	switch (type.kind) {
		case 'Scalar':
			return null;
		case 'List':
			return objecTypeOrNull(type.elementType);
		case 'NonNull':
			return objecTypeOrNull(type.nullableType);
		case 'Object':
			return type;
		default:
			throw new Error('Unknown kind ' + (type as any).kind);
	}
}

function flattenedObjecTypeOrNull(type: T.FlattenedType): T.FlattenedObjectType | null {
	switch (type.kind) {
		case 'Reference': // FALLTHROUGH
		case 'Scalar':
			return null;
		case 'List':
			return flattenedObjecTypeOrNull(type.elementType);
		case 'NonNull':
			return flattenedObjecTypeOrNull(type.nullableType);
		case 'Object':
			return type;
		default:
			throw new Error('Unknown kind ' + (type as any).kind);
	}
}

function printObjectTypeFields(type: T.ObjectType, indentLevel: number): void {
	const indents = indent(indentLevel);
	for (const field of type.fields) {
		const alias = field.resultFieldName !== field.fieldName ? `${field.resultFieldName}: ` : '';
		const objectType = objecTypeOrNull(field.type);

		if (objectType != null) {
			console.log(`${indents}${alias}${field.fieldName} {`);
			printObjectTypeFields(objectType, indentLevel + 2);
			console.log(`${indents}}`);
		} else {
			console.log(`${indents}${alias}${field.fieldName}`);
		}
	}
	printFragments(type.fragmentSpreads, indentLevel);
}

function printFragments(fragments: T.ObjectType[], indentLevel: number): void {
	const indents = indent(indentLevel);
	for (const fragment of fragments) {
		console.log(`${indents}... on ${fragment.schemaType.name} {`);
		printObjectTypeFields(fragment, indentLevel + 2);
		console.log(`${indents}}`);
	}
}

function printFlattenedObjectTypeFields(type: T.FlattenedObjectType, indentLevel: number): void {
	const indents = indent(indentLevel);
	if (type.objectKind === 'Single') {
		for (const field of type.fields) {
			const alias = field.resultFieldName !== field.fieldName ? `${field.resultFieldName}: ` : '';
			const objectType = flattenedObjecTypeOrNull(field.type);

			if (objectType != null) {
				const types = objectType.schemaTypes.map(t => t.name).join(' | ');
				console.log(`${indents}${alias}${field.fieldName} (${types}) {`);
				printFlattenedObjectTypeFields(objectType, indentLevel + 2);
				console.log(`${indents}}`);
			} else {
				console.log(`${indents}${alias}${field.fieldName}`);
			}
		}
		return;
	}
	console.log(`${indents}(`);
	printFlattenedFragments(type.fragmentSpreads, indentLevel + 2);
	console.log(`${indents})`);
}

function printSpecificObjectTypeFields(type: T.FlattenedSpreadType, indentLevel: number): void {
	const indents = indent(indentLevel);
	for (const field of type.fields) {
		const alias = field.resultFieldName !== field.fieldName ? `${field.resultFieldName}: ` : '';
		const objectType = flattenedObjecTypeOrNull(field.type);

		if (objectType != null) {
			const types = objectType.schemaTypes.map(t => t.name).join(' | ');
			console.log(`${indents}${alias}${field.fieldName} (${types}) {`);
			printFlattenedObjectTypeFields(objectType, indentLevel + 2);
			console.log(`${indents}}`);
		} else {
			console.log(`${indents}${alias}${field.fieldName}`);
		}
	}
}

function printFlattenedFragments(fragments: T.FlattenedSpreadType[], indentLevel: number): void {
	const indents = indent(indentLevel);
	let first = true;
	for (const fragment of fragments) {
		if (!first) {
			console.log(`${indents}|`);
		}
		first = false;
		const types =
			fragment.kind === 'SpecificObject'
				? fragment.schemaType.name
				: fragment.schemaTypes.map(t => t.name).join(' | ');
		console.log(`${indents}... on ${types} {`);
		printSpecificObjectTypeFields(fragment, indentLevel + 2);
		console.log(`${indents}}`);
	}
}

function scalarTypeToTSType(type: GraphQLScalarType): string {
	if (type === GraphQLInt || type === GraphQLFloat) {
		return 'number';
	}
	if (type === GraphQLBoolean) {
		return 'boolean';
	}

	return 'string';
}

export function printType(nullable: boolean, type: T.FlattenedType, withNames: boolean, indentLevel?: number): string {
	indentLevel = indentLevel != null ? indentLevel : 0;
	const wrap = (t: string) => {
		if (!nullable) {
			return t;
		}
		return `${t} | null`;
	};
	switch (type.kind) {
		case 'Reference': {
			return wrap(type.names.join(' | '));
		}
		case 'Scalar': {
			if (type.knownPossibleValues != null) {
				return wrap(type.knownPossibleValues.map(e => JSON.stringify(e)).join(' | '));
			}
			return wrap(scalarTypeToTSType(type.schemaType as GraphQLScalarType));
		}
		case 'NonNull': {
			return printType(false, type.nullableType, withNames, indentLevel + 2);
		}
		case 'List': {
			const complexElementType = isParenAroundTypeNeeded(type.elementType);
			const elementType = printType(true, type.elementType, withNames, indentLevel);
			return wrap(complexElementType ? `(${elementType})[]` : `${elementType}[]`);
		}
		case 'Object': {
			const nullableWrapper = nullable ? ' | null' : '';
			const printFields = (fields: T.FlattenedFieldInfoWithMeta[], i: number) => {
				if (fields.length === 0) {
					return '{}';
				}
				const indents = ' '.repeat(i);
				const buffer: string[] = [`{`];
				const sanitizeComment = (lineStart: string, comment: string): string => {
					return lineStart + comment.replace(/\n/g, `\n${lineStart}`).replace(/\*\//g, '* /');
				};
				fields.forEach((f, idx) => {
					const fieldName = f.resultFieldName === '' ? `''` : f.resultFieldName;
					if (f.deprecationReason != null || f.description != null) {
						buffer.push(`${indents}  /**`);
						const lineStart = `${indents}   * `;

						if (f.description != null) {
							buffer.push(sanitizeComment(lineStart, f.description));
						}
						if (f.deprecationReason != null) {
							buffer.push(sanitizeComment(lineStart, `@deprecated ${f.deprecationReason}`));
						}
						buffer.push(`${indents}   */`);
					}

					const typeDef =
						withNames && f.exportName != null
							? f.type.kind === 'NonNull' ? f.exportName : `${f.exportName} | null`
							: printType(true, f.type, withNames, i + 4);
					buffer.push(`${indents + '  '}${fieldName}: ${typeDef};`);
					if (idx < fields.length - 1) {
						buffer.push('');
					}
				});
				buffer.push(`${indents}}`);
				return buffer.join('\n');
			};
			if (type.objectKind === 'Single') {
				return printFields(type.fields, indentLevel) + nullableWrapper;
			} else {
				const buffer: string[] = [];
				type.fragmentSpreads.forEach(spread => {
					buffer.push(printFields(spread.fields, indentLevel as number));
				});
				const indents = ' '.repeat(indentLevel);
				const nl = '\n' + indents;
				return `${buffer.join(' | ')}${nullableWrapper}`;
			}
		}
		default: {
			throw new Error('Unknown type');
		}
	}
}

function isParenAroundTypeNeeded(type: T.FlattenedType): boolean {
	if (type.kind !== 'NonNull') {
		return true;
	}

	const innerType = type.nullableType;

	if (innerType.kind === 'List') {
		return false;
	}

	if (innerType.kind === 'Scalar') {
		if (innerType.knownPossibleValues == null || innerType.knownPossibleValues.length === 1) {
			return false;
		}
		return true;
	}
	if (innerType.kind === 'Object') {
		return innerType.objectKind === 'Single' || innerType.fragmentSpreads.length === 1;
	}

	return innerType.names.length === 1;
}
