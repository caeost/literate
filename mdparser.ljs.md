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

`regex` is at first just meant for [github flavored markdown](https://help.github.com/articles/github-flavored-markdown) style fenced code. We want to also very soon support 4 space indentation style. 

The -N component to the regex is a temporary hack. This will I think break proper in editor syntax highlighting, as well as also not clearly enough saying what is and is not runtime code.

__Note:__ currently compiling this into mdparser.js is blocked by only
this regex, as you can see it doesnt allow backticks in side code
blocks, which this regex obviously has, need to fix. Maybe split apart
into something that just searches for three backticks? Do more in code?

```javascript
var regex = /`{3}([A-Za-z]*)?(-N)?([^`]*)\n`{3}/g;
```

The `map` of markdown syntax name types to extensions, will add more [types](https://github.com/github/linguist/blob/master/lib/linguist/languages.yml) later. I want to play with [highlight.js](https://www.npmjs.org/package/highlight) and see how its auto language detection code maybe work to prevent having to explicitly tag with code types (untagged code currently falls back to being javascript, could make it pull from a reverse map of `map` against the filename, that is file.ljs -> literate js).

Only web languages should work as documentation code (here being documentation code means being *-page)
```javascript
var map = {
  "javascript": "js",
  "CSS": "css",
  "HTML": "html"
};
```

####Parser
This is where the rubber hits the road. This is a constructor function which takes in three arguments. `filename` is simply the name of the file you are translating, this may have to be more flexible to handle directories later. `watch` determines whether or not to continue watching file for changes. `generateHtml` will cause it to render out the markdown, as well as output the documentation code. 

Some desirable changes:

  * allow passing an output name to write to
  * write html + documentation code to a directory that can be published easily
  * make sure the parser reveals what it does to more advanced usage

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
```

