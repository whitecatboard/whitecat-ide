require("block")

wcBlock.led = {}

function wcBlock.led.set(id, gpio, value)
	pio.pin.setdir(pio.OUTPUT, gpio)
	pio.pin.setpull(pio.NOPULL, gpio)
	pio.pin.setval(value, gpio)	
end