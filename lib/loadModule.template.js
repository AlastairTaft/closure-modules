/**
 * @fileoverview This file is used to load modules. If sourcemaps are generated
 * this file is copied to the output directory so it can be mapped.
 */

goog.provide('loadModule')

var loadModule = function(name, opt_callback){
  //if (goog.DEBUG) {
  //  goog.require(moduleName)
  //  return
  //}

  __MODULES__

  if (!modules[name])
    throw 'Module not found'

  var script = document.createElement('script')
  script['src'] = modules[name]
  script['type'] = 'text/JavaScript'
  script['onload'] = function(){
    if (opt_callback)
      opt_callback()
  }
  
  document.body.appendChild(script)
}
if (typeof goog !== 'undefined' && goog.global)
  goog.global['loadModule'] = loadModule
else if (typeof window !== 'undefined')
  window['loadModule'] = loadModule