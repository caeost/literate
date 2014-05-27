var _ = require("underscore"),
    parse = require("./parser.js");

var render = function(code, template, hostLanguage, foreignLanguage) {
  var extraArgs = Array.prototype.slice.call(arguments, 4);
  
  var blocks = parse(code, hostLanguage, foreignLanguage)

  var templateOptions = {
      blocks: blocks
  };
  _.extend.apply(_, [templateOptions].concat(extraArgs));

  return _.template(template, templateOptions);
};

module.exports = render;
