import {
	GraphQLInterfaceType,
	GraphQLObjectType,
	GraphQLScalarType,
	GraphQLSchema,
	GraphQLUnionType,
} from 'graphql';
import * as T from './Types';

type StackType = GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType;

function possibleTypesForType(schema: GraphQLSchema, type: StackType): GraphQLObjectType[] {
	if (type instanceof GraphQLObjectType) {
		return [type];
	}

	return schema.getPossibleTypes(type);
}

function intersectPossibleTypes(
	outerPossibleTypes: GraphQLObjectType[],
	innerPossibleTypes: GraphQLObjectType[],
): GraphQLObjectType[] {
	return innerPossibleTypes.filter(t => outerPossibleTypes.indexOf(t) >= 0);
}

function flattenFragmentSpread(
	schema: GraphQLSchema,
	type: T.ObjectType,
	possibleTypes: GraphQLObjectType[],
): T.FlattenedSpecificObjectType[] {
	return type.fragmentSpreads.reduce((carry, spread) => {
		const possibleSpreadTypes = intersectPossibleTypes(
			possibleTypes,
			possibleTypesForType(schema, spread.schemaType),
		);
		spread.fragmentSpreads.forEach(s => {
			const possibleInnerSpreadTypes = intersectPossibleTypes(
				possibleSpreadTypes,
				possibleTypesForType(schema, s.schemaType),
			);
			const innerFragmentSpreads = flattenFragmentSpread(schema, s, possibleSpreadTypes);
			innerFragmentSpreads.forEach(t => carry.push(t));
			const fields = s.fields.map(f => ({
				fieldName: f.fieldName,
				resultFieldName: f.resultFieldName,
				schemaType: f.schemaType,
				type: normalizeWrappedType(schema, f.type),
			}));
			for (const t of possibleInnerSpreadTypes) {
				carry.push({
					fields: mapWithConstantTypeNameValues(fields, t),
					kind: 'SpecificObject',
					schemaType: t,
				});
			}
		});

		const fields = spread.fields.map(f => ({
			fieldName: f.fieldName,
			resultFieldName: f.resultFieldName,
			schemaType: f.schemaType,
			type: normalizeWrappedType(schema, f.type),
		}));
		for (const t of possibleSpreadTypes) {
			carry.push({
				fields: fields,
				kind: 'SpecificObject',
				schemaType: t,
			});
		}
		return carry;
	}, [] as T.FlattenedSpecificObjectType[]);
}

export function normalizeType(schema: GraphQLSchema, type: T.ObjectType): T.FlattenedObjectType {
	const possibleTypes = sortBy(possibleTypesForType(schema, type.schemaType), (t) => t.name);
	const fields = type.fields.map(f => {
		return {
			fieldName: f.fieldName,
			resultFieldName: f.resultFieldName,
			schemaType: f.schemaType,
			type: normalizeWrappedType(schema, f.type),
		};
	});
	const spreads = collapseFragmentSpreads(
		schema,
		fields,
		flattenFragmentSpread(
			schema,
			type,
			possibleTypes,
		),
	);

	if (spreads.length === 0) {
		return {
			fields: mapWithConstantTypeNameValues(fields, possibleTypes),
			fragmentSpreads: null,
			kind: 'Object',
			objectKind: 'Single',
			schemaTypes: possibleTypes,
		};
	}

	if (
		fields.length === 0 &&
		spreads.length === 1 &&
		possibleTypes.length === 1 &&
		possibleTypes[0] === spreads[0].schemaType
	) {
		return {
			fields: mapWithConstantTypeNameValues(spreads[0].fields, spreads[0].schemaType),
			fragmentSpreads: null,
			kind: 'Object',
			objectKind: 'Single',
			schemaTypes: [spreads[0].schemaType],
		};
	}

	const missingTypes = possibleTypes.filter(t => {
		return spreads.find(s => s.schemaType === t) == null;
	});

	const fieldsToSpreads = possibleTypes.filter(t => missingTypes.indexOf(t) < 0).map(t => {
		return {
			fields: fields,
			kind: 'SpecificObject',
			schemaType: t,
		} as T.FlattenedSpecificObjectType;
	});

	const collapsedSpreads = collapseFragmentSpreads(schema, [], spreads.concat(fieldsToSpreads));

	const constantMappedSpreads: T.FlattenedSpreadType[] = collapsedSpreads.map(s => ({
		fields: mapWithConstantTypeNameValues(s.fields, s.schemaType),
		kind: 'SpecificObject',
		schemaType: s.schemaType,
	} as T.FlattenedSpecificObjectType));

	const restSpread: T.FlattenedSpreadType[] = missingTypes.length > 0 ?
		[{
			fields: sortBy(
				mapWithConstantTypeNameValues(fields, missingTypes),
				t => t.resultFieldName,
			),
			kind: 'RestObject',
			schemaTypes: missingTypes,
		}] :
		[];
	return {
		fields: null,
		fragmentSpreads: constantMappedSpreads.concat(restSpread),
		kind: 'Object',
		objectKind: 'Spread',
		schemaTypes: possibleTypes,
	};
}

