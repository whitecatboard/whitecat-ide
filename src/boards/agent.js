/*
 * Whitecat Ecosystem Blockly Based Web IDE
 *
 * Conecction to The Whitecat Create Agent abstraction
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L.
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

function agent() {
	var thisInstance = this;
	
	// Board events
	thisInstance.boardEvents = [
		"boardUpgraded",
		"boardAttached",
		"boardDetached",
		"boardPowerOnReset",
		"blockStart",
		"blockEnd",
		"blockError",
		"blockErrorCatched",
		"boardUpdate",
		"boardConsoleOut",
		"boardRuntimeError",
    "invalidFirmware",
    "invalidPrerequisites"
	];

	// Board commands
	thisInstance.boardCommands = [
		"attachIde",
		"detachIde",
		"boardUpgrade",
		"boardInfo",
		"boardReset",
		"boardStop",	
		"boardGetDirContent",	
		"boardReadFile",
		"boardWriteFile",
		"boardRunProgram",
		"boardRunCommand",
		"boardRemoveFile",
    "boardInstall"
	];
	
	thisInstance.version = "";
	
	// Create a listener array for each board envent
	for(var i = 0;i < thisInstance.boardEvents.length;i++) {
		thisInstance[thisInstance.boardEvents[i] + 'Listeners'] = [];
		thisInstance[thisInstance.boardEvents[i] + 'ListenersOne'] = [];
	}
	
	// Create a listener array for each board command
	for(var i = 0;i < thisInstance.boardCommands.length;i++) {
		thisInstance[thisInstance.boardCommands[i] + 'Listeners'] = [];
		thisInstance[thisInstance.boardCommands[i] + 'ListenersOne'] = [];
	}
	
	// Control socket
	thisInstance.controlSocket = undefined;
	thisInstance.controlSocketConnected = false;

	// Console Up socket
	thisInstance.consoleUpSocket = undefined;
	thisInstance.consoleUpSocketConnected = false;

	// Console Down socket
	thisInstance.consoleDownSocket = undefined;
	thisInstance.consoleDownSocketConnected = false;
}

// This try to stablish a connection to the agent, and install all the
// required callbacks for monitor the websocket connection
agent.prototype.controlSocketConnect = function() {
	var thisInstance = this;
	var socket;
	
	// Extracted from https://www.websocket.org/js/echo.js
	if (window.MozWebSocket) {
		window.WebSocket = window.MozWebSocket;
	} else if (!window.WebSocket) {
		return;
	}
	 
	// Create the websocket
	socket = new WebSocket("ws://localhost:8080");
	
	// Open callback
    socket.addEventListener("open", function(event) {
		thisInstance.controlSocketConnected = true;
		thisInstance.controlSocket = socket;
		
		// Get the board definition
		Code.board.get(Code.settings.board, function(board) {
			// Try to stablish a connection with the agent
			Code.agent.send({command: "attachIde", arguments: {devices: Code.devices}}, function(id, info) {
			});	
		});		
    });

	// Mesage callback
    socket.addEventListener("message", function(event) {
		// Get data. Now data is a stringyfied JSON data.
		var data = event.data;

		// Some issues related whith later versions of the
		// create agent <= 1.2
		data = data.replace('"info": , "', '"');
		
		// JSON data
		var message = JSON.parse(data);
		
		thisInstance.callListeners(message.notify, message.info);
    });

	// Socket is closed
    socket.addEventListener("close", function(event) {
		thisInstance.controlSocket = undefined;

		if (thisInstance.controlSocketConnected) {
			thisInstance.callListeners("boardDetached","")			
		}

		thisInstance.controlSocketConnected = false;
		thisInstance.consoleUpSocketConnected = false;

		// Reeschelude the connection in a while
		setTimeout(function() {
			thisInstance.controlSocketConnect();
		}, 1000);
    });		
	
	// Socket is closed
    socket.addEventListener("error", function(event) {
		Status.show("Can't connect to agent");
	});
}

agent.prototype.consoleUpSocketConnect = function() {
	var thisInstance = this;
	var socket;
	
	if (typeof thisInstance.consoleUpSocket != "undefined") {
		return;
	}
	
	// Extracted from https://www.websocket.org/js/echo.js
	if (window.MozWebSocket) {
		window.WebSocket = window.MozWebSocket;
	} else if (!window.WebSocket) {
		return;
	}
	 
	// Create the websocket
    //socket = new WebSocket("wss://localhost:8081");
	socket = new WebSocket("ws://localhost:8080/up");
	
	// Open callback
    socket.addEventListener("open", function(event) {
		thisInstance.consoleUpSocketConnected = true;
		thisInstance.consoleUpSocket = socket;
    });

	// Mesage callback
    socket.addEventListener("message", function(event) {
		Term.write(event.data);
    });

	// Socket is closed
    socket.addEventListener("close", function(event) {
		thisInstance.consoleUpSocket = undefined;
		thisInstance.consoleUpSocketConnected = false;
		thisInstance.consoleDownSocketConnected = false;
		thisInstance.consoleUpSocket = undefined;
		thisInstance.consoleDownSocket = undefined;
		

		// Reeschelude the connection in a while
		setTimeout(function() {
			thisInstance.consoleUpSocketConnect();
		}, 1000);
    });		
	
	// Socket is closed
    socket.addEventListener("error", function(event) {
	});
}

agent.prototype.consoleDownSocketConnect = function() {
	var thisInstance = this;
	var socket;
	
	if (typeof thisInstance.consoleDownSocket != "undefined") {
		return;
	}
	
	// Extracted from https://www.websocket.org/js/echo.js
	if (window.MozWebSocket) {
		window.WebSocket = window.MozWebSocket;
	} else if (!window.WebSocket) {
		return;
	}
	 
	// Create the websocket
    //socket = new WebSocket("wss://localhost:8081");
	socket = new WebSocket("ws://localhost:8080/down");
	
	// Open callback
    socket.addEventListener("open", function(event) {
		thisInstance.consoleDownSocketConnected = true;
		thisInstance.consoleDownSocket = socket;
    });

	// Mesage callback
    socket.addEventListener("message", function(event) {
    });

	// Socket is closed
    socket.addEventListener("close", function(event) {
		thisInstance.consoleDownSocket = undefined;
		thisInstance.consoleDownSocketConnected = false;

		// Reeschelude the connection in a while
		setTimeout(function() {
			thisInstance.consoleDownSocketConnect();
		}, 1000);
    });		
	
	// Socket is closed
    socket.addEventListener("error", function(event) {
	});
}

/*
 * Helper functions
 */

