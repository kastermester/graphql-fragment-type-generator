import {
	GraphQLInterfaceType,
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLOutputType,
	GraphQLScalarType,
	GraphQLUnionType
} from 'graphql';
export type NullableFragmentType = ObjectType | ListType | ScalarType;
export type FragmentType = NullableFragmentType | NonNullType;

export type FlattenedNullableType = FlattenedObjectType | FlattenedListType | ScalarType;
export type FlattenedType = FlattenedNullableType | FlattenedNonNullType;
export interface FieldInfo {
	fieldName: string;
	resultFieldName: string;
	schemaType: GraphQLOutputType;
	type: FragmentType;
}

export interface FlattenedFieldInfo {
	fieldName: string;
	resultFieldName: string;
	schemaType: GraphQLOutputType;
	type: FlattenedType;
}

export interface ObjectType {
	kind: 'Object';
	fields: FieldInfo[];
	schemaType: GraphQLObjectType | GraphQLInterfaceType | GraphQLUnionType;
	fragmentSpreads: ObjectType[];
}

export interface FlattenedSpecificObjectType {
	kind: 'SpecificObject';
	fields: FlattenedFieldInfo[];
	schemaType: GraphQLObjectType;
}

export interface FlattenedObjectType {
	kind: 'Object';
	fields: FlattenedFieldInfo[];
	schemaTypes: GraphQLObjectType[];
	fragmentSpreads: FlattenedSpecificObjectType[]
}

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
	schemaType: GraphQLScalarType;
}