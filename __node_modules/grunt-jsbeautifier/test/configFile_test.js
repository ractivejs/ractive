"use strict";
var grunt = require("grunt"),
    exec = require("child_process").exec;

(function() {

    function beautifyAndassert(test, task, actualFile, expectedFile) {
        exec("grunt " + task, function() {
            var actual = grunt.file.read("tmp/configFile/" + actualFile),
                expected = grunt.file.read("tmp/configFile/" + expectedFile);
            test.equal(actual, expected, "should beautify js " + actualFile + " using config file");
            test.done();
        });
    }

    exports["configFile_test"] = {
        "beautification of js file using settings from config file": function(test) {
            test.expect(1);
            beautifyAndassert(test, "jsbeautifier:configFile", "test.js", "expected/test_expected.js");
        },
        "beautification of css file using settings from config file": function(test) {
            test.expect(1);
            beautifyAndassert(test, "jsbeautifier:configFile", "test.css", "expected/test_expected.css");
        },
        "beautification of html file using settings from config file": function(test) {
            test.expect(1);
            beautifyAndassert(test, "jsbeautifier:configFile", "test.html", "expected/test_expected.html");
        }
    };
    exports["configFile_flat_test"] = {
        "beautification of js file using settings from flat config file": function(test) {
            test.expect(1);
            beautifyAndassert(test, "jsbeautifier:configFileFlat", "test.js", "expected/test_expected.js");
        },
        "beautification of css file using settings from flat config file": function(test) {
            test.expect(1);
            beautifyAndassert(test, "jsbeautifier:configFileFlat", "test.css", "expected/test_expected.css");
        },
        "beautification of html file using settings from flat config file": function(test) {
            test.expect(1);
            beautifyAndassert(test, "jsbeautifier:configFileFlat", "test.html", "expected/test_expected.html");
        }
    };
    exports["configFile_with_gruntfile_options_test"] = {
        "beautification of js file using settings from config file and gruntfile": function(test) {
            test.expect(1);
            beautifyAndassert(test, "jsbeautifier:configFileWithGruntFileOptions", "test.js", "expected/withGruntFileOptions/test_expected.js");
        },
        "beautification of css file using settings from config file and gruntfile": function(test) {
            test.expect(1);
            beautifyAndassert(test, "jsbeautifier:configFileWithGruntFileOptions", "test.css", "expected/withGruntFileOptions/test_expected.css");
        },
        "beautification of html file using settings from config file and gruntfile": function(test) {
            test.expect(1);
            beautifyAndassert(test, "jsbeautifier:configFileWithGruntFileOptions", "test.html", "expected/withGruntFileOptions/test_expected.html");
        }
    };
})();
