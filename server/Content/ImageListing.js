"use strict";

const path = require("path");

const Config = require("../Config");
const Utilities = require("../Utilities");
const Listing = require("./Listing");


class ImageListing extends Listing.class {
    fixImagePaths(files) {
        return files.map(file => "/" + path.posix.relative(Config.get("publicPath"), file));
    }

    load(req, content) {
        let pagination = this.createPaginationObject(req.query.page, content.perPage);

        return this.getFilenamesFromUrl(Utilities.getUrlPathname(req.originalUrl), Config.get("publicPath"), ".jpg")
            .then(this.ignoreIndex)
            .then(files => this.paginate(files, pagination))
            .then(this.checkValidPage)
            .then(this.fixImagePaths)
            .then(files => {
                content.__pagination = pagination;
                content.__listing = files;
                return content;
            });
    }
}


module.exports = new ImageListing();
module.exports.class = ImageListing;
