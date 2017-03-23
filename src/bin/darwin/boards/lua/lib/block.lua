os.loglevel(os.LOG_ERR)

wcBlock = {
	delevepMode = true
}

function wcBlock.blockStart(id)
	if (wcBlock.delevepMode) then
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
	if (wcBlock.delevepMode) then
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
	if (wcBlock.delevepMode) then
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
	
	error(err..":"..msg)
end