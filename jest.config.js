module.exports = {
	globals: {
		'ts-jest': {
			tsConfig: './tsconfig-test.json',
		},
	},
	moduleFileExtensions: [
		'js',
		'ts',
	],
	rootDir: 'src',
	testEnvironment: 'node',
	testRegex: '/__tests__/.*\\.ts$',
	transform: {
		'.(ts|tsx)': 'ts-jest',
	},
	preset: 'ts-jest',
	testMatch: null,
}
