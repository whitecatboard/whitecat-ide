var Whitecat = {};

Whitecat.connId = null;
Whitecat.connPort = null;
Whitecat.chunkSize = 255;

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
	if ((!Whitecat.connId) || (Whitecat.connId < 0)) {
		 throw 'Invalid connection';
	}	
}

// Send a command to the whitecat, and wait for the response
Whitecat.sendCommand = function(command, success, error) {
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
	    if (info.connectionId == Whitecat.connId && info.data) {
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
	
	chrome.serial.flush(Whitecat.connId, function(result) {
		waitForCommandEcho = true;
		waitForPrompt = false;
		chrome.serial.onReceive.addListener(sendCommandListener);
		chrome.serial.send(Whitecat.connId, Whitecat.str2ab(command + '\r\n'), function(info) {
			if (info.bytesSent == 0) {
				Whitecat.checkConnection();
			}
		});		
	});
};

// Receive file from the whitecat
Whitecat.receiveFile = function(fileName, received) {
	var outputIndex = 0;
	var currentReceived = "";
	var fileReceiveCommand =  "io.send(\"" + fileName + "\")\r";
	var waitForC = false;
	var waitForN = false;
	var vaitForS = false;
	var size = 0;
	
	Whitecat.checkConnection();

	function receiveChunkListener(info) {
	    if (info.connectionId == Whitecat.connId && info.data) {
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
		chrome.serial.send(Whitecat.connId, Whitecat.str2ab('C\n'), function() {
		});
	}
	
	function waitForCommandEcho(info) {
	    if (info.connectionId == Whitecat.connId && info.data) {
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

	chrome.serial.flush(Whitecat.connId, function(result) {
		chrome.serial.onReceive.addListener(waitForCommandEcho);
		
		Whitecat.checkConnection();
		chrome.serial.send(Whitecat.connId, Whitecat.str2ab(fileReceiveCommand), function() {
			Whitecat.checkConnection();
		});
	});
};

// Send file to the whitecat
Whitecat.sendFile = function(fileName, content, sended) {
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
		chrome.serial.send(Whitecat.connId, Whitecat.str2ab(String.fromCharCode(chunk.length)), function(info) {
			Whitecat.checkConnection();
			
			if (chunk.length > 0) {
				// Send chunk
				chrome.serial.send(Whitecat.connId, Whitecat.str2ab(chunk), function(info) {					
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
	    if (info.connectionId == Whitecat.connId && info.data) {
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
	    if (info.connectionId == Whitecat.connId && info.data) {
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

	chrome.serial.flush(Whitecat.connId, function(result) {
		chrome.serial.onReceive.addListener(waitForCommandEcho);
		
		Whitecat.checkConnection();
		chrome.serial.send(Whitecat.connId, Whitecat.str2ab(fileSendCommand), function() {
			Whitecat.checkConnection();
		});
	});
};

// Check if a file exists in the whitecat
Whitecat.fileExists = function(name, callback) {
	Whitecat.sendCommand("do;local f = io.open('"+name+"',\"r\");if f ~= nil then io.close(f) print(\"true\") else print(\"false\") end end;", 
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
Whitecat.stop = function(success, error) {
	var currentReceived = "";
	
	Whitecat.checkConnection();

	function stopThreads() {
		Whitecat.sendCommand("do;thread.stop();local n = thread.list(\"*n\");print(n);end;", 
			function(resp) {
				if (resp == "0") {
					Whitecat.sendCommand("do;local curr_os, curr_ver = os.version();print(curr_os);end;", 
						function(resp) {
							if (resp == "LuaOS") {
								success();
							}
						},
						function(err) {
							error(err);
						}
					);
				}
			},
			function(err) {
				error(err);
			}
		);		
	}
	
	function stopListener(info) {
		var mustStopThreads = false;
		
	    if (info.connectionId == Whitecat.connId && info.data) {
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

	// Send a Ctrl-C for interrupt current running script
	Whitecat.checkConnection();
	chrome.serial.flush(Whitecat.connId, function(info) {
		Whitecat.checkConnection();
		chrome.serial.onReceive.addListener(stopListener);
		
		Whitecat.checkConnection();
		chrome.serial.send(Whitecat.connId, Whitecat.str2ab('\03'), function(info) {
			Whitecat.checkConnection();
		});			
	});
};

// Try to detect a Whitecat connected to serial port
Whitecat.detect = function() {
	var patt = /tty\.SLAB_USBtoUART/g;
	
	function reeschelude() {
		setTimeout(function(){
			Whitecat.detect();
		}, 500);
	}

	function testPort(port) {
		if (port.path != Whitecat.connPort) {
			// Try to connect
			chrome.serial.connect(port.path, {bitrate: 115200, bufferSize: 4096}, function(connectionInfo) {
				// Store connection id and name of port
				Whitecat.connId = connectionInfo.connectionId;
				Whitecat.connPort = port.path;
				
				chrome.serial.flush(Whitecat.connId, function(result) {
					Whitecat.stop(
						function() {
							// There's a whitecat on this port
							Code.boardConnected();
							reeschelude();
						},
						function() {
							// No whitecat connected to this port
							Code.boardDisconnected();
							reeschelude();
						}
					);		
				});				
			});			
		} else {
			reeschelude();
		}
	}
	
	chrome.serial.getDevices(function(ports) {
		var port;
		
		// Get ports that match an expected connected whitecat
		for(port=0;port < ports.length;port++) {
			if (patt.test(ports[port].path)) {
				// Port match
				
				// Check if port it's the current connected port
				// If it's the connected port boar is still connect
				if ((Whitecat.connId != -1) && (Whitecat.connPort == ports[port].path)) {
					reeschelude();
					break;
				} else {
					if (!(Whitecat.connId) || (Whitecat.connId == -1)) {
						testPort(ports[port]);
						break;
					} else {
						reeschelude();
					}
				}
			}
		}
		
		if (port >= ports.length) {
			if ((Whitecat.connId == null) || (Whitecat.connId != -1)) {
				Whitecat.connId = -1;
				Whitecat.connPort = null;
				
				Code.boardDisconnected();
			}
			
			Whitecat.connId = -1;
			Whitecat.connPort = null;

			reeschelude();
		};
	});	
};

// Init the whitecat, connecting to a serial port matching with the expected
// configuration
Whitecat.init = function() {
	setTimeout(function(){
		Whitecat.detect();
	}, 1000);
};

// Run current generated code to the whitecat
Whitecat.run = function(file, code, success, fail) {
	var currentReceived = "";
	
	if (code.trim() == "") {
		success();
		return;
	}
		
	chrome.serial.flush(Whitecat.connId, function() {
		// Stop anything running
		Whitecat.stop(
			function() {
				// Whitecat is stopped
				// Send code
				Whitecat.sendFile(file, code, 
					function() {
						// Code is sended

						//Now run it!
						chrome.serial.send(Whitecat.connId,  Whitecat.str2ab("dofile(\"/sd/autorun.lua\")\r\n"), function() {
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
Whitecat.listDirectory = function(name, success, error) {
	Whitecat.sendCommand("os.ls('" + name + "')", 
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