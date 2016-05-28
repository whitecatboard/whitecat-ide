/*
 * Whitecat Blocky Environment, stk500v2 bootloader update
 *
 * Inspired on code from: https://github.com/sergev/pic32prog
 * 
 * Copyright (C) 2014-2015 Serge Vakulenko
 *
 * This file is part of PIC32PROG project, which is distributed
 * under the terms of the GNU General Public License (GPL).
 * See the accompanying file "COPYING" for more details.
 *
 * -----
 *
 * Adapted for Whitecat Blocky Environment
 * 
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L. & CSS IBÉRICA, S.L.
 * 
 * Author: Jaume Olivé (jolive@iberoxarxa.com / jolive@whitecatboard.org)
 * 
 */

var stk500 = {};

stk500.seq = 0;

stk500.MESSAGE_START = 0x1b;
stk500.TOKEN = 0x0e;
stk500.CMD_SIGN_ON = 0x01;
stk500.CMD_SET_PARAMETER = 0x02;
stk500.CMD_GET_PARAMETER = 0x03;
stk500.CMD_LOAD_ADDRESS = 0x06;
stk500.CMD_ENTER_PROGMODE_ISP = 0x10;
stk500.CMD_LEAVE_PROGMODE_ISP = 0x11;
stk500.CMD_CHIP_ERASE_ISP = 0x12;
stk500.CMD_PROGRAM_FLASH_ISP = 0x13;
stk500.STATUS_CMD_OK = 0;

stk500.ERR_INVALID_HEADER = -1;
stk500.ERR_INVALID_LENGTH = -2;
stk500.ERR_INVALID_CHECKSUM = -3;
stk500.ERR_INVALID_RESPONSE = -4;
stk500.ERR_INVALID_STATUS = -5;
stk500.ERR_INVALID_SIGNATURE = -6;
stk500.ERR_CANNOT_ENTER_PROGMODE_ISP = -7;
stk500.ERR_CANNOT_SET_PARAMETER = -8;
stk500.ERR_CANNOT_GET_PARAMETER = -9;
stk500.ERR_INVALID_DEVICEID = -10;
stk500.ERR_CANNOT_LOAD_ADDRES = -11;
stk500.ERR_CANNOT_PROGRAM_FLASH_ISP = -12;
stk500.ERR_CANNOT_ERASE_CHIP = -13;
stk500.ERR_TIMEOUT = -14;

stk500.PARAM_CK_DEVID_LOW = 0x44;
stk500.PARAM_CK_DEVID_MID = 0x45;
stk500.PARAM_CK_DEVID_HIGH = 0x46;
stk500.PARAM_CK_DEVID_TOP = 0x47;

stk500.blockSize  = 1024;
stk500.flashSize  = 2048 * 1024;
stk500.flashVBase = 0x9d000000;
stk500.flashPBase = 0x1d000000;
stk500.pageBytes  = 256;

stk500.checksum = function(data, length) {
	var checksum = 0;
	
    for (var i = 0; i < length; ++i) {
      checksum ^= data[i];
    }	

	return checksum;
};

stk500.msb = function(data) {
	return (data & 0xff00) >> 8;
}

stk500.lsb = function(data) {
	return (data & 0x00ff);
}

