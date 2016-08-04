"use strict";

const path = require("path");
const Cms = require("../server");

let cms = new Cms();
cms.initialize(path.join(__dirname, "config", "cms.yml"));

// Setup routes
cms.configureRoutes(router => {
    // router.get("/blog", cms.routePages());
});

cms.start(process.env.PORT || 3001);
