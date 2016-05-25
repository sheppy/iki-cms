"use strict";

const koa = require("koa");
const promisify = require("promisify-node");
const fs = promisify("fs");
const isDirectory = require("is-directory");
const path = require("path");
const fm = require("front-matter");
const MarkdownIt = require("markdown-it");


const app = koa();

app.context.md = new MarkdownIt({
    linkify: true,
    typographer: true
});

const getContentFilenameFromUrl = function(url) {
    let filename = path.join(__dirname, '..', 'content', 'page', path.normalize(url));

    if (isDirectory.sync(filename)) {
        filename = path.join(filename, "index");
    }

    return filename + ".md";
};

const getContentFromUrl = function(url) {
    return fs.readFile(getContentFilenameFromUrl(url), "utf8").then(fm);
};

app.use(function *() {
    // TODO: Merge with template
    yield getContentFromUrl(this.request.url)
        .then(content => {
            this.body = this.md.render(content.body);
        }).catch(err => {
            this.status = err.status || 500;
            this.body = err.message;
            this.app.emit("error", err, this);
        });
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
