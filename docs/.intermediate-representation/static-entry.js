'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _objectWithoutProperties2 = require('babel-runtime/helpers/objectWithoutProperties');

var _objectWithoutProperties3 = _interopRequireDefault(_objectWithoutProperties2);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _server = require('react-dom/server');

var _reactRouter = require('react-router');

var _html = require('html');

var _html2 = _interopRequireDefault(_html);

var _lodash = require('lodash');

var _lodash2 = _interopRequireDefault(_lodash);

var _childRoutes = require('.intermediate-representation/child-routes.js');

var _childRoutes2 = _interopRequireDefault(_childRoutes);

var _tmpPages = require('public/tmp-pages.json');

var _tmpPages2 = _interopRequireDefault(_tmpPages);

var _apiRunnerSsr = require('.intermediate-representation/api-runner-ssr');

var _apiRunnerSsr2 = _interopRequireDefault(_apiRunnerSsr);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var pathChunkName = function pathChunkName(path) {
  var name = path === `/` ? `index` : _lodash2.default.kebabCase(path);
  return `path---${ name }`;
};
//import { pathChunkName } from './js-chunk-names'

//import { prefixLink } from '../isomorphic/gatsby-helpers'


module.exports = function (locals, callback) {
  var linkPrefix = ``;
  if (__PREFIX_LINKS__) {
    linkPrefix = __LINK_PREFIX__;
  }

  (0, _reactRouter.match)({ routes: _childRoutes2.default, location: locals.path }, function (error, redirectLocation, renderProps) {
    if (error) {
      console.log(`error when building page ${ locals.path }`, error);
      callback(error);
    } else if (renderProps) {
      (function () {
        var component = _react2.default.createElement(_reactRouter.RouterContext, renderProps);

        // Let the site or plugin render the page component.
        var results = (0, _apiRunnerSsr2.default)(`replaceServerBodyRender`, { component, headComponents: [] }, {});
        var _results$ = results[0],
            body = _results$.body,
            headComponents = _results$.headComponents,
            postBodyComponents = _results$.postBodyComponents,
            bodyRenderProps = (0, _objectWithoutProperties3.default)(_results$, ['body', 'headComponents', 'postBodyComponents']);

        // If no one stepped up, we'll handle it.

        if (!body) {
          body = (0, _server.renderToString)(component);
        }

        // Check if vars were created.
        if (!bodyRenderProps) {
          bodyRenderProps = {};
        }
        if (!headComponents) {
          headComponents = [];
        }
        if (!postBodyComponents) {
          postBodyComponents = [];
        }

        // Add the chunk-manifest as a head component.
        var chunkManifest = require(`!raw!public/chunk-manifest.json`);

        headComponents.push(_react2.default.createElement('script', {
          id: 'webpack-manifest',
          dangerouslySetInnerHTML: { __html: `
            //<![CDATA[
            window.webpackManifest = ${ chunkManifest }
            //]]>
            `
          }
        }));

        var stats = void 0;
        try {
          stats = require(`public/stats.json`);
        } catch (e) {
          // ignore
        }
        var dascripts = [_tmpPages2.default.find(function (page) {
          return page.path === locals.path;
        }).componentChunkName, pathChunkName(locals.path), `app`, `commons`];
        dascripts.forEach(function (script) {
          var fetchKey = `assetsByChunkName[${ script }][0]`;
          //const prefixedScript = prefixLink(`/${_.get(stats, fetchKey, ``)}`)
          var prefixedScript = `${ linkPrefix }/${ _lodash2.default.get(stats, fetchKey, ``) }`;

          // Add preload <link>s for scripts.
          headComponents.unshift(_react2.default.createElement('link', {
            rel: 'preload',
            href: prefixedScript,
            as: 'script'
          }));

          // Add script tags for the bottom of the page.
          postBodyComponents.unshift(_react2.default.createElement('script', { key: prefixedScript, src: prefixedScript }));
        });

        // Call plugins to let them add to or modify components/props.
        var pluginHeadComponents = (0, _apiRunnerSsr2.default)(`modifyHeadComponents`, { headComponents }, []);
        headComponents = headComponents.concat(pluginHeadComponents);

        var pluginPostBodyComponents = (0, _apiRunnerSsr2.default)(`modifyPostBodyComponents`, { postBodyComponents }, []);
        postBodyComponents = postBodyComponents.concat(pluginPostBodyComponents);

        var pluginBodyRenderProps = (0, _apiRunnerSsr2.default)(`modifyBodyRenderProps`, { bodyRenderProps }, {});
        bodyRenderProps = _lodash2.default.merge(bodyRenderProps, pluginBodyRenderProps);

        var html = `<!DOCTYPE html>\n ${ (0, _server.renderToStaticMarkup)(_react2.default.createElement(_html2.default, (0, _extends3.default)({}, bodyRenderProps, {
          headComponents: headComponents,
          postBodyComponents: postBodyComponents,
          body: body
        }, renderProps))) }`;
        callback(null, html);
      })();
    } else {
      console.log(`Couldn't match ${ locals.path } against your routes. This
      should NEVER happen.`);
      callback(null, `FAIL ALERT`);
    }
  });
};