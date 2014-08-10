module.exports = {
  "javascript": {
    name: "javascript",
    extension: "js",
    checkForeign: function(line) {
      return /^\s*\/\//.test(line);
    },
    makeNative: function(line) {
      return line.replace(/^(\s*)\/\//, "$1");
    },
    makeForeign: function(line) {
      return "//" + line;
    },
    splitBlocks: function(line) {
      return false;
    },
    checkDocumentation: function(line) {
      return false;
    },
    type: "code"
  },
  "markdown": {
    name: "markdown",
    extension: "md",
    checkForeign: function(line) {
      return /^[ ]{4}/.test(line);
    },
    makeNative: function(line) {
      return line.replace(/^[ ]{4}/, "");
    },
    makeForeign: function(line) {
      return "    " + line;
    },
    splitBlocks: function(line) {
      return /^#{1,3}/.test(line);
    },
    checkDocumentation: function() {
      var isDocCode = false;
      return function(line) {
        if(isDocCode) {
          var foreign = this.checkForeign(line);
          if(foreign) {
            return true;
          } else {
            return isDocCode = false;
          }
        } else {
          isDocCode = /^={3,}/.test(line);
          return false;
        }
    }}(),
    type: "text"
  }
};
