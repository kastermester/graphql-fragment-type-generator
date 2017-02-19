var plugins = [{
      plugin: require('/Users/khs/www/graphql-fragment-type-generator/docs/gatsby-browser.js'),
      options: {"plugins":[]},
    }]
'use strict';

// During bootstrap, we write requires at top of this file which looks
// basically like:
// var plugins = [
//   require('/path/to/plugin1/gatsby-browser.js'),
//   require('/path/to/plugin2/gatsby-browser.js'),
// ]

module.exports = function (api, args, defaultReturn) {
  console.log(`running gatsby plugins for api "${ api }" with args`, args);

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

  console.log(`results`, results);

  if (results.length > 0) {
    return results;
  } else if (defaultReturn) {
    return [defaultReturn];
  } else {
    return [];
  }
};