//#Literate.js
//this layer of wrapping basically adds file system semantics to load filenames, templates
//and to write out files. All this uses promises from [node-utils.js](/node-utils.html) 
var utils = require("./node-utils.js"),
    _ = require("underscore"),
    languages = require("./languages.js");

var findLanguageName = function(extension) {
  for(var key in languages) {
    if(languages.hasOwnProperty(key) && languages[key].extension == extension) {
      return key;
    }
  }
};

//having the render func here makes it flexible but not as much an entry point as desired
var literate = function(path, renders, output, templatePath) {
  if(!_.isArray(renders)) {
    renders = [renders];
  }

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
      _.each(renders, function(render) {
        var temp = render.template || template;
        var rendered = render(file, temp, hostLanguage, foreignLanguage);
        var out = render.output || output;
        if(out) {
          utils.write(out, rendered);
        } else {
          console.log(rendered);
        }
      });
    });
  });
};

module.exports = literate;
