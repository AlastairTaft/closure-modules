/**
 * @fileoverview Replaced the absolute references in the sourcemap to relative 
 * ones
 */

var fs = require('fs')
  , path = require('path')
  


module.exports = function(filepath){

  // This makes all the sourcemap file relative to where the 
  // asset files are deployed
  //var virtualDir = ''
  // This makes it relative to the root of the url
  //var virtualDir = '/'
  //var virtualDir = '/claims/assets'

  var packageRoot = path.resolve(process.cwd())
  packageRoot = packageRoot.replace(/\\/gi, '/')
  

  var contents = fs.readFileSync(filepath, 'utf8')
  // Replace the generated absolute paths with relative ones
  contents = contents.replace(
    (new RegExp(process.cwd().replace(/\\/gi, '/'), 'gi')), ''
  )
  // Replace the only non relative path that will be to this loadModule file
  // TODO Consider copying this file to assets so there's more chance routers
  // can map to it when part of the sourcemap
  contents = contents.replace(
    (new RegExp(path.resolve(__dirname, '..').replace(/\\/gi, '/'), 'gi')), ''
  )

  fs.writeFileSync(filepath, contents, 'utf8')
  
}


