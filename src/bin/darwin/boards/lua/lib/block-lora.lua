require("block")

wcBlock.lora = {}

function wcBlock.lora.join(id, band, dr, retx, adr, DevEUI, AppEUI, AppKey)
	try(
		function()
			local instance = "_lora"
	
			if (_G[instance] == nil) then
			    _G[instance] = lora.setup(band)		
			end
			
			if (os.flashEUI() == nil) then
				lora.setDevEui(DevEUI)
			end

			lora.setAppEui(AppEUI)
			lora.setAppKey(AppKey)
			lora.setDr(dr)
			lora.setAdr(adr)
			lora.setReTx(retx)
			lora.join()
		end,
	    function(where, line, err, message)
			wcBlock.blockError(id, err, message)
		end
	)
end

function wcBlock.lora.tx(id, otaa, band, dr, retx, adr, a1, a2, a3, confirmed, payload, port)
	try(
		function()
			local instance = "_lora"
	
			if (_G[instance] == nil) then
			    _G[instance] = lora.setup(band)		
			end
			
			lora.setDr(dr)
			lora.setAdr(adr)
			lora.setReTx(retx)

			if (otaa) then
				if (os.flashEUI() == nil) then
					lora.setDevEui(DevEUI)
				end

				lora.setAppEui(a2)
				lora.setAppKey(a3)
			else
				lora.setDevAddr(a1)
				lora.setNwksKey(a2)
				lora.setAppsKey(a1)
			end
			
			lora.tx(confirmed,port,payload)
		end,
	    function(where, line, err, message)
			wcBlock.blockError(id, err, message)
		end
	)
end