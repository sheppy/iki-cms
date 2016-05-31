"use strict";

const path = require("path");
const koaLogger = require("koa-logger");
const koaRateLimit = require("koa-better-ratelimit");
const koaCompress = require("koa-compress");
const Cms = require("../src/Cms");
const CmsErrorHandler = require("../src/CmsErrorHandler");
const CmsKoaMiddleware = require("../src/CmsKoaMiddleware");
const CmsViewEngine = require("../src/CmsViewEngine");


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
    views: path.normalize(`${__dirname}/template`)
});
