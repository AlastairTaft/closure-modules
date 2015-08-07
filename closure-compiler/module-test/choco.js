
goog.provide('Choco')
goog.require('goog.array')


Choco = function(){
  console.log('New instance of Choco created')
}

Choco.prototype.logSampleChocos = function(){
  goog.array.forEach(['mars', 'snickers', 'bounty'], function(a){
    console.log(a)
  })
}


module.exports = Choco
goog.exportProperty(Choco.prototype, 'logSampleChocos', Choco.prototype.logSampleChocos)