function normalizeWrappedType(schema: GraphQLSchema, type: T.FragmentType): T.FlattenedType {
	switch (type.kind) {
		case 'Object':
			return normalizeType(schema, type);
		case 'NonNull':
			return {
				kind: 'NonNull',
				nullableType: normalizeWrappedType(schema, type.nullableType) as T.FlattenedNullableType,
				schemaType: type.schemaType,
			};
		case 'List':
			return {
				elementType: normalizeWrappedType(schema, type.elementType),
				kind: 'List',
				schemaType: type.schemaType,
			};
		case 'Scalar':
			return type;
		default:
			throw new Error('Unexpected type kind');
	}
}

function collapseFragmentSpreads(
	schema: GraphQLSchema,
	parentFields: T.FlattenedFieldInfo[],
	spreads: T.FlattenedSpecificObjectType[],
): T.FlattenedSpecificObjectType[] {
	const grouped = groupBy(spreads, (v) => v.schemaType, (v) => v.fields);
	const res: T.FlattenedSpecificObjectType[] = [];
	const parentFieldsMap: Map<string, T.FlattenedType> = parentFields.reduce((carry, v) => {
		carry.set(v.resultFieldName, v.type);
		return carry;
	}, new Map());

	for (const entry of Array.from(grouped.entries())) {
		const type = entry[0];
		const allFields = ([] as T.FlattenedFieldInfo[]).concat(...entry[1]);

		const fields = uniqueBy(allFields, (v) => v.resultFieldName).filter((field) => {
			const parentType = parentFieldsMap.get(field.resultFieldName);
			if (parentType == null) {
				return true;
			}

			return !isSameType(parentType, field.type);
		});
		if (fields.length > 0) {
			res.push({
				fields: sortBy(fields, (f) => f.resultFieldName),
				kind: 'SpecificObject',
				schemaType: type,
			});
		}
	}

	return sortBy(res, (s) => s.schemaType.name);
}

function uniqueBy<T, TUniqueVal>(
	arr: T[],
	uniqueKeySelector: (item: T) => TUniqueVal,
): T[] {
	const uniqueValues = new Set();
	const res: T[] = [];

	arr.forEach((v) => {
		const key = uniqueKeySelector(v);
		if (uniqueValues.has(key)) {
			return;
		}
		uniqueValues.add(key);
		res.push(v);
	});

	return res;
}

function groupBy<T, TKey, TValue>(
	arr: T[],
	keySelector: (item: T) => TKey,
	valueSelector: (item: T) => TValue): Map<TKey, TValue[]> {
	const res = new Map();

	arr.forEach((v) => {
		const key = keySelector(v);
		let entry = res.get(key);
		if (entry == null) {
			entry = [];
			res.set(key, entry);
		}
		entry.push(valueSelector(v));
	});
	return res;
}

