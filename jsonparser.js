//An EXTREMELY LAX Json parser that supports streaming
//LAX Nature mostly is around the lack of needing commas and colons for mappings
//It also does not expect a single document to be parsed, it expects a list of documents
//
//TODO: Move from single char appends to chunked
//
//onObjectStart()
//onObjectEnd()
//onObjectKeyStart()
//onObjectKeyEnd()
//onObjectValueStart()
//onObjectValueEnd()
//
//onArrayStart()
//onArrayEnd()
//onArrayValueEnd()
//
//onStringStart()
//onStringEnd(string)
//
//onNumberStart()
//onNumberEnd(number)
//
//onLiteralStart()
//onLiteralEnd(string)
//
//onError()

module.exports = function CreateParser(handler) {
	var states = ["looking_for_object"]
	, state = "looking_for_object"
	, buffer = ""
	, buffer_index = 0
	, unicode_buffer = ""
	return {
		reset: function () {
			states = ["looking_for_object"]
			, state = "looking_for_object"
			, buffer = ""
			, buffer_index = 0
			, unicode_buffer = ""
		}
		, end: function () {
			state = "end"
		}
		, parseChunk: function chunk(str) {
			str = String(str)
			var index = 0
			, character
			parse_loop:
			while(index < str.length) {
			//console.log("TODO:"+states)
			//console.log(state)
			character = str.charAt(index)
			switch(state) {
				case "end":
					return
				case "looking_for_comment_end":
					switch(character) {
						case "\n":
						case "\r":
							state = states[states.length-1]
							break
						default:
					}
					index++
					break
				case "looking_for_comment_type":
					switch(character) {
						case "/":
							state = "looking_for_comment_end"
							break
						case "*":
							state = "looking_for_block_comment_end"
							break
						default:
							if(handler.onError) handler.onError("expected '*' or '/' for comment type but got "+JSON.stringify(character))
							state = "error"
					}
					index++
					break
				case "possible_block_comment_end":
					if(character == "/") {
						state = states[states.length-1]
						index++
						break
					}
				case "looking_for_block_comment_end":
					switch(character) {
						case "*":
							state = "possible_block_comment_end"
							break
						default:
					}
					index++
					break
				case "looking_for_unicode_end":
					switch(character) {
						case "a":case "A":case "b":case "B":case "c":case "C":case "d":case "D":
						case "e":case "E":case "f":case "F":
						case "0":case "1":case "2":case "3":case "4":case "5":case "6":case "7":
						case "8":case "9":
							unicode_buffer+=character
							index++
							if(buffer_index==3) {
								unicode_buffer+=String.fromCharCode(Number(unicode_buffer,16))
								state = states[states.length-1]
								break
							}
							buffer_index++
							break
						default:
							//dont error, resolve the unicode to just be a 'u' that is quoted
							buffer+="u"+unicode_buffer
							state = "looking_for_string_end"
					}
					break
				case "looking_for_quote_end":
					switch(character) {
						case "u":
							state = "looking_for_unicode_end"
							buffer_index = 0
							break
						default:
							switch(character) {
								case "b":
									buffer+="\b"
									break
								case "f":
									buffer+="\f"
									break
								case "n":
									buffer+="\n"
									break
								case "r":
									buffer+="\r"
									break
								case "t":
									buffer+="\t"
									break
								default:
									buffer+=character
									break
							}
							state = "looking_for_string_end"
					}
					index++
					break
				case "looking_for_string_end":
					switch(character) {
						case "\"":
							state = states[states.length-1]
							if(handler.onStringEnd) handler.onStringEnd(buffer)
							buffer = ""
							break
						case "\\":
							state = "looking_for_quote_end"
							break
						default:
							buffer += character
					}
					index++
					break
				case "looking_for_single_string_end":
					switch(character) {
						case "'":
							state = states[states.length-1]
							if(handler.onStringEnd) handler.onStringEnd(buffer)
							break
						case "\\":
							state = "looking_for_quote_end"
							break
						default:
							buffer += character
					}
					index++
					break
				case "looking_for_number_end":
					switch(character) {
						case "0":case "1":case "2":case "3":case "4":case "5":case "6":case "7":
						case "8":case "9":
							buffer+=character
							index++
							break
						case ".":
							buffer+=character
							state = "looking_for_number_decimal_end"
							index++
							break
						case "e":
						case "E":
							buffer+=character
							state = "looking_for_number_exponent_end_first"
							index++
							break
						default:
							state = states[states.length-1]
							if(handler.onNumberEnd) handler.onNumberEnd(buffer)
							break
					}
					break
				case "looking_for_number_decimal_end":
					switch(character) {
						case "0":case "1":case "2":case "3":case "4":case "5":case "6":case "7":
						case "8":case "9":
							buffer+=character
							index++
							break
						case "e":
						case "E":
							buffer+=character
							state = "looking_for_number_exponent_end_first"
							index++
							break
						default:
							state = states[states.length-1]
							if(handler.onNumberEnd) handler.onNumberEnd(buffer)
							break
					}
					break
				case "looking_for_number_exponent_end_first":
					var used = false
					switch(character) {
						case "+":
						case "-":
							used = true
							buffer+=character
							index++
					}
					if(used) break
				case "looking_for_number_exponent_end":
					switch(character) {
						case "0":case "1":case "2":case "3":case "4":case "5":case "6":case "7":
						case "8":case "9":
							buffer+=character
							index++
							break
						default:
							state = states[states.length-1]
							if(handler.onNumberEnd) handler.onNumberEnd(buffer)
							break
					}
					break
				case "looking_for_literal_end":
					switch(character) {
						case "a":case "b":case "c":case "d":case "e":case "f":case "g":case "h":
						case "i":case "j":case "k":case "l":case "m":case "n":case "o":case "p":
						case "q":case "r":case "s":case "t":case "u":case "v":case "w":case "x":
						case "y":case "z":
						case "A":case "B":case "C":case "D":case "E":case "F":case "G":case "H":
						case "I":case "J":case "K":case "L":case "M":case "N":case "O":case "P":
						case "Q":case "R":case "S":case "T":case "U":case "V":case "W":case "X":
						case "Y":case "Z":
						case "_":
						case "0":case "1":case "2":case "3":case "4":case "5":case "6":case "7":
						case "8":case "9":
						case "$":
							buffer+=character
							index++;
							break
						default:
							state = states[states.length-1]
							if(handler.onLiteralEnd) handler.onLiteralEnd(buffer)
							break
					}
					break
				case "array_value_end":
					if(handler.onArrayValueEnd) handler.onArrayValueEnd()
					states.pop()
					state = "looking_for_array_end"
				case "looking_for_array_end":
					var used = false
					switch(character) {
						case "]":
							index++
							used = true
							states.pop()
							state = states.pop()
							if(handler.onArrayEnd) handler.onArrayEnd()
							break
						case ",":
							used = true
							index++
							break
					}
					if(used) break
				case "looking_for_object":
					switch(character) {
						case "/":
							state = "looking_for_comment_type"
						case " ":
						case "\r":
						case "\n":
						case "\f":
						case "\v":
							index++
							break
						case "{":
							if(state == "looking_for_array_end") states.push("array_value_end")
							state = "looking_for_object_end"
							states.push(state)
							if(handler.onObjectStart) handler.onObjectStart()
							index++
							break
						case "[":
							if(state == "looking_for_array_end") states.push("array_value_end")
							state = "looking_for_array_end"
							states.push(state)
							if(handler.onArrayStart) handler.onArrayStart()
							index++
							break
						case "\"":
							buffer = ""
							if(state == "looking_for_array_end") states.push("array_value_end")
							state = "looking_for_string_end"
							if(handler.onStringStart) handler.onStringStart()
							index++
							break
						case "'":
							buffer = ""
							if(state == "looking_for_array_end") states.push("array_value_end")
							state = "looking_for_single_string_end"
							if(handler.onStringStart) handler.onStringStart()
							index++
							break
						case "a":case "b":case "c":case "d":case "e":case "f":case "g":case "h":
						case "i":case "j":case "k":case "l":case "m":case "n":case "o":case "p":
						case "q":case "r":case "s":case "t":case "u":case "v":case "w":case "x":
						case "y":case "z":
						case "A":case "B":case "C":case "D":case "E":case "F":case "G":case "H":
						case "I":case "J":case "K":case "L":case "M":case "N":case "O":case "P":
						case "Q":case "R":case "S":case "T":case "U":case "V":case "W":case "X":
						case "Y":case "Z":
						case "_":case "$":
							buffer = character
							index++
							if(state == "looking_for_array_end") states.push("array_value_end")
							if(handler.onLiteralStart) handler.onLiteralStart()
							state = "looking_for_literal_end"
							break
						case "-":
						case "0":case "1":case "2":case "3":case "4":case "5":case "6":case "7":
						case "8":case "9":
							buffer = character
							index++
							if(state == "looking_for_array_end") states.push("array_value_end")
							if(handler.onNumberStart) handler.onNumberStart()
							state = "looking_for_number_end"
							break
						case ".":
							buffer = character
							index++
							if(state == "looking_for_array_end") states.push("array_value_end")
							if(handler.onNumberStart) handler.onNumberStart()
							state = "looking_for_number_decimal_end"
							break
						default:
							state = "error"
							if(handler.onError) handler.onError("Expected start of object but found "+JSON.stringify(character))
							index++
					}
					break
				case "looking_for_object_end":
					switch(character) {
						case "}":
							index++
							state =	states.pop()
							if(handler.onObjectEnd) handler.onObjectEnd()
							break
						case "/":
							state = "looking_for_comment_type"
						case ",":
						case " ":
						case "\r":
						case "\n":
						case "\f":
						case "\v":
							index++
							break
						case "\"":
						case "'":
						case "a":case "b":case "c":case "d":case "e":case "f":case "g":case "h":
						case "i":case "j":case "k":case "l":case "m":case "n":case "o":case "p":
						case "q":case "r":case "s":case "t":case "u":case "v":case "w":case "x":
						case "y":case "z":
						case "A":case "B":case "C":case "D":case "E":case "F":case "G":case "H":
						case "I":case "J":case "K":case "L":case "M":case "N":case "O":case "P":
						case "Q":case "R":case "S":case "T":case "U":case "V":case "W":case "X":
						case "Y":case "Z":
						case "_":case "$":
						case "-":
						case "0":case "1":case "2":case "3":case "4":case "5":case "6":case "7":
						case "8":case "9":
						case ".":
							if(handler.onObjectKeyStart) handler.onObjectKeyStart()
							states.push("looking_for_object_key_end")
							state = "looking_for_object"
							break

						default:
							state = "error"
							if(handler.onError) handler.onError("Expected one of '}\\'\"\\d-[a-zA-Z_,]' but found "+JSON.stringify(character))
							index++
					}
					break
				case "looking_for_object_key_end":
					if(handler.onObjectKeyEnd) handler.onObjectKeyEnd()
					states.pop()
					state = "looking_for_object_value"
				case "looking_for_object_value":
					switch(character) {
						case "/":
							state = "looking_for_comment_type"
						case ":":
						case " ":
						case "\r":
						case "\n":
						case "\f":
						case "\v":
							index++
							break
						case "\"":
						case "'":
						case "a":case "b":case "c":case "d":case "e":case "f":case "g":case "h":
						case "i":case "j":case "k":case "l":case "m":case "n":case "o":case "p":
						case "q":case "r":case "s":case "t":case "u":case "v":case "w":case "x":
						case "y":case "z":
						case "A":case "B":case "C":case "D":case "E":case "F":case "G":case "H":
						case "I":case "J":case "K":case "L":case "M":case "N":case "O":case "P":
						case "Q":case "R":case "S":case "T":case "U":case "V":case "W":case "X":
						case "Y":case "Z":
						case "_":case "$":
						case "-":
						case "0":case "1":case "2":case "3":case "4":case "5":case "6":case "7":
						case "8":case "9":
						case ".":
						case "{":
						case "[":
							if(handler.onObjectValueStart) handler.onObjectValueStart()
							states.push("looking_for_object_value_end")
							state = "looking_for_object"
							break

						default:
							state = "error"
							if(handler.onError) handler.onError("Expected one of '{[\\'\"\\d-\s[.a-zA-Z_:$]' but found "+JSON.stringify(character))
							index++
					}
					break
				case "looking_for_object_value_end":
					if(handler.onObjectValueEnd) handler.onObjectValueEnd()
					states.pop()
					state = "looking_for_object_end"
					break
				case "error":
					return
			}
			}
		}
	}
}