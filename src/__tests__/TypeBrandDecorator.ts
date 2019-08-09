import * as fs from 'fs';
import {
	buildClientSchema,
	parse,
	DocumentNode,
	GraphQLInt,
	GraphQLInterfaceType,
	GraphQLID,
	GraphQLNonNull,
	GraphQLObjectType,
	GraphQLString,
	Source,
} from 'graphql';
import * as path from 'path';
import { decorateWithTypeBrands, getTypeBrandNames } from '../TypeBrandDecorator';
import { FlattenedObjectType } from '../Types';
import { validateSingleFragmentAST } from '../Validator';

const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, 'schema.json'), 'utf-8')).data);

test('Can decorate super simple fragment', () => {
	const type: FlattenedObjectType = {
		fields: [
			{
				deprecationReason: null,
				description: null,
				exportName: null,
				fieldName: 'name',
				resultFieldName: 'name',
				schemaType: GraphQLString,
				type: {
					kind: 'Scalar',
					knownPossibleValues: null,
					schemaType: GraphQLString,
				},
			},
		],
		fragmentSpreads: null,
		kind: 'Object',
		objectKind: 'Single',
		schemaTypes: [schema.getType('Planet') as GraphQLObjectType],
	};

	const decorated = decorateWithTypeBrands(type);

	expect(decorated).toMatchInlineSnapshot(`
		Object {
		  "fields": Array [
		    Object {
		      "deprecationReason": null,
		      "description": null,
		      "exportName": null,
		      "fieldName": "",
		      "resultFieldName": "",
		      "schemaType": "String!",
		      "type": Object {
		        "kind": "NonNull",
		        "nullableType": Object {
		          "kind": "Reference",
		          "names": Array [
		            "Planet",
		          ],
		        },
		        "schemaType": "String!",
		      },
		    },
		    Object {
		      "deprecationReason": null,
		      "description": null,
		      "exportName": null,
		      "fieldName": " $fragmentRefs",
		      "resultFieldName": " $fragmentRefs",
		      "schemaType": "String!",
		      "type": Object {
		        "kind": "NonNull",
		        "nullableType": Object {
		          "kind": "Reference",
		          "names": Array [
		            "any",
		          ],
		        },
		        "schemaType": "String!",
		      },
		    },
		    Object {
		      "deprecationReason": null,
		      "description": null,
		      "exportName": null,
		      "fieldName": "name",
		      "resultFieldName": "name",
		      "schemaType": "String",
		      "type": Object {
		        "kind": "Scalar",
		        "knownPossibleValues": null,
		        "schemaType": "String",
		      },
		    },
		  ],
		  "fragmentSpreads": null,
		  "kind": "Object",
		  "objectKind": "Single",
		  "schemaTypes": Array [
		    "Planet",
		  ],
		}
	`);
	const brandNames = getTypeBrandNames(type);
	expect(brandNames).toMatchInlineSnapshot(`
						Object {
						  "allRequiredNames": Array [
						    "Planet",
						  ],
						  "fragmentTypeNames": Array [
						    "Planet",
						  ],
						}
			`);
});

