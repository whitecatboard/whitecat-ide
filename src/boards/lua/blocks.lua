wcBlock = {}
wcBlock.sensor = {}

function wcBlock.sensor.read(id, type, magnitude, ...)
	-- Setup sensor, if needed
	local sensor_var = "_sensor"..id.."_"..type
	if (_G[sensor_var] == nil) then
		_G[sensor_var] = sensor.setup(type, ...)
	end
	
	-- Read
	return _G[sensor_var]:read(magnitude)
end
