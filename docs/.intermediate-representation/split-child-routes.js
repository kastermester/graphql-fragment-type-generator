
    import React from 'react'
    const rootRoute = { childRoutes: [{childRoutes: [
      {
        path:'/Users/khs/www/graphql-fragment-type-generator/docs/pages',
        getComponent (nextState, cb) {
          require.ensure([], (require) => {
            let Component = require('/Users/khs/www/graphql-fragment-type-generator/docs/pages/index.js')
            if (Component.default) {
              Component = Component.default
            }
            require.ensure([], (require) => {
              const data = require('./json/users-khs-www-graphql-fragment-type-generator-docs-pages.json')
              cb(null, () => <Component {...nextState} {...data} />)
            }, 'path---users-khs-www-graphql-fragment-type-generator-docs-pages')
          }, 'page-component---pages-index-js')
        }
      },
    
      {
        path:'/',
        getComponent (nextState, cb) {
          require.ensure([], (require) => {
            let Component = require('/Users/khs/www/graphql-fragment-type-generator/docs/pages/index.js')
            if (Component.default) {
              Component = Component.default
            }
            require.ensure([], (require) => {
              const data = require('./json/index.json')
              cb(null, () => <Component {...nextState} {...data} />)
            }, 'path---index')
          }, 'page-component---pages-index-js')
        }
      },
    ]},]}
    module.exports = rootRoute