stk500.message = function(port, body, callback) {
	var currentTimeOut;
	
	// Receiver states
	var waitForHeader = true;
	var waitForData = true;
	var waitForChecksum = true;


	// Receiver data
	var received = 0;
	var respLength = 0;
	var respChecksum = 0;
	var respHeader = new Uint8Array(5);
	var respData = new Uint8Array(0);
	
	function messageListener(info) {
		var bytes = new Uint8Array(info.data);

	    if (info.connectionId == port.connId && info.data) {
			for(var i = 0; i < bytes.length; i++) {
				// Get header bytes
				if (waitForHeader) {
					if (received < 5) {
						// One header byte more
						respHeader[received++] = bytes[i];
						continue;
					} else {
						// Header is readed
						waitForHeader = false;
						
						// Some sanity checks
						if (
							(respHeader[0] != stk500.MESSAGE_START) ||
							(respHeader[1] != stk500.seq) ||
							(respHeader[4] != stk500.TOKEN)
						) {
							chrome.serial.onReceive.removeListener(messageListener);
							clearTimeout(currentTimeOut);
							callback(null, stk500.ERR_INVALID_HEADER);
							break;
						}
						
						// Response length
						respLength = (respHeader[2] << 8) | respHeader[3];

						// Some sanity checks
						if (respLength == 0) {
							chrome.serial.onReceive.removeListener(messageListener);
							clearTimeout(currentTimeOut);
							callback(null, stk500.ERR_INVALID_LENGTH);
							break;
						}

						// Make room for response data
						respData = new Uint8Array(respLength);
						received = 0;						
					}					
				}
				
				// Get response data (don't read checksum)
				if (waitForData) {
					if (received < respLength) {
						respData[received++] = bytes[i];
						continue;
					} else {
						// Data is readed
						waitForData = false;						
					}
				}
				
				// Get checksum
				if (waitForChecksum) {
					respChecksum = bytes[i];
					waitForChecksum = false;

					var expectedChecksum = 0;
					
					// Header
					for(var j = 0; j < respHeader.length; j++) {
						expectedChecksum ^= respHeader[j];
					}
					
					// Data
					for(var j = 0; j < respData.length; j++) {
						expectedChecksum ^= respData[j];
					}

					// Check
					if (respChecksum != expectedChecksum) {
						chrome.serial.onReceive.removeListener(messageListener);
						clearTimeout(currentTimeOut);
						callback(null, stk500.ERR_INVALID_CHECKSUM);
						break;
					}

					chrome.serial.onReceive.removeListener(messageListener);
					clearTimeout(currentTimeOut);
					callback(respData);
				}
			}
		}
	}

	if (stk500.seq == 0xff) {
		stk500.seq = 0;
	}
	
	// Build message buffer
    var msg = new Uint8Array(6 + body.length);
	var b = 0;
	
	msg[b++] = stk500.MESSAGE_START;  	 // Message start
    msg[b++] = ++stk500.seq;		     // Sequence
	msg[b++] = stk500.msb(body.length);	 // Message size - msb
	msg[b++] = stk500.lsb(body.length);	 // Message size - lsb
	msg[b++] = stk500.TOKEN;	  	     // Token
	
	// Body
	for(var i = 0; i < body.length; i++) {
		msg[b++] = body[i];
	}

	msg[b++] = stk500.checksum(msg, b);  // Checksum

	function timeout() {
		chrome.serial.onReceive.removeListener(messageListener);
		callback(null, stk500.ERR_TIMEOUT);
	}

	// Set a timeout
	currentTimeOut = setTimeout(function(){
		timeout();
	}, 2000);
	
	// Send message
	chrome.serial.flush(port.connId, function(result) {
		chrome.serial.onReceive.addListener(messageListener);
		chrome.serial.send(port.connId, msg.buffer, function(info) {
		});	
	});
};

stk500.signOn = function(port, callback) {
	var b = 0;
    var bytes = new Uint8Array(1);
	
	bytes[b++] = stk500.CMD_SIGN_ON;

	stk500.message(port, bytes, 
		function(data, error) {
			if (data != null) {
				// Sanity checks
				if (data[0] != stk500.CMD_SIGN_ON) {
					callback(null, stk500.ERR_INVALID_RESPONSE);
				}

				if (data[1] != stk500.STATUS_CMD_OK) {
					callback(null, stk500.ERR_INVALID_STATUS);
				}
			
				var length = data[2];
				var signature = "";
				for(var i = 0; i < length; i++) {
					signature += String.fromCharCode(data[3 + i]);
				}

				callback(signature, error);				
			} else {
				callback(null, error);
			}
		}
	);
};

stk500.enterProgmodeIsp = function(port, callback) {
	var b = 0;
    var bytes = new Uint8Array(12);
	
	bytes[b++] = stk500.CMD_ENTER_PROGMODE_ISP;
	
	bytes[b++] = 200;   // timeout in msec
	bytes[b++] = 100;   // pin stabilization delay in msec
	bytes[b++] = 25;    // command execution delay in msec
	bytes[b++] = 32;    // number of synchronization loops
	bytes[b++] = 0;     // per byte delay
	bytes[b++] = 0x53;  // poll value, 53h for AVR, 69h for AT89xx
	bytes[b++] = 0x3;   // poll index, 3 for AVR, 4 for AT89xx
	bytes[b++] = 0xac;
	bytes[b++] = 0x53;
	bytes[b++] = 0x00;
	bytes[b++] = 0x00;

	stk500.message(port, bytes, 
		function(data) {
			// Sanity checks
			if (data[0] != stk500.CMD_ENTER_PROGMODE_ISP) {
				callback(null, stk500.ERR_INVALID_RESPONSE);
			}

			if (data[1] != stk500.STATUS_CMD_OK) {
				callback(null, stk500.ERR_CANNOT_ENTER_PROGMODE_ISP);
			}

			callback(data);
		}
	);	
};

