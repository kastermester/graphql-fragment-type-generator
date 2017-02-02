import {
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLOutputType,
	GraphQLScalarType,
} from 'graphql';
export type NullableFragmentType = ObjectType | ListType | ScalarType;
export type FragmentType = NullableFragmentType | NonNullType;
export interface FieldInfo {
	fieldName: string;
	resultFieldName: string;
	schemaType: GraphQLOutputType;
	type: FragmentType;
}
export interface ObjectType {
	kind: 'Object';
	displayableName: string | null;
	fields: FieldInfo[];
	schemaType: GraphQLObjectType;
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