var _ = require("underscore"),
    parse = require("./parser.js");

var render = function(code, template, hostLanguage, foreignLanguage) {
  var extraArgs = Array.prototype.slice.call(arguments, 4);
  
  var blocks = parse(code, hostLanguage, foreignLanguage)

  var allLines = function(text, iterator) {
    var lines = text.split("\n");
    return _.reduce (lines, function(memo, line, index) {
      return memo += iterator(line) + "\n";
    }, "");
  };

  var templateOptions = {
      blocks: blocks,
      allLines: allLines
  };
  _.extend.apply(_, [templateOptions].concat(extraArgs));

  return _.template(template, templateOptions);
};

module.exports = render;
