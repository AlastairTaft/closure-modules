/**
 * @fileoverview Utils for sourcemap files
 */

module.exports.addVirtualDir = function(sourcemap, virtualDir){
  // Adds a virtual dir to all the sources
  sourcemap["sources"] = sourcemap["sources"].map(function(src){
    // Skip things like " [synthetic:2] "
    if (src.slice(0, 1) == " ") return src

    return virtualDir + src
  })
}
