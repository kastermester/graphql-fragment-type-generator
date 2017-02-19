var plugins = []
'use strict';

// During bootstrap, we write requires at top of this file which looks like:
// var plugins = [
//   require('/path/to/plugin1/gatsby-ssr.js'),
//   require('/path/to/plugin2/gatsby-ssr.js'),
// ]

module.exports = function (api, args, defaultReturn) {
  // Run each plugin in series.
  var results = plugins.map(function (plugin) {
    if (plugin.plugin[api]) {
      var result = plugin.plugin[api](args, plugin.options);
      return result;
    }
    return;
  });

  // Filter out undefined results.
  results = results.filter(function (result) {
    return typeof result !== 'undefined';
  });

  if (results.length > 0) {
    return results;
  } else {
    return [defaultReturn];
  }
};