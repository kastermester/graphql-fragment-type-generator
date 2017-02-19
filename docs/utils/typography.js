import Typography from 'typography'
import theme from 'typography-theme-sutro'
import CodePlugin from 'typography-plugin-code'
theme.plugins = [new CodePlugin()]

const typography = new Typography(theme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== 'production') {
	typography.injectStyles()
}

export default typography
