var languages = require("./languages.js"),
    _ = require("underscore");

// #todo:
// clean up these initializations
var parse = function(text, hostLanguage, foreignLanguage) {
  var hostLangSpecs = languages[hostLanguage],
      foreignLangSpecs = languages[foreignLanguage],
      //list of blocks
      blocks = [{foreign: false, text: ""}],
      inHost = true;

  var checkForeign = _.bind(hostLangSpecs.checkForeign, hostLangSpecs),
      makeNative = hostLangSpecs.makeNative,
      splitBlocks = hostLangSpecs.splitBlocks,
      foreignSplitBlocks = foreignLangSpecs.splitBlocks;

  var lines = text.split("\n");
  for(var i = 0, len = lines.length; i < len; i++) {
    var line = lines[i],
        previous = lines[i - 1],
        split = false;
    if(i < len - 1) line += "\n";

    var foreign = checkForeign(line, previous);

    if(foreign){
      line = makeNative(line);
      // for people using previous
      lines[i] = line;
      split = foreignSplitBlocks(line, previous);
    } else {
      split = splitBlocks(line);
    }

    // should split if inHost and current line is foreign, or if not
    // inHost and current line is not foreign (aka host)
    if(inHost == foreign || split) {
      blocks.push({foreign: foreign, text: line});
      inHost = !foreign;
    } else {
      var lastBlock = blocks[blocks.length - 1];
      lastBlock.text += line;
    }
  }

  var result = [],
      hostBlock = {
        language: languages[hostLanguage],
        langName: hostLanguage,
        extension: languages[hostLanguage].extension
      },
      foreignBlock = {
        language: languages[foreignLanguage],
        langName: foreignLanguage,
        extension: languages[foreignLanguage].extension
      };

  for(var i = 0, len = blocks.length; i < len; i++) {
    var block = blocks[i];

    if(block.text) {
      _.extend(block, block.foreign ? foreignBlock : hostBlock);
      result.push(block);
    }
  }

  return result;
};

module.exports = parse;
