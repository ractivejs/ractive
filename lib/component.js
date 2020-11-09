/* eslint-env node */
const { reducePromiseFunctions, Ractive } = require('./util');

const stringify = require('./parse').stringify;

const help = `
    component

      Read a single file component definition from STDIN or from a file via the
      -i option and compile it into an ES module to output either to STDOUT or to
      a file via the -o option. Linked stylesheets will be imported into the
      component from their external files and included alongside any style elements.
      Any script tags will be concatenated and used as the JS body of the template
      file. The remaining HTML will be turned into a template and inlined into the
      script anywhere $TEMPLATE is encountered. Any aggregated css will be injected
      into the script as a JS string (JSON.stringify-ed) anywhere $CSS is
      encountered.

      Any additional script tags encountered with type text/ractive or text/html
      and an id or name attribute will be automatically turned into partials on the
      main template. <template> tags with an id attribute will also be turned into
      partials on the main template.

      script and link tags can specify the path to a file to include directly using
      the src and href attributes, respectively. Paths to remote files should be
      relative to the source file.

      If you are only interested in the partials defined in and linked to the main
      file, you can reference $PARTIALS in your script and it will be replaced with
      an object containing a stringified partials object.

      -i,  --input {file} - file to parse, otherwise STDIN
           This may also be a directory containing a component in index.html.
      -id, --input-dir {dir} - a directory to recursively search for component files
           to transform
      -e,  --extension {ext} - the extension to look for when searching for files in an
           inputdir - defaults to .ractive.html
      -o,  --output {file} - file to write, otherwise STDOUT
           for inputdir, this should be an output directory
      -oe, --output-extension {ext} - the extension to use for output files when an
           inputdir is specified - defaults to .js
      -x,  --nocsp - don't output expression functions
      -d,  --delimiters {open} {close} - set the plain mustache delimiters (default {{ }})
      -s,  --static {open} {close} - set the static mustache delimiters (default [[ ]])
      -r,  --triple {open} {close} - set the triple mustache delimiters (default {{{ }}})
			-p,  --static-triple {open} {close} - set the static triple delimiters (default [[[ ]]])
      -u,  --escape-unicode - export non-ASCII characters in strings as UTF escapes
      -ae, --auto-export - automatically generate a script tag with exports if no script
           is found in the component file
`;

function build(string, opts, readFile) {
  const rootOpts = Object.create(opts);
  rootOpts.interpolate = Object.assign({}, opts.interpolate, {
    script: false,
    style: false,
    template: false
  });
  return readTemplate(string, rootOpts, mkReadFile(readFile, ''), true).then(res => {
    return Promise.all([
      compileCss(res.style, opts),
      reducePromiseFunctions(opts.partialProcessors, res.partials),
      reducePromiseFunctions(opts.templateProcessors, res.template),
      reducePromiseFunctions(opts.scriptProcessors, res.script)
    ]).then(list => {
      const tpl = list[2];
      const partials = list[1];
      const style = list[0];

      for (const k in tpl.p || {}) {
        if (!partials[k]) partials[k] = tpl.p[k];
      }
      tpl.p = partials;

      let script = list[3];
      script = dedent(script.join(''));

      if (!script && opts.autoExport)
        script = `${tpl ? `export const template = $TEMPLATE;\n` : ''}${
          style.length ? `export const css = $CSS;\n` : ''
        }`;

      script = script.replace(/\$TEMPLATE/g, stringify(tpl, opts));
      script = script.replace(
        /\$TEMPLATE_ONLY/g,
        stringify({ v: tpl.v, e: tpl.e, t: tpl.t }, opts)
      );
      script = script.replace(/\$CSS/g, style);
      script = script.replace(/\$PARTIALS\['([-a-zA-Z0-9_\/]+)'\]/g, (_m, n) =>
        stringify({ v: tpl.v, t: partials[n] || '' }, opts)
      );
      script = script.replace(/\$PARTIALS/g, stringify(partials || {}, opts));

      return script;
    });
  });
}

function readPartial(id, str, opts, readFile, style, partials, exprs) {
  return readTemplate(str, opts, readFile, false).then(res => {
    style.push.apply(style, res.style);
    if (!partials[id]) partials[id] = res.template.t;
    for (const k in res.partials) {
      if (res.partials[k] && !partials[k]) partials[k] = res.partials[k];
    }
    for (const k in res.exprs || {}) {
      exprs[k] = res.exprs[k];
    }
  });
}

