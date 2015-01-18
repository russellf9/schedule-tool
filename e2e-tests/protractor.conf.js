exports.config = {
    allScriptsTimeout: 11000,

    specs: [
        './*.js'
    ],

    capabilities: {
        browserName: 'chrome'
    },

    baseUrl: 'http://localhost:8000/app/',

    framework: 'jasmine',


    chromeDriver: '/usr/local/lib/node_modules/protractor/selenium/chromedriver',

    seleniumServerJar: '/usr/local/lib/node_modules/protractor/selenium/selenium-server-standalone-2.44.0.jar',

    //
    // /Users/russell.wenban/sites/schedule-tool/e2e-tests/.node_modules/selenium-server-standalone-jar

    // The file path to the selenium server jar ()
    //
    //node_modules/selenium-server-standalone-jar

    jasmineNodeOpts: {
        defaultTimeoutInterval: 30000
    }
};
