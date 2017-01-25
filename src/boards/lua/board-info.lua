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

	function __cpu()
	    local curr_os, curr_ver, curr_build = os.version();
	    io.write("\"cpu\": \""..os.cpu().."\",")
	    io.write("\"os\": \""..curr_os.."\",")
	    io.write("\"version\": \""..curr_ver.."\",")
	    io.write("\"build\": \""..curr_build.."\",")
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
	    __m_ena("screen",screen)
	    __m_ena("spi",spi)
	    __m_ena("tmr",tmr)
	    __m_ena("uart",uart)
	    __m_ena("net",net)
	    __m_ena("lora",lora)
	    __m_ena("mqtt",mqtt)
	    __m_ena("sensor",sensor)
		io.write("},")
	end
	
	function __sensors()
	    io.write("\"sensors\": ")
		io.write("[")
		for sk,sv in pairs(sensor.list(true)) do 
			io.write("{")
			for k,v in pairs(sv) do 
				if (k == "settings") then
					io.write("\"settings\":[")
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
					io.write("\""..k.."\":\""..v.."\",")
				end
			end
			io.write("},")
		end
		io.write("],")
	end
	
    io.write("{");
    __mods()
    __cpu()
    __sensors()
    io.write("}")
	
	__m_ena = nil
	__mods = nil
	__cpu = nil
	__sensors = nil
	
	print("")
end