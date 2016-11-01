"use strict";

const path = require("path");
const url = require("url");
const glob = require("glob");

const Config = require("./../Config");
const Utilities = require("./../Utilities");
const Content = require("./Content");


/**
 * CMS listing pagination.
 * @typedef {{page: number, total: number, pages: number, perPage: number, offset: number}} CmsListingPagination
 */


class Listing {
    /**
     * Create a pagination object.
     *
     * @param {number} [page = 1] - The current page.
     * @param {number} [perPage = Config.get("defaultPerPage")] - The number per page.
     * @returns {CmsListingPagination} - The pagination object.
     */
    createPaginationObject(page, perPage) {
        let pagination = {
            page: parseInt(page || 1, 10),
            total: 0,
            pages: 0,
            perPage: parseInt(perPage || Config.get("defaultPerPage"), 10),
            offset: 0
        };

        pagination.offset = (pagination.page - 1) * pagination.perPage;

        return pagination;
    }

    /**
     * Get an array of filenames from a url.
     *
     * @param {string} url - The url.
     * @param {string} root - The root path.
     * @param {string} extension - The file extensions to look for.
     * @returns {Promise.<string[]>} - The filenames.
     */
    getFilenamesFromUrl(url, root, extension) {
        let globPattern = path.join(root, Utilities.sanitizePath(url), `/*${extension}`);

        return new Promise((resolve, reject) => {
            glob(globPattern, {}, (err, files) => {
                if (err) return reject(err);
                resolve(files);
            });
        });
    }

    /**
     * Ignore index.md files from a files array.
     *
     * @param {string[]} files - The array of filenames.
     * @returns {string[]} - The filenames excluding index files.
     */
    ignoreIndex(files) {
        return files.filter(file => path.basename(file) !== "index.md");
    }

    /**
     * Paginate a list of files.
     *
     * @param {string[]} files - An array of filenames.
     * @param {CmsListingPagination} pagination - The cms pagination object.
     * @returns {string[]} - The paginated array of files.
     */
    paginate(files, pagination) {
        pagination.total = files.length;
        pagination.pages = Math.ceil(files.length / pagination.perPage);
        return files.slice(pagination.offset, pagination.offset + pagination.perPage);
    }

    /**
     * Get the cms content for a list of files.
     *
     * @param {string[]} files - An array of filenames.
     * @returns {CmsContent[]} - An array of cms content.
     */
    getListingMarkdown(files) {
        return Promise.all(files.map(Content.getFileContent))
            .then(files => Promise.all(files.map(Content.convertFileContentToMarkdown)));
    }

    /**
     * Checks if the page is valid.
     *
     * @param {string[]} files - An array of filenames.
     * @returns {string[]|Promise} - The filename or a rejected promise.
     */
    checkValidPage(files) {
        if (!files.length) {
            return new Promise((resolve, reject) => reject());
        }

        return files;
    }

    /**
     * Load listing from the request.
     *
     * @param {Object} req - The express request object.
     * @param {CmsContent} content - The cms content.
     * @returns {Promise.<CmsContent>} - The converted content.
     */
    load(req, content) {
        let pagination = this.createPaginationObject(req.query.page, content.perPage);

        return this.getFilenamesFromUrl(Utilities.getUrlPathname(req.originalUrl), Config.get("contentPath"), ".md")
            .then(this.ignoreIndex)
            .then(files => this.paginate(files, pagination))
            .then(this.checkValidPage)
            .then(this.getListingMarkdown)
            .then(files => {
                content.__pagination = pagination;
                content.__listing = files;
                return content;
            });
    }
}


module.exports = new Listing();
module.exports.class = Listing;
