require("block")

wcBlock.event = {}

function wcBlock.event.whenBoardStarts(id, func)
	thread.start(function()
		wcBlock.blockStart(id)
		func()
		wcBlock.blockEnd(id)
	end)
end

function wcBlock.event.whenIReceive(id, eid, func)
	local instance = "_"..eid
	
	if (_G[instance] == nil) then
		_G[instance] = event.create()
	end
	
	_G[instance]:addlistener(function()
		thread.start(function()
			wcBlock.blockStart(id)
			func()
			wcBlock.blockEnd(id) 
		end)
	end)
end

function wcBlock.event.broadcast(id, eid, wait)
	local instance = "_"..eid
	
	_G[instance]:broadcast(wait)
end

function wcBlock.event.whenIReceiveLoraFrame(id, func)
	lora.whenReceived(function(port, payload)
		func(port, payload)
	end)
end