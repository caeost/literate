##Literate 
__note:__ you should view this file in something that allows github flavored markdown style code blocks.

Viewing in [markdown-editor](http://jbt.github.io/markdown-editor/) works quite well.

###Basics
This project comprises a few ideas.

1. A basic implementation of literate programming that is as general as possible
2. the ability to embed "documentation code" that is code that is not part of your final runtime, but useful
  * Inline tests into your documentation / code
  * Render out widgets
  * Apply full tools of modern web to your source code
  * Do so in ways that are peformant and don't mess with viewing of source (sandboxing etc.)
3. A flexible and simple structure that doesn't try to do to much (reordering, custom constructs, etc.)

###Code

#####Dependencies 

```javascript
var fs = require("fs"),
    markdown = require( "markdown" ).markdown;

```

#####Useful variables

`regex` is currently just meant for [github flavored markdown](https://help.github.com/articles/github-flavored-markdown) style fenced code. I also want to very soon support 4 space indentation style. 

```javascript
var regex = /(={3,}\n)?`{3}/g;
```

The `map` of markdown syntax name types to extensions, will add more [types](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml) later. I want to play with [highlight.js](https://www.npmjs.org/package/highlight) and see how its auto language detection code could work to prevent having to explicitly tag with code types (untagged code currently falls back to being javascript, could make it pull from a reverse map of `map` against the filename, that is file.ljs -> literate js).

Only web languages will work as documentation code (here being documentation code means being *-page)
```javascript
var map = {
  "javascript": "js",
  "CSS": "css",
  "HTML": "html"
};
```

===
```
console.log("hello world");
```


####Parser
This is where the rubber hits the road. This is a constructor function which takes in three arguments. `filename` is simply the name of the file you are translating, this may have to be more flexible to handle directories later. `watch` determines whether or not to continue watching file for changes. `generateHtml` will cause it to render out the markdown, as well as output the documentation code. 

Some desirable changes:

  * allow passing an output name to write to
  * write html + documentation code to a directory that can be published easily
  * make sure the parser reveals what it does to more advanced usage
  * abstract out file actions so we can also parse documents on client side. For example have a button that on click saves parsed js to clipboard
  * build preview viewer. Just a simple node server with marked which opens a preivew window, or clientside just a window opening. This would have the running documentation code and update on preview
  * write out headers and subheaders of markdown as comments to generated file
  * build sourcemaps when asked to
  * *MAYBE* support closure compiler style annotations in markdown if it can be done in a pretty and reliable way

```javascript
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
```

This documentation code thing needs a serious cleanup..

```javascript
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
```

The parse function basically just loops over all occurences of our special three backticks (which I dread to name until it only checks at the beginning of lines) and counts itself in and out of code blocks. This means that nested code blocks will __absolutely not work__. 

This code is a little verbose right now, but I'm hopeful that at least its relatively easy to follow and understand the idea. Striving for something approaching obvious correctness at the cost of no fancy coding and complex regexs.

```javascript
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
```
Send it out to the world!

```javascript
module.exports = mdparser;
```

