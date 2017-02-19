import React from 'react'

import { Container } from 'react-responsive-grid'
import { rhythm } from 'utils/typography'

const IndexRoute = React.createClass({
	render() {
		const page = this.props.data.page;
		return (
			<Container
				style={{
					maxWidth: 960,
					marginBottom: rhythm(1),
					padding: `${rhythm(1)} ${rhythm(1 / 2)}`,
					paddingTop: rhythm(2),
				}}>
				<div dangerouslySetInnerHTML={{ __html: page.html }} />
			</Container>
		)
	},
})

export default IndexRoute

export const pageQuery = `
query pageById($pageId: String) {
	page: markdownRemark(id: { eq: $pageId }) {
		html
	}
}
`
