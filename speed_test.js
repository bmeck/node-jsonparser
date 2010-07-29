var count = 100000000
var start,end;
var x=0
start=Date.now()
for(var i=0;i<count;i++)
	switch("a") {
		case "b":
		case "a":
			x++
	}

end = Date.now()
console.log(end-start)
console.log(x)

x=0
start=Date.now()
var a = "a".charCodeAt(0)
for(var i=0;i<count;i++)
	switch(a) {
		case 98:
		case 97:
			x++
			break
	}

end = Date.now()
console.log(end-start)
console.log(x)