This library should make breaking down your compiled closure-library style code into modules easier.

## How to

Stick your module configuration in your package.json under a `"closure-modules"` key, like so

*package.json* (real world example)
```
...
"closure-modules": {
  // All the locations of your JavaScript code and libraries, make sure all these paths are relative
  "js-sources": [
    "node_modules/@alastair/closure-library/closure/goog" 
    , "node_modules/@alastair/closure-library/third_party/closure/goog/dojo/dom" 
    , "node_modules/@alastair/pbx-core/pbx" 
    , "node_modules/@alastair/pb"
    , "node_modules/@alastair/perseus"
    , "node_modules/@alastair/orion"
    , "node_modules/@alastair/titan"
    , "third_party/closure-templates" 
  ],
  // Configure your modules, name them as the key and put the script filepath as the value
  "modules": {
    "claimsProduct": "closureModules/raw/claimsProduct/claims-product.js",
    "testPage": "closureModules/raw/test-page.js"
  },
  // Any externs
  "externs": ["closureModules/raw/claimsProduct/claims-product-externs.js"],
  // Optional, you probably don't need this, but it just prepends this to url paths, and sourcemap paths
  "virtual-dir": "/claims/",
  // Output directory, if omitted defaults to assets
  "output-dir": 'assets'
}
...
```

The module adds a new command `generate-closure-modules` that can be run via npm scripts
```
... 
{
  "scripts": [
    "generate": "generate-closure-modules",
    // If you need to debug your compiled code you'll be glad this exists
    "generate-with-sourcemaps": "generate-closure-modules --sourcemaps"
  ]
}
...
```

Generating the sourcemaps will mean your router will have to play nice serving up any of your JavaScript libraries but the sourcemaps will let you know where any errors are occuring in the compiled code

### Loading modules

Include common.js (this is the shared code that gets generated)
```
<script type="text/JavaScript" src="assets/common.js"></script>
```
A lightweight function `loadModule` gets included in the common code. Somewhere on your webpage you can then load the modules via the names you've given them whenever they are required.

```
<script type="text/JavaScript">
  loadModule('claimsProduct', function(){
    // Callback fired when script has been loaded
    claimsProduct.init()
  })
</script>
```