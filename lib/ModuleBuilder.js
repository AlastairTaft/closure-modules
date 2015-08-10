/**
 * @fileoverview Build the closure modules, generates the files
 */

var fs = require('fs')
  , path = require('path')
  , stream = require('stream')
  , spawn = require('child_process').spawn
  , debug = require('debug')('closure-modules:ModuleBuilder')
  , createLoadModuleFile = require('./createLoadModuleFile.js')

var Builder = function(jsSources){
  this.outputDir = ''
  this.commonFilename = 'common'
  this.args = ['-jar'
    , path.resolve(__dirname, '../closure-compiler/compiler.jar')
  ];
  // Add the jsSource
  jsSources.forEach(function(p){
    this.args.push('--js=' + p)
  }, this)
  this.modules = []
  this.virtualDir = '/'
  this.useTypesForOptimisation = true
}

/**
 * This is the filename that contains the shared code
 */
Builder.prototype.setCommonFilename = function(filename){
  this.commonFilename = filename
}

Builder.prototype.setOutputDir = function(outputDir){
  this.outputDir = outputDir
}

Builder.prototype.addExtern = function(filepath){
  this.args.push('--externs=' + filepath) 
}

Builder.prototype.addModule = function(scriptPath, opt_outputName){
  // Switched these around for testing
  var entryPoint = this.getFirstProvide(scriptPath)
  this.modules.push([scriptPath, entryPoint, opt_outputName || entryPoint])
}

Builder.prototype.setVirtualDir = function(virtualDir){
  this.virtualDir = virtualDir
}

Builder.prototype.setUseTypesForOptimisation = function(value){
  this.useTypesForOptimisation = value
}

Builder.prototype.run = function(addSourceMap){
  var self = this

  var tempSourcemapPath = this.outputDir + '/sourcemap.js.map'

  this.args.splice(this.args.length, 0
     , '--module', this.commonFilename + ':auto:'
     , '--only_closure_dependencies' 
     , '--compilation_level=ADVANCED'
     , '--language_in', 'ECMASCRIPT5'
     , '--module_output_path_prefix=' + this.outputDir + '/'
  )

  var moduleMap = {}
  this.modules.forEach(function(module){
    this.args.push('--js=' + module[0]) 
    this.args.push('--module') 
    this.args.push(module[2] + ':1:' + this.commonFilename + ':')

    /*
 , '--module', 'test:1:common:' 
 , '--module', 'claimsProduct:1:common:'
 , '--closure_entry_point', 'claimsProduct'
 , '--closure_entry_point', 'testPage'
*/
    this.args.push('--closure_entry_point')
    this.args.push(module[1])

    moduleMap[module[1]] = this.virtualDir + this.outputDir + '/' 
      + module[2] + '.js' 
  }, this)

  // Add our loadModule method to jsSources
  var loadModuleFilepath = path.resolve(this.outputDir, 'loadModule.js')
  createLoadModuleFile(loadModuleFilepath, moduleMap)
  this.args.splice(2, 0, '--js=' + loadModuleFilepath)

  if (addSourceMap){
    this.args.splice(this.args.length, 0
      , '--create_source_map=' + tempSourcemapPath
      //, '--output_wrapper="%output%\\n//# sourceMappingURL=sourcemap.js.map"'
    )
  }

  this.args.splice(this.args.length, 0
    , '--use_types_for_optimization'
    , this.useTypesForOptimisation)

  debug('Running compiler.jar with args: ' + this.args.join('\n'))

  var  ccp    = spawn('java', 
      this.args);

  //var ws = fs.createWriteStream('assets/claimsProduct.js')
  //ccp.stdout.pipe(ws)
  ccp.stdout.on('data', function (data) {
    console.log('stdout: ' + data);
  });

  var errStr = ""
  ccp.stderr.on('data', function (data) {
    errStr += data
    console.log(String(data))
  });

  ccp.on('close', function (code) {
    if (code != 0)
      throw errStr
    console.log('child process exited with code ' + code);

    // Now that the files are generated we need to mod the generated sourcemap
    if (! addSourceMap) {
      // Remove the loadModule file as it's included in the compiled files
      fs.unlinkSync(loadModuleFilepath)
      return
    }
    self.fixSourcemap(tempSourcemapPath)
    
  });

}

/**
 * The closure compiler does most of the work but there's still some
 * manual processing to be done
 * @private
 */
Builder.prototype.fixSourcemap = function(tempSourcemapPath){
  var self = this
  var updateSourcemapReferences = require(path.resolve(__dirname, 'fixSourcemapAbsoluteReferences.js'))
  updateSourcemapReferences(tempSourcemapPath)
  self.splitSourcemap(tempSourcemapPath)
  
}

/**
 * Breaks the temp sourcemap out into it's parts for each module
 * @private
 */
Builder.prototype.splitSourcemap = function(tempSourcemapPath){
  var self = this;

  var sourcemapUtil = require('./sourcemapUtil.js')
  
  fs.readFile(tempSourcemapPath, 'utf8', function (err,data) {
    if (err) throw err

    var parts = data.split('}\n{')
    parts[0] = parts[0].slice(1)
    parts[parts.length - 1] = parts[parts.length - 1].slice(0, -2)
    debugger
    parts.forEach(function(content, i){
      
      if (i == 0){
        var file = self.commonFilename
      } else {
        var file = self.modules[(i - 1)][2]
      }
      var filepath = path.resolve(self.outputDir, file + '.sourcemap.map.js')
      content = '{' + content + '}'

      var sourcemap = JSON.parse(content)
      // Makes it relative to the root of the website instead of the assets
      // directory
      sourcemapUtil.addVirtualDir(sourcemap, self.virtualDir)

      fs.writeFile(filepath, JSON.stringify(sourcemap), 'utf8', function (err) {
         if (err) throw err
      });

      // Add the sourcemap comment to the end of the original module file
      // //# sourceMappingURL=sourcemap.js.map
      fs.appendFileSync(
        path.resolve(self.outputDir, file + '.js')
        //, '//# sourceMappingURL=/claims/' + self.outputDir + '/' + file + '.sourcemap.map.js'
        , '//# sourceMappingURL=' + file + '.sourcemap.map.js'
      )

      i++
    })

    // Delete the temp file
    fs.unlinkSync(tempSourcemapPath);
  });
}

/**
 * Gets the value from the first found provide statement in the file. 
 */
Builder.prototype.getFirstProvide = function(filepath){
  var content = fs.readFileSync(filepath, {'encoding':'utf8'})
  var matches = content.match(/goog\.(provide|module)\(['"](.*?)['"]\)/i)
  if (! matches[2])
    throw filepath + ' does not provide an entry point, ' + 
      'looking for a goog.provide statement'

  return matches[2]
}

module.exports = Builder
