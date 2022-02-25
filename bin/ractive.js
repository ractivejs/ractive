#!/usr/bin/env node
/* eslint-env node */
/* eslint-disable no-console */

const path = require('path');
const fs = require('fs');

const util = require('../lib/util');
const parse = require('../lib/parse');
const component = require('../lib/component');

const args = process.argv.slice();

if (~args[0].indexOf('node')) args.shift();
args.shift(); // program
const cmd = args.shift();

const opts = {
  output: process.stdout,
  base: process.cwd()
};

function mkReadFile(file) {
  const base = path.isAbsolute(file)
    ? path.dirname(file)
    : path.join(opts.base, path.dirname(file));
  return function readFile(names) {
    if (Array.isArray(names)) names = path.join.apply(path, names);
    return Promise.resolve(
      fs.readFileSync(path.isAbsolute(names) ? names : path.join(base, names), { encoding: 'utf8' })
    );
  };
}

function dirIndexOrFile(name) {
  const stats = util.stat(name);
  if (stats && stats.isDirectory()) {
    opts.base = name;
    if (util.stat(path.resolve(name, './index.ractive'))) {
      opts.input = fs.createReadStream(path.resolve(name, './index.ractive'));
    } else {
      opts.input = fs.createReadStream(path.resolve(name, './index.html'));
    }
  } else {
    opts.base = path.dirname(name);
    opts.input = fs.createReadStream(name);
  }
}

const commands = {
  parse: {
    run(opts) {
      util.readToString(opts.input).then(
        string => {
          return parse.parse(string, opts).then(string => util.writeToStream(opts.output, string));
        },
        err => {
          console.error(err.message);
          process.exit(1);
        }
      );
    },
    help: parse.help,
    args(list, opts) {
      for (let i = 0; i < args.length; i++) {
        if (args[i] === '-t' || args[i] === '--text-only') {
          opts.textOnlyMode = true;
          args.splice(i--, 1);
        }
      }
    }
  },
  component: {
    run(opts) {
      if (opts.directory) {
        const ext = new RegExp((opts.extension || '.ractive.html').replace('.', '\\.') + '$', 'i');
        const files = util.lsr(opts.directory).filter(f => ext.test(f));

        /* eslint-disable-next-line no-inner-declarations */
        function step() {
          const f = files.pop();
          if (f) {
            console.error('Ractive: compiling component ' + path.join(opts.directory, f));
            util
              .readToString(fs.createReadStream(path.join(opts.directory, f)))
              .then(string => {
                return component
                  .build(string, opts, mkReadFile(path.join(opts.directory, f)))
                  .then(string => {
                    const file = path.join(
                      opts.output,
                      f.replace(ext, opts.outputExtension || '.js')
                    );
                    util.mkdirp(path.dirname(file));
                    util.writeToStream(fs.createWriteStream(file), string);
                  });
              })
              .then(step, err => {
                console.error(err && typeof err === 'object' ? err.stack : err);
                process.exit(1);
              });
          }
        }

        step();
      } else {
        util
          .readToString(opts.input)
          .then(string => {
            return component
              .build(string, opts, mkReadFile(''))
              .then(string => util.writeToStream(opts.output, string));
          })
          .then(null, err => {
            console.error(err && typeof err === 'object' ? err.stack : err);
            process.exit(1);
          });
      }
    },
    help: component.help
  }
};

const config = {
  addCommand(name, obj) {
    if (!obj.help) console.warn(`Ractive: Command ${name} does not provide any help.`);
    commands[name] = obj;
  },
  addStyleProcessor(fn) {
    const list = opts.styleProcessors || (opts.styleProcessors = []);
    list.push(fn);
  },
  addTemplateProcessor(fn) {
    const list = opts.templateProcessors || (opts.templateProcessors = []);
    list.push(fn);
  },
  addPartialProcessor(fn) {
    const list = opts.partialProcessors || (opts.partialProcessors = []);
    list.push(fn);
  },
  addScriptProcessor(fn) {
    const list = opts.scriptProcessors || (opts.scriptProcessors = []);
    list.push(fn);
  },
  Ractive: util.Ractive,
  util,
  parse,
  component
};

