"use strict";

const path = require("path");
const promisify = require("promisify-node");
const fs = promisify("fs");
const nunjucks = require("nunjucks");
const MarkdownIt = require("markdown-it");

const nunjucksRender = promisify(nunjucks.render);


const CmsViewEngine = function(options) {
    // Create markdown converter
    this.markdown = new MarkdownIt({
        linkify: true,
        typographer: true
    });

    // Setup nunjucks
    nunjucks.configure(options.path, { noCache: !this.isProduction });
    this.render = nunjucksRender;
};


module.exports = CmsViewEngine;
