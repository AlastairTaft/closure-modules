/**
 * @fileoverview This file is used to load modules. If sourcemaps are generated
 * this file is copied to the output directory so it can be mapped.
 */

goog.module('loadModule')

var dom = goog.require('goog.dom')

var loadModule = function(name, opt_callback){
  //if (goog.DEBUG) {
  //  goog.require(moduleName)
  //  return
  //}

  __MODULES__

  if (!modules[name])
    throw 'Module not found'

  var script = dom.createDom('script', {
    'src': modules[name],
    'type': 'text/JavaScript',
    'onload': function(){
      if (opt_callback)
        opt_callback()
    }
  })
  document.body.appendChild(script)
}
goog.exportSymbol('loadModule', loadModule)