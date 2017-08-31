os.loglevel(os.LOG_ERR)

wcBlock = {
	developerMode = true,
	reportLimit = 200,
	messages = {
	}
}

function wcBlock.blockStart(id)
	if (wcBlock.developerMode) then
		if (wcBlock.messages[id] == nil) then
			wcBlock.messages[id] = {}
			wcBlock.messages[id].lastStart = os.clock()
			wcBlock.messages[id].lastEnd = 0
		else
			local _, millis = math.modf(os.clock() - wcBlock.messages[id].lastStart)
			
			millis = millis * 1000
			
			if (millis < wcBlock.reportLimit) then
				return
			else
				wcBlock.messages[id].lastStart = os.clock()
			end
		end
		
		uart.lock(uart.CONSOLE)
		uart.write(uart.CONSOLE,"<blockStart,")
		if id == nil then
			uart.write(uart.CONSOLE,"?")
		else
			uart.write(uart.CONSOLE,tostring(id))
		end
		uart.write(uart.CONSOLE,">\n")
		uart.unlock(uart.CONSOLE)
	end
end

function wcBlock.blockEnd(id)
	if (wcBlock.developerMode) then
		if (wcBlock.messages[id] == nil) then
			wcBlock.messages[id] = {}
			wcBlock.messages[id].lastStart = 0
			wcBlock.messages[id].lastEnd = os.clock()
		else
			local _, millis = math.modf(os.clock() - wcBlock.messages[id].lastEnd)
			
			millis = millis * 1000
			
			if (millis < wcBlock.reportLimit) then
				return
			else
				wcBlock.messages[id].lastEnd = os.clock()
			end
		end

		uart.lock(uart.CONSOLE)
		uart.write(uart.CONSOLE,"<blockEnd,")
		if id == nil then
			uart.write(uart.CONSOLE,"?")
		else
			uart.write(uart.CONSOLE,tostring(id))
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
			uart.write(uart.CONSOLE,tostring(id))
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
	thread.stop()
end