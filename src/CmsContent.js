"use strict";

const path = require("path");
const isDirectory = require("is-directory");
const promisify = require("promisify-node");
const fs = promisify("fs");
const fm = require("front-matter");


const loadFrontMatteredContent = function(filename, contentPath) {
    return fs.readFile(path.join(contentPath, filename) + ".md", "utf8").then(fm);
};


const getContentFilenameFromUrl = function(url, contentPath) {
    let filename = path.join("page", path.normalize(url));

    if (isDirectory.sync(path.join(contentPath, filename))) {
        filename = path.join(filename, "index");
    }

    return filename;
};


const CmsContent = function(options) {
    const cms = this;

    const render = function *(view = "default", data) {
        // Inject the global data
        let global = yield loadFrontMatteredContent("global", options.path);
        data.global = global.attributes;
        return cms.render(path.join("page", view) + ".njk", data);
    };

    const cmsPage = function *(next) {
        let content;

        try {
            let contentFilename = getContentFilenameFromUrl(this.request.url, options.path);
            content = yield loadFrontMatteredContent(contentFilename, options.path);
            content.body = content.body ? cms.markdown.render(content.body) : "";
        } catch (err) {
            console.error(err);
            return yield next;
        }

        this.body = yield render(content.attributes.template, content);
    };

    this.app.use(cmsPage);
};


module.exports = CmsContent;
