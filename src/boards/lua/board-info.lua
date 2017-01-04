do
	local first_mod = false
	
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
	    io.write("\"build\": \""..curr_build.."\"")
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
		io.write("},")
	end
	
    io.write("{");
    __mods()
    __cpu()
    io.write("}")
	
	__m_ena = nil
	__mods = nil
	__cpu = nil
	
	print("")
end