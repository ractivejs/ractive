process.env.CHROME_BIN = require('puppeteer').executablePath()

module.exports = config => {
  config.set({
    basePath: process.cwd(),
    singleRun: true,
    plugins: ['karma-qunit', 'karma-coverage', 'karma-chrome-launcher', 'karma-tape-reporter'],
    frameworks: ['qunit'],
    browsers: ['ChromeHeadlessNoSandbox'],
    client: { captureConsole: false },
    autoWatch: false,
    reporters: ['tape', 'coverage'],
    logLevel: config.LOG_DISABLED,
    files: [
      { pattern: 'tmp/*.map', watched: false, included: false },
      { pattern: 'test/samples/**/*.*', watched: false, included: false },
      // There's probably a better way to inject this
      '../../../../node_modules/qunit-assert-html/dist/qunit-assert-html.js',
      'tmp/test.js'
    ],
    customLaunchers: {
      ChromeHeadlessNoSandbox: {
        base: 'ChromeHeadless',
        flags: ['--no-sandbox']
      }
    },
    coverageReporter: {
      dir: './coverage/',
      subdir: 'chrome',
      reporters: [
        { type: 'html' },
        { type: 'json' }
      ]
    }
  })
}
