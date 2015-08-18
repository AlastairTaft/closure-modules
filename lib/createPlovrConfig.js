/**
 * @fileoverview Cretes a plovr config based off of what's setup under 
 * "closure-modules" in the package.json
 */

var fs = require('fs')
  , path = require('path')

/**
 * Creates a plovr config file in the current directory
 */
module.exports = function(){
  //var dir = path.dirname(__dirname)
  
  var packageJson = require(path.resolve('.', 'package.json'))
  if (!packageJson['closure-modules'])
    throw 'closure-modules not setup in package.json'
  var options = packageJson['closure-modules']
    , outputDir = options['output-dir'] || 'assets' // Defaults to assets

  var plovrConfig = {
    "id": "closure"
    ,"paths": [
      // Needed so the loadModule uses don't throw errors
      outputDir + "/loadModuleNoop.js"
    ]
    ,"inputs": []
    ,"mode": "ADVANCED"
    , "externs": []
  }

  var relativeAdjustment = ''

  options['js-sources'] = options['js-sources'] || []
  options['js-sources'].forEach(function(jsSource){
    // Bit hacky bit it'll do the job
    if (jsSource.slice(- 'closure-library/closure/goog'.length) == 'closure-library/closure/goog'){
      plovrConfig['closure-library'] = relativeAdjustment + jsSource
      return
    }

    plovrConfig['paths'].push(relativeAdjustment + jsSource)
  })
  for (var key in options['modules']){
    var module = options['modules'][key]
    plovrConfig['inputs'].push(relativeAdjustment + module)
  }
  options['externs'] = options['externs'] || []
  options['externs'].forEach(function(extern){
    plovrConfig['externs'].push(relativeAdjustment + extern)
  })

  var filepath = './plovr-config-generated.js'
  fs.writeFileSync(filepath, JSON.stringify(plovrConfig))
  return filepath
}
