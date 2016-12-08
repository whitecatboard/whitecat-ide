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
Whitecat.status = {};

Whitecat.ERR_TIMEOUT = -1;
Whitecat.ERR_INVALID_RESPONSE = -2;
Whitecat.ERR_CONNECTION_ERROR = -4;

Whitecat.debug = true;
Whitecat.inDetect = false;
Whitecat.inRecover = false;
Whitecat.detectInterval = null;
Whitecat.hardwareReset = false;

Whitecat.stopTimeout = 2000;
Whitecat.bootingTimeout = 3500;
Whitecat.runningTimeout = 1500;

Whitecat.runQueue = [];

Whitecat.updateMaps = function() {
	var board = "X1";
	
	if (Whitecat.status.cpu == "ESP8266") {
		board = "N1ESP8266";
	}

	if (Whitecat.status.cpu == "ESP32") {
		board = "N1ESP32";
	}

	Whitecat.digitalPins = Whitecat[board].digitalPins;
	Whitecat.analogPins = Whitecat[board].analogPins;
	Whitecat.analogPinsChannel = Whitecat[board].analogPinsChannel;
	Whitecat.pwmPins = Whitecat[board].pwmPins;
	Whitecat.pwmPinsChannel = Whitecat[board].pwmPinsChannel;
	Whitecat.i2cModules = Whitecat[board].i2cModules;
	Whitecat.hardwareReset = Whitecat[board].hardwareReset;
	Whitecat.stopTimeout = Whitecat[board].stopTimeout;
	Whitecat.bootingTimeout = Whitecat[board].bootingTimeout;
	Whitecat.runningTimeout = Whitecat[board].runningTimeout;

	return;
}

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
		if ((Whitecat.ports[i].connId != null) && (Whitecat.ports[i].state == Whitecat.CONNECTED_STATE)) {
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
	Whitecat.ports.push({path: path, connId: null, forTest: true, forDelete: false, state: Whitecat.BOOTING_STATE});
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
			Whitecat.runQueue.push(str);
			
			for(var i = 0; i < str.length; i++) {
				if ((str.charAt(i) === '\n') || (str.charAt(i) === '\r')) {
					if (currentReceived !== "") {
						if (waitForCommandEcho) {
							// Remove propmt in response
							currentReceived = currentReceived.replace(/^\/.*\>\s*/g,"");
							
							if (currentReceived == command) {
								waitForCommandEcho = false;
								waitForPrompt = true;
							}
						} else {
							if (waitForPrompt) {
								if (currentReceived.match(/^\/.*\>\s*$/g)) {
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

	// Set a timeout
	currentTimeOut = setTimeout(function(){
		timeout();
	}, tOut);
		
	chrome.serial.flush(port.connId, function(result) {
		waitForCommandEcho = true;
		waitForPrompt = false;
		chrome.serial.onReceive.addListener(sendCommandListener);
		chrome.serial.send(port.connId, Whitecat.str2ab(command + '\r\n'), function(info) {
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
						Term.enable();
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
		
		setTimeout(function(){		
			chrome.serial.send(port.connId, Whitecat.str2ab('C\n'), function() {
			});
		}, 100);
		
		
	}
	
	function waitForCommandEcho(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);
			Whitecat.runQueue.push(str);
			
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

	Term.disable();
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
	var fileSendCommand =  "io.receive(\"" + fileName + "\")";
	var waitForC = false;
	var waitForN = false;
	var waitForChunk = false;
	var waitForTrue = false;
	var waitForCommandEcho = true;
	
	function sendChunk() {
		// Get a new chunk
		var chunk = content.slice(outputIndex, outputIndex + Whitecat.chunkSize);

		// Increment next chunk start position
		outputIndex += chunk.length;	
		
		// Send size
		chrome.serial.send(port.connId, Whitecat.str2ab(String.fromCharCode(chunk.length)), function(info) {
			if (chunk.length > 0) {
				waitForC = true;
				waitForN = false;

				// Send chunk
				chrome.serial.send(port.connId, Whitecat.str2ab(chunk), function(info) {					
				});
			} else {		
				waitForC = false;
				waitForN = false;
				waitForTrue = true;
			}						
		});	
	}
	
	function sendFileListener(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);
			Whitecat.runQueue.push(str);

			for(var i = 0; i < str.length; i++) {
				if (waitForCommandEcho || waitForTrue) {
					if ((str.charAt(i) === '\n') || (str.charAt(i) === '\r')) {
						// Remove promtp and others in response
						currentReceived = currentReceived.replace(/^.*\/.*\>\s*/g,"");

						if (currentReceived == fileSendCommand) {
							waitForC = true;
							waitForN = false;
							waitForCommandEcho = false;
							currentReceived = "";
							continue;
						} else if (currentReceived == "true") {
							chrome.serial.onReceive.removeListener(sendFileListener);
							
							Term.enable();
							sended();
							
							break;
						}
					} else {
						currentReceived = currentReceived + str.charAt(i);
					}					
				} else if ((str.charAt(i) === 'C') && (waitForC)) {
					waitForC = false;
					waitForN = true;
				} else if ((str.charAt(i) === '\n') && (waitForN)) {					
					waitForC = true;
					waitForN = false;
					sendChunk();
					break;
				}				
			}			
		}			
	}

	Term.disable();
	chrome.serial.flush(port.connId, function(result) {
		chrome.serial.onReceive.addListener(sendFileListener);
		
		debug(fileSendCommand);
		chrome.serial.send(port.connId, Whitecat.str2ab(fileSendCommand + "\r\n"), function() {
		});
	});
};

// run code in fileName on the whitecat
Whitecat.runCode = function(port, fileName, content, running) {
	var outputIndex = 0;
	var currentReceived = "";
	var runCommand =  "os.run()\r\n";
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
				Term.enable();
				running();
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
			Whitecat.runQueue.push(str);

			for(var i = 0; i < str.length; i++) {
				currentReceived = currentReceived + str.charAt(i);

				if (currentReceived == runCommand) {
					waitForC = true;
					waitForN = false;
					chrome.serial.onReceive.removeListener(waitForCommandEcho);
					chrome.serial.onReceive.addListener(waitForSend);
				}
			}		
		}			
	}

	Term.disable();
	chrome.serial.flush(port.connId, function(result) {
		chrome.serial.onReceive.addListener(waitForCommandEcho);
		
		chrome.serial.send(port.connId, Whitecat.str2ab(runCommand), function() {
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
	var currentInterval;
	
	function timeout() {
		chrome.serial.onReceive.removeListener(stopListener);
		Term.enable();
		error(Whitecat.ERR_TIMEOUT);
	}

	function stopThreads() {
		Whitecat.sendCommand(port, 'do;thread.stop();local n = thread.list("*n");print(n);end;', 1000, 
			function(resp) {
				if (resp == "0") {
					Whitecat.sendCommand(port, 'do;local curr_os, curr_ver, curr_build = os.version();print("{\\"os\\":\\""..curr_os.."\\",\\"version\\":\\""..curr_ver.."\\",\\"build\\":\\""..curr_build.."\\"}");end;', 2000,
						function(resp) {
							try {
								resp = JSON.parse(resp);

								if (resp.os == "Lua RTOS") {
									clearTimeout(currentTimeOut);
									Term.enable();
									success();
								}
							} catch (err) {
								clearTimeout(currentTimeOut);
								Term.enable();
								error(Whitecat.ERR_INVALID_RESPONSE);
							}
							
						},
						function(err) {
							clearTimeout(currentTimeOut);
							Term.enable();
							error(err);
						}
					);
				}
			},
			function(err) {
				clearTimeout(currentTimeOut);
				Term.enable();
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
					if (currentReceived.match(/^\/.*\>\s*$/g)) {
						clearTimeout(currentTimeOut);
						clearInterval(currentInterval);
						chrome.serial.onReceive.removeListener(stopListener);
						stopThreads();
						break;
					}
				}
			}		
		}		
	}
	
	Term.disable();
	
	// Send a Ctrl-C for interrupt current running script
	chrome.serial.flush(port.connId, function(info) {
		chrome.serial.onReceive.addListener(stopListener);

		// Set a timeout
		currentTimeOut = setTimeout(function(){
			timeout();
		}, Whitecat.stopTimeout);

		currentInterval = setInterval(function() {
			chrome.serial.send(port.connId, Whitecat.str2ab('\03'), function(info) {
			});					
		}, 1);
	});
};

// Detects if whitecat is booting
Whitecat.isBooting = function(port, success, error) {
	var currentReceived = "";
	var currentTimeOut;
	var currentInterval;
	
	function timeout() {
		clearInterval(currentInterval);
		chrome.serial.onReceive.removeListener(isBootingListener);
		error(Whitecat.ERR_TIMEOUT);
	}

	function isBootingListener(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);
			Whitecat.runQueue.push(str);
			
			for(var i = 0; i < str.length; i++) {
				if ((str.charAt(i) === '\n') || (str.charAt(i) === '\r')) {
					if (currentReceived.match(/^Lua RTOS-booting-.*/g)) {
						clearInterval(currentInterval);
						clearTimeout(currentTimeOut);
						chrome.serial.onReceive.removeListener(isBootingListener);
						success(true);	
						break;				
					}
								
					currentReceived = "";
				} else {
					currentReceived = currentReceived + str.charAt(i);	
				}
			}		
		}		
	}
	
	// Set a timeout
	currentTimeOut = setTimeout(function(){
		timeout();
	}, Whitecat.bootingTimeout);

	// Send a Ctrl-D for test if LuaOS is booting
	chrome.serial.onReceive.addListener(isBootingListener);

	currentInterval = setInterval(function() {
		chrome.serial.send(port.connId, Whitecat.str2ab('\04'), function(info) {
		});					
	}, 10);
};

// Detects if whitecat is running
Whitecat.isRunning = function(port, success, error) {
	var currentReceived = "";
	var currentTimeOut;
	var currentInterval;
	
	function timeout() {
		clearInterval(currentInterval);
		chrome.serial.onReceive.removeListener(isRunningListener);
		error(Whitecat.ERR_TIMEOUT);
	}

	function isRunningListener(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);
			Whitecat.runQueue.push(str);

			for(var i = 0; i < str.length; i++) {
				if ((str.charAt(i) === '\n') || (str.charAt(i) === '\r')) {
					if (currentReceived.match(/^Lua RTOS-running-.*/g)) {
						clearInterval(currentInterval);
						clearTimeout(currentTimeOut);
						chrome.serial.onReceive.removeListener(isRunningListener);
						success(true);	
						break;				
					}
					
					currentReceived = "";
				} else {
					currentReceived = currentReceived + str.charAt(i);	
				}
			}		
		}		
	}
	
	// Set a timeout
	currentTimeOut = setTimeout(function(){
		timeout();
	}, Whitecat.runningTimeout);

	chrome.serial.onReceive.addListener(isRunningListener);

	// Send a Ctrl-D for test if LuaOS is running
	currentInterval = setInterval(function() {
		chrome.serial.send(port.connId, Whitecat.str2ab('\04'), function(info) {
		});					
	}, 10);
};

Whitecat.getStatus = function(port, success, error) {
	Term.disable();
	Whitecat.sendCommand(port, 'do;local curr_os, curr_ver, curr_build = os.version();local cpu = os.cpu();print("{\\"os\\":\\""..curr_os.."\\",\\"version\\":\\""..curr_ver.."\\",\\"build\\":\\""..curr_build.."\\",\\"cpu\\":\\""..cpu.."\\"}");end;', 5000,
		function(resp) {
			Term.enable();
			try {
				resp = JSON.parse(resp);
				
				Whitecat.status.os = resp.os;
				Whitecat.status.version = resp.version;
				Whitecat.status.build = resp.build;
				Whitecat.status.firmware = resp.os + "-" + resp.version.replace(" ","-") + "-" + resp.build;
				Whitecat.status.cpu = resp.cpu;
				success();
			} catch (err) {
				error(Whitecat.ERR_INVALID_RESPONSE);
			}
		
		},
		function(err) {
			Term.enable();
			error(err);
		}
	);
}

// Try to detect a Whitecat connected to serial port
//
// When a whitecat is connect through an USB cord to the desktop:
//
// * During the first 2 seconds bootloader is executed
// * Then, if a firmware is present jumps to the first instruction
// * Then, LuaOS boots, at this point the board response with a
//   LuaOS-booting during the boot process to a Ctlr-D char received
//   through the console, and with a LuaOS-running when LuaOS is ready for
//   response to commands.

Whitecat.HAS_BOOTLOADER_STATE = false;

Whitecat.BOOTLOADER_STATE = 1;
Whitecat.BOOTING_STATE    = 2;
Whitecat.RUNNING_STATE    = 3;
Whitecat.CONNECTED_STATE  = 4;
Whitecat.BAD_STATE        = 5;
Whitecat.RECOVER_STATE    = 6;

Whitecat.detect = function() {
	var pathPattern;
	var displayNamePattern;
	var timeoutTestBootloader;

	if (Whitecat.inDetect) return;
	Whitecat.inDetect = true;

	if (window.navigator.platform == 'MacIntel') {
		pathPattern = /tty\.SLAB_USBtoUART|tty\.usbserial-/;
		displayNamePattern = /.*USB to UART.*|.*FR232RL*./;
	} else if (window.navigator.platform == 'Win32') {
		pathPattern = /COM\d+/;
		displayNamePattern = /.*USB to UART.*/;
	}
		
	function testPort(port) {
		if ((port.state == Whitecat.BOOTLOADER_STATE) && (!Whitecat.HAS_BOOTLOADER_STATE)) {
			port.state = Whitecat.BOOTING_STATE;
		}
		
		if (port.state == Whitecat.BOOTLOADER_STATE) {
			debug("BOOTLOADER_STATE");
			stk500.detect(port, function(detected) {
				if (detected) {
					port.state = Whitecat.BAD_STATE;
					Code.boardInBootloaderMode();
				} else {
					port.state = Whitecat.BAD_STATE;
					Code.boardBadFirmware();
				}
				Whitecat.inDetect = false;
			});	
		} else if (port.state == Whitecat.BOOTING_STATE) {
			debug("BOOTING_STATE");
			chrome.serial.setControlSignals(Whitecat.ports[0].connId, { dtr: true, rts: true }, function() {
				chrome.serial.setControlSignals(Whitecat.ports[0].connId, { dtr: false, rts: false }, function() {
					Whitecat.isBooting(port,
						function(booting) {
							port.state = Whitecat.RUNNING_STATE;
							Whitecat.inDetect = false;
						},
						function(err) {
							// Time out
							chrome.serial.setControlSignals(Whitecat.ports[0].connId, { dtr: true, rts: true }, function() {
								chrome.serial.setControlSignals(Whitecat.ports[0].connId, { dtr: false, rts: false }, function() {
									port.state = Whitecat.BOOTLOADER_STATE
									Whitecat.inDetect = false;
								});
							});					
						}
					);
				});
			});					
		} else if (port.state == Whitecat.RUNNING_STATE) {
			debug("RUNNING_STATE");
			Whitecat.isRunning(port,
				function(running) {
					if (running) {
						// We want a whitecat with nothing running when the environment
						// detects a new connected board, because we need to have the
						// Lua interpreter available for get the board status				
						Whitecat.stop(
							port,
							function() {
								Whitecat.getStatus(
									port,
									function() {
										Whitecat.updateMaps();
										port.state = Whitecat.CONNECTED_STATE;
										Code.boardConnected();
										Whitecat.inDetect = false;
									},
									function() {
										Whitecat.updateMaps();
										port.state = Whitecat.CONNECTED_STATE;
										Code.boardConnected();
										Whitecat.inDetect = false;
									}
								);	
							},
							function() {
								Whitecat.inDetect = false;
							}
						);							
						
					} else {
						Whitecat.inDetect = false;
					}
				},
				function(err) {
					// Timeout
					chrome.serial.setControlSignals(Whitecat.ports[0].connId, { dtr: true, rts: true }, function() {
						chrome.serial.setControlSignals(Whitecat.ports[0].connId, { dtr: false, rts: false }, function() {
							port.state = Whitecat.BOOTLOADER_STATE
							Whitecat.inDetect = false;
						});
					});					
				}
			);
		} else if (port.state == Whitecat.RECOVER_STATE) {
			stk500.detect(port, function(detected) {
				if (detected) {
					Code.boardRecover();
				} else {
					Whitecat.inDetect = false;
				}
			});	
		} else {
			Whitecat.inDetect = false;
		}
	}
	
	chrome.serial.getDevices(function(ports) {
		var port;
		
		// Remove all delete marks
		Whitecat.port.markAllForDelete();
		
		// Process all ports and update previous ports with changes
		for(port = 0;port < ports.length;port++) {
			if (pathPattern.test(ports[port].path)) {
				if (!displayNamePattern.test(ports[port].displayName)) {
					continue;
				}
			} else {
				continue;
			}

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
		
		if (Whitecat.ports.length == 0) {
			Whitecat.inDetect = false;			
		} else {
			// Process all deleted ports
			for(port = 0;port < Whitecat.ports.length;port++) {
				// Port is for delete, inform the UI
				if (Whitecat.ports[port].forDelete) {
					if (Whitecat.ports[port].state != Whitecat.RECOVER_STATE) {
						if (Whitecat.ports[port].state == Whitecat.BAD_STATE) {
							bootbox.hideAll();
						}
						Whitecat.ports.splice(port, 1);
						Code.boardDisconnected();
					} else {
						Whitecat.ports.splice(port, 1);
					}
				}
			}	
			
			if (Whitecat.ports.length == 0) {
				Whitecat.inDetect = false;
			} else {
				if (Whitecat.ports[0].forTest) {
					if (Whitecat.ports[0].connId == null) {
						chrome.serial.connect(Whitecat.ports[0].path, {bitrate: 115200, bufferSize: 4096}, function(connectionInfo) {
							debug("Connected to " + Whitecat.ports[0].path);

							if (Whitecat.inRecover) {
								Whitecat.ports[0].state = 6;
							}
							
							// Store connection id and name of port
							Whitecat.ports[0].connId = connectionInfo.connectionId;

							//chrome.serial.setControlSignals(Whitecat.ports[0].connId, { dtr: true, rts: true }, function() {
							//	chrome.serial.setControlSignals(Whitecat.ports[0].connId, { dtr: false, rts: false }, function() {
									testPort(Whitecat.ports[0]);
							//	});
							//});
						});
					} else {
						//chrome.serial.setControlSignals(Whitecat.ports[0].connId, { dtr: true, rts: true }, function() {
						//	chrome.serial.setControlSignals(Whitecat.ports[0].connId, { dtr: false, rts: false }, function() {
								testPort(Whitecat.ports[0]);
						//	});
						//});
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
Whitecat.init = function(state) {
	Whitecat.inDetect = false;
	if (typeof state == 'undefined') {
		state = Whitecat.BOOTING_STATE;
	}
	clearInterval(Whitecat.detectInterval);
	
	for(var port = 0;port < Whitecat.ports.length;port++) {
		Whitecat.ports[port].state = state;
	}
	
	Whitecat.inRecover = (state == 6);
	
	Whitecat.updateMaps();
	
	Whitecat.detectInterval = setInterval(function(){
		Whitecat.detect();
	}, 100);

	if (state != Whitecat.BOOTING_STATE) {
		if (!Whitecat.runListenerRunning) {
			setTimeout(function() {
				Whitecat.runListener();
			}, 50);
		}
	}
};

Whitecat.runListenerRunning = false;
Whitecat.runListenerCurrentReceived = "";

Whitecat.runListener = function() {
	Whitecat.runListenerRunning = true;
	
	while (Whitecat.runQueue.length > 0) {
		var str = Whitecat.runQueue.shift();
		
		for(var i = 0; i < str.length; i++) {
			if ((str.charAt(i) === '\n') || (str.charAt(i) === '\r')) {
				if (Whitecat.runListenerCurrentReceived !== "") {
					var tmp = Whitecat.runListenerCurrentReceived.match(/^(.*\.lua)\:([0-9]*)\:(.*)/);
					if (tmp) {
						var exceptionFile = tmp[1].trim();
						var exceptionLine = tmp[2].trim();
						var exceptionMessage = tmp[3].trim();
						var exceptionCode = 0;
						
						tmp = exceptionMessage.match(/^([0-9]*)\:(.*)/);
						if (tmp) {
							exceptionCode = tmp[1].trim();
							exceptionMessage = tmp[2].trim();
						}
						
						Code.runtimeError(exceptionFile, exceptionLine, exceptionCode, exceptionMessage);						
					} 
				}
				
				Whitecat.runListenerCurrentReceived = "";
			} else {
				Whitecat.runListenerCurrentReceived = Whitecat.runListenerCurrentReceived + str.charAt(i);
			}
		}	
	}
	
	setTimeout(function() {
		Whitecat.runListener();
	}, 50);
}


Whitecat.sendAndRun = function(port, file, code, success, fail) {
	// First update autorun.lua, which run the target file
	Whitecat.sendFile(port, "/autorun.lua", "dofile(\""+file+"\")\r\n", 
		function() {
			// Now write code to target file
			Whitecat.sendFile(port, file, code, 
				function() {
					Term.enable();

					// Run the target file
					chrome.serial.send(port.connId, Whitecat.str2ab("dofile(\""+file+"\")\r"), function() {
						success();
					});
			});		

	});			
};

Whitecat.run = function(port, file, code, success, fail) {
	if (code.trim() == "") {
		success();
		return;
	}
		
	Term.disable();
	
	if (!Whitecat.hardwareReset) {
		chrome.serial.flush(port.connId, function() {
			// Stop anything running
			Whitecat.stop(
				port,
				function() {
					Whitecat.sendAndRun(port, file, code, success, fail);
				},
				function() {
					Term.enable();
					fail();
				}
			);							
		});
	} else {
		// Do a hardware reset
		chrome.serial.setControlSignals(port.connId, { dtr: false, rts: false }, function() {
			chrome.serial.setControlSignals(port.connId, { dtr: true, rts: true }, function() {
				Whitecat.init(Whitecat.BOOTING_STATE);
				
				// Wait for the connected state
				var currentInterval = setInterval(function() {
					if (port.state == Whitecat.CONNECTED_STATE) {
						clearInterval(currentInterval);
						Whitecat.sendAndRun(port, file, code, success, fail);
					}
				}, 100);
			});
		});
	}
};

// List a directory from the whitecat, and return an array of entries
Whitecat.listDirectory = function(port, name, success, error) {
	Term.disable();
	Whitecat.sendCommand(port, "os.ls('" + name + "')", 10000, 
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
					}
				});
			}

			Term.enable();
			success(entries);
		},
		function(err) {
			Term.enable();
			error(err);
		}
	);			
}

Whitecat.upgradeFirmware = function(port, code, callback) {
	Term.disable();
	chrome.serial.send(port.connId,  Whitecat.str2ab("\r\nos.exit()\r\n"), function() {	
		stk500.upgradeFirmware(port, intelHex.parse(code), function() {
			Term.enable();
			callback();
		});
	});
}

Whitecat.reboot = function(port, callback) {
	Term.disconnect();

	chrome.serial.setControlSignals(Whitecat.ports[0].connId, { dtr: true, rts: true }, function() {
		chrome.serial.setControlSignals(Whitecat.ports[0].connId, { dtr: false, rts: false }, function() {
			Whitecat.init(Whitecat.BOOTING_STATE);
			callback();		
		});
	});					
}

// Get version of the firmware installed on the board
Whitecat.getInstalledFirmwareVersion = function(port, success, error) {
	Term.disable();
	Whitecat.sendCommand(port, 'do;local curr_os, curr_ver, curr_build = os.version();print("{\\"os\\":\\""..curr_os.."\\",\\"version\\":\\""..curr_ver.."\\",\\"build\\":\\""..curr_build.."\\"}");end;', 1000,
		function(resp) {
			Term.enable();

			try {
				resp = JSON.parse(resp);

				success(resp.os + "-" + resp.version.replace(" ","-") + "-" + resp.build);
			} catch (err) {
				error(Whitecat.ERR_INVALID_RESPONSE);
			}
		},
		function(err) {
			Term.enable();
			error(err);
		}
	);	
}

// Get last published available firmware version
Whitecat.getLastFirmwareAvailableVersion = function(success, error) {
	var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
       if (xhr.readyState == 4 && xhr.status == 200) {
		   success(xhr.responseText.trim());
       } else {
		   if (xhr.readyState == 4 && xhr.status != 200) {
			   error(Whitecat.ERR_CONNECTION_ERROR);
		   }
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
				   if (xhr.readyState == 4 && xhr.status != 200) {
					   error(Whitecat.ERR_CONNECTION_ERROR);
				   }
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

Whitecat.checkForNewFirmwareAvailability = function(port, success, error) {
	Whitecat.getInstalledFirmwareVersion(port, 
		function(installedVersion) {
			installedVersion = installedVersion + ".hex";
			
			Whitecat.getLastFirmwareAvailableVersion(
				function(lastVersion) {
					if (installedVersion != lastVersion) {
						success(true);						
					} else {
						success(false);
					}
				},
				function(err) {
					error(err);
				}
			);
		},
		function(err) {
			error(err);
		}
	);
}

var Board = Whitecat;

if (Whitecat.debug) {
	chrome.app.window.create('debug.html', {
		id: "debugwin",
	});  
}