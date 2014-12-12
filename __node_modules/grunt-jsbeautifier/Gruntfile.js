module.exports = function(grunt) {
    "use strict";
    // Project configuration.
    grunt.initConfig({
        jsbeautifier: {
            default: {
                src: ["<%= jshint.files %>", "!test/fixtures/**"]
            },
            hasNotBeenBeautified: {
                src: ["tmp/verifyMode/not-been-beautified.js", "tmp/verifyMode/not-been-beautified.css"],
                options: {
                    mode: "VERIFY_ONLY"
                }
            },
            hasBeenBeautified: {
                src: ["tmp/verifyMode/been-beautified.js"],
                options: {
                    mode: "VERIFY_ONLY"
                }
            },
            fileMapping: {
                src: ["tmp/fileMapping/not-beautified.js.erb",
                    "tmp/fileMapping/not-beautified.css.erb", "tmp/fileMapping/not-beautified.html.erb"
                ],
                options: {
                    js: {
                        fileTypes: [".js.erb"]
                    },
                    css: {
                        fileTypes: [".css.erb"]
                    },
                    html: {
                        fileTypes: [".html.erb"]
                    }
                }
            },
            configFile: {
                src: ["tmp/configFile/test.js",
                    "tmp/configFile/test.css", "tmp/configFile/test.html"
                ],
                options: {
                    config: "tmp/configFile/jsbeautifyrc.json"
                }
            },
            configFileFlat: {
                src: "<%= jsbeautifier.configFile.src %>",
                options: {
                    config: "tmp/configFile/jsbeautifyrc_flat.json"
                }
            },
            configFileWithGruntFileOptions: {
                src: "<%= jsbeautifier.configFile.src %>",
                options: {
                    config: "tmp/configFile/jsbeautifyrc_flat.json",
                    js: {
                        indentSize: 3
                    },
                    css: {
                        indentSize: 5
                    },
                    html: {
                        indentSize: 7
                    }
                }
            },
            dest: {
                src: ["tmp/not-been-beautified.js"],
                options: {
                    dest: "dest"
                }
            }
        },
        copy: {
            tmp: {
                src: ["**"],
                dest: "tmp",
                cwd: "test/fixtures",
                expand: true
            }
        },
        clean: ["tmp", "dest"],
        nodeunit: {
            all: ["test/**/*.js"]
        },
        jshint: {
            files: ["package.json", "Gruntfile.js", "tasks/**/*.js", "test/**/*.js"],
            options: {
                curly: true,
                eqeqeq: true,
                immed: true,
                latedef: true,
                newcap: true,
                noarg: true,
                sub: true,
                undef: true,
                boss: true,
                eqnull: true,
                node: true,
                camelcase: true
            }
        }
    });

    // Actually load this plugin's task(s).
    grunt.loadTasks("tasks");

    // These plugins provide necessary tasks.
    grunt.loadNpmTasks("grunt-contrib-jshint");
    grunt.loadNpmTasks("grunt-contrib-nodeunit");
    grunt.loadNpmTasks("grunt-contrib-copy");
    grunt.loadNpmTasks("grunt-contrib-clean");

    // By default, beautifiy, lint and run all tests.
    grunt.registerTask("test", ["jshint", "copy", "nodeunit", "clean"]);
    grunt.registerTask("default", ["test", "jsbeautifier:default"]);
};
