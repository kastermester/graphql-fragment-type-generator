'use strict';

var _react = require('react');

var _react2 = _interopRequireDefault(_react);

var _reactDom = require('react-dom');

var _reactDom2 = _interopRequireDefault(_reactDom);

var _reactHotLoader = require('react-hot-loader');

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var apiRunner = require(`./api-runner-browser`);
// Let the site/plugins run code very early.
apiRunner(`clientEntry`);

var rootElement = document.getElementById(`react-mount`);

var Root = require('./root');
if (Root.default) {
  Root = Root.default;
}

_reactDom2.default.render(_react2.default.createElement(
  _reactHotLoader.AppContainer,
  null,
  _react2.default.createElement(Root, null)
), rootElement);

if (module.hot) {
  module.hot.accept(`./root`, function () {
    var NextRoot = require('./root');
    if (NextRoot.default) {
      NextRoot = NextRoot.default;
    }
    _reactDom2.default.render(_react2.default.createElement(
      _reactHotLoader.AppContainer,
      null,
      _react2.default.createElement(NextRoot, null)
    ), rootElement);
  });
}