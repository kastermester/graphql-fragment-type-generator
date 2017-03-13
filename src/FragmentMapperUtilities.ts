import {
	GraphQLEnumType,
	GraphQLList,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLOutputType,
	GraphQLScalarType,
} from 'graphql';
import * as T from './Types';

export function transformType(type: GraphQLOutputType): {
	leafType: T.FragmentType;
	fragmentType: T.FragmentType;
} {
	let leafGraphQLType = type;
	const transformType: ((innerType: T.FragmentType) => T.FragmentType)[] = [];
	let isScalarType = false;
	let knownValues = null;
	while (true) {
		const currentType = leafGraphQLType;
		if (currentType instanceof GraphQLNonNull) {
			transformType.push((innerType) => ({
				kind: 'NonNull',
				nullableType: innerType as T.NullableFragmentType,
				schemaType: currentType,
			}));
			leafGraphQLType = currentType.ofType;
			continue;
		}
		if (currentType instanceof GraphQLList) {
			transformType.push((innerType) => ({
				elementType: innerType,
				kind: 'List',
				schemaType: currentType,
			}));
			leafGraphQLType = currentType.ofType;
			continue;
		}
		if (currentType instanceof GraphQLScalarType) {
			isScalarType = true;
		}
		if (currentType instanceof GraphQLEnumType) {
			isScalarType = true;
			knownValues = currentType.getValues().map(v => v.value);
		}
		break;
	}

	const leafType: T.ScalarType | T.ObjectType = !isScalarType ? {
		fields: [],
		fragmentSpreads: [],
		kind: 'Object',
		schemaType: leafGraphQLType as GraphQLObjectType,
	} : {
			kind: 'Scalar',
			knownPossibleValues: knownValues,
			schemaType: leafGraphQLType as GraphQLScalarType,
		};
	const fragmentType = transformType.reverse().reduce(
		(t, transformer) => transformer(t),
		leafType as T.FragmentType,
	);
	return {
		fragmentType: fragmentType,
		leafType: leafType,
	};
}
