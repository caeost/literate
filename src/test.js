var literate = require("./literate.js"),
    markRender = require("./markdownRender.js");

var file = literate("./mdparser.js.md", markRender, "./output.md", "./markdown-template.html");

console.log(file);

