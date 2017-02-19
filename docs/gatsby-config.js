module.exports = {
	siteMetadata: {
		title: `graphql-fragment-type-generator`,
		subTitle: 'Strong-GraphQL',
	},
	plugins: [
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `pages`,
				path: `${__dirname}/pages`,
			},
		},
		{
			resolve: `gatsby-source-filesystem`,
			options: {
				name: `data`,
				path: `${__dirname}/data`,
			},
		},
		`gatsby-parser-json`,
		`gatsby-parser-remark`,
		`gatsby-typegen-filesystem`,
		{
			resolve: `gatsby-typegen-remark`,
			options: {
				plugins: [
					'gatsby-typegen-remark-prismjs',
					'gatsby-typegen-remark-copy-linked-files',
					'gatsby-typegen-remark-smartypants',
				],
			},
		},
	],
}
