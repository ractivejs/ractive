const path = require('path');
const fs = require('fs');

function stat(file) {
  try {
    return fs.statSync(file);
  } catch (e) {
    /* ok */
  }
}

function lsr(basedir) {
  const result = [];

  function processdir(dir) {
    fs.readdirSync(dir).forEach(file => {
      const filepath = path.join(dir, file);

      if (fs.statSync(filepath).isDirectory()) {
        processdir(filepath);
      } else {
        result.push(filepath.replace(basedir + path.sep, ''));
      }
    });
  }

  processdir(basedir);
  return result;
}

function mkdirp(dir) {
  dir = dir.split(path.sep);
  let cd = '';

  while (dir.length) {
    cd = path.join(cd, dir.shift());
    try {
      fs.statSync(cd);
    } catch (e) {
      fs.mkdirSync(cd);
    }
  }
}

function readToString(stream) {
  return new Promise((ok, fail) => {
    const data = [];
    stream.on('data', chunk => data.push(chunk));
    stream.on('end', () => ok(Buffer.concat(data).toString('utf8')));
    stream.on('error', fail);
  });
}

function reducePromiseFunctions(fnList, init) {
  if (!fnList || !fnList.length) return Promise.resolve(init);
  const fns = fnList.slice();
  let res = init;

  return new Promise((done, fail) => {
    function step() {
      const fn = fns.shift();
      if (!fn) done(res);
      else {
        Promise.resolve(
          Promise.resolve(fn(res)).then(r => {
            res = r;
            step();
          }, fail)
        );
      }
    }
    step();
  });
}

// find Ractive
const basePath = path.resolve(path.dirname(fs.realpathSync(__filename)));
const devFile = path.resolve(basePath, '../.build/ractive.js');
const modFile = path.resolve(basePath, '../ractive.js');
const Ractive = require(stat(modFile) ? modFile : devFile);

function writeToStream(stream, string) {
  return new Promise(ok => {
    stream.on('drain', ok);
    stream.write(string, 'utf8');
  });
}

module.exports = {
  Ractive,
  stat,
  mkdirp,
  lsr,
  readToString,
  writeToStream,
  reducePromiseFunctions
};
