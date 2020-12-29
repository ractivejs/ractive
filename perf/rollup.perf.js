import fs from 'fs';
import path from 'path';

import buble from '@rollup/plugin-buble';
import copy from 'rollup-plugin-copy';
import serve from 'rollup-plugin-serve';

const BUILD_FOLDER = '.build';

/**
 * The perf build process is a little hacky but I hope the following documentation explains why
 *
 * 1. Clean up build folder
 *
 * 2. Create test templates
 *    Test template are created injecting some transpiled js code inside an HTML file
 *    with a special marker (<%== )
 *    1. Create a rollup configuration to build templates. These configuration include a special
 *       plugin which "compile HTML" templates with transpiled JS provided by rollup
 *    2. For each template we create a rollup entry point
 *
 * 3. Build run suite.js and copy some content that needs to make the page work
 *    - most recent build from './build
 *    - slide transition
 *    - create control folder
 *    For more information about those folders you can check README inside this folder
 *
 * 4. start server to serve pages
 */

fs.rmdirSync(BUILD_FOLDER, { recursive: true });
if (!fs.existsSync(BUILD_FOLDER)) {
  fs.mkdirSync(BUILD_FOLDER);
}

const pageTemplate = makeTemplate(fs.readFileSync('src/templates/testpage.html').toString());
const indexTemplate = makeTemplate(fs.readFileSync('src/templates/index.html').toString());

function makeTemplate(templateDefinition) {
  return function (data) {
    return templateDefinition.replace(/<%=\s*(\S+)\s*%>/g, (match, $1) => {
      return $1 in data ? data[$1] : match;
    });
  };
}

// 2.1
const compileTemplateConfig = {
  input: {},
  output: {
    dir: BUILD_FOLDER,
    entryFileName: `${BUILD_FOLDER}/[name].js`
  },
  plugins: [
    buble(),

    (function compilePerformanceTemplate() {
      return {
        name: 'compilePerformanceTemplate',
        transform(suite, modulePath) {
          const extension = path.extname(modulePath);
          const fileName = path.basename(modulePath, extension);

          const html = pageTemplate({
            name: fileName,
            srcPrefix: fileName
              .split(path.sep)
              .map(() => {
                return '..';
              })
              .join('/'),
            suite
          });

          fs.writeFileSync(`${BUILD_FOLDER}/${fileName}.html`, html);

          return '';
        }
      };
    })()
  ]
};

// 2.2
let list = '<ul>';

const tests = fs.readdirSync('./tests');
tests.forEach(filePath => {
  const extension = path.extname(filePath);
  const fileName = path.basename(filePath, extension);

  list += '<li><a href="' + fileName + '.html">' + fileName + '</a></li>';

  compileTemplateConfig.input[fileName] = `./tests/${filePath}`;
});

fs.writeFileSync(`${BUILD_FOLDER}/index.html`, indexTemplate({ list }));

export default [
  compileTemplateConfig,

  // 3
  {
    input: 'src/app/runSuite.js',
    context: 'window',
    output: {
      format: 'iife',
      file: `${BUILD_FOLDER}/runSuite.js`
    },
    plugins: [
      buble(),

      copy({
        targets: [
          { src: 'src/vendor/*', dest: `${BUILD_FOLDER}/` },
          // control build
          { src: 'control/*', dest: `${BUILD_FOLDER}/builds/control` },
          // most recent build
          { src: '../.build/*', dest: `${BUILD_FOLDER}/builds/edge` }
        ]
      }),

      // 4
      serve({
        contentBase: [BUILD_FOLDER],
        port: 4567
      })
    ]
  }
];