function loadConfig() {
  let dir = process.cwd();
  let prev;
  while (dir !== prev) {
    const file = path.join(dir, '.ractive.config.js');
    if (util.stat(file)) {
      try {
        const fn = require(file);
        fn.call(config, config, util.Ractive);
      } catch (e) {
        console.error(`Ractive: Error while trying to read Ractive config file at ${dir}:`);
        console.error(e);
        process.exit(2);
      }

      break;
    } else {
      prev = dir;
      dir = path.join(dir, '..');
    }
  }
}
// try to find a config file
loadConfig();

if (cmd === 'help') {
  console.error(`Usage: ractive [command] [options] [file]

  Available commands: ${Object.keys(commands)
    .sort()
    .join(', ')}
  ${Object.keys(commands)
    .filter(c => commands[c].help)
    .map(c => commands[c].help)
    .join('')}`);

  process.exit(1);
}

if (args[0] === 'help' || !cmd || !commands[cmd]) {
  console.error(`Usage: ractive [command] [options] [file]

  Available commands: ${Object.keys(commands)
    .sort()
    .join(', ')}`);

  if (!cmd)
    console.error(`\n  Find out more about a particular command with ractive [command] help`);

  if (cmd && !commands[cmd]) console.error(`\n  Unknown command: ${cmd}`);

  if (commands[cmd] && commands[cmd].help) console.error(commands[cmd].help);

  process.exit(1);
}

// let the command process the args if it wants to
if (typeof commands[cmd].preArgs === 'function') commands[cmd].preArgs(args, opts);

// process out common args
for (let i = 0; i < args.length; i++) {
  const arg = args[i];

  switch (arg) {
    case '-i':
    case '--input':
      dirIndexOrFile(args[i + 1]);
      args.splice(i--, 2);
      i--;
      break;

    case '-o':
    case '--output':
      opts.output = args[i + 1];
      args.splice(i--, 2);
      break;

    case '-x':
    case '--nocsp':
      opts.csp = false;
      args.splice(i--, 1);
      break;

    case '-d':
    case '--delimiters':
      opts.delimiters = [args[i + 1], args[i + 1]];
      args.splice(i--, 3);
      break;

    case '-s':
    case '--static':
      opts.staticDelimiters = [args[i + 1], args[i + 1]];
      args.splice(i--, 3);
      break;

    case '-r':
    case '--triple':
      opts.tripleDelimiters = [args[i + 1], args[i + 1]];
      args.splice(i--, 3);
      break;

    case '-p':
    case '--static-triple':
      opts.staticTripleDelimiters = [args[i + 1], args[i + 1]];
      args.splice(i--, 3);
      break;

    case '-u':
    case '--escape-unicode':
      opts.escapeUnicode = true;
      args.splice(i--, 1);
      break;

    case '-id':
    case '--input-dir':
      opts.directory = args[i + 1];
      args.splice(i--, 2);
      break;

    case '-e':
    case '--extension':
      opts.extension = args[i + 1];
      args.splice(i--, 2);
      break;

    case '-oe':
    case '-output-extension':
      opts.outputExtension = args[i + 1];
      args.splice(i--, 2);
      break;

    case '-ae':
    case '--auto-export':
      opts.autoExport = true;
      args.splice(i--, 1);
      break;
  }
}

if (typeof commands[cmd].args === 'function') commands[cmd].args(args, opts);

if (args.length === 1 && util.stat(args[0])) {
  // last arg may be the input file
  opts.input = fs.createReadStream(args[0]);
} else if (args.length) {
  console.error(`Ractive: Unknown arguments: ${args.join(' ')}`);
}

if (!opts.directory && !opts.input) {
  try {
    opts.input = process.stdin;
  } catch (e) {
    console.error(`Ractive: No input was provided.`);
    process.exit(2);
  }
}

if (!opts.directory && typeof opts.output === 'string') {
  util.mkdirp(path.dirname(opts.output));
  opts.output = fs.createWriteStream(opts.output);
} else if (opts.directory && typeof opts.output !== 'string') {
  console.error(`Ractive: Directory transforms require an output directory`);
  process.exit(2);
}

commands[cmd].run(opts);
