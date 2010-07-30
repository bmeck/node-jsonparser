var toObject = require("./toObject")

console.log(JSON.stringify(toObject("['a' /*t*/ 'b' {c 1 5e5 {.5 \"1\" 1 2}}]")))
