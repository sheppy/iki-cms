"use strict";

const nunjucks = require("nunjucks");

const Content = require("./Content");
const Listing = require("./Listing");
const ImageListing = require("./ImageListing");


class ContentService {
    static renderFile(file, template, extra) {
        return Content.loadMarkdownFile(file)
            .then(content => {
                if (extra) { Object.assign(content, extra); }
                return content;
            })
            .then(content => this.renderContent(content, template))
    }

    static renderContent(content, template) {
        template = template || content.template;

        return new Promise((resolve, reject) => {
            nunjucks.render(`${template}.njk`, content, (err, res) => {
                if (err) return reject(err);
                resolve(res);
            });
        });
    }

    static load(req) {
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
            .then(ContentService.renderContent);
    }
}


module.exports = ContentService;
