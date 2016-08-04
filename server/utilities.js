"use strict";

const path = require("path");
const fs = require("fs");
const isDirectory = require("is-directory");
const yamlFront = require("yaml-front-matter");
const marked = require("marked");
const glob = require("glob");
const nunjucks = require("nunjucks");

const utilities = {};


utilities._sanitizePath = (filePath) => {
    return path.normalize(filePath).replace(/(\.\.)+/, "");
};


utilities.convertFileContentToMarkdown = (content) => {
    content = yamlFront.loadFront(content);
    content.__html = marked(content.__content);
    return content;
};


utilities.getMarkdownForUrl = (contentPath, url) => {
    return utilities._getContentFileFromUrl(contentPath, url, ".md")
        .then(utilities.convertFileContentToMarkdown);
};


utilities._getContentFileFromUrl = (contentPath, url, ext) => {
    let filename = path.join(contentPath, utilities._sanitizePath(url));

    if (isDirectory.sync(filename)) {
        filename = path.join(filename, "index");
    }

    filename = filename + ext;

    return utilities.getContentFile(filename);
};


utilities.getContentFile = (filename) => {
    return new Promise((resolve, reject) => {
        fs.readFile(filename, (err, data) => {
            if (err) return reject();
            resolve(data);
        });
    });
};


utilities.getContentFilenamesFromUrl = (contentPath, url, ext) => {
    return new Promise((resolve, reject) => {
        glob(path.join(contentPath, utilities._sanitizePath(url), `/*${ext}`), {}, (err, files) => {
            if (err) return reject(err);
            resolve(files);
        });
    });
};


utilities.renderMarkdown = (defaultTemplate, markdown, template) => {
    return new Promise((resolve, reject) => {
        template = template || markdown.template || defaultTemplate;
        nunjucks.render(`${template}.njk`, markdown, (err, res) => {
            if (err) return reject(err);
            resolve(res);
        });
    });
};


utilities.isProduction = () => {
    return process.env.NODE_ENV === "production";
};


module.exports = utilities;
