"use strict";

const path = require("path");

const Config = require("../Config");
const Utilities = require("../Utilities");
const Listing = require("./Listing");


class ImageListing extends Listing.class {
    getFileBasenames(files) {
        return files.map(file => path.basename(file));
    }

    load(req, content) {
        let pagination = this.createPaginationObject(req.query.page, content.perPage);

        return this.getFilenamesFromUrl(Utilities.realUrl(req.originalUrl), Config.get("contentPath"), ".jpg")
            .then(this.ignoreIndex)
            .then(files => this.paginate(files, pagination))
            // TODO: Get names better?
            .then(this.getFileBasenames)
            .then(files => {
                content.__pagination = pagination;
                content.__listing = files;
                return content;
            });
    }
}


module.exports = new ImageListing();
module.exports.class = ImageListing;
