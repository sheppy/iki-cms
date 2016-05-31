"use strict";

const path = require("path");

const koaLogger = require("koa-logger");
const koaRateLimit = require("koa-better-ratelimit");
const koaCompress = require("koa-compress");

const Cms = require("./cms");
const CmsErrorHandler = require("./CmsErrorHandler");
const CmsKoaMiddleware = require("./CmsKoaMiddleware");
const CmsViewEngine = require("./CmsViewEngine");
const CmsContent = require("./CmsContent");



// Create the CMS
const cms = new Cms();

cms.use(CmsErrorHandler);

cms.use(CmsKoaMiddleware, koaLogger());

// Add rate limiting
cms.use(CmsKoaMiddleware, koaRateLimit({
    duration: 1000, // 1 sec
    max: 10,
    blacklist: []
}));

// Add gzip compression
cms.use(CmsKoaMiddleware, koaCompress({
    filter: content_type => /text/i.test(content_type),
    threshold: 860, // Minimum size to compress
    flush: require('zlib').Z_SYNC_FLUSH
}));

cms.use(CmsViewEngine, {
    path: path.normalize(`${__dirname}/template`)
});

cms.use(CmsContent, {
    path: path.normalize(`${__dirname}/../content`)
});



/*
const serverError = function *(next) {
    try {
        yield next;
    } catch (err) {
        this.status = err.status || 500;
        this.body = yield render("500", !cms.isProduction ? { err } : {});
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


cms.app.use(serverError);
cms.app.use(pageNotFound);
cms.app.use(page);
*/

cms.listen();