stk500.exitProgmodeIsp = function(port, callback) {
	var b = 0;
    var bytes = new Uint8Array(4);
	
	bytes[b++] = stk500.CMD_LEAVE_PROGMODE_ISP;
	
	bytes[b++] = 0x01; // pre-delay in msec
	bytes[b++] = 0x01; // post-delay in msec

	stk500.message(port, bytes, 
		function(data) {
			// Sanity checks
			if (data[0] != stk500.CMD_LEAVE_PROGMODE_ISP) {
				callback(null, stk500.ERR_INVALID_RESPONSE);
			}

			if (data[1] != stk500.STATUS_CMD_OK) {
				callback(null, stk500.ERR_CANNOT_ENTER_PROGMODE_ISP);
			}

			callback(data);
		}
	);	
};

stk500.setParameter = function(port, param, val, callback) {
	var b = 0;
    var bytes = new Uint8Array(3);
	
	bytes[b++] = stk500.CMD_SET_PARAMETER;
	bytes[b++] = param;
	bytes[b++] = val;

	stk500.message(port, bytes, 
		function(data) {
			// Sanity checks
			if (data[0] != stk500.CMD_SET_PARAMETER) {
				callback(null, stk500.ERR_INVALID_RESPONSE);
			}

			if (data[1] != stk500.STATUS_CMD_OK) {
				callback(null, stk500.ERR_CANNOT_SET_PARAMETER);
			}

			callback(data);
		}
	);		
}

stk500.getParameter = function(port, param, callback) {
	var b = 0;
    var bytes = new Uint8Array(2);
	
	bytes[b++] = stk500.CMD_GET_PARAMETER;
	bytes[b++] = param;
	
	stk500.message(port, bytes, 
		function(data) {
			// Sanity checks
			if (data[0] != stk500.CMD_GET_PARAMETER) {
				callback(null, stk500.ERR_INVALID_RESPONSE);
			}

			if (data[1] != stk500.STATUS_CMD_OK) {
				callback(null, stk500.ERR_CANNOT_GET_PARAMETER);
			}

			callback(data[2]);
		}
	);		
}

stk500.getDeviceId = function(port, callback) {
	var id = 0;
	
	stk500.setParameter(port, stk500.PARAM_CK_DEVID_LOW, 0x0b, function() {
		stk500.setParameter(port, stk500.PARAM_CK_DEVID_MID, 0xb0, function() {
			stk500.setParameter(port, stk500.PARAM_CK_DEVID_HIGH, 0xaf, function() {
				stk500.setParameter(port, stk500.PARAM_CK_DEVID_TOP, 0xde, function() {
					stk500.getParameter(port, stk500.PARAM_CK_DEVID_LOW, function(data) {
						id = data;
						stk500.getParameter(port, stk500.PARAM_CK_DEVID_MID, function(data) {
							id |= data << 8;
							stk500.getParameter(port, stk500.PARAM_CK_DEVID_HIGH, function(data) {
								id |= data << 16;
								stk500.getParameter(port, stk500.PARAM_CK_DEVID_TOP, function(data) {
									id |= data << 24;
									id = id << 32;
									id = id >>> 32;
									
									callback(id);
								});
							});
						});
					});
				});
			});
		});
	});	
}

stk500.loadAddress = function(port, address, callback) {
	var b = 0;
    var bytes = new Uint8Array(5);
		
	bytes[b++] = stk500.CMD_LOAD_ADDRESS;
	bytes[b++] = (address >> 24) & 0xff;
	bytes[b++] = (address >> 16) & 0xff;
	bytes[b++] = (address >> 8) & 0xff;
	bytes[b++] = (address) & 0xff;
	
	stk500.message(port, bytes, 
		function(data) {
			// Sanity checks
			if (data[0] != stk500.CMD_LOAD_ADDRESS) {
				callback(null, stk500.ERR_INVALID_RESPONSE);
			}

			if (data[1] != stk500.STATUS_CMD_OK) {
				callback(null, stk500.ERR_CANNOT_LOAD_ADDRES);
			}

			callback();
		}
	);		
}

