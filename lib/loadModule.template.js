/**
 * @fileoverview This file is used to load modules. If sourcemaps are generated
 * this file is copied to the output directory so it can be mapped.
 */

goog.provide('loadModule')

/**
 * Load a module. This adds the modules JavaScript code to the DOM in a script
 * tag. It only adds the script tag for each module once. So if you call 
 * loadModule a second time after the module has already been loaded then the
 * callback won't do anything except immediately call the callback
 * @param {string} name The module name
 * @param {Function} opt_callback An optional callback to run once the script
 * has loaded.
 */
loadModule = function(name, opt_callback){
  //if (goog.DEBUG) {
  //  goog.require(moduleName)
  //  return
  //}

  __MODULES__

  if (!modules[name])
    throw 'Module not found'

  if (loadModule.loadedModules[name] === true){
    // Already loaded
    if (opt_callback) opt_callback()
    return
  } else if (loadModule.loadedModules[name]){
    // Currently loading
    loadModule.onScriptLoad(script, opt_callback)
    return
  }

  var script = document.createElement('script')
  script['src'] = modules[name]
  script['type'] = 'text/JavaScript'
  /*script['onload'] = function(){
    if (opt_callback)
      opt_callback()
  }*/
  loadModule.onScriptLoad(script, opt_callback)
  
  document.body.appendChild(script)
}
if (typeof goog !== 'undefined' && goog.global)
  goog.global['loadModule'] = loadModule
else if (typeof window !== 'undefined')
  window['loadModule'] = loadModule

/**
 * Keep a record of modules currently loading or already loaded
 */
loadModule.loadedModules = {}

/**
 * Fires the callback when the script loads
 */
loadModule.onScriptLoad = function(script, opt_callback){
  if (!opt_callback) return
  if (script.addEventListener) {
    script.addEventListener('load', opt_callback, false); 
  } else if (el.attachEvent)  {
    script.attachEvent('onload', opt_callback);
  }
}