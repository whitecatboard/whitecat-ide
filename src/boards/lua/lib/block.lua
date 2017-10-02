os.loglevel(os.LOG_ERR)

wcBlock = {
	developerMode = true,
	reportLimit = 200,
	mutex = thread.createmutex(),
	messages = {
	}
}

function wcBlock.blockStart(id)
    wcBlock.mutex:lock()
	if (wcBlock.developerMode) then
		if (wcBlock.messages[id] == nil) then
			wcBlock.messages[id] = {}
			wcBlock.messages[id].lastStart = os.clock()
			wcBlock.messages[id].lastEnd = 0
		else
			local _, millis = math.modf(os.clock() - wcBlock.messages[id].lastStart)
			
			millis = millis * 1000
			
			if (millis < wcBlock.reportLimit) then
			    wcBlock.mutex:unlock()
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
    wcBlock.mutex:unlock()
end

function wcBlock.blockEnd(id)
    wcBlock.mutex:lock()
	if (wcBlock.developerMode) then
		if (wcBlock.messages[id] == nil) then
			wcBlock.messages[id] = {}
			wcBlock.messages[id].lastStart = 0
			wcBlock.messages[id].lastEnd = os.clock()
		else
			local _, millis = math.modf(os.clock() - wcBlock.messages[id].lastEnd)
			
			millis = millis * 1000
			
			if (millis < wcBlock.reportLimit) then
            	wcBlock.mutex:unlock()
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
	wcBlock.mutex:unlock()
end

function wcBlock.blockError(id, err, msg)
	wcBlock.mutex:lock()
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
	wcBlock.mutex:unlock()
	thread.stop()
end