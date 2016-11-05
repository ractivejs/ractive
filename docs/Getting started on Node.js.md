---
title: Get started with node.js
---

Using Ractive.js with node is straightforward once [node.js is installed](http://nodejs.org/):
```
$ npm install ractive
```

### Using Ractive within a node app

Here's a simple "hello world" example that covers the basics of getting started
 with ractive and node:
```sh
$ mkdir mynodeapp
$ cd mynodeapp
$ npm install ractive
$ touch test.js
$ open test.js
```

In `test.js`:
```js
var Ractive = require('ractive');
var ractive = new Ractive({
    template: 'hello from \{{who}}'
});
ractive.set('who', 'node');
console.log(ractive.toHTML());
```

Running the file using node:
```sh
$ node test.js
hello from node
```

### Limitations of using Ractive in node

There is no two-way binding in node as there is no DOM.

Data manipulation _can_ be done in node. Use methods like
{{{createLink 'ractive.set()'}}} to modify data, and {{{createLink 'ractive.toHTML()'}}}
to output the current template state as HTML.

### Precompiling templates with node

Use {{{createLink 'ractive.parse()'}}} to precompile templates in node. Here is an
example grunt task:

```js
var Ractive = require('ractive'),
	path = require('path');

module.exports = function(grunt){

	var desc = 'Compile ractive.js templates';
	grunt.registerMultiTask('compile', desc, make);

	function make(){
		this.files.forEach(function(file){
			var templates = file.src.map(parse);
			grunt.file.write(file.dest,
				'var templates = {\n' + templates.join(',\n') + '\n}');
		});
	}

	function parse(template){
		var name = path.basename(template, '.mustache'),
			html = grunt.file.read(template),
			parsed = Ractive.parse(html);

		return  '\t' + name + ': ' + JSON.stringify(parsed);
	}

};
```

If the above file was in folder `/tasks/`, it could be used like:

```js
module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    compile: {
      ractive: {
        src: 'templates/*.mustache',
        dest: 'templates/templates.js'
      }
    }
  });

  grunt.loadTasks('./tasks');

  grunt.registerTask('default', ['compile']);

};
```

### Debugging on node

Check out [node-inspector](https://github.com/node-inspector/node-inspector)
for information on debugging node modules from the Chrome Web Inspector.
```sh
$ npm install -g node-inspector
$ node-debug test.js
```

