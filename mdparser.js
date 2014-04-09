
var fs = require("fs"),
    markdown = require( "markdown" ).markdown;


var regex = /(={3,}\n)?`{3}/g;

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
  generateHtml: function(data, filename) {
    var html = markdown.toHTML(data);
    fs.writeFile(filename, html, function(err) {
      if(err) throw err;
    });
  },
  read: function(filename) {
    var that = this;
    fs.readFile(filename, "utf8", function (err, data) {
      if (err) throw err;
      that.operate(data, filename);
      if(that.html) that.generateHtml(data, filename);
    });
  },
  operate: function(data, name) {
    var parsedObject = this.parse(data);
    for (var key in parsedObject) {
      var parsed = parsedObject[key],

          documentationCode = !~~key.indexOf("page-"),
          type = documentationCode ? key.substring(5) : key,
          output = name.split(".")[0] + (documentationCode ? "-page" : "") + "." + map[type];
      console.log("type: " + type + " output: " + output);
      if(documentationCode && !this.html) continue;
      
      fs.writeFile(output, parsed, function(err) {
        if(err) throw err;
      });
    }
  },

  parse: function(file) {
    var myArray,
        result = {},
        inCode = false,
        documentationCode = false,
        type,
        codeStart;

    while ((myArray = regex.exec(file)) !== null) {
      var index = myArray.index,
      	  length = myArray[0].length,
          doc = myArray[1],
          text = "";

      if(!inCode) {
        index += length;
        var lineEnd = file.indexOf("\n", index);
        type = file.substring(index, lineEnd) || "javascript"; //change to inferred page type later
        documentationCode = doc;

        inCode = true;
        codeStart = lineEnd || index;
      } else {
        text = file.substring(codeStart, index);
        if(text.length) {
          if(documentationCode) {
            type = "page-" + type;
          }
          if(result[type]) {
            result[type] += text;
          } else {
            result[type] = text;
          }
        }
        documentationCode = false;
        codeStart = false;
        inCode = false;
      }
    }
    return result;
  }
}

module.exports = mdparser;
