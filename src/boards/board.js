/*
 * Whitecat Blocky Environment, board definition
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

var Board = {};

Board.status = {};
Board.ports = [];
Board.port = {};
Board.runQueue = [];
Board.types = [];
Board.sensors = [];
Board.detectInterval = null;

/*
 *
 * Global flags
 *
 */
Board.inDetect = false;           // We are in a board detect loop?
Board.inRecover = false;	      // We are in a board recover?

/*
 *
 * Default configurations
 *
 */
Board.chunkSize = 255;         // Chunk size for file-transfer
Board.debug = true;            // Enable / disable debug window
Board.bootingTimeout = 3500;   // When board is in boot state, how much time to wait for a response
Board.runningTimeout = 1500;   // When board is in run state, how much time to wait for a response

Board.status.modules = {
	"thread": false,
	"nvs": false,
	"pack": false,
	"i2c": false,
	"pio": false,
	"pwm": false,
	"screen": false,
	"spi": false,
	"tmr": false,
	"uart": false,
	"lora": false,
	"mqtt": false,
	"sensor": false,
};

Board.sequenceIndex = -1;
Board.resetSequence = [];
Board.resetSequence.push([{"dtr": false, "rts": true}, {"dtr": false, "rts": false}]);

// Error constants
Board.ERR_TIMEOUT = -1;
Board.ERR_INVALID_RESPONSE = -2;
Board.ERR_CONNECTION_ERROR = -4;

Board.doReset = function(port, idx, sequence, callback) {
	var currentPhase;
	
	if (idx < sequence.length) {
		currentPhase = sequence[idx];
	} else {
		callback(sequence);
		return;
	}

	chrome.serial.setControlSignals(port.connId, { dtr: currentPhase.dtr, rts: currentPhase.rts }, function() {
   	 	var start = Date.now(),
        now = start;
    	while (now - start < 30) {
      		now = Date.now();
    	}
		
		idx++;
		Board.doReset(port, idx, sequence, callback);
	});
}

Board.reset = function(port, callback) {
	Board.sequenceIndex = ((Board.sequenceIndex + 1) % Board.resetSequence.length);
	Board.doReset(port, 0, Board.resetSequence[Board.sequenceIndex], callback);		
}

Board.updateMaps = function() {
	var board = "";
	
	if (Board.status.cpu == "ESP32") {
		board = "N1ESP32";
	}
	
	if (board != "") {
	    var fs = require('fs');
	    var path = require('path');
  
	    var dirPath = path.join(process.cwd(), "/boards/defs");  
		var dirs = fs.readdirSync(dirPath);
		
		var i;
		for(i=0;i<dirs.length;i++) {
			if (dirs[i].match(/^.*\.json$/)) {
				// Read board definition
				try {
					var data = fs.readFileSync(path.join(dirPath, dirs[i]), "utf8");
				} catch (error) {
					return;
				}
				
				// Parse board definition
				try {
					var boardDef = JSON.parse(data);
					
					if (!boardDef.hasOwnProperty("id")) {
						Code.showError(MSG['error'], MSG['youHaveAnErrorInFile'] + dirs[i] + ':<br><br>' + MSG["missingBoardId"]);
						return;	
					}
					
					if (boardDef.id != board) continue;
					
					Board.digitalPins = boardDef.digitalPins;
					Board.analogPins = boardDef.analogPins;
					Board.analogPinsChannel = boardDef.analogPinsChannel;
					Board.pwmPins = boardDef.pwmPins;
					Board.pwmPinsChannel = boardDef.pwmPinsChannel;
					Board.i2cModules = boardDef.i2cModules;
					Board.bootingTimeout = boardDef.bootingTimeout;
					Board.runningTimeout = boardDef.runningTimeout;
					Board.hasFirmwareUpgradeSupport = boardDef.hasFirmwareUpgradeSupport;
				} catch (error) {
					Code.showError(MSG['error'], MSG['youHaveAnErrorInFile'] + dirs[i] + ':<br><br>' + 
					error.message);	
					return;
				}
			}
		}		
	}

	Code.updateToolBox();
	return;
}

