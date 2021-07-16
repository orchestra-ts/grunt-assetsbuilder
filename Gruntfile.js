"use strict";

module.exports = function(grunt) {

  // Project configuration.
  grunt.initConfig({
    pkg: grunt.file.readJSON("package.json"),
    pathOrx: {
      catalogCsWeb: "./test/shared/cs/web/",
      catalogTsLocal: "./test/shared/ts/local/",
      generatedWeb: "./test/generated/web/",
      generatedLocal: "./test/generated/local/",
      tempCopyLess: "./test/tmp/copy/less/"
    },
    catalogName: [
      "test-generic-catalog",
      "test-whitelabel-catalog"
    ],

    // Assets Builder
    assetsbuilder: {
      "<%= catalogName[0] %>": {
        options: {
          catalog: {
            less: "<%= pathOrx.catalogCsWeb %><%= catalogName[0] %>/less/"
          },
          json: {
            path: "<%= pathOrx.generatedLocal %><%= catalogName[0] %>/config/less.json"
          },
          manifest: {
            banner: "## Generated <%= catalogName[0] %>: " + grunt.template.today("yyyy-mm-dd HH:MM") + "\n",
            path: "<%= pathOrx.generatedLocal %><%= catalogName[0] %>/config/manifest.properties"
          },
          temp: {
            path: "<%= pathOrx.tempCopyLess %><%= catalogName[0] %>/"
          }
        },
        files: [
          {
            src: ["<%= pathOrx.catalogTsLocal %>cms/<%= catalogName[0] %>/main/pages/*.xml"],
            dest: "<%= pathOrx.generatedWeb %><%= catalogName[0] %>/"
          }
        ]
      },
      "<%= catalogName[1] %>": {
        options: {
          catalog: {
            less: "<%= pathOrx.catalogCsWeb %><%= catalogName[1] %>/less/",
            dependency: "<%= pathOrx.catalogCsWeb %><%= catalogName[0] %>/less/"
          },
          json: {
            path: "<%= pathOrx.generatedLocal %><%= catalogName[1] %>/config/less.json"
          },
          manifest: {
            banner: "## Generated <%= catalogName[1] %>: " + grunt.template.today("yyyy-mm-dd HH:MM") + "\n",
            path: "<%= pathOrx.generatedLocal %><%= catalogName[1] %>/config/manifest.properties"
          },
          temp: {
            path: "<%= pathOrx.tempCopyLess %><%= catalogName[1] %>/"
          }
        },
        files: [
          {
            src: ["<%= pathOrx.catalogTsLocal %>cms/<%= catalogName[0] %>/main/pages/*.xml"],
            dest: "<%= pathOrx.generatedWeb %><%= catalogName[1] %>/"
          }
        ]
      }
    },

    // Linter for JavaScript files.
    jshint: {
      all: ["Gruntfile.js", "tasks/*.js"],
      options: {
        jshintrc: ".jshintrc"
      }
    },

    // Clean
    clean: {
      lessTemp: {
        src: [
          "<%= pathOrx.tempCopyLess %><%= catalogName[0] %>/*",
          "<%= pathOrx.tempCopyLess %><%= catalogName[1] %>/*"
        ]
      }
    }
  });


  // Actually load this plugin's task(s).
  grunt.loadTasks("tasks");

  // Load grunt tasks from NPM packages
  grunt.loadNpmTasks("grunt-contrib-jshint");

  // Default task.
  grunt.registerTask("default", ["assetsbuilder"]);

  // Specific tasksTemp
  grunt.registerTask("generic", ["assetsbuilder:<%= catalogName[0] %>"]);
  grunt.registerTask("specific", ["assetsbuilder:<%= catalogName[1] %>"]);
  grunt.registerTask("cleanTemp", ["clean:lessTemp"]);

  // Test task
  grunt.registerTask("test", ["jshint"]);

};