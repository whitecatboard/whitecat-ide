/*
 * Whitecat Blocky Environment, whitecat board definition
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L. & CSS IBÉRICA, S.L.
 * 
 * Author: Jaume Olivé (jolive@iberoxarxa.com / jolive@whitecatboard.org)
 * 
 * All rights reserved.  
 *
 * Permission to use, copy, modify, and distribute this software
 * and its documentation for any purpose and without fee is hereby
 * granted, provided that the above copyright notice appear in all
 * copies and that both that the copyright notice and this
 * permission notice and warranty disclaimer appear in supporting
 * documentation, and that the name of the author not be used in
 * advertising or publicity pertaining to distribution of the
 * software without specific, written prior permission.
 *
 * The author disclaim all warranties with regard to this
 * software, including all implied warranties of merchantability
 * and fitness.  In no event shall the author be liable for any
 * special, indirect or consequential damages or any damages
 * whatsoever resulting from loss of use, data or profits, whether
 * in an action of contract, negligence or other tortious action,
 * arising out of or in connection with the use or performance of
 * this software.
 */

var Whitecat = {};

Whitecat.chunkSize = 255;

Whitecat.ports = [];
Whitecat.port = {};

Whitecat.ERR_TIMEOUT = -1;
Whitecat.ERR_INVALID_RESPONSE = -2;
Whitecat.ERR_CONNECTION_ERROR = -4;

Whitecat.inDetect = false;
Whitecat.detectInterval = null;

Whitecat.currentPort = function() {
	for (var i = 0; i < Whitecat.ports.length; i++) {
		if (Whitecat.ports[i].connId != null) {
			return Whitecat.ports[i];
		}
	}

	return null;	
}

Whitecat.isConnected = function() {
	for (var i = 0; i < Whitecat.ports.length; i++) {
		if ((Whitecat.ports[i].connId != null) && (Whitecat.ports[i].phase == 4)) {
			return true;
		}
	}

	return false;
}

Whitecat.port.isNew = function(path) {
	var finded = false;
	
	for (var i = 0; i < Whitecat.ports.length; i++) {
		finded = (Whitecat.ports[i].path == path);
		if (finded) break;
	}
	
	return !finded;
}

Whitecat.port.isConnected = function(path) {
	for (var i = 0; i < Whitecat.ports.length; i++) {
		if (Whitecat.ports[i].path == path) {
			if (Whitecat.ports[i].connId != null) {
				return true;
			}
		}
	}

	return false;
}

Whitecat.port.add = function(path) {
	Whitecat.ports.push({path: path, connId: null, forTest: true, forDelete: false, phase: 0});
}

Whitecat.port.addTestMark = function(path) {
	for (var i = 0; i < Whitecat.ports.length; i++) {
		if (Whitecat.ports[i].path == path) {
			Whitecat.ports[i].forTest = true;
		}
	}

	return;
}

Whitecat.port.removeDeleteMark = function(path) {
	for (var i = 0; i < Whitecat.ports.length; i++) {
		if (Whitecat.ports[i].path == path) {
			Whitecat.ports[i].forDelete = false;
		}
	}

	return;
}

Whitecat.port.markAllForDelete = function() {
	for (var i = 0; i < Whitecat.ports.length; i++) {
		Whitecat.ports[i].forDelete = true;
	}

	return;
}

Whitecat.digitalPins = {
	"8" : "pio.PB_5",
	"9" : "pio.PB_4",
	"10": "pio.PB_3",
	"11": "pio.PB_2",
	"12": "pio.PB_1",
	"13": "pio.PB_0",
	"14": "pio.PB_6",
	"15": "pio.PB_7",
	"16": "pio.PB_8",
	"17": "pio.PB_15",
	"18": "pio.PB_13",
	"19": "pio.PB_12",
	"20": "pio.PC_15",
	"27": "pio.PD_9",
	"28": "pio.PD_10",
	"29": "pio.PD_11",
	"30": "pio.PD_0",
	"31": "pio.PC_13",
	"32": "pio.PC_14",
	"35": "pio.PD_4",
	"36": "pio.PD_5",
	"37": "pio.PE_0",
	"38": "pio.PE_1",
	"39": "pio.PE_2",
	"40": "pio.PE_3",
	"41": "pio.PE_4",
	"42": "pio.PE_5",
	"43": "pio.PE_6",
	"44": "pio.PE_7"
};

