import {
	GraphQLBoolean,
	GraphQLEnumType,
	GraphQLFloat,
	GraphQLInputObjectType,
	GraphQLInputType,
	GraphQLInt,
	GraphQLID,
	GraphQLList,
	GraphQLNamedType,
	GraphQLNonNull,
	GraphQLScalarType,
	GraphQLSchema,
	GraphQLString,
} from 'graphql';

type TypeMap = {
	[name: string]: GraphQLNamedType;
};

export function getInputObjectTypes(schema: GraphQLSchema): string {
	const inputObjectTypes = [];
	const enumTypes = [];
	// The version of @types/graphql I'm using thinks this is a single type?
	const types: TypeMap = schema.getTypeMap() as any;
	const rootType = schema.getQueryType();

	for (const type of Object.values(types)) {
		if (type instanceof GraphQLInputObjectType) {
			if (type.name.startsWith('__')) {
				continue;
			}
			inputObjectTypes.push(type);
		} else if (type instanceof GraphQLEnumType) {
			if (type.name.startsWith('__')) {
				continue;
			}
			enumTypes.push(type);
		}
	}

	const inputObjectDefinitions = inputObjectTypes.map(t => `export interface ${t.name} {\n${printFields(t)}\n}`);

	const enumUnionTypes = enumTypes.map(
		t => `export type ${t.name} = ${t.getValues().map(v => JSON.stringify(v.name)).join(' | ')};`,
	);
	return inputObjectDefinitions.concat(enumUnionTypes).sort().join('\n\n');
}

function printFields(type: GraphQLInputObjectType): string {
	const indent = '  ';

	const fields = type.getFields();

	return Object.keys(fields).sort().map(fieldName => {
		const fieldInfo = fields[fieldName];
		const nullable = fieldInfo.defaultValue != null || !(fieldInfo.type instanceof GraphQLNonNull) ? '?' : '';
		return `${indent}${fieldName}${nullable}: ${printType(true, fieldInfo.type)};`;
	}).join('\n');
}

function printType(nullable: boolean, type: GraphQLInputType): string {
	if (type instanceof GraphQLNonNull) {
		return printType(false, type.ofType);
	}

	const nullableWrapper = nullable ? ' | null' : '';

	const wrap = (str: string) => str + nullableWrapper;

	if (type instanceof GraphQLList) {
		const wrapType = (str: string) => {
			if (isParenAroundTypeNeeded(type.ofType)) {
				return `(${str})`;
			}
			return str;
		};

		return wrap(`${wrapType(printType(true, type.ofType))}[]`);
	} else if (type instanceof GraphQLEnumType) {
		return wrap(type.name);
	} else if (type instanceof GraphQLScalarType) {
		return wrap(getScalarTypeTypeScriptType(type));
	} else if (type instanceof GraphQLInputObjectType) {
		return wrap(type.name);
	}

	throw new Error('Unexpected input type');
}

function getScalarTypeTypeScriptType(
	type: GraphQLScalarType,
	customScalarMap?: (type: GraphQLScalarType) => string,
): string {
	if (type === GraphQLString || type === GraphQLID) {
		return 'string';
	}

	if (type === GraphQLBoolean) {
		return 'boolean';
	}

	if (type === GraphQLInt || type === GraphQLFloat) {
		return 'number';
	}

	if (customScalarMap != null) {
		return customScalarMap(type);
	}

	return 'string';
}

function isParenAroundTypeNeeded(type: GraphQLInputObjectType): boolean {
	return !(type instanceof GraphQLNonNull);
}
