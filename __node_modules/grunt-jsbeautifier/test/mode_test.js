"use strict";
var grunt = require("grunt");
var exec = require("child_process").exec;

exports["mode_test"] = {
    "Verify beautification with unbeautified file": function(test) {
        test.expect(3);
        exec("grunt jsbeautifier:hasNotBeenBeautified", {
                cwd: __dirname + "/../"
            },
            function(err, stdout, stderr) {
                test.notEqual(err, null, "Grunt fails because file has not been beautified");
                test.ok(stdout.indexOf("are not beautified") > -1, "Error message is logged");
                test.ok(stdout.indexOf("tmp/verifyMode/not-been-beautified.js") > -1, "Error message with filename is logged");
                test.done();
            });
    },

    "Verify beautification with multiple unbeautified file": function(test) {
        test.expect(4);
        exec("grunt jsbeautifier:hasNotBeenBeautified", {
                cwd: __dirname + "/../"
            },
            function(err, stdout, stderr) {
                test.notEqual(err, null, "Grunt fails because file has not been beautified");
                test.ok(stdout.indexOf("are not beautified") > -1, "Error message is logged");
                test.ok(stdout.indexOf("tmp/verifyMode/not-been-beautified.js") > -1, "Error message with js filename is logged");
                test.ok(stdout.indexOf("tmp/verifyMode/not-been-beautified.css") > -1, "Error message with css filename is logged");
                test.done();
            });
    },

    "Verify beautification with beautified file": function(test) {
        test.expect(1);
        exec("grunt jsbeautifier:hasBeenBeautified", {
                cwd: __dirname + "/../"
            },
            function(err, stdout, stderr) {
                test.equal(err, null, "Grunt passes because file has been beautified");
                test.done();
            });
    }
};
