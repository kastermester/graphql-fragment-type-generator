module.exports = {
	globals: {
		'ts-jest': {
			tsConfigFile: './tsconfig-test.json',
		},
	},
	moduleFileExtensions: ['ts', 'js'],
	rootDir: 'src',
	testEnvironment: 'node',
	testRegex: '/__tests__/.*\\.ts$',
	transform: {
		'.(ts|tsx)': '<rootDir>/../node_modules/ts-jest/preprocessor.js',
	},
};
