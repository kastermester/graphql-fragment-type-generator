"use strict";
const graphql_1 = require("graphql");
const fs = require("fs");
const path = require("path");
const FragmentMapper_1 = require("./FragmentMapper");
const schema = graphql_1.buildClientSchema(JSON.parse(fs.readFileSync(path.resolve(__dirname, '..', 'test', 'schema.json')).toString()).data);
const fragment = `fragment on ProjectNode { ... on ProjectTask { id } }`;
const res = FragmentMapper_1.mapFragmentType(schema, fragment);
console.dir(res, { depth: 2 });