Whitecat.analogPins = {
	"9" : "pio.PB_4",
	"10": "pio.PB_3",
    "11": "pio.PB_2",
    "12": "pio.PB_1",
	"13": "pio.PB_0",
};

Whitecat.analogPinsChannel = {
	"9" : "4",
	"10": "3",
    "11": "2",
    "12": "1",
	"13": "0",
};

Whitecat.pwmPins = {
	"12": "pio.PB_2",
	"14": "pio.PB_6",
	"12": "pio.PB_1",
	"13": "pio.PB_0",
	"10": "pio.PB_3",
	"16": "pio.PB_8",
};

Whitecat.pwmPinsChannel = {
	"12": "1",
	"14": "2",
	"12": "4",
	"13": "5",
	"10": "7",
	"16": "8",
};

var Board = Whitecat;

Whitecat.ab2str = function(buf) {
  var bufView = new Uint8Array(buf);
  var str =  String.fromCharCode.apply(null, bufView);
  
  //consoleWindow.insert(str);
  
  return str;
};

Whitecat.str2ab = function(str) {
  var bytes = new Uint8Array(str.length);
  for (var i = 0; i < str.length; ++i) {
    bytes[i] = str.charCodeAt(i);
  }

  return bytes.buffer;
};

// Send a command to the whitecat, and wait for the response
Whitecat.sendCommand = function(port, command, tOut, success, error) {
	var line = 0;
	var commandEcho = false;
	var commandResponse = "";
	var commandPrompt = false;
	var currentReceived = "";
	
	var waitForCommandEcho = false;
	var waitForPrompt = false;
	var response = "";
	
	var currentTimeout;

	// Set a timeout
	function timeout() {
		chrome.serial.onReceive.removeListener(sendCommandListener);
		error(Whitecat.ERR_TIMEOUT);
	}	
	
	function sendCommandListener(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);

			for(var i = 0; i < str.length; i++) {
				if ((str.charAt(i) === '\n') || (str.charAt(i) === '\r')) {
					if (currentReceived !== "") {
						if (waitForCommandEcho) {
							if (currentReceived == command) {
								waitForCommandEcho = false;
								waitForPrompt = true;
							}
						} else {
							if (waitForPrompt) {
								if (currentReceived.match(/^\/.*\>\s$/g)) {
									clearTimeout(currentTimeOut);
									chrome.serial.onReceive.removeListener(sendCommandListener);
									waitForPrompt = false;
									success(response);									
									break;
								} else {
									if (response != "") {
										response = response + '\n';
									}
									
									response = response + currentReceived;
								}
							}
						}						
					}
			
					currentReceived = "";
				} else {
					currentReceived = currentReceived + str.charAt(i);
				}
			}		
		}		
	}
		
	chrome.serial.flush(port.connId, function(result) {
		waitForCommandEcho = true;
		waitForPrompt = false;
		chrome.serial.onReceive.addListener(sendCommandListener);
		chrome.serial.send(port.connId, Whitecat.str2ab(command + '\r\n'), function(info) {
			// Set a timeout
			currentTimeOut = setTimeout(function(){
				timeout();
			}, tOut);
		});		
	});
};

