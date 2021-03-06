var fs = require("fs"),
    render = require("./render.js"),
    languages = require("./languages.js"),
    pagedown = require("pagedown"),
    _ = require("underscore"),
    highlight = require("highlight").Highlight;

var converter = new pagedown.Converter();

module.exports = _.partial(render, _, _, {converter: converter, markdown: languages["markdown"], highlight: highlight});

