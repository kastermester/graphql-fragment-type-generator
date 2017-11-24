import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import { mapWithConstantTypeNameValues, withMeta } from './TypeNormalizer';
import * as T from './Types';
import { sortBy } from './utils';

export function decorateWithTypeBrands(type: T.FlattenedObjectType): T.FlattenedObjectType {
	if (type.objectKind === 'Single' && type.schemaTypes.length === 1) {
		return {
			...type,
			fields: decorateFieldsWithTypeBrands(type.fields, type.schemaTypes[0]),
		};
	}

	if (type.objectKind === 'Single') {
		const spreadFields = type.schemaTypes.map((schemaType: GraphQLObjectType): T.FlattenedSpecificObjectType => {
			return {
				fields: decorateFieldsWithTypeBrands(
					withMeta(
						mapWithConstantTypeNameValues(sortBy(type.fields, s => s.resultFieldName), [schemaType], true),
						schemaType,
					),
					schemaType,
				),
				kind: 'SpecificObject',
				schemaType: schemaType,
			};
		});
		return {
			fields: null,
			fragmentSpreads: sortBy(spreadFields, t => t.schemaType.name),
			kind: 'Object',
			objectKind: 'Spread',
			schemaTypes: type.schemaTypes,
		};
	}

	const spreadFields = type.fragmentSpreads.reduce(
		(carry: T.FlattenedSpecificObjectType[], s: T.FlattenedSpreadType) => {
			if (s.kind === 'SpecificObject') {
				carry.push({
					...s,
					fields: decorateFieldsWithTypeBrands(s.fields, s.schemaType),
				});
			} else {
				for (const t of s.schemaTypes) {
					carry.push({
						fields: decorateFieldsWithTypeBrands(
							withMeta(mapWithConstantTypeNameValues(s.fields, [t], true), t),
							t,
						),
						kind: 'SpecificObject',
						schemaType: t,
					});
				}
			}
			return carry;
		},
		[] as T.FlattenedSpecificObjectType[],
	);

	return {
		...type,
		fragmentSpreads: sortBy(spreadFields, t => t.schemaType.name),
	};
}

export function decorateTypeWithTypeBrands(type: T.FlattenedType): T.FlattenedType {
	if (type.kind === 'Object') {
		return decorateWithTypeBrands(type);
	}

	if (type.kind === 'NonNull') {
		return {
			...type,
			nullableType: decorateTypeWithTypeBrands(type.nullableType) as T.FlattenedNullableType,
		};
	}

	if (type.kind === 'List') {
		return {
			...type,
			elementType: decorateTypeWithTypeBrands(type.elementType),
		};
	}

	return type;
}

function decorateFieldsWithTypeBrands(
	fields: T.FlattenedFieldInfoWithMeta[],
	type: GraphQLObjectType,
): T.FlattenedFieldInfoWithMeta[] {
	return [
		{
			deprecationReason: null,
			description: null,
			exportName: null,
			fieldName: '',
			resultFieldName: '',
			schemaType: new GraphQLNonNull(GraphQLString),
			type: {
				kind: 'NonNull',
				nullableType: {
					kind: 'Reference',
					names: [type.name],
				},
				schemaType: new GraphQLNonNull(GraphQLString),
			},
		},
		...fields.map(f => {
			return {
				...f,
				type: decorateTypeWithTypeBrands(f.type),
			};
		}),
	];
}

export interface TypeBrands {
	allRequiredNames: string[];
	fragmentTypeNames: string[];
}

export function getTypeBrandNames(type: T.FlattenedObjectType | T.FlattenedListType): TypeBrands {
	const names = new Set<string>();
	const visitFields = (fields: T.FlattenedFieldInfo[]) => {
		for (const field of fields) {
			visitType(field.type);
		}
	};

	const visitType = (flattenedType: T.FlattenedType): void => {
		if (flattenedType.kind === 'Object') {
			return visitObjectType(flattenedType);
		}
		if (flattenedType.kind === 'NonNull') {
			return visitType(flattenedType.nullableType);
		}
		if (flattenedType.kind === 'List') {
			return visitType(flattenedType.elementType);
		}
	};

	const visitObjectType = (objectType: T.FlattenedObjectType) => {
		if (objectType.objectKind === 'Single') {
			objectType.schemaTypes.forEach(t => names.add(t.name));
			visitFields(objectType.fields);
			return;
		}
		for (const spread of objectType.fragmentSpreads) {
			if (spread.kind === 'SpecificObject') {
				names.add(spread.schemaType.name);
			} else {
				spread.schemaTypes.forEach(t => names.add(t.name));
			}
			visitFields(spread.fields);
		}
	};

	visitType(type);
	const allNames = Array.from(names.values()).sort();

	if (type.kind === 'List' && type.elementType.kind !== 'Object') {
		throw new Error('Expected list element type to be Object but found: ' + type.elementType.kind);
	}

	const objectType = type.kind === 'List' ? (type.elementType as T.FlattenedObjectType) : type;

	const rootNames = new Set<string>();
	if (objectType.objectKind === 'Single') {
		objectType.schemaTypes.forEach(t => rootNames.add(t.name));
	} else {
		objectType.fragmentSpreads.forEach(s => {
			if (s.kind === 'SpecificObject') {
				rootNames.add(s.schemaType.name);
			} else {
				s.schemaTypes.forEach(t => rootNames.add(t.name));
			}
		});
	}

	return {
		allRequiredNames: allNames,
		fragmentTypeNames: Array.from(rootNames.values()).sort(),
	};
}