// Receive file from the whitecat
Whitecat.receiveFile = function(port, fileName, received) {
	var outputIndex = 0;
	var currentReceived = "";
	var fileReceiveCommand =  "io.send(\"" + fileName + "\")\r";
	var waitForC = false;
	var waitForN = false;
	var vaitForS = false;
	var size = 0;
	
	function receiveChunkListener(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);
			for(var i = 0; i < str.length; i++) {
				if (waitForS) {
					waitForS = false;	
					size = str.charCodeAt(i);
					if (size == 0) {
						chrome.serial.onReceive.removeListener(receiveChunkListener);
						received(currentReceived);
						break;
					}
				} else {
					if (!waitForS) {
						currentReceived = currentReceived + str.charAt(i);
						if (size > 1) {
							size--;
						} else {
							chrome.serial.onReceive.removeListener(receiveChunkListener);
							reciveChunk();
							break;
						}
					}
				}
			}	
		}			
	}
	
	function reciveChunk() {
		waitForS = true;	
		size = 0;
		
		chrome.serial.onReceive.addListener(receiveChunkListener);		
		chrome.serial.send(port.connId, Whitecat.str2ab('C\n'), function() {
		});
	}
	
	function waitForCommandEcho(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);
			for(var i = 0; i < str.length; i++) {
				currentReceived = currentReceived + str.charAt(i);
				
				if (currentReceived == fileReceiveCommand) {
					chrome.serial.onReceive.removeListener(waitForCommandEcho);
					
					currentReceived = "";
					reciveChunk();
					break;
				}
			}		
		}			
	}

	chrome.serial.flush(port.connId, function(result) {
		chrome.serial.onReceive.addListener(waitForCommandEcho);
		
		chrome.serial.send(port.connId, Whitecat.str2ab(fileReceiveCommand), function() {
		});
	});
};

// Send file to the whitecat
Whitecat.sendFile = function(port, fileName, content, sended) {
	var outputIndex = 0;
	var currentReceived = "";
	var fileSendCommand =  "io.receive(\"" + fileName + "\")\r";
	var waitForC = false;
	var waitForN = false;
	
	function sendChunk() {
		// Get a new chunk
		var chunk = content.slice(outputIndex, outputIndex + Whitecat.chunkSize);

		// Send size
		chrome.serial.send(port.connId, Whitecat.str2ab(String.fromCharCode(chunk.length)), function(info) {
			if (chunk.length > 0) {
				// Send chunk
				chrome.serial.send(port.connId, Whitecat.str2ab(chunk), function(info) {					
					waitForC = true;
					waitForN = false;
					
					chrome.serial.onReceive.addListener(waitForSend);
				});
			} else {
				sended();
			}						
		});
	
		// Increment next chunk start position
		outputIndex += chunk.length;	
	}
	
	function waitForSend(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);

			for(var i = 0; i < str.length; i++) {
				if ((str.charAt(i) === 'C') && (waitForC)) {
					waitForC = false;
					waitForN = true;
				}
				
				if ((str.charAt(i) === '\n') && (waitForN)) {
					waitForC = false;
					waitForN = false;

					chrome.serial.onReceive.removeListener(waitForSend);
					sendChunk();
				}
			}		
		}			
	}
	
	function waitForCommandEcho(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);

			for(var i = 0; i < str.length; i++) {
				currentReceived = currentReceived + str.charAt(i);

				if (currentReceived == fileSendCommand) {
					waitForC = true;
					waitForN = false;
					chrome.serial.onReceive.removeListener(waitForCommandEcho);
					chrome.serial.onReceive.addListener(waitForSend);
				}
			}		
		}			
	}

	chrome.serial.flush(port.connId, function(result) {
		chrome.serial.onReceive.addListener(waitForCommandEcho);
		
		chrome.serial.send(port.connId, Whitecat.str2ab(fileSendCommand), function() {
		});
	});
};

// Check if a file exists in the whitecat
Whitecat.fileExists = function(port, name, callback) {
	Whitecat.sendCommand(port, "do;local f = io.open('"+name+"',\"r\");if f ~= nil then io.close(f) print(\"true\") else print(\"false\") end end;", 1000,
		function(resp) {
			if (resp == "true") {
				callback(true);
			} else {
				callback(false);				
			}
		},
		function(err) {
			callback(false);
		}
	);		
}