test('Can decorate inline fragment spreads', () => {
	const type: FlattenedObjectType = {
		fields: null,
		fragmentSpreads: [
			{
				fields: [
					{
						deprecationReason: null,
						description: null,
						exportName: null,
						fieldName: 'name',
						resultFieldName: 'name',
						schemaType: GraphQLString,
						type: {
							kind: 'Scalar',
							knownPossibleValues: null,
							schemaType: GraphQLString,
						},
					},
				],
				kind: 'SpecificObject',
				schemaType: schema.getType('Planet') as GraphQLObjectType,
			},
			{
				fields: [],
				kind: 'RestObject',
				schemaTypes: [
					schema.getType('Film') as GraphQLObjectType,
					schema.getType('Person') as GraphQLObjectType,
					schema.getType('Species') as GraphQLObjectType,
					schema.getType('Starship') as GraphQLObjectType,
					schema.getType('Vehicle') as GraphQLObjectType,
				],
			},
		],
		kind: 'Object',
		objectKind: 'Spread',
		schemaTypes: [
			schema.getType('Film') as GraphQLObjectType,
			schema.getType('Person') as GraphQLObjectType,
			schema.getType('Planet') as GraphQLObjectType,
			schema.getType('Species') as GraphQLObjectType,
			schema.getType('Starship') as GraphQLObjectType,
			schema.getType('Vehicle') as GraphQLObjectType,
		],
	};
	const decorated = decorateWithTypeBrands(type);
	expect(decorated).toMatchInlineSnapshot(`
		Object {
		  "fields": null,
		  "fragmentSpreads": Array [
		    Object {
		      "fields": Array [
		        Object {
		          "deprecationReason": null,
		          "description": null,
		          "exportName": null,
		          "fieldName": "",
		          "resultFieldName": "",
		          "schemaType": "String!",
		          "type": Object {
		            "kind": "NonNull",
		            "nullableType": Object {
		              "kind": "Reference",
		              "names": Array [
		                "Film",
		              ],
		            },
		            "schemaType": "String!",
		          },
		        },
		        Object {
		          "deprecationReason": null,
		          "description": null,
		          "exportName": null,
		          "fieldName": " $fragmentRefs",
		          "resultFieldName": " $fragmentRefs",
		          "schemaType": "String!",
		          "type": Object {
		            "kind": "NonNull",
		            "nullableType": Object {
		              "kind": "Reference",
		              "names": Array [
		                "any",
		              ],
		            },
		            "schemaType": "String!",
		          },
		        },
		      ],
		      "kind": "SpecificObject",
		      "schemaType": "Film",
		    },
		    Object {
		      "fields": Array [
		        Object {
		          "deprecationReason": null,
		          "description": null,
		          "exportName": null,
		          "fieldName": "",
		          "resultFieldName": "",
		          "schemaType": "String!",
		          "type": Object {
		            "kind": "NonNull",
		            "nullableType": Object {
		              "kind": "Reference",
		              "names": Array [
		                "Person",
		              ],
		            },
		            "schemaType": "String!",
		          },
		        },
		        Object {
		          "deprecationReason": null,
		          "description": null,
		          "exportName": null,
		          "fieldName": " $fragmentRefs",
		          "resultFieldName": " $fragmentRefs",
		          "schemaType": "String!",
		          "type": Object {
		            "kind": "NonNull",
		            "nullableType": Object {
		              "kind": "Reference",
		              "names": Array [
		                "any",
		              ],
		            },
		            "schemaType": "String!",
		          },
		        },
		      ],
		      "kind": "SpecificObject",
		      "schemaType": "Person",
		    },
		    Object {
		      "fields": Array [
		        Object {
		          "deprecationReason": null,
		          "description": null,
		          "exportName": null,
		          "fieldName": "",
		          "resultFieldName": "",
		          "schemaType": "String!",
		          "type": Object {
		            "kind": "NonNull",
		            "nullableType": Object {
		              "kind": "Reference",
		              "names": Array [
		                "Planet",
		              ],
		            },
		            "schemaType": "String!",
		          },
		        },
		        Object {
		          "deprecationReason": null,
		          "description": null,
		          "exportName": null,
		          "fieldName": " $fragmentRefs",
		          "resultFieldName": " $fragmentRefs",
		          "schemaType": "String!",
		          "type": Object {
		            "kind": "NonNull",
		            "nullableType": Object {
		              "kind": "Reference",
		              "names": Array [
		                "any",
		              ],
		            },
		            "schemaType": "String!",
		          },
		        },
		        Object {
		          "deprecationReason": null,
		          "description": null,
		          "exportName": null,
		          "fieldName": "name",
		          "resultFieldName": "name",
		          "schemaType": "String",
		          "type": Object {
		            "kind": "Scalar",
		            "knownPossibleValues": null,
		            "schemaType": "String",
		          },
		        },
		      ],
		      "kind": "SpecificObject",
		      "schemaType": "Planet",
		    },
		    Object {
		      "fields": Array [
		        Object {
		          "deprecationReason": null,
		          "description": null,
		          "exportName": null,
		          "fieldName": "",
		          "resultFieldName": "",
		          "schemaType": "String!",
		          "type": Object {
		            "kind": "NonNull",
		            "nullableType": Object {
		              "kind": "Reference",
		              "names": Array [
		                "Species",
		              ],
		            },
		            "schemaType": "String!",
		          },
		        },
		        Object {
		          "deprecationReason": null,
		          "description": null,
		          "exportName": null,
		          "fieldName": " $fragmentRefs",
		          "resultFieldName": " $fragmentRefs",
		          "schemaType": "String!",
		          "type": Object {
		            "kind": "NonNull",
		            "nullableType": Object {
		              "kind": "Reference",
		              "names": Array [
		                "any",
		              ],
		            },
		            "schemaType": "String!",
		          },
		        },
		      ],
		      "kind": "SpecificObject",
		      "schemaType": "Species",
		    },
		    Object {
		      "fields": Array [
		        Object {
		          "deprecationReason": null,
		          "description": null,
		          "exportName": null,
		          "fieldName": "",
		          "resultFieldName": "",
		          "schemaType": "String!",
		          "type": Object {
		            "kind": "NonNull",
		            "nullableType": Object {
		              "kind": "Reference",
		              "names": Array [
		                "Starship",
		              ],
		            },
		            "schemaType": "String!",
		          },
		        },
		        Object {
		          "deprecationReason": null,
		          "description": null,
		          "exportName": null,
		          "fieldName": " $fragmentRefs",
		          "resultFieldName": " $fragmentRefs",
		          "schemaType": "String!",
		          "type": Object {
		            "kind": "NonNull",
		            "nullableType": Object {
		              "kind": "Reference",
		              "names": Array [
		                "any",
		              ],
		            },
		            "schemaType": "String!",
		          },
		        },
		      ],
		      "kind": "SpecificObject",
		      "schemaType": "Starship",
		    },
		    Object {
		      "fields": Array [
		        Object {
		          "deprecationReason": null,
		          "description": null,
		          "exportName": null,
		          "fieldName": "",
		          "resultFieldName": "",
		          "schemaType": "String!",
		          "type": Object {
		            "kind": "NonNull",
		            "nullableType": Object {
		              "kind": "Reference",
		              "names": Array [
		                "Vehicle",
		              ],
		            },
		            "schemaType": "String!",
		          },
		        },
		        Object {
		          "deprecationReason": null,
		          "description": null,
		          "exportName": null,
		          "fieldName": " $fragmentRefs",
		          "resultFieldName": " $fragmentRefs",
		          "schemaType": "String!",
		          "type": Object {
		            "kind": "NonNull",
		            "nullableType": Object {
		              "kind": "Reference",
		              "names": Array [
		                "any",
		              ],
		            },
		            "schemaType": "String!",
		          },
		        },
		      ],
		      "kind": "SpecificObject",
		      "schemaType": "Vehicle",
		    },
		  ],
		  "kind": "Object",
		  "objectKind": "Spread",
		  "schemaTypes": Array [
		    "Film",
		    "Person",
		    "Planet",
		    "Species",
		    "Starship",
		    "Vehicle",
		  ],
		}
	`);

	const brandNames = getTypeBrandNames(decorated);
	expect(brandNames).toMatchInlineSnapshot(`
										Object {
										  "allRequiredNames": Array [
										    "Film",
										    "Person",
										    "Planet",
										    "Species",
										    "Starship",
										    "Vehicle",
										  ],
										  "fragmentTypeNames": Array [
										    "Film",
										    "Person",
										    "Planet",
										    "Species",
										    "Starship",
										    "Vehicle",
										  ],
										}
					`);
});
