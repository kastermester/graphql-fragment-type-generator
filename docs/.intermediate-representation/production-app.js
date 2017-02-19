'use strict';

var _extends2 = require('babel-runtime/helpers/extends');

var _extends3 = _interopRequireDefault(_extends2);

var _apiRunnerBrowser = require('./api-runner-browser');

var _apiRunnerBrowser2 = _interopRequireDefault(_apiRunnerBrowser);

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _applyRouterMiddleware = require('react-router/lib/applyRouterMiddleware');

var _applyRouterMiddleware2 = _interopRequireDefault(_applyRouterMiddleware);

var _Router = require('react-router/lib/Router');

var _Router2 = _interopRequireDefault(_Router);

var _match = require('react-router/lib/match');

var _match2 = _interopRequireDefault(_match);

var _browserHistory = require('react-router/lib/browserHistory');

var _browserHistory2 = _interopRequireDefault(_browserHistory);

var _useScroll = require('react-router-scroll/lib/useScroll');

var _useScroll2 = _interopRequireDefault(_useScroll);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

// Let the site/plugins run code very early.
(0, _apiRunnerBrowser2.default)(`clientEntry`);

// Explicitly require from Gatsby subfolder. This isn't normally required but
// seems to be when developing using "npm link" as otherwise Webpack uses
// different versions of the plugin (one locally and the other in the checked
// out version of Gatsby) which makes everything fall apart.
var runtime = void 0;
try {
  runtime = require(`gatsby/node_modules/offline-plugin/runtime`);
} catch (e) {
  // If the above doesn't work, require normally.
  try {
    runtime = require(`offline-plugin/runtime`);
  } catch (e) {
    // ignore
  }
}

// Install service worker.
runtime.install({
  onInstalled: function onInstalled() {
    console.log("SW Event:", "onInstalled");
  },
  onUpdating: function onUpdating() {
    console.log("SW Event:", "onUpdating");
  },
  onUpdateReady: function onUpdateReady() {
    console.log("SW Event:", "onUpdateReady");
    runtime.applyUpdate();
  },
  onUpdated: function onUpdated() {
    console.log("SW Event:", "onUpdated");
    (0, _apiRunnerBrowser2.default)('swOnUpdated');
  },
  onUninstalled: function onUninstalled() {
    console.log("SW Event:", "onUninstalled");
  }
});

var rootElement = document.getElementById(`react-mount`);
var rootRoute = require(`./split-child-routes`);

// If you try to load the split-child-routes module in other
// modules, Webpack freezes in some sort of infinite loop when
// you try to build the javascript for production. No idea
// why... so for now we'll pop the routes on window. I hope no
// one feels overly dirty from reading this ;-)
if (typeof window !== 'undefined') {
  window.gatsbyRootRoute = rootRoute;
}

var currentLocation = void 0;
_browserHistory2.default.listen(function (location) {
  currentLocation = location;
});

function shouldUpdateScroll(prevRouterProps, _ref) {
  var pathname = _ref.location.pathname;

  var results = (0, _apiRunnerBrowser2.default)(`shouldUpdateScroll`, { prevRouterProps, pathname });
  if (results.length > 0) {
    return results[0];
  }

  if (prevRouterProps) {
    var oldPathname = prevRouterProps.location.pathname;

    if (oldPathname === pathname) {
      return false;
    }
  }
  return true;
}

(0, _match2.default)({ history: _browserHistory2.default, routes: rootRoute }, function (error, redirectLocation, renderProps) {
  var Root = function Root() {
    return _react2.default.createElement(_Router2.default, (0, _extends3.default)({}, renderProps, {
      render: (0, _applyRouterMiddleware2.default)((0, _useScroll2.default)(shouldUpdateScroll)),
      onUpdate: function onUpdate() {
        (0, _apiRunnerBrowser2.default)('onRouteUpdate', currentLocation);
      }
    }));
  };
  var NewRoot = (0, _apiRunnerBrowser2.default)(`wrapRootComponent`, { Root }, Root)[0];
  _reactDom2.default.render(_react2.default.createElement(NewRoot, null), typeof window !== `undefined` ? document.getElementById(`react-mount`) : void 0);
});