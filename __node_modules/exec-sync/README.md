# exec-sync

Execute shell command synchronously. Use this for migration scripts, cli programs, but not for regular server code.

## Installation

### Installing npm (node package manager)
``` bash
$ curl http://npmjs.org/install.sh | sh
```

### Installing exec-sync
``` bash
$ cd /path/to/your/project
$ [sudo] npm install exec-sync
```

### Using exec-sync from node.js
Warning: use only for special operation or command line scripts written with node. Don't use this for regular server code or it will ruin the responsiveness of your server.

``` js
var execSync = require('exec-sync');

var user = execSync('echo $USER');
console.log(user);
```

By default, an Error is thrown if stderr is not empty. Alternatively, the function can return an object with both `stdout` and `stderr` as properties by passing `true` as a second argument (`returnOutAndErr`).


## License 

(The MIT License)

Copyright (c) 2011-2012 Jérémy Faivre &lt;contact@jeremyfa.com&gt;

Permission is hereby granted, free of charge, to any person obtaining
a copy of this software and associated documentation files (the
'Software'), to deal in the Software without restriction, including
without limitation the rights to use, copy, modify, merge, publish,
distribute, sublicense, and/or sell copies of the Software, and to
permit persons to whom the Software is furnished to do so, subject to
the following conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED 'AS IS', WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF
MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT.
IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY
CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT,
TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE
SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.