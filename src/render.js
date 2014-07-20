var _ = require("underscore");

var allLines = function(text, iterator) {
  var lines = text.split("\n");
  return _.reduce (lines, function(memo, line, index) {
    return memo += iterator(line) + "\n";
  }, "");
};


var render = function(blocks, template) {
  var extraArgs = Array.prototype.slice.call(arguments, 2);
  
  var templateOptions = {
      blocks: blocks,
      allLines: allLines
  };
  _.extend.apply(_, [templateOptions].concat(extraArgs));

  return _.template(template, templateOptions);
};

module.exports = render;
