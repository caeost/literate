var languages = require("./languages.js"),
    _ = require("underscore");

//todo: add capacity to introspect and fine grain finding hostlanguage and foreignlanguage on case by case
var parse = function(text, hostLanguage, foreignLanguage) {
  var hostLangSpecs = languages[hostLanguage],
      checkForeign = _.bind(hostLangSpecs.checkForeign, hostLangSpecs),
      makeNative = hostLangSpecs.makeNative,
      splitBlocks = hostLangSpecs.splitBlocks,
      checkDocumentation = _.bind(hostLangSpecs.checkDocumentation, hostLangSpecs),
      
      foreignLangSpecs = languages[foreignLanguage],
      foreignSplitBlocks = foreignLangSpecs.splitBlocks,

  //list of blocks
      blocks = [],
      current = {},
      inHost = true;

  //helpers
  var createBlock = function(text, language) {
    var args = _.rest(arguments, 2);
    blocks.push(current);
    current = {
      text: text ? text + "\n" : "",
      language: languages[language],
      langName: language,
      extension: languages[language].extension
    };
    _.extend.apply(_, [current].concat(args));
  };
  var createForeignBlock = _.partial(createBlock, _, foreignLanguage);
  var createHostBlock = _.partial(createBlock, _, hostLanguage);

  createHostBlock("");

  var lines = text.split("\n");
  for(var i = 0, len = lines.length; i < len; i++) {
    var line = lines[i];
    var foreign = checkForeign(line);
    var isDocumentationCode = checkDocumentation(line);
    //determine if this is a block of non host code
    if(foreign) {
      //determine if this non host code is part of some kind of "non source" code
      var nativeLine = makeNative(line);
      var isForeignSplit = foreignSplitBlocks(nativeLine);

      //if currently in the host language this means a split is necessary
      if(inHost) {
        var next = "";
        //foreign can explicitly pass back the string "after" to make the found string be added to the
        //previous block, such as delimiting syntax in the host language that wraps the lines of another block
        if(foreign == "after") {
          current.text += line + "\n";
        } else if(isForeignSplit == "after") {
          createForeignBlock(nativeLine);
        } else {
          next = nativeLine;
        }
        createForeignBlock(next);
        inHost = false;
      } else {
        //if this line is considered splitting in the foreign language we need to split again potentially
        if(isForeignSplit) {
          var next = ""
          if(isForeignSplit == "after") {
            current.text += nativeLine + "\n";
          } else {
            next = nativeLine;
          }
          createForeignBlock(next);
        }
        current.text += nativeLine + "\n";
      }
      current.documentationCode = isDocumentationCode;
    //host language
    } else {
      var isSplit = splitBlocks(line);
      //need to build this so that the after before dynamic can work here too
      if(!inHost) {
        if(isSplit == "after") {
          createHostBlock(line);
          createHostBlock("");
        } else {
          createHostBlock(line);
        }
        inHost = true;
      } else {
        if(isSplit) {
          if(isSplit == "after") {
            current.text += line + "\n";
            createHostBlock("");
          } else {
            createHostBlock(line);
          }
        } else {
          current.text += line + "\n";
        }
      }
    }
  }
  blocks.push(current);

  blocks = _.filter(blocks, function(block) {
    return block.text;
  });

  return blocks;
};

module.exports = parse;
