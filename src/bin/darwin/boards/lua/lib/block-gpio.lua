require("block")

wcBlock.gpio = {}

function wcBlock.gpio.set(id, gpio, value)
	try(
		function()
			pio.pin.setdir(pio.OUTPUT, gpio)
			pio.pin.setpull(pio.NOPULL, gpio)
			pio.pin.setval(value, gpio)	
		end,
	    function(where, line, err, message)
			wcBlock.blockError(id, err, message)
		end
	)
end

function wcBlock.gpio.get(id, gpio)
	local ret
	
	try(
		function()
			pio.pin.setdir(pio.INPUT, gpio)
			pio.pin.setpull(pio.PULLUP, gpio)
			ret = pio.pin.getval(gpio)
		end,
	    function(where, line, err, message)
			wcBlock.blockError(id, err, message)
		end
	)	
	
	return ret
end