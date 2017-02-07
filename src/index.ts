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
				... on ProjectTask {
					assignees {
						edges {
							node {
								name
							}
						}
					}
				}
			}
		}
	}
}`;

const res = mapFragmentType(schema, fragment);
console.log('Initial parsed output');
console.log();
printObjectType(res);

const flattened = normalizeType(schema, res);
console.log();
console.log('Flattened output');
console.log();
printFlattedObjectType(flattened);
console.log();
console.log('Generated type');
console.log();
console.log(printType(true, flattened, 0));