Board.currentPort = function() {
	for (var i = 0; i < Board.ports.length; i++) {
		if (Board.ports[i].connId != null) {
			return Board.ports[i];
		}
	}

	return null;	
}

Board.isConnected = function() {
	for (var i = 0; i < Board.ports.length; i++) {
		if ((Board.ports[i].connId != null) && (Board.ports[i].state == Board.CONNECTED_STATE)) {
			return true;
		}
	}

	return false;
}

Board.port.isNew = function(path) {
	var finded = false;
	
	for (var i = 0; i < Board.ports.length; i++) {
		finded = (Board.ports[i].path == path);
		if (finded) break;
	}
	
	return !finded;
}

Board.port.isConnected = function(path) {
	for (var i = 0; i < Board.ports.length; i++) {
		if (Board.ports[i].path == path) {
			if (Board.ports[i].connId != null) {
				return true;
			}
		}
	}

	return false;
}

Board.port.add = function(path) {
	Board.ports.push({path: path, connId: null, forTest: true, forDelete: false, state: Board.BOOTING_STATE});
}

Board.port.addTestMark = function(path) {
	for (var i = 0; i < Board.ports.length; i++) {
		if (Board.ports[i].path == path) {
			Board.ports[i].forTest = true;
		}
	}

	return;
}

Board.port.removeDeleteMark = function(path) {
	for (var i = 0; i < Board.ports.length; i++) {
		if (Board.ports[i].path == path) {
			Board.ports[i].forDelete = false;
		}
	}

	return;
}

Board.port.markAllForDelete = function() {
	for (var i = 0; i < Board.ports.length; i++) {
		Board.ports[i].forDelete = true;
	}

	return;
}

Board.ab2str = function(buf) {
  var bufView = new Uint8Array(buf);
  var str =  String.fromCharCode.apply(null, bufView);
  
  //consoleWindow.insert(str);
  
  return str;
};

Board.str2ab = function(str) {
  var bytes = new Uint8Array(str.length);
  for (var i = 0; i < str.length; ++i) {
    bytes[i] = str.charCodeAt(i);
  }

  return bytes.buffer;
};

// Send a command to the whitecat, and wait for the response
Board.sendCommand = function(port, command, tOut, success, error) {
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
		error(Board.ERR_TIMEOUT);
	}	
	
	function sendCommandListener(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Board.ab2str(info.data);
			Board.runQueue.push(str);

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
		chrome.serial.send(port.connId, Board.str2ab(command + '\r\n'), function(info) {
		});		
	});
};

// Receive file from the whitecat
Board.receiveFile = function(port, fileName, received) {
	var outputIndex = 0;
	var currentReceived = "";
	var fileReceiveCommand =  "io.send(\"" + fileName + "\")\r";
	var waitForC = false;
	var waitForN = false;
	var vaitForS = false;
	var size = 0;
	
	function receiveChunkListener(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Board.ab2str(info.data);
			
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
			chrome.serial.send(port.connId, Board.str2ab('C\n'), function() {
			});
		}, 100);
		
		
	}
	
	function waitForCommandEcho(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Board.ab2str(info.data);
			Board.runQueue.push(str);
			
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
		
		chrome.serial.send(port.connId, Board.str2ab(fileReceiveCommand), function() {
		});
	});
};

