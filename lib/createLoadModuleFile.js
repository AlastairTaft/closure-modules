/**
 * Creates the loadModule.js file
 */

var fs = require('fs')
  , path = require('path')

function createLoadModuleFile(outputPath, moduleMap){
  var contents = fs.readFileSync(__dirname + '/loadModule.template.js', 
    {'encoding':'utf8'})

  // Format template
  contents = contents.replace(
    (new RegExp('__MODULES__', 'gi')), 
    'var modules = ' + JSON.stringify(moduleMap)
  )


  fs.writeFileSync(outputPath, contents)
}

module.exports = createLoadModuleFile