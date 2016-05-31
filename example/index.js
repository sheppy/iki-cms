"use strict";

const path = require("path");
const koa = require("koa");
const koaLogger = require("koa-logger");
const koaRateLimit = require("koa-better-ratelimit");
const koaCompress = require("koa-compress");
const cms = require("../src");


// Create the app
const app = koa();

// Custom app setup
// Add logger
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


// Create the cms
cms(app, {
    views: path.normalize(`${__dirname}/template`),
    content: path.normalize(`${__dirname}/content`)
});