// Call to all listeners registered for the id
// (can be a command or an event)
agent.prototype.callListeners = function(id, data) {
	var thisInstance = this;

	if (thisInstance.hasOwnProperty(id + 'Listeners')) {
		for(var i=0;i < thisInstance[id + 'Listeners'].length;i++) {
			thisInstance[id + 'Listeners'][i](id, data);
		}			
	}

	if (thisInstance.hasOwnProperty(id + 'ListenersOne')) {
		thisInstance[id + 'ListenersOne'] = thisInstance[id + 'ListenersOne'].filter(function(e){return e}); 
		
		for(var i=0;i < thisInstance[id + 'ListenersOne'].length;i++) {
			thisInstance[id + 'ListenersOne'][i](id, data);
			
			thisInstance[id + 'ListenersOne'][i] = null;
		}			
	}
};

// Add a listener for the id (can be a command or an event)
agent.prototype.addListener = function(id, callback) {
	var thisInstance = this;
	
	if (!thisInstance.hasOwnProperty(id + 'Listeners')) {
		throw "missingListener:" + id;
	}
	
	thisInstance[id + 'Listeners'].push(callback);
	
	return thisInstance[id + 'Listeners'].length;
};

agent.prototype.addListenerOne = function(id, callback) {
	var thisInstance = this;
	
	if (!thisInstance.hasOwnProperty(id + 'ListenersOne')) {
		throw "missingListener:" + id;
	}
	
	thisInstance[id + 'ListenersOne'].push(callback);
	
	return thisInstance[id + 'ListenersOne'].length;
};

// Send a command to the agent, when response is received callback is
// called
agent.prototype.send = function(command, callback) {
	var thisInstance = this;

	if (thisInstance.controlSocket) {
		// Install a listener for this command
		thisInstance.addListener(command.command, callback);
	
		// Send command
		thisInstance.controlSocket.send(JSON.stringify(command));
	} else {
		callback({});
	}
};