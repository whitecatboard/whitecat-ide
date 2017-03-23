require("block")

wcBlock.servo = {}

function wcBlock.servo.attach(instance, gpio)
	try(
		function()
			if (_G[instance] == nil) then
				_G[instance] = servo.attach(gpio)
			end
		end,
	    function(where, line, err, message)
			wcBlock.blockError(id, err, message)
		end
	)
end

function wcBlock.servo.move(id, gpio, value)
	try(
		function()
			local instance = "_servo"..gpio
	
			wcBlock.servo.attach(instance, gpio)
	
			_G[instance]:write(value)
		end,
	    function(where, line, err, message)
			wcBlock.blockError(id, err, message)
		end
	)
end