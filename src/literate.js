//#Literate.js
//this layer of wrapping basically adds file system semantics to load filenames, templates
//and to write out files.
var _ = require("underscore"),
    languages = require("./languages.js"),
    parser = require("./parser.js"),
    highlight = require("highlight.js").highlightAuto;

var extensionToLanguage = function(extension) {
  for(var key in languages) {
    if(languages.hasOwnProperty(key) && languages[key].extension == extension) {
      return key;
    }
  }
};

var literate = function(text, filename, hostLangName, foreignLangName) {

  if(!hostLangName || !foreignLangName) {
    var extensions = filename.split(".");
    if(extensions.length > 1) {
      extensions.shift();
      extensions = _.last(extensions, 2);
    } else {
      // filename has no extensions... do something i guess
    }

    if(!hostLangName) {
      hostLangName = extensionToLanguage(extensions.pop());
      if(!hostLangName) {
        var highlighted = highlight(text);
        //two different ideas of language intersect here.. need to be kept consistent
        hostLangName = highlighted.language;
      }
    }


    if(!foreignLangName) {
      if(extensions.length) {
        foreignLangName = extensionToLanguage(extensions.pop());
      }
      if(!foreignLangName) {
        var onlyForeign = _.reduce(text.split("\n"), function(memo, line) {
          if(hostLang.checkForeign(line)) {
            return memo + "\n" + hostLang.makeNative(line);
          } else {
            return memo;
          }
        }, "");

        var highlighted = highlight(onlyForeign);
        foreignLangName = highlighted.language;
      }
    }
  }

  return parser(text, hostLangName, foreignLangName);
};

module.exports = literate;
