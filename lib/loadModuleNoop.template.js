goog.provide('loadModule')

var loadModule = function(name, opt_callback){
  if (opt_callback){
    // Wait because plovr may not have loaded all the scripts yet
    setTimeout(function(){
      opt_callback()
    }, 500)
  }
}
goog.exportSymbol('loadModule', loadModule)