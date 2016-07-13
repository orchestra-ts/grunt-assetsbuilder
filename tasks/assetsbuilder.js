"use strict";

module.exports = function(grunt) {

  // Node utils
  var path = require("path"),
      fs = require("fs"),
      et = require("elementtree");

  // return a array with the style path
  function createSources(styles, pathFile) {
    var temp = [];

    styles.forEach(function(name) {
      temp.push(pathFile + name + ".less");
    });

    return temp;
  }

  // Merge and check require options
  function checkOptions(defaultOptions, opts) {
    var merge = grunt.util._.merge(defaultOptions, opts);

    if (!merge.catalog || !merge.catalog.less) {
      grunt.log.error("Cannot build because no catalog option was found.".red);
      return;

    } else if (!merge.json || !merge.json.path) {
      grunt.log.error("Cannot build because no json option was found.".red);
      return;

    } else if (!merge.manifest || !merge.manifest.path) {
      grunt.log.error("Cannot build because no manifest option was found.".red);
      return;
    }

    return merge;
  }


  grunt.registerMultiTask("assetsbuilder", "Parse XML pages and generated manifest", function() {

    var defaultOptions = { manifest: { banner: "" }, xml: { xpath: "./mergeFiles/less" }, temp: { path: "./tmp/copy/" } },
        opts = checkOptions(defaultOptions, this.options()),
        compress = true;

    // Clean the temporary directory
    grunt.config(["clean", "temporary"], [opts.temp.path]);
    grunt.task.run("clean:temporary");

    // When dependency exist copy the reference files
    if (opts.catalog.dependency) {
      grunt.config(["copy", "dependency", "files"], [{expand: true, cwd: opts.catalog.dependency, src: "**", dest: opts.temp.path}]);
      grunt.task.run("copy:dependency");
    }

    // Initialize and run copy task
    grunt.config(["copy", "main", "files"], [{expand: true, cwd: opts.catalog.less, src: "**", dest: opts.temp.path}]);
    grunt.task.run("copy:main");


    this.files.forEach(function(file) {

      var fileJSON = {},
          manifest = opts.manifest.banner;

      if (!file.src.length) {
        grunt.log.warn("Cannot build because no source files were found.");
        return;
      }

      if (!file.dest.length) {
        grunt.log.warn("Cannot build because no destination path was found.");
        return;
      }

      file.src.forEach(function(xml) {

        var data = fs.readFileSync(xml).toString(),
            etree = et.parse(data),
            less = etree.findall(opts.xml.xpath);

        if (less.length) {
          manifest += path.basename(xml, ".xml") + "=";

          less.forEach(function(element, index) {
            var name = less[index].get("name"),
                src = less[index].get("src").replace(/\s+/g, "").split(","),
                id = less[index].get("id"),
                target = file.dest + "css/" + name + ".css";

            fileJSON[target] = createSources(src, opts.temp.path);
            manifest += name + ".css" + (id ? "[" + id + "]" : "") + (index === less.length - 1 ? "" : ",");
          });

          manifest += "\n";

        } else {
          grunt.verbose.writeln("The XML " + (path.basename(xml, ".")).yellow + " as not merge files.");
        }
      });

      // Create the JSON file
      grunt.file.write(opts.json.path, JSON.stringify(fileJSON));
      grunt.log.ok("The JSON file has been generated");

      // Create the properties file
      grunt.file.write(opts.manifest.path, manifest);
      grunt.log.ok("The manifest file has been generated");
      grunt.verbose.writeln("manifest: \n" + manifest);

      // Change environment when a flag parameter is dev
      if (/--nocompress/.test(grunt.option.flags())) {
        compress = false;
      }

      // Initialize and run less task
      grunt.config(["less", "prod", "options", "compress"], compress);
      grunt.config(["less", "prod", "files"], grunt.file.readJSON(opts.json.path));
      grunt.task.run("less:prod");
    });

  });

};