import * as T from './Types';

export function extractNamedTypes(
	type: T.FlattenedObjectType | T.FlattenedListType,
): Map<string, T.FlattenedNullableType> {
	const map = new Map<string, T.FlattenedNullableType>();
	visitType(type, map);
	return map;
}

function visitType(type: T.FlattenedType, map: Map<string, T.FlattenedNullableType>): void {
	if (type.kind === 'Object') {
		return visitObjectType(type, map);
	}
	if (type.kind === 'NonNull') {
		return visitType(type.nullableType, map);
	}

	if (type.kind === 'List') {
		return visitType(type.elementType, map);
	}
}

function visitObjectType(type: T.FlattenedObjectType, map: Map<string, T.FlattenedNullableType>): void {
	if (type.objectKind === 'Single') {
		visitFields(type.fields, map);
	} else {
		type.fragmentSpreads.forEach(v => visitFields(v.fields, map));
	}
}

function visitFields(fields: T.FlattenedFieldInfo[], map: Map<string, T.FlattenedNullableType>): void {
	fields.forEach(field => {
		if (field.exportName != null) {
			map.set(field.exportName, getNullableType(field.type));
		}
		visitType(field.type, map);
	});
}

function getNullableType(type: T.FlattenedType): T.FlattenedNullableType {
	if (type.kind === 'NonNull') {
		return type.nullableType;
	}
	return type;
}
