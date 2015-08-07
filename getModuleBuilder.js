/**
 * Parses the command line arguments and package.json and sends back
 * a ModuleBuilder instance configured with those settings.
 */

 var path = require('path')
    , ModuleBuilder = require(__dirname + '/lib/ModuleBuilder.js')
  
module.exports = function(){

  var packageJson = require(path.resolve(process.cwd(),'package.json'))

  if (packageJson['closure-modules']){
    var options = packageJson['closure-modules']
  } else {
    var options = require('./parseArgs.js')(process.argv);
  }

  var packageRoot = 'C:/projects/pbx-ui'

  var jsSources = options['js-sources']
    , outputDir = options['output-dir'] || 'assets' // Defaults to assets
    , modules = options['modules']
    , externs = options['externs'] || []
    , virtualDir = options['virtual-dir']

  if (!jsSources)
    throw "No javascript sources specified"

  if (!modules || Object.keys(modules).length == 0)
    throw "No modules specified"


  var builder = new ModuleBuilder(jsSources)
  builder.setOutputDir(outputDir)

  for (var name in modules){
    var scriptPath = modules[name]
    builder.addModule(scriptPath, name)
  }

  externs.forEach(function(e){
    builder.addExtern(e)
  })

  if (typeof virtualDir != 'undefined')
    builder.setVirtualDir(virtualDir)

  return builder


}