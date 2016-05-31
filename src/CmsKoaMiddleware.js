"use strict";


const CmsKoaMiddleware = function(middleware) {
    this.app.use(middleware);
};

module.exports = CmsKoaMiddleware;
