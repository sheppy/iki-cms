"use strict";

const path = require("path");
const fs = require("fs");
const url = require("url");
const isDirectory = require("is-directory");
const yamlFront = require("yaml-front-matter");
const marked = require("marked");

const Config = require("./../Config");
const Utilities = require("./../Utilities");


class Content {
    getFilenameFromUrl(url, root, extension, index) {
        let filename = path.join(root, Utilities.sanitizePath(url));

        if (index && isDirectory.sync(filename)) {
            filename = path.join(filename, index);
        }

        return path.resolve(filename + extension);
    }


    getFileContent(filename) {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, (err, data) => {
                if (err) return reject();
                resolve(data);
            });
        });
    }


    convertFileContentToMarkdown(content) {
        content = yamlFront.loadFront(content);
        content.__markdown = content.__content;
        delete content.__content;
        content.__html = marked(content.__markdown);
        content.type = content.type || "page";
        content.template = content.template || Config.get("defaultTemplate");
        return content;
    }


    loadMarkdownFile(filename) {
        return this.getFileContent(filename).then(this.convertFileContentToMarkdown);
    }


    load(req) {
        let markdownFilename = this.getFilenameFromUrl(Utilities.getUrlPathname(req.originalUrl), Config.get("contentPath"), ".md", "index");
        return this.loadMarkdownFile(markdownFilename);
    }
}


module.exports = new Content();
