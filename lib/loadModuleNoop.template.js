goog.provide('loadModule')

var loadModule = function(name, opt_callback){
  if (opt_callback)
    opt_callback()
}
goog.exportSymbol('loadModule', loadModule)