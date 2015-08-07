#!/usr/bin/env node

/**
 * @fileoverview Compile the closure files
 */

var builder = require('./getModuleBuilder.js')()


var args = process.argv.slice(2)

var generateSourcemaps = args.some(function(arg){
  return arg.toLowerCase() == '--sourcemaps'
})

builder.run(generateSourcemaps)