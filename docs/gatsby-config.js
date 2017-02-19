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
		`gatsby-plugin-sharp`,
		`gatsby-parser-sharp`,
		`gatsby-parser-json`,
		`gatsby-parser-remark`,
		`gatsby-typegen-filesystem`,
		`gatsby-typegen-sharp`,
		{
			resolve: `gatsby-typegen-remark`,
			options: {
				plugins: [
					{
						resolve: `gatsby-typegen-remark-responsive-image`,
						options: {
							maxWidth: 590,
						},
					},
					{
						resolve: `gatsby-typegen-remark-responsive-iframe`,
						options: {
							wrapperStyle: `margin-bottom: 1.0725rem`,
						},
					},
					'gatsby-typegen-remark-prismjs',
					'gatsby-typegen-remark-copy-linked-files',
					'gatsby-typegen-remark-smartypants',
				],
			},
		},
	],
}