// Stop anything running on the whitecat, including scripts and threads
Whitecat.stop = function(port, success, error) {
	var currentReceived = "";
	var currentTimeOut;
	
	function timeout() {
		chrome.serial.onReceive.removeListener(stopListener);
		error(Whitecat.ERR_TIMEOUT);
	}

	function stopThreads() {
		Whitecat.sendCommand(port, 'do;thread.stop();local n = thread.list("*n");print(n);end;', 1000, 
			function(resp) {
				if (resp == "0") {
					Whitecat.sendCommand(port, 'do;local curr_os, curr_ver, curr_build = os.version();print("{\\"os\\":\\""..curr_os.."\\",\\"version\\":\\""..curr_ver.."\\",\\"build\\":\\""..curr_build.."\\"}");end;', 1000,
						function(resp) {
							try {
								resp = JSON.parse(resp);

								if (resp.os == "LuaOS") {
									clearTimeout(currentTimeOut);
									success();
								}
							} catch (err) {
								clearTimeout(currentTimeOut);
								error(Whitecat.ERR_INVALID_RESPONSE);
							}
							
						},
						function(err) {
							clearTimeout(currentTimeOut);
							error(err);
						}
					);
				}
			},
			function(err) {
				clearTimeout(currentTimeOut);
				error(err);
			}
		);		
	}
	
	function stopListener(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);

			for(var i = 0; i < str.length; i++) {
				if ((str.charAt(i) === '\n') || (str.charAt(i) === '\r')) {
					currentReceived = "";
				} else {
					currentReceived = currentReceived + str.charAt(i);	

					if (currentReceived.match(/^lua\:.*interrupted\!$/g)) {
					}
									
					if (currentReceived.match(/^\/.*\>\s$/g)) {
						clearTimeout(currentTimeOut);
						chrome.serial.onReceive.removeListener(stopListener);
						stopThreads();
					}
				}
			}		
		}		
	}
	
	// Send a Ctrl-C for interrupt current running script
	chrome.serial.flush(port.connId, function(info) {
		chrome.serial.onReceive.addListener(stopListener);
		
		chrome.serial.send(port.connId, Whitecat.str2ab('\03'), function(info) {
			// Set a timeout
			currentTimeOut = setTimeout(function(){
				timeout();
			}, 2000);
		});			
	});
};

// Detects if white is running
Whitecat.isRunning = function(port, success, error) {
	var currentReceived = "";
	var currentTimeOut;
	
	function timeout() {
		chrome.serial.onReceive.removeListener(isRunningListener);
		error(Whitecat.ERR_TIMEOUT);
	}

	function isRunningListener(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);

			for(var i = 0; i < str.length; i++) {
				currentReceived = currentReceived + str.charAt(i);	

				if (currentReceived == "LuaOS") {
					clearTimeout(currentTimeOut);
					success();					
				}
			}		
		}		
	}
	
	// Send a Ctrl-D for test if LuaOS is running
	chrome.serial.flush(port.connId, function(info) {
		chrome.serial.onReceive.addListener(isRunningListener);
		
		chrome.serial.send(port.connId, Whitecat.str2ab('\04'), function(info) {
			// Set a timeout
			currentTimeOut = setTimeout(function(){
				timeout();
			}, 500);
		});			
	});
};

