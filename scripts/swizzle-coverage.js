#!/usr/bin/env node

var sander = require('gobble').sander;
var path = require('path');

sander.writeFileSync(process.argv[2],
	sander.readFileSync(process.argv[2], { encoding: 'utf8' }).replace(
		new RegExp(path.resolve().replace(/\//g, '\\/') + '[^\\n\\r]+?\\/\\.cache\\/', 'g'), './src/'
	)
);
