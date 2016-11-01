"use strict";

const path = require("path");
const fs = require("fs");
const url = require("url");
const isDirectory = require("is-directory");
const yamlFront = require("yaml-front-matter");
const marked = require("marked");
const Config = require("./../Config");
const Utilities = require("./../Utilities");


/**
 * CMS markdown content.
 * @typedef {{__markdown: string, __html: string, type: string, template: string, __listing: string[]=, __pagination: CmsListingPagination=, perPage: number=}} CmsContent
 */


class Content {
    /**
     * Get the content filename from the url.
     *
     * @param {string} url - The url.
     * @param {string} root - The file path root.
     * @param {string} extension - The file extension (including dot).
     * @param {string} [index] - The index filename.
     * @returns {string} - The content filename.
     */
    getFilenameFromUrl(url, root, extension, index) {
        let filename = path.join(root, Utilities.sanitizePath(url));

        if (index && isDirectory.sync(filename)) {
            filename = path.join(filename, index);
        }

        return path.resolve(filename + extension);
    }


    /**
     * Get a files contents.
     *
     * @param {string} filename - The filename to load.
     * @returns {Promise.<string>} - A promise that resolves with the file content.
     */
    getFileContent(filename) {
        return new Promise((resolve, reject) => {
            fs.readFile(filename, (err, data) => err ? reject(err) : resolve(data));
        });
    }


    /**
     * Converts a files contents to markdown.
     *
     * @param {string} content - The content to convert.
     * @returns {CmsContent} - An object with the converted file.
     */
    convertFileContentToMarkdown(content) {
        let converted = yamlFront.loadFront(content);
        converted.__markdown = converted.__content;
        delete converted.__content;
        converted.__html = marked(converted.__markdown);
        converted.type = converted.type || "page";
        converted.template = converted.template || Config.get("defaultTemplate");
        return converted;
    }


    /**
     * Load and convert a markdown file.
     *
     * @param {string} filename - The markdown filename.
     * @returns {Promise.<CmsContent>} - The converted file.
     */
    loadMarkdownFile(filename) {
        return this.getFileContent(filename).then(this.convertFileContentToMarkdown);
    }


    /**
     * Load CMS content from the request.
     *
     * @param {Object} req - The express request object.
     * @returns {Promise.<CmsContent>} - The converted content.
     */
    load(req) {
        let markdownFilename = this.getFilenameFromUrl(
            Utilities.getUrlPathname(req.originalUrl),
            Config.get("contentPath"),
            ".md",
            "index"
        );
        return this.loadMarkdownFile(markdownFilename);
    }
}


module.exports = new Content();
