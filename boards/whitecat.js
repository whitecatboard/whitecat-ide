var Whitecat = {};

Whitecat.chunkSize = 255;

Whitecat.ports = [];
Whitecat.port = {};

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
		if (Whitecat.ports[i].connId != null) {
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
	Whitecat.ports.push({path: path, connId: null, forTest: true, forDelete: false, mode: null});
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

Whitecat.checkConnection = function() {
//	if ((!Whitecat.connId) || (Whitecat.connId < 0)) {
//		 throw 'Invalid connection';
//	}	
}

// Send a command to the whitecat, and wait for the response
Whitecat.sendCommand = function(port, command, success, error) {
	var line = 0;
	var commandEcho = false;
	var commandResponse = "";
	var commandPrompt = false;
	var currentReceived = "";
	
	var waitForCommandEcho = false;
	var waitForPrompt = false;
	var response = "";
	
	Whitecat.checkConnection();

	function sendCommandListener(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);

			for(var i = 0; i < str.length; i++) {
				Whitecat.checkConnection();
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
			if (info.bytesSent == 0) {
				Whitecat.checkConnection();
			}
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
	
	Whitecat.checkConnection();

	function receiveChunkListener(info) {
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);
			for(var i = 0; i < str.length; i++) {
				Whitecat.checkConnection();
					
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
				Whitecat.checkConnection();
				
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
		
		Whitecat.checkConnection();
		chrome.serial.send(port.connId, Whitecat.str2ab(fileReceiveCommand), function() {
			Whitecat.checkConnection();
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
	
	Whitecat.checkConnection();

	function sendChunk() {
		// Get a new chunk
		var chunk = content.slice(outputIndex, outputIndex + Whitecat.chunkSize);

		// Send size
		chrome.serial.send(port.connId, Whitecat.str2ab(String.fromCharCode(chunk.length)), function(info) {
			Whitecat.checkConnection();
			
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
				Whitecat.checkConnection();
				
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
				Whitecat.checkConnection();
				
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
		
		Whitecat.checkConnection();
		chrome.serial.send(port.connId, Whitecat.str2ab(fileSendCommand), function() {
			Whitecat.checkConnection();
		});
	});
};

// Check if a file exists in the whitecat
Whitecat.fileExists = function(port, name, callback) {
	Whitecat.sendCommand(port, "do;local f = io.open('"+name+"',\"r\");if f ~= nil then io.close(f) print(\"true\") else print(\"false\") end end;", 
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
	
	Whitecat.checkConnection();

	function stopThreads() {
		Whitecat.sendCommand(port, "do;thread.stop();local n = thread.list(\"*n\");print(n);end;", 
			function(resp) {
				if (resp == "0") {
					Whitecat.sendCommand(port, "do;local curr_os, curr_ver = os.version();print(curr_os);end;", 
						function(resp) {
							if (resp == "LuaOS") {
								clearTimeout(currentTimeOut);
								success();
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
		var mustStopThreads = false;
		
	    if (info.connectionId == port.connId && info.data) {
			var str = Whitecat.ab2str(info.data);
						
			for(var i = 0; i < str.length; i++) {
				Whitecat.checkConnection();
				
				if ((str.charAt(i) === '\n') || (str.charAt(i) === '\r')) {
					currentReceived = "";
				} else {
					currentReceived = currentReceived + str.charAt(i);	

					if (currentReceived.match(/^lua\:.*interrupted\!$/g)) {
					}
									
					if (currentReceived.match(/^\/.*\>\s$/g)) {
						chrome.serial.onReceive.removeListener(stopListener);
						mustStopThreads = true;
					}
				}
			}		
		}		

		if (mustStopThreads) {
			stopThreads();
		}
	}
	
	function timeout() {
		chrome.serial.onReceive.removeListener(stopListener);
		error("timeout");
	}

	// Set a timeout
	currentTimeOut = setTimeout(function(){
		timeout();
	}, 2000);

	// Send a Ctrl-C for interrupt current running script
	Whitecat.checkConnection();
	chrome.serial.flush(port.connId, function(info) {
		Whitecat.checkConnection();
		chrome.serial.onReceive.addListener(stopListener);
		
		Whitecat.checkConnection();
		chrome.serial.send(port.connId, Whitecat.str2ab('\03'), function(info) {
			Whitecat.checkConnection();
		});			
	});
};

// Try to detect a Whitecat connected to serial port
Whitecat.detect = function() {
	var patt = /tty\.SLAB_USBtoUART/g;
	var timeoutTestBootloader;
	
	function reeschelude() {
		setTimeout(function(){
			Whitecat.detect();
		}, 500);
	}

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
		chrome.serial.flush(port.connId, function(result) {
			// Try to detect
			Whitecat.stop(
				port,
				function() {
					callback(true);				
				},
				function(error) {
					callback(false);
				}
			);								
		});			
	}

	function testPort(port) {
		if (port.connId == null) {
			// Try to connect
			chrome.serial.connect(port.path, {bitrate: 115200, bufferSize: 4096}, function(connectionInfo) {
				// Store connection id and name of port
				port.connId = connectionInfo.connectionId;
				
				testLuaOS(port, function(connected) {
					if (connected) {
						port.mode = "LuaOS";
						Code.boardConnected();
						reeschelude();
						return;
					} else {
						setTimeout(function(){
							testBootloader(port, function(connected) {
								if (connected) {
									port.mode = "Bootloader";
									
									Code.boardInBootloaderMode(function(upgrade) {
										if (!upgrade) {
											reeschelude();								
										} else {
											Whitecat.upgradeFirmware(port, function(data, error) {
												port.mode = null;
												
												Code.showInformation(MSG['firmwareUpgraded']);
												reeschelude();									
											});
										}
									});
								} else {
									reeschelude();
									return;									
								}
							});
						}, 2000);
					}
				});
			});						
		} else {
			if (port.mode == null) {				
				testLuaOS(port, function(connected) {
					if (connected) {
						port.mode = "LuaOS";
						Code.boardConnected();
						reeschelude();
						return;
					} else {
						setTimeout(function(){
							testBootloader(port, function(connected) {
								if (connected) {
									port.mode = "Bootloader";									
								} else {
									reeschelude();
									return;									
								}
							});
						}, 2000);
					}
				});
			} else {
				reeschelude();
			}
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
		
		// Process all ports
		for(port = 0;port < Whitecat.ports.length;port++) {
			// Port is for delete, inform the UI
			if (Whitecat.ports[port].forDelete) {
				Whitecat.ports.splice(port, 1);
				Code.boardDisconnected();
				reeschelude();
				return;				
			}

			if (Whitecat.ports[port].forTest) {
				testPort(Whitecat.ports[port]);
				return;				
			}
		}
		
		reeschelude();
	});	
};

// Init the whitecat, connecting to a serial port matching with the expected
// configuration
Whitecat.init = function() {
	setTimeout(function(){
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
	Whitecat.sendCommand(port, "os.ls('" + name + "')", 
		function(resp) {
			var entries = [];

			if (resp !== '') {
				resp.split('\n').forEach(function(item) {
					var elements = item.split('\t');
				
					var type = elements[0].trim();
					var size = elements[1].trim();
					var date = elements[2].trim();
					var entry = elements[3].trim();
				
					entries.push({type: type, size: size, date: date, name: entry});
				});
			}

			success(entries);
		},
		function(err) {
			error(err);
		}
	);			
}

Whitecat.upgradeFirmware = function(port, callback) {
	function loadFile(fileEntry) {
	    fileEntry.file(function(file) {
			var reader = new FileReader();
	    	reader.onload = function(e) {
				if (Whitecat.isConnected()) {
					chrome.serial.send(port.connId,  Whitecat.str2ab("os.exit()\r\n"), function() {
						stk500.upgradeFirmware(port, intelHex.parse(e.target.result), function() {
							callback();
						});
					});	
				} else {					
					stk500.upgradeFirmware(port, intelHex.parse(e.target.result), function() {
						callback();
					});
				}
	    	};
	    	reader.readAsText(file);
	    });
	};
	
	var extension = "hex";
	
    chrome.fileSystem.chooseEntry({
         type: 'openFile',
         suggestedName: 'untitled.'+ extension,
         accepts: [ { description: extension + ' files (*.' + extension + ')',
                      extensions: [extension]} ],
         acceptsAllTypes: false
     }, loadFile);		
}

Whitecat.reboot = function(port) {
	//Now run it!
	chrome.serial.send(port.connId,  Whitecat.str2ab("os.exit()\r\n"), function() {
		Whitecat.init();
	});	
}