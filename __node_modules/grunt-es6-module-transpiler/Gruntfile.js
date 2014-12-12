/*
 * grunt-es6-module-transpiler
 * https://github.com/joefiorini/grunt-es6-module-transpiler
 *
 * Copyright (c) 2013 Joe Fiorini
 * Licensed under the MIT license.
 */

'use strict';

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    jshint: {
      all: [
        'Gruntfile.js',
        'tasks/*.js',
        '<%= nodeunit.tests %>',
      ],
      options: {
        jshintrc: '.jshintrc',
      },
    },

    // Before generating any new files, remove any previously-created files.
    clean: {
      tests: ['tmp'],
    },

    release: {
      options: {
        tagName: 'v<%= version %>',
        commitMessage: 'Release v<%= version %> :tada:',
        tagMessage: 'Release v<%= version %>'
      }
    },

    // Configuration to be run (and then tested).
    transpile: {
      toCJS: {
        type: "cjs",
        files: {
          'tmp/cjs.js': ['test/fixtures/input.js'],
          'tmp/cjs-bar.js': ['test/fixtures/bar.js']
        },
      },
      toAMD: {
        type: "amd",
        files: {
          'tmp/amd.js': ['test/fixtures/input.js'],
          'tmp/amd-bar.js': ['test/fixtures/bar.js']
        }
      },
      toYUI: {
        type: "yui",
        files: {
          'tmp/yui.js': ['test/fixtures/input.js'],
          'tmp/yui-bar.js': ['test/fixtures/bar.js']
        }
      },
      toGlobals: {
        type: "globals",
        imports: { bar: "Bar" },
        files: {
          'tmp/globals.js': ['test/fixtures/input.js'],
          'tmp/globals-bar.js': ['test/fixtures/bar.js']
        }
      },
      moduleName: {
        type: 'amd',
        moduleName: 'namedModule',
        files: {
          'tmp/name.js': ['test/fixtures/name.js'],
        }
      },
      moduleNameCallback: {
        type: 'amd',
        moduleName: function(srcWithoutExt, file){
          return 'my_app/' + srcWithoutExt.replace(/^test\/fixtures\//, '');
        },
        files: {
          'tmp/name_callback.js': ['test/fixtures/name_callback.js'],
        }
      },
      moduleNameCallbackWithCwd: {
        type: 'amd',
        moduleName: function(srcWithoutExt, file){
          return 'my_app/' + srcWithoutExt;
        },
        files: [
          {
            expand: true,     // Enable dynamic expansion.
            cwd: 'test/fixtures/lib/',      // Src matches are relative to this path.
            src: ['**/*.js'], // Actual pattern(s) to match.
            dest: 'tmp/'   // Destination path prefix.
          }
        ]
      },
      anonymous: {
        type: 'amd',
        anonymous: true,
        files: {
          'tmp/anonymous.js': ['test/fixtures/anonymous.js'],
        }
      },
      coffeeSrc: {
        type: 'amd',
        files: {
          'tmp/coffee.coffee': ['test/fixtures/coffee.coffee'],
        }
      },
      mixedCoffeeAndJS: {
        type: 'amd',
        anonymous: true,
        files: {
          'tmp/anonymous.coffee': ['test/fixtures/anonymous.coffee'],
          'tmp/anonymous.js': ['test/fixtures/anonymous.js'],
        }
      },
      importError: {
        type: 'amd',
        anonymous: true,
        files: {
          'tmp/import-error.js': ['test/fixtures/import-error.js']
        }
      },
      exportError: {
        type: 'amd',
        anonymous: true,
        files: {
          'tmp/export-error.js': ['test/fixtures/export-error.js']
        }
      }
    },

    // Unit tests.
    nodeunit: {
      tests: ['test/*_test.js'],
    },

  });

  // Actually load this plugin's task(s).
  grunt.loadTasks('tasks');

  // These plugins provide necessary tasks.
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-nodeunit');
  grunt.loadNpmTasks('grunt-release');

  // Whenever the "test" task is run, first clean the "tmp" dir, then run this
  // plugin's task(s), then test the result.
  grunt.registerTask('test', ['clean', 'transpile', 'nodeunit']);

  // By default, lint and run all tests.
  grunt.registerTask('default', ['jshint', 'test']);

};
