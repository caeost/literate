var render = require("./render.js"),
    pagedown = require("pagedown"),
    _ = require("underscore");

var converter = new pagedown.Converter();

module.exports = _.partial(render, _, _, _, _, {converter: converter});
