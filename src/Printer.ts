import * as T from './Types';

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
		const alias = (field.resultFieldName !== field.fieldName) ?
			`${field.resultFieldName}: ` : '';
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
	for (const field of type.fields) {
		const alias = (field.resultFieldName !== field.fieldName) ?
			`${field.resultFieldName}: ` : '';
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
	printFlattenedFragments(type.fragmentSpreads, indentLevel);
}

function printSpecificObjectTypeFields(type: T.FlattenedSpecificObjectType, indentLevel: number): void {
	const indents = indent(indentLevel);
	for (const field of type.fields) {
		const alias = (field.resultFieldName !== field.fieldName) ?
			`${field.resultFieldName}: ` : '';
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

function printFlattenedFragments(fragments: T.FlattenedSpecificObjectType[], indentLevel: number): void {
	const indents = indent(indentLevel);
	for (const fragment of fragments) {
		console.log(`${indents}... on ${fragment.schemaType.name} {`);
		printSpecificObjectTypeFields(fragment, indentLevel + 2);
		console.log(`${indents}}`);
	}
}