// Send file to the whitecat
Board.sendFile = function(port, fileName, content, sended) {
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
		var chunk = content.slice(outputIndex, outputIndex + Board.chunkSize);

		// Increment next chunk start position
		outputIndex += chunk.length;	
		
		// Send size
		chrome.serial.send(port.connId, Board.str2ab(String.fromCharCode(chunk.length)), function(info) {
			if (chunk.length > 0) {
				waitForC = true;
				waitForN = false;

				// Send chunk
				chrome.serial.send(port.connId, Board.str2ab(chunk), function(info) {					
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
			var str = Board.ab2str(info.data);
			Board.runQueue.push(str);

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
		chrome.serial.send(port.connId, Board.str2ab(fileSendCommand + "\r\n"), function() {
		});
	});
};

// run code in fileName on the whitecat
Board.runCode = function(port, fileName, content, running) {
	var outputIndex = 0;
	var currentReceived = "";
	var runCommand =  "os.run()\r\n";
	var waitForC = false;
	var waitForN = false;
	
	function sendChunk() {
		// Get a new chunk
		var chunk = content.slice(outputIndex, outputIndex + Board.chunkSize);

		// Send size
		chrome.serial.send(port.connId, Board.str2ab(String.fromCharCode(chunk.length)), function(info) {
			if (chunk.length > 0) {
				// Send chunk
				chrome.serial.send(port.connId, Board.str2ab(chunk), function(info) {					
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
			var str = Board.ab2str(info.data);

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
			var str = Board.ab2str(info.data);
			Board.runQueue.push(str);

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
		
		chrome.serial.send(port.connId, Board.str2ab(runCommand), function() {
		});
	});
};

// Check if a file exists in the whitecat
Board.fileExists = function(port, name, callback) {
	Board.sendCommand(port, "do;local f = io.open('"+name+"',\"r\");if f ~= nil then io.close(f) print(\"true\") else print(\"false\") end end;", 1000,
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
Board.stop = function(port, success, error) {
	Term.disconnect();
	
	Board.reset(port, function(sequence) {
		Board.init(Board.BOOTING_STATE);

		success();

		// Wait for the connected state
		var currentInterval = setInterval(function() {
			if (port.state == Board.CONNECTED_STATE) {
				clearInterval(currentInterval);
			}
		}, 100);		
	});
};

// Detects if whitecat is booting
Board.isBooting = function(port, success, error) {
	var currentReceived = "";
	var currentTimeOut;
	var currentInterval;
	
	function timeout() {
		clearInterval(currentInterval);
		chrome.serial.onReceive.removeListener(isBootingListener);
		error(Board.ERR_TIMEOUT);
	}

	function isBootingListener(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Board.ab2str(info.data);
			Board.runQueue.push(str);
			
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
	}, Board.bootingTimeout);

	// Send a Ctrl-D for test if LuaOS is booting
	chrome.serial.onReceive.addListener(isBootingListener);

	currentInterval = setInterval(function() {
		chrome.serial.send(port.connId, Board.str2ab('\04'), function(info) {
		});					
	}, 10);
};

// Detects if whitecat is running
Board.isRunning = function(port, success, error) {
	var currentReceived = "";
	var currentTimeOut;
	var currentInterval;
	
	function timeout() {
		clearInterval(currentInterval);
		chrome.serial.onReceive.removeListener(isRunningListener);
		error(Board.ERR_TIMEOUT);
	}

	function isRunningListener(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Board.ab2str(info.data);
			Board.runQueue.push(str);

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
	}, Board.runningTimeout);

	chrome.serial.onReceive.addListener(isRunningListener);

	// Send a Ctrl-D for test if LuaOS is running
	currentInterval = setInterval(function() {
		chrome.serial.send(port.connId, Board.str2ab('\04'), function(info) {
		});					
	}, 10);
};

Board.getInfo = function(port, success, error) {
	Term.disable();

    var fs = require("fs");
    var path = require('path');
  
    var file = 'boards/lua/board-info.lua';
    var filePath = path.join(process.cwd(), file);  

    fs.readFile(filePath, "utf8", function(cerr, code) {
		Board.sendFile(port, "/_info.lua", code, function() {
			Board.sendCommand(port, 'dofile("/_info.lua")', 5000,
				function(resp) {
					Term.enable();
					try {
						resp = JSON.parse(resp.replace(/,\}/g,"}").replace(/,\]/g,"]"));
				
						Board.status.os = resp.os;
						Board.status.version = resp.version;
						Board.status.build = resp.build;
						Board.status.firmware = resp.os + "-" + resp.version.replace(" ","-") + "-" + resp.build;
						Board.status.cpu = resp.cpu;
						Board.status.modules = resp.modules;
						Board.sensors = resp.sensors;

						success();
					} catch (err) {
						error(Board.ERR_INVALID_RESPONSE);
					}
		
				},
				function(err) {
					Term.enable();
					error(err);
				}
			);
		});
	});		
	/*	
		
		
		
		Board.sendCommand(port, data, 5000,
			function(resp) {
				Term.enable();
				try {
					resp = JSON.parse(resp);
				
					Board.status.os = resp.os;
					Board.status.version = resp.version;
					Board.status.build = resp.build;
					Board.status.firmware = resp.os + "-" + resp.version.replace(" ","-") + "-" + resp.build;
					Board.status.cpu = resp.cpu;
					success();
				} catch (err) {
					error(Board.ERR_INVALID_RESPONSE);
				}
		
			},
			function(err) {
				Term.enable();
				error(err);
			}
		);
    });
	*/
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

Board.HAS_BOOTLOADER_STATE = Board.hasFirmwareUpgradeSupport;

Board.BOOTLOADER_STATE = 1;
Board.BOOTING_STATE    = 2;
Board.RUNNING_STATE    = 3;
Board.CONNECTED_STATE  = 4;
Board.BAD_STATE        = 5;
Board.RECOVER_STATE    = 6;


Board.detect = function() {
	var timeoutTestBootloader;

	if (Board.inDetect) return;
	Board.inDetect = true;

	function testPort(port) {
		if ((port.state == Board.BOOTLOADER_STATE) && (!Board.HAS_BOOTLOADER_STATE)) {
			port.state = Board.BOOTING_STATE;
		}
		
		if (port.state == Board.BOOTLOADER_STATE) {
			stk500.detect(port, function(detected) {
				if (detected) {
					port.state = Board.BAD_STATE;
					Code.boardInBootloaderMode();
				} else {
					port.state = Board.BAD_STATE;
					Code.boardBadFirmware();
				}
				Board.inDetect = false;
			});	
		} else if (port.state == Board.BOOTING_STATE) {
			Board.reset(port, function(sequence) {
				Board.isBooting(port,
					function(booting) {
						port.state = Board.RUNNING_STATE;
						Board.inDetect = false;
					},
					function(err) {
						// Time out
						Board.reset(port, function(sequence) {
							port.state = Board.BOOTLOADER_STATE
							Board.inDetect = false;
						});
					}
				);
			});			
		} else if (port.state == Board.RUNNING_STATE) {
			Board.isRunning(port,
				function(running) {
					if (running) {
						Board.getInfo(
							port,
							function() {
								Board.updateMaps();
								port.state = Board.CONNECTED_STATE;
								Code.boardConnected();
								Board.inDetect = false;
							},
							function() {
								Board.updateMaps();
								port.state = Board.CONNECTED_STATE;
								Code.boardConnected();
								Board.inDetect = false;
							}
						);
					} else {
						Board.inDetect = false;
					}
				},
				function(err) {
					// Timeout
					Board.reset(port, function(sequence) {
						port.state = Board.BOOTLOADER_STATE
						Board.inDetect = false;
					});					
				}
			);
		} else if (port.state == Board.RECOVER_STATE) {
			stk500.detect(port, function(detected) {
				if (detected) {
					Code.boardRecover();
				} else {
					Board.inDetect = false;
				}
			});	
		} else {
			Board.inDetect = false;
		}
	}
	
	chrome.serial.getDevices(function(ports) {
		var port;
		
		// Remove all delete marks
		Board.port.markAllForDelete();
		
		// Process all ports and update previous ports with changes
		for(port = 0;port < ports.length;port++) {	
			if (!Adapters.isValidForPort(ports[port])) {
				continue;
			}
					
			// This port matches, and may be connected to a whitecat
			if (Board.port.isNew(ports[port].path)) {
				// Port is new
				// Probably user has plug something once pluging is started
				Board.port.add(ports[port].path);
			} else {
				// Port is not new
				// If is not connected 2 things may happend: board is not respond to commands
				// or board is in bootloader mode
				if (!Board.port.isConnected(ports[port].path)) {
					Board.port.addTestMark(ports[port].path);
				}

				// Remove delete mark
				Board.port.removeDeleteMark(ports[port].path);
			}
		}
		
		if (Board.ports.length == 0) {
			Board.inDetect = false;			
		} else {
			// Process all deleted ports
			for(port = 0;port < Board.ports.length;port++) {
				// Port is for delete, inform the UI
				if (Board.ports[port].forDelete) {
					if (Board.ports[port].state != Board.RECOVER_STATE) {
						if (Board.ports[port].state == Board.BAD_STATE) {
							bootbox.hideAll();
						}
						Board.ports.splice(port, 1);
						
						// Update status
						for(var key in Board.status.modules) {
							Board.status.modules[key] = false;
						}

						Code.boardDisconnected();
					} else {
						Board.ports.splice(port, 1);
					}
				}
			}	
			
			if (Board.ports.length == 0) {
				Board.inDetect = false;
			} else {
				if (Board.ports[0].forTest) {
					if (Board.ports[0].connId == null) {
						chrome.serial.connect(Board.ports[0].path, {bitrate: 115200, bufferSize: 4096}, function(connectionInfo) {
							if (Board.inRecover) {
								Board.ports[0].state = 6;
							}
							
							// Store connection id and name of port
							Board.ports[0].connId = connectionInfo.connectionId;
							
							// Init control signals
							chrome.serial.setControlSignals(Board.ports[0].connId, { dtr: false, rts: true }, function() {
								// Test port
								testPort(Board.ports[0]);
							});							
						});
					} else {
						testPort(Board.ports[0]);
					}
				} else {
					Board.inDetect = false;
				}
			}
		}		
		
	});	
};

// Init the whitecat, connecting to a serial port matching with the expected
// configuration
Board.init = function(state) {
	Board.inDetect = false;
	if (typeof state == 'undefined') {
		state = Board.BOOTING_STATE;
	}
	clearInterval(Board.detectInterval);
	
	for(var port = 0;port < Board.ports.length;port++) {
		Board.ports[port].state = state;
	}
	
	Board.inRecover = (state == 6);
	
	Board.updateMaps();
	
	Board.detectInterval = setInterval(function(){
		Board.detect();
	}, 100);

	if (state != Board.BOOTING_STATE) {
		if (!Board.runListenerRunning) {
			setTimeout(function() {
				Board.runListener();
			}, 50);
		}
	}
};

Board.runListenerRunning = false;
Board.runListenerCurrentReceived = "";

Board.runListener = function() {
	Board.runListenerRunning = true;
	
	while (Board.runQueue.length > 0) {
		var str = Board.runQueue.shift();
		
		for(var i = 0; i < str.length; i++) {
			if ((str.charAt(i) === '\n') || (str.charAt(i) === '\r')) {
				if (Board.runListenerCurrentReceived !== "") {
					var tmp = Board.runListenerCurrentReceived.match(/^(.*\.lua)\:([0-9]*)\:(.*)/);
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
				
				Board.runListenerCurrentReceived = "";
			} else {
				Board.runListenerCurrentReceived = Board.runListenerCurrentReceived + str.charAt(i);
			}
		}	
	}
	
	setTimeout(function() {
		Board.runListener();
	}, 50);
}


Board.sendAndRun = function(port, file, code, success, fail) {
	// First update autorun.lua, which run the target file
	Board.sendFile(port, "/autorun.lua", "dofile(\""+file+"\")\r\n", 
		function() {
			// Now write code to target file
			Board.sendFile(port, file, code, 
				function() {
					Term.enable();

					// Run the target file
					chrome.serial.send(port.connId, Board.str2ab("dofile(\""+file+"\")\r"), function() {
						success();
					});
			});		

	});			
};

Board.run = function(port, file, code, success, fail) {
	if (code.trim() == "") {
		success();
		return;
	}
		
	Term.disable();
	
	Board.reset(port, function() {
		Board.init(Board.BOOTING_STATE);
		
		// Wait for the connected state
		var currentInterval = setInterval(function() {
			if (port.state == Board.CONNECTED_STATE) {
				clearInterval(currentInterval);
				Board.sendAndRun(port, file, code, success, fail);
			}
		}, 100);		
	});	
};

// List a directory from the whitecat, and return an array of entries
Board.listDirectory = function(port, name, success, error) {
	Term.disable();
	Board.sendCommand(port, "os.ls('" + name + "')", 10000, 
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

Board.upgradeFirmware = function(port, code, callback) {
	Term.disable();
	chrome.serial.send(port.connId,  Board.str2ab("\r\nos.exit()\r\n"), function() {	
		stk500.upgradeFirmware(port, intelHex.parse(code), function() {
			Term.enable();
			callback();
		});
	});
}

Board.reboot = function(port, callback) {
	Term.disconnect();

	Board.reset(port, function() {
		Board.init(Board.BOOTING_STATE);
		callback();				
	});
}

// Get version of the firmware installed on the board
Board.getInstalledFirmwareVersion = function(port, success, error) {
	Term.disable();
	Board.sendCommand(port, 'do;local curr_os, curr_ver, curr_build = os.version();print("{\\"os\\":\\""..curr_os.."\\",\\"version\\":\\""..curr_ver.."\\",\\"build\\":\\""..curr_build.."\\"}");end;', 1000,
		function(resp) {
			Term.enable();

			try {
				resp = JSON.parse(resp);

				success(resp.os + "-" + resp.version.replace(" ","-") + "-" + resp.build);
			} catch (err) {
				error(Board.ERR_INVALID_RESPONSE);
			}
		},
		function(err) {
			Term.enable();
			error(err);
		}
	);	
}

// Get last published available firmware version
Board.getLastFirmwareAvailableVersion = function(success, error) {
	var xhr = new XMLHttpRequest();

    xhr.onreadystatechange = function() {
       if (xhr.readyState == 4 && xhr.status == 200) {
		   success(xhr.responseText.trim());
       } else {
		   if (xhr.readyState == 4 && xhr.status != 200) {
			   error(Board.ERR_CONNECTION_ERROR);
		   }
       }	   
    }

	xhr.open("GET", "https://raw.githubusercontent.com/whitecatboard/LuaOS/master/releases/current", true);
	xhr.send();	
}

// Get last published available firmware code
// In the whitecat code is an hex file
Board.getLastFirmwareAvailableCode = function(success, error) {
	Board.getLastFirmwareAvailableVersion(
		function(version) {
			var xhr = new XMLHttpRequest();
		
		    xhr.onreadystatechange = function() {
		       if (xhr.readyState == 4 && xhr.status == 200) {
				   success(xhr.responseText);
		       } else {
				   if (xhr.readyState == 4 && xhr.status != 200) {
					   error(Board.ERR_CONNECTION_ERROR);
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

Board.checkForNewFirmwareAvailability = function(port, success, error) {
	Board.getInstalledFirmwareVersion(port, 
		function(installedVersion) {
			installedVersion = installedVersion + ".hex";
			
			Board.getLastFirmwareAvailableVersion(
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

//var Board = Whitecat;

//if (Board.debug) {
//	chrome.app.window.create('debug.html', {
//		id: "debugwin",
//	});  
//}
