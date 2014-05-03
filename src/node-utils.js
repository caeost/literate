var fs = require("fs"),
    Promise = require("rsvp").Promise;

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
  }
};