stk500.programFlashIsp = function(port, data, callback) {
	var b = 0;
    var bytes = new Uint8Array(10 + stk500.pageBytes);
	
	bytes[b++] = stk500.CMD_PROGRAM_FLASH_ISP;
	bytes[b++] = (stk500.pageBytes >> 8) & 0xff;
	bytes[b++] = (stk500.pageBytes) & 0xff;
	bytes[b++] = 0;
	bytes[b++] = 0;
	bytes[b++] = 0;
	bytes[b++] = 0;
	bytes[b++] = 0;
	bytes[b++] = 0;
	bytes[b++] = 0;
	
	for (var i = 0; i < data.length; i++) {
		bytes[b++] = data[i];
	}

	stk500.message(port, bytes, 
		function(data) {
			// Sanity checks
			if (data[0] != stk500.CMD_PROGRAM_FLASH_ISP) {
				callback(null, stk500.CMD_PROGRAM_FLASH_ISP);
			}

			if (data[1] != stk500.STATUS_CMD_OK) {
				callback(null, stk500.STATUS_CMD_OK);
			}

			callback();
		}
	);	
}

stk500.programPage = function(port, address, flashData, callback) {
	var data = [];
	var endPageAddress = address + stk500.pageBytes;
	var pages = flashData.length / stk500.pageBytes;
	var page = (address / stk500.pageBytes) + 1;
	var percent = Math.floor(page * 100 / pages);
	
	while (address < endPageAddress) {
		data.push(flashData[address++]);
		data.push(flashData[address++]);
		data.push(flashData[address++]);
		data.push(flashData[address++]);	
    }

	stk500.programFlashIsp(port, data, function() {
		Code.upgradeFirmwareProgress(percent);
		
		if (address < flashData.length) {
			stk500.programPage(port, address, flashData, function() {
				callback();
			});
		} else {
			callback();			
		}
	});
}

stk500.eraseChipIsp = function(port, callback) {
	var b = 0;
    var bytes = new Uint8Array(7);
		
	bytes[b++] = stk500.CMD_CHIP_ERASE_ISP;
	bytes[b++] = 150; 	// erase delay
	bytes[b++] = 0;   	// poll method
	bytes[b++] = 0xac;
	bytes[b++] = 0x80;
	bytes[b++] = 0x00;
	bytes[b++] = 0x00;
	
	stk500.message(port, bytes, 
		function(data) {
			// Sanity checks
			if (data[0] != stk500.CMD_CHIP_ERASE_ISP) {
				callback(null, stk500.ERR_INVALID_RESPONSE);
			}

			if (data[1] != stk500.STATUS_CMD_OK) {
				callback(null, stk500.ERR_CANNOT_ERASE_CHIP);
			}

			callback();
		}
	);		
}

stk500.detect = function(port, callback) {
	stk500.signOn(port, function(data, error) {
		// Sanity checks
		if (data == 'STK500_2') {
			// Get device id
			stk500.getDeviceId(port, function(data) {
				// Sanity checks
				if (data != 0xdeafb00b) {
					callback(false);	
					return;					
				}
				
				callback(true);
			});
		} else {
			callback(false, error);
			return;
		}
	});	
}

stk500.upgradeFirmware = function(port, flashData, callback) {
	var lastAddress = flashData.length;

	if (lastAddress & (stk500.pageBytes - 1)) {
		// Pad last page to fit page size
		for (var i = 0; i < 0xff - (lastAddress & (stk500.pageBytes - 1)) + 1;i++) {
			flashData.push(0xff);
		}
	}
		
	stk500.signOn(port, function(data, error) {
		// Sanity checks
		if (data == 'STK500_2') {
			// Enter in program mode
			stk500.enterProgmodeIsp(port, function(data) {
				// Get device id
				stk500.getDeviceId(port, function(data) {
					// Sanity checks
					if (data != 0xdeafb00b) {
						callback(null, stk500.ERR_INVALID_DEVICEID);
					}

					// Erase chip
					stk500.eraseChipIsp(port, function() {
						Code.upgradeFirmwareProgress(0);
						
						// Load first adress
						stk500.loadAddress(port, 0, function() {
							// Program first page
							stk500.programPage(port, 0x00000000, flashData, function() {
								// Exit from program mode
								stk500.exitProgmodeIsp(port, function(data) {
									callback(null);
								});
							});
						});												
					});
				});
			});
		} else {
			callback(null, stk500.ERR_INVALID_SIGNATURE);
		}
	});
}