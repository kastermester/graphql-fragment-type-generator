module.exports = {
	rootDir: 'src',
	globals: {
		'ts-config': './tsconfig-test.json',
	},
	transform: {
		'.(ts|tsx)': '<rootDir>/../node_modules/ts-jest/preprocessor.js',
	},
	testEnvironment: 'node',
	testRegex: '(/__tests__/.*|\\.(test|spec))\\.(ts|tsx|js)$',
	moduleFileExtensions: ['ts', 'tsx', 'js'],
};
