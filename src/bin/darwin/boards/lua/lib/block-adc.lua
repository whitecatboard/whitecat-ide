require("block")

wcBlock.adc = {}

function wcBlock.adc.get(id, channel)
	local raw = nil
	local mvolts = nil
	
	try(
		function()
			local instance = "_adc"..channel
	
			if (_G[instance] == nil) then
			    _G[instance] = adc.setup(adc.ADC1, channel, 12)
			end

			raw, mvolts = _G[instance]:read()
		end,
	    function(where, line, err, message)
			wcBlock.blockError(id, err, message)
		end
	)
	
	return raw, mvolts
end