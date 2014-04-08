
var fs = require("fs"),
    markdown = require( "markdown" ).markdown;


var regex = /`{3}([A-Za-z]*)?(-N)?([^`]*)\n`{3}/g;

var map = {
  "javascript": "js",
  "CSS": "css",
  "HTML": "html"
};

var mdparser = function(filename, watch, generateHtml) {
  this.fileName = filename;
  this.watch = watch;
  this.html = generateHtml;

  this.read(filename);

  if(watch) {
    var that = this;
    fs.watch(filename, function(e, name) {
      that.read(filename);
    });
  } 
};

mdparser.prototype = {
  generateHtml: function(data) {
    var html = markdown.toHTML(data);
    fs.writeFile(output, html, function(err) {
      if(err) throw err;
    });
  },
  read: function(filename) {
    var that = this;
    fs.readFile(filename, function (err, data) {
      if (err) throw err;
      that.operate(data, filename);
      if(that.html) that.generateHtml(data);
    });
  },
  operate: function(data, name) {
    var parsedObject = this.parse(data);
    for (var key in parsedObject) {
      var parsed = parsedObject[key],
          documentationCode = !~~key.indexOf("page-"),
          type = documentationCode ? key.substring(5) : key,
          output = name.split(".")[0] + (documentationCode ? "-page" : "") + "." + map[type];

      if(documentationCode && !this.html) continue;

      fs.writeFile(output, parsed, function(err) {
        if(err) throw err;
      });
    }
  },
  parse: function(file) {
    var myArray,
        result = {},
        last = 0;
  
    while ((myArray = regex.exec(file)) !== null) {
      var text = "" + myArray[3],
          noout = myArray[2],
          //see note in mdparser bash script
          type = myArray[1] ||  "javascript";
  	
      if(!text.length || (myArray.index + text.length) < last) continue;
      last = myArray.index + text.length;
      if(noout) type = "page-" + type 
  
      if(result[type]) {
        result[type] += text;
      } else {
        result[type] = text;
      }
    } 
    return result;
  }
}


module.exports = mdparser;

