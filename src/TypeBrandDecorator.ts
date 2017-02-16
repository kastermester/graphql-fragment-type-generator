import { GraphQLNonNull, GraphQLObjectType, GraphQLString } from 'graphql';
import {
	mapWithConstantTypeNameValues,
	withMeta,
} from './TypeNormalizer';
import * as T from './Types';
import { sortBy } from './utils';

export function decorateWithTypeBrands(type: T.FlattenedObjectType): T.FlattenedObjectType {
	if (type.objectKind === 'Single') {
		return {
			...type,
			fields: decorateFieldsWithTypeBrands(type.fields, type.schemaTypes),
		};
	}

	const spreadFields = type.fragmentSpreads.reduce(
		(carry: T.FlattenedSpecificObjectType[], s: T.FlattenedSpreadType) => {
			if (s.kind === 'SpecificObject') {
				carry.push({
					...s,
					fields: decorateFieldsWithTypeBrands(s.fields, [s.schemaType]),
				});
			} else {
				for (const t of s.schemaTypes) {
					carry.push({
						fields: decorateFieldsWithTypeBrands(
							withMeta(
								mapWithConstantTypeNameValues(s.fields, [t]),
								t,
							),
							[t],
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
		fragmentSpreads: sortBy(spreadFields, (t) => t.schemaType.name),
	};
}

function decorateFieldsWithTypeBrands(
	fields: T.FlattenedFieldInfoWithMeta[],
	types: GraphQLObjectType[],
): T.FlattenedFieldInfoWithMeta[] {
	return [
		{
			deprecationReason: null,
			description: null,
			fieldName: '',
			resultFieldName: '',
			schemaType: new GraphQLNonNull(GraphQLString),
			type: {
				kind: 'NonNull',
				nullableType: {
					kind: 'Reference',
					names: types.map(e => e.name),
				},
				schemaType: new GraphQLNonNull(GraphQLString),
			},
		},
		...fields.map((f) => {
			if (f.type.kind === 'Object') {
				return {
					...f,
					type: decorateWithTypeBrands(f.type),
				};
			}
			return f;
		}),
	];
}

export interface TypeBrands {
	allRequiredNames: string[];
	fragmentTypeNames: string[];
}

export function getTypeBrandNames(type: T.FlattenedObjectType): TypeBrands {
	const names = new Set<string>();
	const visitFields = (fields: T.FlattenedFieldInfo[]) => {
		for (const field of fields) {
			if (field.type.kind === 'Object') {
				visitObjectType(field.type);
			}
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

	visitObjectType(type);
	const allNames = Array.from(names.values()).sort();

	const rootNames = new Set<string>();
	if (type.objectKind === 'Single') {
		type.schemaTypes.forEach(t => rootNames.add(t.name));
	} else {
		type.fragmentSpreads.forEach(s => {
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
