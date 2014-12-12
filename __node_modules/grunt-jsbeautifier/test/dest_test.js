/**
 * Created by vkadam on 12/13/13.
 */
"use strict";
var grunt = require("grunt");
var exec = require("child_process").exec;

exports["dest_test"] = {
    "Verify beautification with dest folder": function(test) {
        test.expect(1);
        exec("grunt jsbeautifier:dest", function(err, stdout, stderr) {
            var actual = grunt.file.read("dest/tmp/not-been-beautified.js"),
                expected = grunt.file.read("test/fixtures/been-beautified.js");
            test.equal(actual, expected, "should beautify js using config file");
            test.done();
        });
    }
};
