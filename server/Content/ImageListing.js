"use strict";

const path = require("path");
const Config = require("../Config");
const Utilities = require("../Utilities");
const Listing = require("./Listing");


class ImageListing extends Listing.class {
    /**
     * Fix the image file paths.
     *
     * @param {string[]} files - The image filenames to fix.
     * @returns {string[]} - The fixed filenames.
     */
    fixImagePaths(files) {
        return files.map(file => "/" + path.posix.relative(Config.get("publicPath"), file));
    }

    /**
     * Load image listing from the request.
     *
     * @param {Object} req - The express request object.
     * @param {CmsContent} content - The cms content.
     * @returns {Promise.<CmsContent>} - The converted content.
     */
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
