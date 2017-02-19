const path = require('path');
function getUrlFromFile(file) {
	const pagesPrefix = path.resolve('pages');
	return file.substr(pagesPrefix).replace(/(\/index)?\.md$/, '');
}
exports.createPages = ({args}) => {
	const { graphql } = args;
	const pageTemplate = path.resolve('pages', 'index.js');
	return graphql(`
		{
			allMarkdownRemark {
				edges {
					node {
						id
						_sourceNodeId {
							id
						}
					}
				}
			}
		}
	`).then(result => {
		if (result.errors) {
			throw result.errors;
		}
		const pages = [];
		for (const edge of result.data.allMarkdownRemark.edges) {
			const page = edge.node
			const file = page._sourceNodeId.id;
			const url = getUrlFromFile(file);
			pages.push({
				path: url,
				component: pageTemplate,
				context: {
					pageId: page.id,
				},
			});
		}

		return pages;
	});
};
