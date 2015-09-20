#!/usr/bin/env node

/**
 * @fileoverview Builds the deps file, the deps file will only work with node as 
 * the path will contain __dirname at the beginning.
 */
 
var spawn = require('child_process').spawn,
  path = require('path'),
  fs = require('fs');

var packageJson = require(path.resolve(process.cwd(),'package.json'))

if (packageJson['closure-modules']){
  var options = packageJson['closure-modules']
} else {
  var options = require('./parseArgs.js')(process.argv);
}

var jsSources = options['js-sources']
  , outputDir = options['output-dir'] || 'assets' // Defaults to assets
  , depsFilepaths = []

jsSources.forEach(function(src){
  generateDeps(src)

  // Make the common file load all the deps files
  var cStream = fs.createWriteStream(outputDir + '/common.js')
  depsFilepaths.forEach(function(p){
    cStream.write('document.write(\'<script type="text/javascript" src="' 
      + p.replace(/\\/gi, '\\\\') + '"></script>\')\n')
  })
})


function generateDeps(src){

  src = path.dirname(src)
    
  var depswriterPath = path.resolve(
    __dirname,
    "depswriter/depswriter.py"
  )

  var proc = spawn('python', [depswriterPath, 
    "--root_with_prefix=" + path.resolve(src) + ' ../'
    //+ ' --root=' + path.resolve('./build/generated-code/entryPoints')
    + '']);
  proc.stderr.pipe(process.stderr);
  var depsFilename = path.resolve(outputDir, 
    src.replace(/\\/gi, '-').replace(/\//gi, '-') + '-deps.js')
  depsFilepaths.push(depsFilename)
  var stream = fs.createWriteStream(depsFilename);
  var content = "";
  proc.stdout.on('data', function(data){
    content += data;
  });
  proc.stdout.on('close', function(){
    //content = content.replace(/<REPLACE>/gi, "' + __dirname + '");
    stream.write(content);
    stream.end()
  });

}