// Try to detect a Whitecat connected to serial port
Whitecat.detect = function() {
	var patt = /tty\.SLAB_USBtoUART/g;
	var timeoutTestBootloader;
	
	if (Whitecat.inDetect) return;
	Whitecat.inDetect = true;
	
	function testBootloader(port, callback) {
		stk500.detect(port, function(detected) {
			if (detected) {
				callback(true);
			} else {
				callback(false);
			}
		});	
	}
		
	function testLuaOS(port, callback) {
		Whitecat.isRunning(
			port,
			function() {
				callback(true);				
			},
			function(error) {
				callback(false);
			}			
		);
	}

	// Test on port has the following phases
	//
	// Phase 0: nothing has tested on this port, test for LuaOS
	// Phase 1: test for LuaOS failed, test for bootloader
	// Phase 2: test for bootloader success
	// Phase 3: test only for LuaOS
	// Phase 4: test for LuaOS success
	// Phase 5: rebooting
	function testPort(port) {
		if (port.phase == 0) {
			testLuaOS(port, function(connected) {
				if (connected) {
					port.phase = 4;
					Code.boardConnected();
					Whitecat.inDetect = false;
					return;
				} else {
					setTimeout(function(){
						port.phase = 1;
						Whitecat.inDetect = false;
					}, 2000);
					return;
				}
			});
		}
		
		if (port.phase == 1) {
			testBootloader(port, function(connected) {
				if (connected) {
					port.phase = 2;
					
					Code.boardInBootloaderMode();
					Whitecat.inDetect = false;
					return;
				} else {
					port.phase = 3;
					Whitecat.inDetect = false;
					return;
				}
			});
		}
				
		if (port.phase == 3) {
			testLuaOS(port, function(connected) {
				if (connected) {
					port.phase = 4;
					Code.boardConnected();
					Whitecat.inDetect = false;
					return;
				} else {
					Whitecat.inDetect = false;
					return;
				}
			});
		}

		if (port.phase == 4) {
			Whitecat.inDetect = false;
		}
	}
	
	chrome.serial.getDevices(function(ports) {
		var port;
		
		// Remove all delete marks
		Whitecat.port.markAllForDelete();
		
		// Process all ports and update previous ports with changes
		for(port = 0;port < ports.length;port++) {
			if (patt.test(ports[port].path)) {
				// This port matches, and may be connected to a whitecat
				if (Whitecat.port.isNew(ports[port].path)) {
					// Port is new
					// Probably user has plug something once pluging is started
					Whitecat.port.add(ports[port].path);
				} else {
					// Port is not new
					// If is not connected 2 things may happend: board is not respond to commands
					// or board is in bootloader mode
					if (!Whitecat.port.isConnected(ports[port].path)) {
						Whitecat.port.addTestMark(ports[port].path);
					}
					
					// Remove delete mark
					Whitecat.port.removeDeleteMark(ports[port].path);
				}
			}
		}
		
		if (Whitecat.ports.length == 0) {
			Whitecat.inDetect = false;			
		} else {
			// Process all deleted ports
			for(port = 0;port < Whitecat.ports.length;port++) {
				// Port is for delete, inform the UI
				if (Whitecat.ports[port].forDelete) {
					Whitecat.ports.splice(port, 1);
					Code.boardDisconnected();
				}
			}	
			
			if (Whitecat.ports.length == 0) {
				Whitecat.inDetect = false;
			} else {
				if (Whitecat.ports[0].forTest) {
					if (Whitecat.ports[0].connId == null) {
						chrome.serial.connect(Whitecat.ports[0].path, {bitrate: 115200, bufferSize: 4096}, function(connectionInfo) {
							// Store connection id and name of port
							Whitecat.ports[0].connId = connectionInfo.connectionId;
						
							testPort(Whitecat.ports[0]);
						});
					} else {
						testPort(Whitecat.ports[0]);
					}
				} else {
					Whitecat.inDetect = false;
				}
			}
		}		
		
	});	
};

// Init the whitecat, connecting to a serial port matching with the expected
// configuration
Whitecat.init = function(phase) {
	Whitecat.inDetect = false;
	
	clearInterval(Whitecat.detectInterval);
	
	for(var port = 0;port < Whitecat.ports.length;port++) {
		Whitecat.ports[port].phase = phase;
	}
	
	Whitecat.detectInterval = setInterval(function(){
		Whitecat.detect();
	}, 500);
};

