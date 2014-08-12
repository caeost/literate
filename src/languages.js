module.exports = {
  "css": {
    name: "css",
    extension: "css",
    checkForeign = function() {
      var inCommentBlock = false;
      return  function(line) {
                if(!inCommentBlock) inCommentBlock = /^\s*\/\*\**/.test(line);
                return inCommentBlock;
              }
    }(),
    makeNative: function(line) {
      return line.replace(/^\s*\/\*\**/, "").replace(/^\*\**\/\s*/."");
    },
    makeForeign: function(line) {

    },
    splitBlocks: function(line) {

    },
    type: "code"
  },
  "javascript": {
    name: "javascript",
    extension: "js",
    checkForeign: function(line) {
      return /^\s*\/\//.test(line);
    },
    makeNative: function(line) {
      return line.replace(/^(\s*)\/\//, "");
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
      return line.replace(/^[ ]*/, "");
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
