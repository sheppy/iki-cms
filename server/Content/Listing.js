"use strict";

const path = require("path");
const url = require("url");
const glob = require("glob");

const Config = require("./../Config");
const Utilities = require("./../Utilities");
const Content = require("./Content");


class Listing {
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


    getFilenamesFromUrl(url, root, extension) {
        let globPattern = path.join(root, Utilities.sanitizePath(url), `/*${extension}`);

        return new Promise((resolve, reject) => {
            glob(globPattern, {}, (err, files) => {
                if (err) return reject(err);
                resolve(files);
            });
        });
    }


    ignoreIndex(files) {
        return files.filter(file => path.basename(file) !== "index.md");
    }


    paginate(files, pagination) {
        pagination.total = files.length;
        pagination.pages = Math.ceil(files.length / pagination.perPage);
        return files.slice(pagination.offset, pagination.offset + pagination.perPage);
    }


    getListingMarkdown(files) {
        return Promise.all(files.map(Content.getFileContent))
            .then(files => Promise.all(files.map(Content.convertFileContentToMarkdown)));
    }


    checkValidPage(files) {
        if (!files.length) {
            return new Promise((resolve, reject) => reject());
        }

        return files;
    }


    load(req, content) {
        let pagination = this.createPaginationObject(req.query.page, content.perPage);

        return this.getFilenamesFromUrl(Utilities.realUrl(req.originalUrl), Config.get("contentPath"), ".md")
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
