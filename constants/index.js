var config = require('config');

function define(name, value) {
    Object.defineProperty(exports, name, {
        value:      value,
        enumerable: true
    });
}

define("api", config.get("api"));

// App Secret can be retrieved from the App Dashboard
define("appSecret", config.get('appSecret'));
// Arbitrary value used to validate a webhook
define("validationToken", config.get('validationToken'));
// Generate a page access token for your page from the App Dashboard
define("pageAccessToken", config.get('pageAccessToken'));


/*
 * Be sure to setup your config values before running this code. You can 
 * set them using environment variables or modifying the config file in /config.
 *
 */
if (!(this.api && this.appSecret && this.validationToken && this.pageAccessToken)) {
    console.error("Missing config values");
    console.log('===System required configuration===');
    console.log('===appSecret：%s===', this.appSecret);
    console.log('===validationToken：%s===', this.validationToken);
    console.log('===pageAccessToken：%s===', this.pageAccessToken);  
    process.exit(1);
}