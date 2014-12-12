"use strict";
var fs = require("fs");
var path = require("path");

var testsDir = path.resolve(__dirname, "../lib/tests");
var testDirFiles = fs.readdirSync(testsDir);

var outFile = fs.createWriteStream(path.resolve(__dirname, "../lib/testFiles.js"), { encoding: "utf-8" });

testDirFiles.forEach(function (file) {
    if (path.extname(file) !== ".js") {
        return;
    }

    outFile.write("require(\"./");
    outFile.write("tests/" + path.basename(file, ".js"));
    outFile.write("\");\n");
});

outFile.end(function (err) {
    if (err) {
        throw err;
    }
});