// Run current generated code to the whitecat
Whitecat.run = function(port, file, code, success, fail) {
	var currentReceived = "";
	
	if (code.trim() == "") {
		success();
		return;
	}
		
	chrome.serial.flush(port.connId, function() {
		// Stop anything running
		Whitecat.stop(
			port,
			function() {
				// Whitecat is stopped
				// Send code
				Whitecat.sendFile(port, file, code, 
					function() {
						// Code is sended

						//Now run it!
						chrome.serial.send(port.connId,  Whitecat.str2ab("dofile(\"/sd/autorun.lua\")\r\n"), function() {
							success();
						});
				});		
			},
			function() {
				fail();
			}
		);							
	});
};

// List a directory from the whitecat, and return an array of entries
Whitecat.listDirectory = function(port, name, success, error) {
	Whitecat.sendCommand(port, "os.ls('" + name + "')", 4000, 
		function(resp) {
			var entries = [];

			if (resp !== '') {
				resp.split('\n').forEach(function(item) {
					var elements = item.split('\t');
				
					if (elements.length == 4) {
						var type = elements[0].trim();
						var size = elements[1].trim();
						var date = elements[2].trim();
						var entry = elements[3].trim();						

						entries.push({type: type, size: size, date: date, name: entry});
					} else {
						error(Whitecat.ERR_INVALID_RESPONSE);
					}
				});
			}

			success(entries);
		},
		function(err) {
			error(err);
		}
	);			
}

Whitecat.upgradeFirmware = function(port, code, callback) {
	stk500.upgradeFirmware(port, intelHex.parse(code), function() {
		callback();
	});
}

Whitecat.reboot = function(port, success, error) {
	port.phase = 5;

	chrome.serial.send(port.connId,  Whitecat.str2ab("\r\nos.exit()\r\n"), function() {	
		success();
		Whitecat.init(0);
	});	
}

// Get version of the firmware installed on the board
Whitecat.getInstalledFirmwareVersion = function(success, error) {
	Whitecat.sendCommand(port, 'do;local curr_os, curr_ver, curr_build = os.version();print("{\\"os\\":\\""..curr_os.."\\",\\"version\\":\\""..curr_ver.."\\",\\"build\\":\\""..curr_build.."\\"}");end;', 1000,
		function(resp) {
			try {
				resp = JSON.parse(resp);

				success(resp.os + "-" + resp.version.replace(" ","-") + "-" + resp.build);
			} catch (err) {
				error(Whitecat.ERR_INVALID_RESPONSE);
			}
		},
		function(err) {
			error(err);
		}
	);	
}

// Get last published available firmware version
Whitecat.getLastFirmwareAvailableVersion = function(success, error) {
	var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
       if (xhr.readyState == 4 && xhr.status == 200) {
		   success(xhr.responseText);
       } else {
       	   error(Whitecat.ERR_CONNECTION_ERROR);
       }
    }

	xhr.open("GET", "https://raw.githubusercontent.com/whitecatboard/LuaOS/master/releases/current", true);
	xhr.send();	
}

// Get last published available firmware code
// In the whitecat code is an hex file
Whitecat.getLastFirmwareAvailableCode = function(success, error) {
	Whitecat.getLastFirmwareAvailableVersion(
		function(version) {
			var xhr = new XMLHttpRequest();
		
		    xhr.onreadystatechange = function() {
		       if (xhr.readyState == 4 && xhr.status == 200) {
				   success(xhr.responseText);
		       } else {
		       	   error(Whitecat.ERR_CONNECTION_ERROR);	       	
		       }
		    }

			xhr.open("GET", "https://raw.githubusercontent.com/whitecatboard/LuaOS/master/releases/" + version, true);
			xhr.send();	
		},
		function(err) {
			error(err);
		}
	);
}
	