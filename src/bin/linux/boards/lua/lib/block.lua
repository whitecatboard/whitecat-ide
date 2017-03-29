os.loglevel(os.LOG_ERR)

wcBlock = {
	developerMode = true
}

function wcBlock.blockStart(id)
	if (wcBlock.developerMode) then
		uart.lock(uart.CONSOLE)
		uart.write(uart.CONSOLE,"<blockStart,")
		if id == nil then
			uart.write(uart.CONSOLE,"?")
		else
			uart.write(uart.CONSOLE,id)
		end
		uart.write(uart.CONSOLE,">\n")
		uart.unlock(uart.CONSOLE)
	end
end

function wcBlock.blockEnd(id)
	if (wcBlock.developerMode) then
		uart.lock(uart.CONSOLE)
		uart.write(uart.CONSOLE,"<blockEnd,")
		if id == nil then
			uart.write(uart.CONSOLE,"?")
		else
			uart.write(uart.CONSOLE,id)
		end
		uart.write(uart.CONSOLE,">\n")
		uart.unlock(uart.CONSOLE)
	end
end

function wcBlock.blockError(id, err, msg)
	if (wcBlock.developerMode) then
		uart.lock(uart.CONSOLE)
		uart.write(uart.CONSOLE,"<blockError,")
		if id == nil then
			uart.write(uart.CONSOLE,"?")
		else
			uart.write(uart.CONSOLE,id)
		end
		uart.write(uart.CONSOLE,",")
		if msg == nill then
			uart.write(uart.CONSOLE,"?")
		else
			uart.write(uart.CONSOLE,msg)
		end
		uart.write(uart.CONSOLE,">\n")
		uart.unlock(uart.CONSOLE)
	end
	
	thread.stop();
	-- error(err..":"..msg)
end