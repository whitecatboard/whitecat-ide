do
	local first_mod = false
	local prev_mod = false;
	
	function __m_ena(n,i)
	    local ena = (i ~= nil)
		
		if (prev_mod) then
			io.write(",")
		end
		
	    if (ena) then
	        io.write("\""..n.."\": true")
	    else
	        io.write("\""..n.."\": false")
	    end
		
		prev_mod = true
	end
	
	function __m_pin_map(name)
		local unit
		local sv
		local signal
		local pin
		
		io.write("\""..name.."\":[")
		
		if (_G[name] ~= nil) then
			if (_G[name].pins ~= nil) then
				for unit,sv in pairs(_G[name].pins(true)) do
					io.write("{\""..sv.id.."\":{")
					for signal,pin in pairs(sv) do
						if (signal ~= "id") then
							io.write("\""..signal.."\":\""..pin.."\",")
						end
					end 
					io.write("},},")
				end
			end
		end
		
		io.write("],")
	end
	
	function __m_pin_maps()
		io.write("\"pinMap\":{")
		__m_pin_map("spi")
		__m_pin_map("i2c")
		__m_pin_map("uart")
		io.write("},")
	end
	
	function __m_exceptions(name)
		io.write("\""..name.."\": ")
		io.write("[")
		if (_G[name] ~= nil) then
			if (_G[name].error ~= nil) then
				for key in pairs(_G[name].error) do
					io.write("\""..key.."\",")
				end
			end
		end
		io.write("],")
	end

	function __cpu()
	    local curr_os, curr_ver, curr_build, curr_commit = os.version()
		local type, subtype, brand = os.board()
		
		if (subtype == nil) then
			subtype = ""
		end

		if (brand == nil) then
			brand = ""
		end
		
	    io.write("\"cpu\": \""..os.cpu().."\",")
	    io.write("\"os\": \""..curr_os.."\",")
	    io.write("\"version\": \""..curr_ver.."\",")
	    io.write("\"build\": \""..curr_build.."\",")
	    io.write("\"commit\": \""..curr_commit.."\",")
	    io.write("\"board\": \""..type.."\",")
	    io.write("\"subtype\": \""..subtype.."\",")
	    io.write("\"brand\": \""..brand.."\",")
		
		isOTA = (not (string.find(subtype, "OTA") == nil)) or (not (string.find(subtype, "OTA-") == nil))
		
		if (isOTA) then
			io.write("\"ota\": true,")
		else
			io.write("\"ota\": false,")
		end
	end

	function __status()
	    local shell = false
	    local history = false
	    
	    io.write("\"status\": ")
		io.write("{")
		
		try(
		    function()
		        shell = os.shell()
		        history = os.history()
		    end,
		    function(where, line, error, message)
		    end
	    )
	
	    if (shell) then
	        shell = "true"
	    else
	        shell = "false"
	    end

	    if (history) then
	        history = "true"
	    else
	        history = "false"
	    end

	    io.write("\"shell\": "..shell..",")
	    io.write("\"history\": "..history..",")
		
		io.write("}")
    end
    
	function __mods()
	    io.write("\"modules\": ")
		io.write("{")
	    __m_ena("thread",thread)
	    __m_ena("nvs",nvs)
	    __m_ena("pack",pack)
	    __m_ena("adc",adc)
	    __m_ena("i2c",i2c)
	    __m_ena("pio",pio)
	    __m_ena("pwm",pwm)
	    __m_ena("tft",tft)
	    __m_ena("spi",spi)
	    __m_ena("tmr",tmr)
	    __m_ena("uart",uart)
	    __m_ena("net",net)
	    __m_ena("lora",lora)
	    __m_ena("mqtt",mqtt)
	    __m_ena("sensor",sensor)
	    __m_ena("servo",servo)
	    __m_ena("sdisplay",sdisplay)
	    __m_ena("net",net)
		__m_ena("can",can)
		io.write("},")

	    io.write("\"exceptions\": ")
		io.write("{")
	    __m_exceptions("thread")
	    __m_exceptions("nvs")
	    __m_exceptions("pack")
	    __m_exceptions("adc")
	    __m_exceptions("i2c")
	    __m_exceptions("pio")
	    __m_exceptions("pwm")
	    __m_exceptions("tft")
	    __m_exceptions("spi")
	    __m_exceptions("tmr")
	    __m_exceptions("uart")
	    __m_exceptions("net")
	    __m_exceptions("lora")
	    __m_exceptions("mqtt")
	    __m_exceptions("sensor")
	    __m_exceptions("servo")
	    __m_exceptions("sdisplay")
	    __m_exceptions("net")
		__m_exceptions("can")
		io.write("},")
	end

	function __sensors()
	    io.write("\"sensors\": ")
		io.write("[")
		for sk,sv in pairs(sensor.list(true)) do 
			io.write("{")
			for k,v in pairs(sv) do 
				if (k == "properties") then
					io.write("\"properties\":[")
					for ask,asv in pairs(v) do 
						io.write("{");
						for tsk,tsv in pairs(asv) do 
							io.write("\""..tsk.."\":\""..tsv.."\",")
						end
						io.write("},");
					end
					io.write("],")
				elseif (k == "provides") then
					io.write("\"provides\":[")
					for apk,apv in pairs(v) do 
						io.write("{");
						for tpk,tpv in pairs(apv) do 
							io.write("\""..tpk.."\":\""..tpv.."\",")
						end
						io.write("},");
					end
					io.write("],")
				else
					if (k == "callback") then
						if (v) then
							v = "true"
						else
							v = "false"
						end
					end
					io.write("\""..k.."\":\""..v.."\",")
				end
			end
			io.write("},")
		end
		io.write("],")
	end
	
	function __externalADC()
		prev_mod = false
	    io.write("\"externalADC\": ")
		io.write("{")
	    __m_ena("MCP3008",adc.MCP3008)
	    __m_ena("MCP3208",adc.MCP3208)
	    __m_ena("ADS1115",adc.ADS1115)
	    __m_ena("ADS1015",adc.ADS1015)
		io.write("},")
	end
	
    io.write("{");
    __mods()
	__m_pin_maps()
    __cpu()
    __sensors()
	__externalADC()
    __status()
    io.write("}")
	
	__m_ena = nil
	__mods = nil
	__cpu = nil
	__sensors = nil
	__externalADC = nil
	__status = nil
	
	print("")
end
