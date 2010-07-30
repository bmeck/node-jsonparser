var toObject = require("./toObject")

console.log(JSON.stringify(toObject("['a' /*t*/ 'b' {c 1}]")))