function isSameType(type1: T.FlattenedType, type2: T.FlattenedType): boolean {
	if (type1.kind !== type2.kind) {
		return false;
	}

	if (type1.kind === 'Object') {
		const t1 = type1;

		if (t1.objectKind !== (type2 as T.FlattenedObjectType).objectKind) {
			return false;
		}

		if (t1.schemaTypes.length !== (type2 as T.FlattenedObjectType).schemaTypes.length) {
			return false;
		}

		const otherFieldsEqual = (otherFields: T.FlattenedFieldInfo[]) => (field: T.FlattenedFieldInfo) => {
			const t2Field = otherFields.find(v => v.resultFieldName === field.resultFieldName);

			if (t2Field == null) {
				return false;
			}

			return isSameType(field.type, t2Field.type);
		};

		if (t1.objectKind === 'Single') {
			const t2 = type2 as T.FlattenedSingleOjectType;
			if (t1.fields.length !== t2.fields.length) {
				return false;
			}

			if (!t1.fields.every(otherFieldsEqual(t2.fields))) {
				return false;
			}
		} else {
			const t2 = type2 as T.FlattenedSpreadsObjectType;
			if (
				t1.fragmentSpreads.length !== t2.fragmentSpreads.length
			) {
				return false;
			}
			const t2FragmentSpreadEquals = (spread: T.FlattenedSpreadType) => {
				const t2Spread = t2.fragmentSpreads.find(v => {
					if (v.kind !== spread.kind) {
						return false;
					}
					if (spread.kind === 'SpecificObject') {
						return spread.schemaType === (v as T.FlattenedSpecificObjectType).schemaType;
					}
					const st: typeof spread = v as any;
					if (st.schemaTypes.length !== spread.schemaTypes.length) {
						return false;
					}
					return spread.schemaTypes.every((t, i) => st.schemaTypes[i] === t);
				});
				if (t2Spread == null) {
					return false;
				}

				return spread.fields.every(otherFieldsEqual(t2Spread.fields));
			};
			if (
				!t1.fragmentSpreads.every(t2FragmentSpreadEquals)
			) {
				return false;
			}
		}

		if (
			!t1.schemaTypes.every(t => (type2 as T.FlattenedObjectType).schemaTypes.indexOf(t) >= 0)
		) {
			return false;
		}
		return true;
	}

	if (type1.kind === 'List') {
		return isSameType(type1.elementType, (type2 as T.FlattenedListType).elementType);
	}

	if (type1.kind === 'NonNull') {
		return isSameType(type1.nullableType, (type2 as T.FlattenedNonNullType).nullableType);
	}

	if (type1.kind === 'Reference') {
		const t2 = type2 as T.ReferencedType;
		if (type1.names.length !== t2.names.length) {
			return false;
		}
		return type1.names.every(n => t2.names.indexOf(n) >= 0);
	}

	return type1.schemaType === (type2 as T.ScalarType).schemaType;
}

function mapWithConstantTypeNameValues(
	fields: T.FlattenedFieldInfo[],
	types: GraphQLObjectType | GraphQLObjectType[],
): T.FlattenedFieldInfo[] {
	const possibleTypes = (types instanceof GraphQLObjectType ? [types] : types).map(t => t.name);
	const SCALAR = 'Scalar';
	const NONNULL = 'NonNull';
	return fields.map(f => {
		if (f.fieldName === '__typename') {
			const type = (f.type as T.NonNullType);
			return {
				fieldName: f.fieldName,
				resultFieldName: f.resultFieldName,
				schemaType: f.schemaType,
				type: {
					kind: NONNULL as typeof NONNULL,
					nullableType: {
						kind: SCALAR as typeof SCALAR,
						knownPossibleValues: possibleTypes,
						schemaType: type.nullableType.schemaType as GraphQLScalarType,
					},
					schemaType: type.schemaType,
				},
			};
		}
		return f;
	});
}

function sortBy<T, TProp>(arr: T[], property: (item: T) => TProp): T[] {
	return arr.sort((a, b) => {
		const aProp = property(a);
		const bProp = property(b);

		if (aProp < bProp) {
			return -1;
		} else if (aProp > bProp) {
			return 1;
		}
		return 0;
	});
}
