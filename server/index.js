"use strict";

const path = require("path");
const url = require("url");
const express = require("express");
const config = require("yaml-config");
const compression = require("compression");
const morgan = require("morgan");
const glob = require("glob");
const nunjucks = require("nunjucks");
const winston = require("winston");
const utilities = require("./utilities");
const logger = require("./logger");


class Cms {
    initialize(configPath) {
        this.settings = config.readConfig(configPath);

        this.app = express();

        this.logger = logger;
        this.app.use(morgan("combined", logger.expressLogger));
        this.app.use(compression());

        this.router = express.Router();
        this.app.use(this.router);

        nunjucks.configure(this.settings.viewPath, { noCache: !utilities.isProduction() });
    }

    configureRoutes(cb) {
        if (typeof cb === "function") {
            cb(this.router);
        }

        this.router.use("*", this.routePage());

        // TODO: Static routes
        this.router.use(this.route404());
        this.router.use(this.route500());
        this.router.use(this.route500Static());
    }

    routePage() {
        return (req, res, next) => {
            const pathname = url.parse(req.originalUrl).pathname;
            utilities.getMarkdownForUrl(this.settings.contentPath, pathname)
                .then(markdown => this._checkPageType(req, pathname, markdown))
                .then(markdown => utilities.renderMarkdown(this.settings.defaultTemplate, markdown))
                .then(html => res.send(html))
                .catch(next);
        };
    }

    _checkPageType(req, pathname, markdown) {
        if (markdown.type == "listing") {
            markdown.listing = markdown.listing || pathname;
            return this.getListingMarkdown(req, markdown);
        }

        if (markdown.type == "images") {
            markdown.listing = markdown.listing || pathname;
            return this.getListingImages(req, markdown);
        }

        return markdown;
    }

    getListingMarkdown(req, markdown) {
        let pagination = this._createPaginationObject(req.query.page, markdown.perPage);

        return utilities.getContentFilenamesFromUrl(this.settings.contentPath, markdown.listing, ".md")
            .then(this._ignoreIndex)
            .then(files => this._paginate(files, pagination))
            .then(this._getListingMarkdown)
            .then(listing => {
                markdown.__pagination = pagination;
                markdown.__listing = listing;
                return markdown;
            });
    }

    getListingImages(req, markdown) {
        let pagination = this._createPaginationObject(req.query.page, markdown.perPage);

        // TODO: Want to get these from the public path?
        return utilities.getContentFilenamesFromUrl(this.settings.contentPath, markdown.listing, ".jpg")
            .then(this._ignoreIndex)
            .then(files => this._paginate(files, pagination))
            // TODO: Get names better?
            .then(this._getFileBasenames)
            .then(listing => {
                markdown.__pagination = pagination;
                markdown.__listing = listing;
                return markdown;
            });
    }

    _ignoreIndex(files) {
        return files.filter(file => path.basename(file) !== "index.md");
    }

    _createPaginationObject(page, perPage) {
        let pagination = {
            page: parseInt(page || 1, 10),
            total: 0,
            pages: 0,
            perPage: parseInt(perPage || this.settings.defaultPerPage, 10),
            offset: 0
        };

        pagination.offset = (pagination.page - 1) * pagination.perPage;

        return pagination;
    }

    _paginate(files, pagination) {
        pagination.total = files.length;
        pagination.pages = Math.ceil(files.length / pagination.perPage);
        return files.slice(pagination.offset, pagination.offset + pagination.perPage);
    }

    _getFileBasenames(files) {
        return files.map(file => path.basename(file));
        return Promise.all(files.map(file => utilities.getContentFile(file)))
            .then(files => Promise.all(files.map(content => utilities.convertFileContentToMarkdown(content))));

    }
    _getListingMarkdown(files) {
        return Promise.all(files.map(file => utilities.getContentFile(file)))
            .then(files => Promise.all(files.map(content => utilities.convertFileContentToMarkdown(content))));

    }

    route404() {
        return (req, res, next) => {
            utilities.getMarkdownForUrl(this.settings.contentPath, "404")
                .then(markdown => utilities.renderMarkdown(this.settings.defaultTemplate, markdown, "error/404"))
                .then(html => res.status(404).send(html))
                .catch(next);
        };
    }

    route500() {
        return (err, req, res, next) => {
            this.logger.error(err.stack);

            utilities.getMarkdownForUrl(this.settings.contentPath, "500")
                .then(markdown => utilities.renderMarkdown(this.settings.defaultTemplate, markdown, "error/500"))
                .then(html => res.status(500).send(html))
                .catch(next);
        };
    }

    route500Static() {
        return (err, req, res, next) => {
            console.error(err.stack);
            res.status(500).sendFile(path.join(__dirname, "500.html"));
        };
    }

    start() {
        this.app.listen(process.env.PORT || this.settings.defaultPort)
    }
}


module.exports = Cms;
