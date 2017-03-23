require("block")

wcBlock.pwm = {}

function wcBlock.pwm.set(id, gpio, frequency, duty)
	try(
		function()
			local instance = "_pwm"..gpio
	
			if (_G[instance] == nil) then
			    _G[instance] = pwm.attach(gpio, frequency, duty)
		
				_G[instance]:start()
			else
				_G[instance]:setduty(duty)
			end
		end,
	    function(where, line, err, message)
			wcBlock.blockError(id, err, message)
		end
	)
end