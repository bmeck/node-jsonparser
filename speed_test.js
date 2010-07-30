var toObject = require("./toObject")
var count = 10
var start,end;
var x=0
start=Date.now()
for(var i=0;i<count;i++)
	JSON.parse("[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]")

end = Date.now()
console.log(end-start)
console.log(x)

x=0
start=Date.now()
for(var i=0;i<count;i++)
	toObject("[[[[[[[[[[[[[[[]]]]]]]]]]]]]]]")

end = Date.now()
console.log(end-start)
console.log(x)
