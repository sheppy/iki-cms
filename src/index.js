"use strict";

const koa = require("koa");
const promisify = require("promisify-node");
const fs = promisify("fs");
const isDirectory = require("is-directory");
const path = require("path");
const fm = require("front-matter");
const MarkdownIt = require("markdown-it");
const swig = require("swig");
const koaLogger = require("koa-logger");
const koaRateLimit = require("koa-better-ratelimit");
const koaCompress = require("koa-compress");


const CONTENT_PATH = path.normalize(`${__dirname}/../content/page`);
const TEMPLATE_PATH = path.normalize(`${__dirname}/template/page`);
const SWIG_OPTIONS = {
    cache: false    // TODO: Only in development
};

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
    filter: function(content_type) {
        // filter requests to be compressed using regex
        return /text/i.test(content_type)
    },
    threshold: 860, //minimum size to compress
    flush: require('zlib').Z_SYNC_FLUSH
}));

// Add markdown to the context
app.context.md = new MarkdownIt({
    linkify: true,
    typographer: true
});
















const getContentFilenameFromUrl = function(url) {
    let filename = path.join(CONTENT_PATH, path.normalize(url));

    if (isDirectory.sync(filename)) {
        filename = path.join(filename, "index");
    }

    return filename + ".md";
};

const getContentFromUrl = function(url) {
    return fs.readFile(getContentFilenameFromUrl(url), "utf8").then(fm);
};

const page = function *(next) {
    let content, templateName;

    try {
        content = yield getContentFromUrl(this.request.url);
        templateName = content.attributes.template || 'default';
    } catch (err) {
        return yield next;
    }

    let template = swig.compileFile(path.join(TEMPLATE_PATH, templateName) + '.swig', SWIG_OPTIONS);

    this.body = template({
        body: content.body ? this.md.render(content.body) : '',
        attributes: content.attributes
    });
};





// app.use(function *(next) {
//     this.log.info('Got a request from %s for %s', this.request.ip, this.path);
//     yield next;
// });

app.use(page);

// Error handler
app.use(function *serverError(next) {
    try {
        yield next;
    } catch (err) {
        // TODO: Display server error page
        this.status = err.status || 500;

        let template = swig.compileFile(path.join(TEMPLATE_PATH, ""+this.status) + '.swig', SWIG_OPTIONS);

        this.body = template({
            message: err.message
        });
        this.app.emit('error', err, this);
    }
});

app.use(function *pageNotFound(next) {
    yield next;

    if (this.status !== 404) {
        return;
    }

    // Need to explicitly set 404 so that koa doesn't assign 200 on body
    this.status = 404;

    let template = swig.compileFile(path.join(TEMPLATE_PATH, ""+this.status) + '.swig', SWIG_OPTIONS);

    this.body = template();
});


// TODO: Logging
// https://github.com/koajs/logger
// https://github.com/koajs/bunyan-logger
// https://github.com/Carlangueitor/winston-koa-logger
app.on('error', function(err) {
    // log.error('server error', err);
    console.error('server error', err);
});

app.listen(8080);
