"use strict";

const path = require("path");
const isDirectory = require("is-directory");
const promisify = require("promisify-node");
const fs = promisify("fs");
const nunjucks = require("nunjucks");
const MarkdownIt = require("markdown-it");
const fm = require("front-matter");
const cmsErrorHandler = require("./cmsErrorHandler");

const IS_PRODUCTION = process.env.NODE_ENV === "production";



const loadFile = function(filePath, filename, extension) {
    return fs.readFile(path.join(filePath, filename) + extension, "utf8");
};


const loadMarkdown = function(filePath, filename) {
    return loadFile(filePath, filename, ".md");
};


const loadMarkdownFrontMatter = function(filePath, filename) {
    return loadMarkdown(filePath, filename).then(fm);
};


const getFilenameOrIndex = function(filePath, filename) {
    if (isDirectory.sync(path.join(filePath, filename))) {
        return path.join(filename, "index");
    }

    return filename;
};


const cms = function(app, options) {
    // Add error handler
    cmsErrorHandler(app);

    // Add nunjucks rendering
    nunjucks.configure(options.views, { noCache: !IS_PRODUCTION });
    const renderNunjucks = promisify(nunjucks.render);

    // Create markdown renderer
    const markdown = new MarkdownIt({
        linkify: true,
        typographer: true
    });


    const render = function *(view = "default", data) {
        // Inject the global data
        let global = yield loadMarkdownFrontMatter(options.content, "global");
        data.global = global.attributes;
        return renderNunjucks(path.join("page", view) + ".njk", data);
    };


    const page = function *(next) {
        let content;

        try {
            let filename = getFilenameOrIndex(options.content, path.join("page", path.normalize(this.request.url)));
            content = yield loadMarkdownFrontMatter(options.content, filename);
            content.body = content.body ? markdown.render(content.body) : "";
        } catch (err) {
            console.error(err);
            return yield next;
        }

        this.body = yield render(content.attributes.template, content);
    };

    const pageNotFound = function *(next) {
        yield next;

        if (this.status !== 404) {
            return;
        }

        // Need to explicitly set 404 so that koa doesn't assign 200 on body
        this.status = 404;
        this.body = yield render("404", { url: this.request.url });
    };

    const serverError = function *(next) {
        try {
            yield next;
        } catch (err) {
            this.status = err.status || 500;
            this.body = yield render("500", !IS_PRODUCTION ? { err } : {});
            this.app.emit("error", err, this);
        }
    };

    app.use(serverError);
    app.use(pageNotFound);
    app.use(page);

    // Start the application
    app.listen(process.env.PORT || 8080);
};


module.exports = cms;
