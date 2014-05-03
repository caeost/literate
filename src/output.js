var fs = require("fs"),
    markdown = require("markdown").markdown,
    Promise = require('rsvp').Promise,
    _ = require("underscore");
var regex = /(={3,}\n)?`{3}/g;
var map = require("./languages.js");
var mdparser = function(filename, watch, doHtml, output) {
  this.fileName = filename;
  this.output = output || filename;
  this.watch = watch;
  this.html = doHtml;


  if(filename) {
    this.processFile(filename);

    if(watch) {
      var that = this;
      fs.watch(filename, function(e, name) {
        that.processFile(filename);
      });
    }
  }
};

mdparser.prototype = {
  addFolder: function(name) {
    return new Promise(function(resolve, reject) {
      var array = name.split("/"),
          fileName = array.pop();

      array.push("documentation");
      var directory = array.join("/");

      array.push(fileName);
      var directoriedName = array.join("/");
      try {
        fs.mkdir(directory, function(err) {
          if(err && err.code != "EEXIST") {
          	console.error("error creating directory");
            reject(err);
          } else {
            resolve(directoriedName);
          }
        });
      } catch(e) {
        console.error("addFolder error", e);
        reject(e);
      }
    });
  },
  generateHtml: function(data, filename) {
    var that = this;

    return new Promise(function(resolve, reject) {
      var html = markdown.toHTML(data);
      that.addFolder(filename).then(function(name) {
        that.write(name + ".html", html).then(resolve, function(error) {
			console.error("error generating HTML: " + error);
			reject(error);
        });
      });
    });
  },
  processFile: function(filename) {
    var that = this;
    return new Promise(function(resolve, reject) {
      that.read(filename).then(function(data) {
        that.operate(data, filename);
        if(that.html) {
          that.generateHtml(data, filename).then(resolve, reject);
        } else {
          resolve(true);
        }
      });
    });
  },
  read: function(filename) {
    var that = this;

    return new Promise(function(resolve, reject) {
      try {
        fs.readFile(filename, "utf8", function (err, data) {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      } catch(e) {
        console.error("read error", e);
        reject(e);
      }
    });
  },
  write: function(path, data) {
    return new Promise(function(resolve, reject) {
      try {
        fs.writeFile(path, data, function(err) {
          if(err) {
            reject(err);
          } else {
            resolve(true);
          }
        });
      } catch (e) {
        console.error("write error", e);
        reject(e);
      }
    });
  },
  operate: function(data, name) {
    var parsedObject = this.parse(data),
        that = this;

    for (var key in parsedObject) {
      var parsed = parsedObject[key],
          documentationCode = !~~key.indexOf("page-"),
          type = documentationCode ? key.substring(5) : key,
          output = name.split(".")[0] + (documentationCode ? "-page" : "") + map[type];
      
		
      if(documentationCode && this.html) {
        this.addFolder(output).then(function(name) {
          that.write(name, parsed);
        });
      } else {
      	console.error(parsed);
        that.write(output, parsed);
      }
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


