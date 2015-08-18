#!/usr/bin/env node

var fs = require('fs')
  , path = require('path')

/**
 * Used for debugging, has to be installed locally as this method will
 * only work with dev dependencies installed
 * @return {string} Runs plovr, so that the closure file can be debugged
 * @private
 */
function runPlovr(opt_settings, callbackA){

  var debug = require('debug')('closure-modules:runPlovr')
  var callback = arguments[arguments.length - 1];

  debug("Starting plovr...");

  var spawn = require('child_process').spawn,
    child;

  if (opt_settings instanceof Function){
    callback = opt_settings;
    opt_settings = {};

  }

  // Override the mode so it's not compressed
  opt_settings["mode"] = "RAW";


  var fs = require('fs');

  var plovrConfigFilepath = require('./lib/createPlovrConfig.js')()
  var plovrConfig = fs.readFileSync(plovrConfigFilepath, {encoding: 'UTF8'});

  // Replace all the comment lines starting with // as this isn't valid JSON
  plovrConfig = plovrConfig.replace(/\s*\/\/.*/gi, "");
  plovrConfig = JSON.parse(plovrConfig);
  extend(plovrConfig, opt_settings);

  // Save the file
  //var plovrFilePath = __dirname + '/build/plovr/config-generated.js';
  var plovrFilePath = plovrConfigFilepath;
  fs.writeFileSync(plovrFilePath, JSON.stringify(plovrConfig, null, 2));

  // java -jar ' + __dirname + '/plovr/plovr.jar build ' + plovrFilePath
  var plovrJarPath = path.dirname(require.resolve('node-plovr')) + "/plovr.jar";
  var args =  ['-jar', plovrJarPath, 'serve', plovrFilePath];
  child = spawn('java', args);
  child.stdout.on('data', function(data) {
    console.log("plovr: " + data);
  });
  child.stderr.on('data', function(data) {
    console.log("plovr error: " + data);
  });
  child.on('close', function(code) {
    console.log("plovr terminated");
  });
};


/**
 * Taken from the closure-library
 * Extends an object with another object.
 * This operates 'in-place'; it does not create a new Object.
 *
 * Example:
 * var o = {};
 * goog.object.extend(o, {a: 0, b: 1});
 * o; // {a: 0, b: 1}
 * goog.object.extend(o, {b: 2, c: 3});
 * o; // {a: 0, b: 2, c: 3}
 *
 * @param {Object} target The object to modify. Existing properties will be
 *     overwritten if they are also present in one of the objects in
 *     {@code var_args}.
 * @param {...Object} var_args The objects from which values will be copied.
 */
function extend(target, var_args) {
  var key, source;
  for (var i = 1; i < arguments.length; i++) {
    source = arguments[i];
    for (key in source) {
      target[key] = source[key];
    }
  }
};


var packageJson = require(path.resolve(process.cwd(),'package.json'))

if (packageJson['closure-modules']){
  var options = packageJson['closure-modules']
} else {
  var options = require('./lib/parseArgs.js')(process.argv);
}

var outputDir = options['output-dir'] || 'assets' // Defaults to assets

// We need to first copy over the common.js script and all it should
// contain is the loading of plovr
fs.writeFileSync(
  path.resolve(outputDir, 'common.js'), 
  fs.readFileSync(__dirname + '/lib/plovr-common-shim.template.js')
)

fs.writeFileSync(
  path.resolve(outputDir, 'loadModuleNoop.js'), 
  fs.readFileSync(__dirname + '/lib/loadModuleNoop.template.js')
)

runPlovr(function(){})