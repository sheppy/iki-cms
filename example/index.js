"use strict";

const path = require("path");
const Cms = require("../server");

let cms = new Cms();
cms.initialize(path.join(__dirname, "config", "cms.yml"));
cms.configureRoutes();
cms.start(process.env.PORT || 3001);
