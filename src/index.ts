import {
	buildClientSchema,
} from 'graphql';
import * as fs from 'fs';
import * as path from 'path';
import {
	mapFragmentType,
} from './FragmentMapper';
const schema = buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'test', 'schema.json')).toString()).data);

const fragment = `fragment on ProjectNode { ... on ProjectTask { id } }`;

const res = mapFragmentType(schema, fragment) as any;
console.dir(res, { depth: 2});