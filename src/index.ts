import * as fs from 'fs';
import {
	buildClientSchema,
} from 'graphql';
import * as path from 'path';
import {
	mapFragmentType,
} from './FragmentMapper';
import {
	printFlattedObjectType,
	printObjectType,
	printType,
} from './Printer';
import {
	normalizeType,
} from './TypeNormalizer';
const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'test', 'schema.json')).toString()).data);

const fragment = `
fragment on Project {
	structure {
		edges {
			node {
				id
				title
				__typename
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
console.log(printType(true, flattened, 0));