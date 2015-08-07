var b=Array.prototype,e=b.forEach?function(a,c,f){b.forEach.call(a,c,f)}:function(a,c,f){for(var l=a.length,h="string"==typeof a?a.split(""):a,d=0;d<l;d++)d in h&&c.call(f,h[d],d,a)};
