process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = config => {
  config.set({
    basePath: process.cwd(),
    singleRun: true,
    plugins: ['karma-qunit', 'karma-chrome-launcher', 'karma-tape-reporter'],
    frameworks: ['qunit'],
    browsers: ['ChromeHeadless'],
    client: { captureConsole: true },
    autoWatch: false,
    reporters: ['tape'],
    logLevel: config.LOG_DEBUG,
    files: [
      { pattern: 'tmp/*.map', watched: false, included: false },
      { pattern: 'test/samples/**/*.*', watched: false, included: false },
      // There's probably a better way to inject this
      '../../../../node_modules/qunit-assert-html/dist/qunit-assert-html.js',
      'tmp/test.js'
    ]
  })
}
