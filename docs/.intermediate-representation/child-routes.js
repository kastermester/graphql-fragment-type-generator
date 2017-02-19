
    import React from 'react'

    /**
     * Warning from React Router, caused by react-hot-loader.
     * The warning can be safely ignored, so filter it from the console.
     * Otherwise you'll see it every time something changes.
     * See https://github.com/gaearon/react-hot-loader/issues/298
     */
    if (module.hot) {
        const isString = require('lodash/isString')

      const orgError = console.error;
      console.error = (...args) => {
      if (args && args.length === 1 && isString(args[0]) && args[0].indexOf('You cannot change <Router routes>;') > -1) {
        // React route changed
      } else {
        // Log the error as normally
        orgError.apply(console, args);
      }
      };
    }

    class ComponentUsersKhsWwwTestSitePages extends React.Component {
          render () {
            let Component = require('/Users/khs/www/test-site/pages/index.js')
            if (Component.default) {
              Component = Component.default
            }
            const data = require('./json/users-khs-www-test-site-pages.json')
            return <Component {...this.props} {...data} />
          }
        }
class ComponentIndex extends React.Component {
          render () {
            let Component = require('/Users/khs/www/test-site/pages/index.js')
            if (Component.default) {
              Component = Component.default
            }
            const data = require('./json/index.json')
            return <Component {...this.props} {...data} />
          }
        }
    const rootRoute = { childRoutes: [{childRoutes: [
      {
        path:'/Users/khs/www/test-site/pages',
        component: ComponentUsersKhsWwwTestSitePages,
      },
    
      {
        path:'/',
        component: ComponentIndex,
      },
    ]},]}
    module.exports = rootRoute