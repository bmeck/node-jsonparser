var CreateParser = require("./jsonparser")
module.exports = function toObject(str) {
	var obj = null
	var stack = []
	var buffer = null
	var keybuffers = []
	var looking_for_key = false
	var parser;parser = CreateParser({
		onObjectStart:function(){
			stack.push(obj = {})
		}
		, onObjectKeyStart:function() {
			looking_for_key = true
		}
		, onObjectKeyEnd:function() {
			looking_for_key = false
		}
		, onObjectValueStart:function() {
			keybuffers.push(buffer)
		}
		, onObjectValueEnd:function(){
			var keybuffer = keybuffers.pop()
			obj[typeof keybuffer == "number"?keybuffer:String(keybuffer)] = buffer
		}
		, onObjectEnd:function(){
			buffer = stack.pop()
			obj = stack[stack.length-1]
			if(stack.length) {
				return
			}
			parser.end()
		}
		, onStringEnd:function(str) {
			buffer = str
			if(stack.length==0) {
				parser.end()
			}
		}
		, onNumberEnd:function(str) {
			buffer = Number(str,10)
			if(stack.length==0) {
				parser.end()
			}
		}
		, onLiteralEnd:function(str) {
			switch(str) {
				case "true":
					buffer = true
					break
				case "false":
					buffer = false
					break
				case "null":
					buffer = null
					break
				case "undefined":
					buffer = undefined
					break
				default:
					if(looking_for_key) buffer = str
					else throw new Error(str)
			}
			if(stack.length==0) {
				parser.end()
			}
		}
		, onArrayStart:function() {
			stack.push(obj = [])
		}
		, onArrayEnd:function() {
			buffer = stack.pop()
			obj = stack[stack.length-1]
			if(stack.length) {
				return
			}
			parser.end()
		}
		, onArrayValueEnd:function() {
			obj[obj.length] = buffer
		}
		, onError:function(err) {
			throw new Error(err)
		}
	})
	parser.parseChunk(str)
	return buffer
}