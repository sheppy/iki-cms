"use strict";

const path = require("path");
const url = require("url");
const express = require("express");
const compression = require("compression");
const morgan = require("morgan");
const nunjucks = require("nunjucks");
const winston = require("winston");
const bodyParser = require("body-parser");
const expressValidator = require("express-validator");

const Config = require("./Config");
const Utilities = require("./Utilities");
const ContentService = require("./Content/ContentService");
const logger = require("./logger");

const HTTP_STATUS_NOT_FOUND = 404;
const HTTP_STATUS_SERVER_ERROR = 500;

class Cms {
    /**
     * Initialise the CMS.
     *
     * @param {string} configPath - The path to the configuration.
     */
    initialize(configPath) {
        Config.load(configPath);

        this.app = express();

        this.logger = logger;
        this.app.use(morgan("combined", logger.expressLogger));
        this.app.use(compression());
        this.app.use(bodyParser.json());
        this.app.use(bodyParser.urlencoded({ extended: true }));
        this.app.use(expressValidator());
        this.app.set("trust proxy", true);

        this.router = express.Router();
        this.app.use(this.router);

        nunjucks.configure(Config.get("viewPath"), { noCache: !Utilities.isProduction() });
    }

    /**
     * Configure the CMS routes.
     *
     * @param {Function} [cb] - A callback function to add custom routes before the CMS routes.
     */
    configureRoutes(cb) {
        if (typeof cb === "function") {
            cb(this.router);
        }

        this.router.use("*", this.routePage);

        // Static routes
        this.router.use(express.static(Config.get("publicPath")));

        this.router.use(this.route404);
        this.router.use(this.route500);
        this.router.use(this.route500Static);
    }

    /**
     * Route the request to a CMS page.
     *
     * @param {Object} req - The express request object.
     * @param {Object} res - The express response object.
     * @param {Function} next - The next middleware function.
     */
    routePage(req, res, next) {
        ContentService.load(req).then(html => res.send(html)).catch(next);
    }

    /**
     * Handle a 404 route.
     *
     * @param {Object} req - The express request object.
     * @param {Object} res - The express response object.
     * @param {Function} next - The next middleware function.
     */
    route404(req, res, next) {
        ContentService.renderFile(`${Config.get("contentPath")}/404.md`, "error/404")
             .then(html => res.status(HTTP_STATUS_NOT_FOUND).send(html))
             .catch(next);
    }

    /**
     * Handle a 500 route.
     *
     * @param {Error} err - The error that occurred.
     * @param {Object} req - The express request object.
     * @param {Object} res - The express response object.
     * @param {Function} next - The next middleware function.
     */
    route500(err, req, res, next) {
        logger.error(err.stack);

        let data = {};

        if (!Utilities.isProduction()) {
            data.error = err.message;
        }

        ContentService.renderFile(`${Config.get("contentPath")}/500.md`, "error/500", data)
            .then(html => res.status(HTTP_STATUS_SERVER_ERROR).send(html))
            .catch(next);
    }

    /**
     * Last attempt to handle a 500 with a static file.
     *
     * @param {Error} err - The error that occurred.
     * @param {Object} req - The express request object.
     * @param {Object} res - The express response object.
     * @param {Function} next - The next middleware function.
     */
    route500Static(err, req, res, next) {
        console.error(err.stack);
        res.status(HTTP_STATUS_SERVER_ERROR).sendFile(path.join(__dirname, "500.html"));
    }

    start() {
        this.app.listen(process.env.PORT || Config.get("defaultPort"));
    }
}


module.exports = Cms;
module.exports.Config = Config;
module.exports.ContentService = ContentService;
module.exports.logger = logger;
