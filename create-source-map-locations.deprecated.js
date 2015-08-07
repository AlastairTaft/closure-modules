/**
 * @fileoverview Creates source map locations. This maps the real absolute paths
 * to a virtual one that the server will handle
 */

var Promise = require('promise')
var path = require('path')
  , fs = require('fs')
  , walk = require(__dirname + '/../../lib/walk.js')

/**
 * @param {Array} jsSources An array of directory or filepaths that contain
 * JavaScript files.
 */
var Mapper = function(jsSources){
  this.map_ = {}
  this.jsSources = jsSources
}

Mapper.prototype.map = function(callback){
  var self = this
  Promise.all(this.jsSources.map(this.mapSource, this))
  .then(function(){
    callback(null, self.map_)
  })
  .catch(function(err){
    callback(err)
  })
}

/**
 * Maps a JavaScript source, returns a promise
 * @param {string} pathOrDir filepath or directory path
 */
Mapper.prototype.mapSource = function(pathOrDir){
  if (fs.lstatSync(pathOrDir).isDirectory()){
    return this.mapDirectory(pathOrDir)
  } else {
    return Promise.resolve(this.mapFile(pathOrDir, this))
  }
}

/**
 * Maps a file's absolute path to a path relative to the package root
 * Assumes the current __dirname is the root.
 * @param {string} filepath
 */
Mapper.prototype.mapFile = function(filepath){

  if (!this.isJavaScriptFile(filepath)) return

  var absolutePath = path.resolve(filepath),
    relPath = absolutePath.slice(__dirname.length)

  this.map_[absolutePath] = relPath
}


/**
 * Maps a directory, returns a promise
 * @param {string} dir
 */
Mapper.prototype.mapDirectory = function(dir){
  var self = this
  return new Promise(function(resolve, reject){
    walk(dir, function(err, paths){
      if (err) return reject(err)

      paths.forEach(self.mapFile, self)
      resolve()
    })
  })
}

/**
 * @return {boolean}
 */
Mapper.prototype.isJavaScriptFile = function(filepath){
  return filepath.toLowerCase().slice(-3) == '.js'
}


module.exports = function(jsSources, callback){
  var mapper = new Mapper(jsSources)
  mapper.map(callback)
}