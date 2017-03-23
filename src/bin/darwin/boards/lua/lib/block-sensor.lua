require("block")

wcBlock.sensor = {}

function wcBlock.sensor.attach(instance, type, args)
	try(
		function()
			if (_G[instance] == nil) then
				_G[instance] = sensor.setup(type, table.unpack(args))
			end
		end,
	    function(where, line, err, message)
			wcBlock.blockError(id, err, message)
		end
	)
end

function wcBlock.sensor.read(id, sid, type, magnitude, ...)
	local args = {...}
	local ret
	
	try(
		function()
			local instance = "_"..sid.."_"..type
	
			wcBlock.sensor.attach(instance, type, args)
	
			ret = _G[instance]:read(magnitude)
		end,
	    function(where, line, err, message)
			wcBlock.blockError(id, err, message)
		end
	)
	
	return ret
end

function wcBlock.sensor.set(id, sid, type, setting, value, ...)
	local args = {...}
	local ret
	
	try(
		function()
			local instance = "_"..sid.."_"..type
	
			wcBlock.sensor.attach(instance, type, args)
	
			ret = _G[instance]:set(setting, value)
		end,
	    function(where, line, err, message)
			wcBlock.blockError(id, err, message)
		end
	)
	
	return ret
end