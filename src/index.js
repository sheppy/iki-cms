"use strict";

const koa = require("koa");
const promisify = require("promisify-node");
const fs = promisify("fs");
const isDirectory = require("is-directory");
const path = require("path");
const fm = require("front-matter");
const MarkdownIt = require("markdown-it");
const nunjucks = require("nunjucks");
const koaLogger = require("koa-logger");
const koaRateLimit = require("koa-better-ratelimit");
const koaCompress = require("koa-compress");
const PrettyError = require("pretty-error");


const CONTENT_PATH = path.normalize(`${__dirname}/../content`);
const TEMPLATE_PATH = path.normalize(`${__dirname}/template`);
const PORT = process.env.PORT || 8080;
const IS_PRODUCTION = process.env.NODE_ENV === "production";

// Friendlier error messages
const pe = new PrettyError();
pe.skipNodeFiles();
pe.skipPackage("nunjucks");


// Create the app
const app = koa();

// Logging
app.use(koaLogger());

// Add rate limiting
app.use(koaRateLimit({
    duration: 1000, // 1 sec
    max: 10,
    blacklist: []
}));

// Add gzip compression
app.use(koaCompress({
    filter: content_type => /text/i.test(content_type),
    threshold: 860, // Minimum size to compress
    flush: require('zlib').Z_SYNC_FLUSH
}));

// Add markdown to the context
app.context.md = new MarkdownIt({
    linkify: true,
    typographer: true
});

// Setup nunjucks
nunjucks.configure(TEMPLATE_PATH, { noCache: !IS_PRODUCTION });

const nunjRender = promisify(nunjucks.render);


const loadFrontMatteredMarkdownContent = function(filename) {
    return fs.readFile(path.join(CONTENT_PATH, filename) + ".md", "utf8")
        .then(fm)
        .then(content => {
            content.body = content.body ? app.context.md.render(content.body) : "";
            return content;
        });
};


const render = function *(view = "default", data) {
    // Inject the global data
    let global = yield loadFrontMatteredMarkdownContent("global");
    data.global = global.attributes;
    return nunjRender(path.join("page", view) + ".njk", data);
};


const getContentFilenameFromUrl = function(url) {
    let filename = path.join("page", path.normalize(url));

    if (isDirectory.sync(path.join(CONTENT_PATH, filename))) {
        filename = path.join(filename, "index");
    }

    return filename;
};


const page = function *(next) {
    let content;

    try {
        content = yield loadFrontMatteredMarkdownContent(getContentFilenameFromUrl(this.request.url));
    } catch (err) {
        return yield next;
    }

    this.body = yield render(content.attributes.template, content);
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


const pageNotFound = function *(next) {
    yield next;

    if (this.status !== 404) {
        return;
    }

    // Need to explicitly set 404 so that koa doesn't assign 200 on body
    this.status = 404;
    this.body = yield render("404", { url: this.request.url });
};


app.use(serverError);
app.use(pageNotFound);
app.use(page);


// Logging
app.on("error", function(err) {
    console.error(pe.render(err));
});

// Start app
app.listen(PORT);
