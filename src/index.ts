import {
	buildClientSchema,
} from 'graphql';
import * as fs from 'fs';
import * as path from 'path';
import {
	mapFragmentType,
} from './FragmentMapper';
import {
	normalizeType,
} from './TypeNormalizer';
import {
	printObjectType,
	printFlattedObjectType,
} from './Printer';
const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'test', 'schema.json')).toString()).data);

const fragment = `
fragment on Project {
	structure {
		edges {
			node {
				id
				title
				trail {
					title
				}
			}
		}
	}
}`;

const res = mapFragmentType(schema, fragment);
printObjectType(res);
const flattened = normalizeType(schema, res);
printFlattedObjectType(flattened);