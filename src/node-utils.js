var fs = require("fs"),
    writeFile = require('writefile'),
    Promise = require("rsvp").Promise;


//from http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
var walk = function(dir) {
  return new Promise(function(resolve, reject) {
    var results = [];
    fs.readdir(dir, function(err, list) {
      if (err) return reject(err);
      var pending = list.length;
      if (!pending) return resolve(results);
      list.forEach(function(file) {
        if(!/\/$/.test(dir)) dir += "/";
        file = dir + file;
        fs.stat(file, function(err, stat) {
          if (stat && stat.isDirectory()) {
            walk(file).then(function(res) {
              results = results.concat(res);
              if (!--pending) resolve(results);
            });
          } else {
            results.push(file);
            if (!--pending) resolve(results);
          }
        });
      });
    });
  });
};

module.exports = {
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
        writeFile(path, data).then(function(result, error) {
          if(error) {
            reject(error);
          } else {
            resolve(result);
          }
        });
      } catch (e) {
        console.error("write error", e);
        reject(e);
      }
    });
  },
  walk: walk
};
