import {
	GraphQLEnumType,
	GraphQLInterfaceType,
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLOutputType,
	GraphQLScalarType,
	GraphQLUnionType,
} from 'graphql';
export type NullableFragmentType = ObjectType | ListType | ScalarType;
export type FragmentType = NullableFragmentType | NonNullType;

export type FlattenedNullableType = FlattenedObjectType | FlattenedListType | ScalarType | ReferencedType;
export type FlattenedType = FlattenedNullableType | FlattenedNonNullType;
export interface FieldInfo {
	fieldName: string;
	resultFieldName: string;
	schemaType: GraphQLOutputType;
	type: FragmentType;
	exportName: null | string;
}

export interface FlattenedFieldInfo {
	fieldName: string;
	resultFieldName: string;
	schemaType: GraphQLOutputType;
	type: FlattenedType;
	exportName: null | string;
}

export interface FlattenedFieldInfoWithMeta extends FlattenedFieldInfo {
	description: string | null;
	deprecationReason: string | null;
}

export interface ObjectType {
	kind: 'Object';
	fields: FieldInfo[];
	schemaType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType;
	fragmentSpreads: ObjectType[];
}

export interface FlattenedSpecificObjectType {
	kind: 'SpecificObject';
	fields: FlattenedFieldInfoWithMeta[];
	schemaType: GraphQLObjectType;
}

export interface FlattenedRestObjectType {
	kind: 'RestObject';
	fields: FlattenedFieldInfoWithMeta[];
	schemaTypes: GraphQLObjectType[];
}

export type FlattenedSpreadType = FlattenedSpecificObjectType | FlattenedRestObjectType;

export interface FlattenedSingleOjectType {
	kind: 'Object';
	objectKind: 'Single';
	fields: FlattenedFieldInfoWithMeta[];
	schemaTypes: GraphQLObjectType[];
	fragmentSpreads: null;
}

// If fragmentSpreads.length < schemaTypes.length, then, when generating the type for
// this fragment, the empty object type must be included.
export interface FlattenedSpreadsObjectType {
	kind: 'Object';
	objectKind: 'Spread';
	fields: null;
	schemaTypes: GraphQLObjectType[];
	fragmentSpreads: FlattenedSpreadType[];
}

export type FlattenedObjectType = FlattenedSingleOjectType | FlattenedSpreadsObjectType;

export interface FlattenedListType {
	kind: 'List';
	schemaType: GraphQLList<any>;
	elementType: FlattenedType;
}

export interface FlattenedNonNullType {
	kind: 'NonNull';
	schemaType: GraphQLNonNull<any>;
	nullableType: FlattenedNullableType;
}

export interface ListType {
	kind: 'List';
	schemaType: GraphQLList<any>;
	elementType: FragmentType;
}

export interface NonNullType {
	kind: 'NonNull';
	schemaType: GraphQLNonNull<any>;
	nullableType: NullableFragmentType;
}

export interface ScalarType {
	kind: 'Scalar';
	knownPossibleValues: any[] | null;
	schemaType: GraphQLScalarType | GraphQLEnumType;
}

export interface ReferencedType {
	kind: 'Reference';
	names: string[];
}
