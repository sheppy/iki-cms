"use strict";

const koa = require("koa");
const promisify = require("promisify-node");
const fs = promisify("fs");
const isDirectory = require("is-directory");
const path = require("path");
const fm = require("front-matter");
const MarkdownIt = require("markdown-it");
const swig = require("swig");
const koaBunyanLogger = require("koa-bunyan-logger");


const CONTENT_PATH = path.normalize(`${__dirname}/../content/page`);
const TEMPLATE_PATH = path.normalize(`${__dirname}/template/page`);

const app = koa();
app.use(koaBunyanLogger({ name: "Iki CMS", level: "warn" }));
app.use(koaBunyanLogger.requestLogger());

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

app.use(function *(next) {
    this.log.info('Got a request from %s for %s', this.request.ip, this.path);
    yield next;
});

// Error handler
app.use(function *(next) {
    try {
        yield next;
    } catch (err) {
        // TODO: Display server error page
        this.status = err.status || 500;
        this.body = err.message;
        this.app.emit('error', err, this);
    }
});


app.use(function *() {
    let content, templateName;

    try {
        content = yield getContentFromUrl(this.request.url);
        templateName = content.attributes.template || 'default';
    } catch (err) {
        this.app.emit("error", err, this);
        this.status = 404;
        content = {};
        templateName = "404";
    }

    let template = swig.compileFile(path.join(TEMPLATE_PATH, templateName) + '.swig', {
        cache: false    // TODO: Only in development
    });

    this.body = template({
        body: content.body ? this.md.render(content.body) : '',
        attributes: content.attributes
    });

        // }).catch(err => {
        //     this.status = err.status || 404;
        //     this.body = '404' + err.status + err.message;
        //     this.app.emit("error", err, this);
        // });


    // yield getContentFromUrl(this.request.url)
    //     .then(content => {
    //
    //         try {
    //             let template = swig.compileFile(path.join(TEMPLATE_PATH, (content.attributes.template || 'default')) + '.swig', {
    //                 cache: false    // TODO: Only in development
    //             });
    //
    //             this.body = template({
    //                 body: this.md.render(content.body),
    //                 attributes: content.attributes
    //             });
    //         } catch (err) {
    //             this.status = err.status || 500;
    //             this.body = '500' + err.status + err.message;
    //             this.app.emit("error", err, this);
    //         }
    //     }).catch(err => {
    //         this.status = err.status || 404;
    //         this.body = '404' + err.status + err.message;
    //         this.app.emit("error", err, this);
    //     });
});


// TODO: Logging
// https://github.com/koajs/logger
// https://github.com/koajs/bunyan-logger
// https://github.com/Carlangueitor/winston-koa-logger
app.on('error', function(err) {
    // log.error('server error', err);
    // console.error('server error', err);
});

app.listen(8080);
