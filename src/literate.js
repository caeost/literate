var utils = require("./node-utils.js"),
    _ = require("underscore"),
    languages = require("./languages.js");

var findLanguageName = function(extension) {
  for(var key in languages) {
    if(languages.hasOwnProperty(key)) {
      if(languages[key].extension == extension) {
        return key;
      }
    }
  }
};

//having the render func here makes it flexible but not as much an entry point as desired
var literate = function(path, render, output, templatePath) {

  var extensions = path.match(/\.(\w+)/g);
  extensions = _.map(extensions, function(extension) {
    return extension.replace(/^\./,"");
  });

  var extension = extensions.pop();
  var foreignExtension = extensions.pop();

  var hostLanguage = findLanguageName(extension);

  var foreignLanguage = "markdown";
  if(foreignExtension) {
    foreignLanguage = findLanguageName(foreignExtension);
  }

  utils.read(path).then(function(file) {
    utils.read(templatePath).then(function(template) {
      var rendered = render(file, template, hostLanguage, foreignLanguage);
      if(output) {
        utils.write(output, rendered);
      } else {
        console.log(rendered);
      }
    });
  });
};

module.exports = literate;