function readTemplate(string, opts, readFile, allowScript) {
  const tpl = Ractive.parse(string || '', opts);
  const partials = {};
  const script = [];
  const style = [];
  const exprs = tpl.e || {};

  const promises = [];

  // walk the template finding any script, style, template, or link tags to process them as appropriate
  let i = tpl.t.length;
  while (i--) {
    const item = tpl.t[i];
    // top-level elements
    if (item.t === 7) {
      if (item.e === 'script') {
        const type = getAttr('type', item);
        const id = getAttr('id', item) || getAttr('name', item);
        const src = getAttr('src', item);

        if (id && (type === 'text/ractive' || type === 'text/html')) {
          if (!src) {
            promises.push(readPartial(id, item.f[0], opts, readFile, style, partials, exprs));
          } else {
            promises.push(
              readFile(src).then(str =>
                readPartial(id, str, opts, readFile.extend(src), style, partials, exprs)
              )
            );
          }
        } else if (!type || type === 'text/javascript' || type === 'application/javascript') {
          const rel = getAttr('rel', item);
          let cssFn;

          if (rel === 'css') {
            const name = getAttr('data-name', item) || 'data';
            cssFn = { name, type: 'fn' };
            style.unshift(cssFn);
          }

          if (!src) {
            if (cssFn) {
              cssFn.body = item.f.join('');
            } else {
              if (!allowScript) {
                i = drop(i, tpl.t);
                // TODO: warn
                continue;
              }
              script.unshift(item.f);
            }
          } else {
            if (cssFn) {
              promises.push(readFile(src).then(str => (cssFn.body = str)));
            } else {
              if (!allowScript) {
                i = drop(i, tpl.t);
                // TODO: warn
                continue;
              }
              script.unshift(`script!${src}`);
              promises.push(
                readFile(src).then(str => script.splice(script.indexOf(`script!${src}`), 1, str))
              );
            }
          }
        }

        i = drop(i, tpl.t);
      } else if (item.e === 'template') {
        const id = getAttr('id', item) || getAttr('name', item);
        if (id) {
          const src = getAttr('src', item);
          if (src) {
            promises.push(
              readFile(src).then(str =>
                readPartial(id, str, opts, readFile.extend(src), style, partials, exprs)
              )
            );
          } else {
            promises.push(
              readPartial(id, item.f ? item.f[0] : '', opts, readFile, style, partials, exprs)
            );
          }
        }

        i = drop(i, tpl.t);
      } else if (item.e === 'style') {
        const rel = getAttr('rel', item);

        if (rel === 'ractive') {
          style.unshift({ type: 'tpl', body: item.f[0] });
        } else {
          style.unshift({ type: 'css', body: item.f[0] || '' });
        }

        i = drop(i, tpl.t);
      } else if (item.e === 'link') {
        const href = getAttr('href', item);
        const type = getAttr('type', item);
        const rel = getAttr('rel', item);

        if (
          href &&
          (type === 'component' ||
            ((!type || type === 'text/css' || type === 'text/css+ractive') &&
              (rel === 'ractive' || rel === 'component')))
        ) {
          const css = { type: type === 'text/css+ractive' ? 'tpl' : 'css' };
          style.unshift(css);
          promises.push(readFile(href).then(str => (css.body = str)));
          // only links that are consumed are removed
          i = drop(i, tpl.t);
        }
      }
    }
  }

  return Promise.all(promises).then(() => {
    for (const k in tpl.p || {}) {
      partials[k] = tpl.p[k];
    }
    return { style, script, template: tpl, partials, exprs };
  });
}

function dedent(string) {
  const lines = (string || '').split(/\r\n|\r|\n/);
  let strip = /^\s*/.exec(lines[lines.length - 1]);
  if (!strip) return string;
  strip = strip[0];
  return lines.map(l => l.replace(strip, '')).join('\n');
}

const blank = /^\s*$/;
function drop(i, tpl) {
  tpl.splice(i, 1);
  while (blank.test(tpl[i])) tpl.splice(i, 1);
  let restart = i--;
  while (blank.test(tpl[i])) {
    tpl.splice(i, 1);
    restart--;
  }
  return restart;
}

function getAttr(name, node) {
  if (node.m) {
    let i = node.m.length;
    while (i--) {
      const a = node.m[i];
      // plain attribute with a matching name
      if (a.t === 13 && a.n === name && typeof a.f === 'string') return a.f;
    }
  }
}

function compileCss(styles, opts) {
  if (!styles.length || !styles.join('')) return Promise.resolve('""');

  const promises = [];

  styles.forEach(style => {
    if (style.type === 'tpl') {
      const styleOpts = Object.create(opts);
      styleOpts.textOnlyMode = true;
      style.compiled = `(function () { return this.Ractive({ template: ${stringify(
        Ractive.parse(style.body, styleOpts),
        opts
      )}, data: this.cssData }).fragment.toString(false); }).call(this)`;
    } else if (style.type === 'fn') {
      let indent = /^\s/.exec(style.body);
      if (indent) indent = indent[0];
      else indent = '  ';
      style.compiled = `(function(${style.name || 'data'}) {\n${style.body
        .split(/\r\n|\r|\n/)
        .map(l => indent + l)
        .join('\n')}\n}).call(this, data)`;
    } else {
      promises.push(
        reducePromiseFunctions(opts.styleProcessors, style.body).then(
          css => (style.compiled = css.replace(/\s+/g, ' '))
        )
      );
    }
  });

  return Promise.all(promises).then(() => {
    const fn = styles.find(style => style.type === 'tpl' || style.type === 'fn');

    if (!fn) return JSON.stringify(styles.map(style => style.compiled).join(' '));

    return `function(data) { return [${styles
      .map(style => (style.type === 'css' ? JSON.stringify(style.compiled) : style.compiled))
      .join(', ')}].join(' '); }`;
  });
}

function dirname(str) {
  const parts = str.split('/');
  parts.pop();
  return parts.join('/');
}

function mkReadFile(read, path) {
  if (typeof path === 'string') path = dirname(path);
  const p = Array.isArray(path) ? path : [path];
  const res = function readFile(file) {
    if (file[0] === '/') return read(file);
    else {
      return read(p.concat(file));
    }
  };
  res.extend = function(path) {
    if (path[0] === '/') return mkReadFile(read, dirname(path));
    else return mkReadFile(read, p.concat(dirname(path)));
  };
  return res;
}

module.exports = { help, build };
