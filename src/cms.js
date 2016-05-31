"use strict";

const koa = require("koa");

const PORT = process.env.PORT || 8080;


class Cms {
    constructor() {
        this.app = koa();
        this.isProduction = process.env.NODE_ENV === "production";
    }

    render() {}

    use(fn, options) {
        fn.call(this, options);
    }

    listen(port = PORT) {
        this.app.listen(port);
    }
}

module.exports = Cms;
