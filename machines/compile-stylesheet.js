module.exports = {


  friendlyName: 'Compile stylesheet',


  description: 'Compile a LESS stylesheet to CSS.',


  extendedDescription: 'Note that, as you might expect, this will also compile any additional LESS stylesheets referenced using \'@import\'.',


  inputs: {

    source: {
      description: 'The path to the LESS stylesheet (i.e. the entry-point) on disk.',
      extendedDescription: 'If a relative path is used, it will be resolved relative to the current working directory.',
      example: '/Users/mikermcneil/Desktop/my-cool-app/assets/styles/importer.less',
      required: true
    },

    importPaths: {
      description: 'An array of paths to folders or specific files to make accessible to @import directives in the LESS stylesheet.',
      extendedDescription: 'If any relative paths are used, they will be resolved relative to the current working directory.',
      example: ['/Users/mikermcneil/Desktop'],
      defaultsTo: []
    },

    minify: {
      description: 'Whether or not to minify the compiled CSS output.',
      example: false,
      defaultsTo: false
    }

  },


  exits: {

    doesNotExist: {
      description: 'No file exists at the provided `source` path.'
    },

    success: {
      description: 'Done.',
      variableName: 'css',
      example: '.button { width: 20px; }'
    },

  },


  fn: function (inputs,exits) {
    var path = require('path');
    var LESS = require('less');
    var _ = require('machinepack-lodash');
    var Filesystem = require('machinepack-fs');

    // Resolve potentially-relative paths
    inputs.source = path.resolve(inputs.source);
    inputs.importPaths = _.map(inputs.importPaths, function (importPath) {
      return path.resolve(importPath);
    });

    // Load contents of stylesheet
    Filesystem.read({
      source: inputs.source
    }).exec({
      error: exits.error,
      doesNotExist: exits.doesNotExist,
      success: function (lessStr) {

        // Compile LESS
        // (which takes care of @import directives, loading other stylesheets from disk as necessary)
        try {
          LESS.render(lessStr, {
            filename: path.basename(inputs.source),
            paths: inputs.importPaths,
            compress: inputs.minify
          }, function (err, css) {
            if (err) {
              return exits.error(err);
            }
            return exits.success(css);
          });
        }
        catch (e) {
          // (just in case)
          return exits.error(e);
        }
      }
    });
  },


};
