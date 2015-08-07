goog.module('Fruit')

var arr = goog.require('goog.array')
var obj = goog.require('goog.object')

Fruit = function(){
  console.log('New instance of Fruit created')
}

Fruit.prototype.logSampleFruits = function(){

  arr.forEach(['Apple','Banana','Orange'], function(a){
    console.log(a)
  })

}

Fruit.prototype.logRandomSample = function(){
  console.log(obj.getAnyKey({'test': 'Pear'}))
}

module.exports = Fruit
goog.exportProperty(Fruit.prototype, 'logSampleFruits', Fruit.prototype.logSampleFruits)
goog.exportProperty(Fruit.prototype, 'logRandomSample', Fruit.prototype.logRandomSample)

