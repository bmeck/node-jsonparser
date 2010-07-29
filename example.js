var CreateParser = require("./jsonparser")
var parser = CreateParser({
	onObjectStart:function(){
		console.log("OBJECT START")
	}
	, onObjectKeyStart:function(){
		console.log("OBJECT KEY START")
	}
	, onObjectKeyEnd:function(){
		console.log("OBJECT KEY END")
	}
	, onObjectValueStart:function(){
		console.log("OBJECT VALUE START")
	}
	, onObjectValueEnd:function(){
		console.log("OBJECT VALUE END")
	}
	, onObjectEnd:function(){
		console.log("OBJECT END")
	}
	, onStringStart:function() {
		console.log("STRING START")
	}
	, onStringEnd:function(str) {
		console.log("STRING END : "+str)
	}
	, onNumberStart:function() {
		console.log("NUMBER START")
	}
	, onNumberEnd:function(str) {
		console.log("NUMBER END : "+str)
	}
	, onLiteralStart:function() {
		console.log("LITERAL START")
	}
	, onLiteralEnd:function(str) {
		console.log("LITERAL END : "+str)
	}
	, onArrayStart:function() {
		console.log("ARRAY START")
	}
	, onArrayValueEnd:function() {
		console.log("ARRAY VALUE")
	}
	, onArrayEnd:function() {
		console.log("ARRAY END")
	}
	, onError:function(err) {
		console.log("ERROR : "+err)
		parser.reset()
	}
})
parser.parseChunk("{a:[b,c]}")