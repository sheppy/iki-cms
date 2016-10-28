"use strict";

const nunjucks = require("nunjucks");

const Content = require("./Content");
const Listing = require("./Listing");
const ImageListing = require("./ImageListing");


class ContentService {
    static renderFile(file, template, extra) {
        return Content.loadMarkdownFile(file).then(content => this.renderContent(content, template, extra))
    }

    static renderContent(content, template, extra) {
        template = template || content.template;
        if (extra) {
            Object.assign(content, extra);
        }

        return new Promise((resolve, reject) => {
            nunjucks.render(`${template}.njk`, content, (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }

    static load(req, extra) {
        return Content.load(req)
            .then(content => {
                // Check what type of page it is
                switch (content.type) {
                    case "listing": return Listing.load(req, content);
                    case "images": return ImageListing.load(req, content);

                    case "page":
                    default:
                        return content;
                }
            })
            .then(content => {
                return ContentService.renderContent(content, null, extra);
            });
    }
}


module.exports = ContentService;
