"use strict";

const nunjucks = require("nunjucks");
const Dictionary = require("../Dictionary");
const Content = require("./Content");
const Listing = require("./Listing");
const ImageListing = require("./ImageListing");


const contentDictionary = new Dictionary({
    listing: Listing.load,
    images: ImageListing.load,
    page: (req, content) => content
}, "page");


class ContentService {
    /**
     * Render a file view.
     *
     * @param {string} filename - The markdown filename.
     * @param {string} [template] - The template to use.
     * @param {Object} [extra] - Any additional data to pass to the template.
     * @returns {Promise.<string>} - The rendered view.
     */
    static renderFile(filename, template, extra) {
        return Content.loadMarkdownFile(filename).then(content => this.renderContent(content, template, extra))
    }

    /**
     * Renders a content view.
     *
     * @param {CmsContent} content - The content to render.
     * @param {?string} [template = content.template] - The template to use.
     * @param {Object} [extra] - Any additional data to pass to the template.
     * @returns {Promise.<string>} - The rendered view.
     */
    static renderContent(content, template, extra) {
        template = template || content.template;
        if (extra) {
            Object.assign(content, extra);
        }

        return new Promise((resolve, reject) => {
            nunjucks.render(`${template}.njk`, content, (err, res) => err ? reject(err) : resolve(res));
        });
    }

    /**
     * Load content for a request and render the view.
     *
     * @param {Object} req - The express request object.
     * @param {Object} [extra] - Any additional data to pass to the template.
     * @returns {Promise.<string>} - The rendered view.
     */
    static load(req, extra) {
        return Content.load(req)
            .then(content => contentDictionary.get(content.type)(req, content))
            .then(content => ContentService.renderContent(content, null, extra));
    }
}


module.exports = ContentService;
