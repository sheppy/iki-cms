const winston = require("winston");

const logger = new winston.Logger({
    transports: [
        new winston.transports.Console({
            level: "info",
            handleExceptions: true,
            humanReadableUnhandledException: true,
            json: false,
            colorize: true
        })
    ],
    exitOnError: false
});


module.exports = logger;
module.exports.expressLogger = {
    stream: {
        write: function(message, encoding) {
            logger.info(message.replace(/\n$/, ""));
        }
    }
};
