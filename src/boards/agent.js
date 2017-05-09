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
		"boardUpdate",
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
	];
	
	// Create a listener array for each board envent
	for(var i = 0;i < thisInstance.boardEvents.length;i++) {
		thisInstance[thisInstance.boardEvents[i] + 'Listeners'] = [];
	}
	
	// Create a listener array for each board command
	for(var i = 0;i < thisInstance.boardCommands.length;i++) {
		thisInstance[thisInstance.boardCommands[i] + 'Listeners'] = [];
	}
	
	// The web socket instance used by the IDE
	thisInstance.socket = undefined;
	
	// Conected to the agent?
	thisInstance.connected = false;
}

// This try to stablish a connection to the agent, and install all the
// required callbacks for monitor the websocket connection
agent.prototype.socketConnect = function() {
	var thisInstance = this;
	var socket;
	
	// Create the websocket
    socket = new WebSocket("ws://localhost:8080", "echo-protocol");

	// Open callback
    socket.addEventListener("open", function(event) {
		thisInstance.connected = true;
		thisInstance.socket = socket;
		
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

		// JSON data
		var message = JSON.parse(data);
		
		thisInstance.callListeners(message.notify, message.info);
    });

	// Socket is closed
    socket.addEventListener("close", function(event) {
		thisInstance.socket = undefined;

		if (thisInstance.connected) {
			thisInstance.callListeners("boardDetached","")			
		}

		thisInstance.connected = false;

		// Reeschelude the connection in a while
		setTimeout(function() {
			thisInstance.socketConnect();
		}, 1000);
    });		
	
	// Socket is closed
    socket.addEventListener("error", function(event) {
		Code.showStatus(statusType.Alert, "Can't connect to agent");
	});
}

/*
 * Helper functions
 */

// Call to all listeners registered for the id
// (can be a command or an event)
agent.prototype.callListeners = function(id, data) {
	var thisInstance = this;
	var called = [];

	if (thisInstance.hasOwnProperty(id + 'Listeners')) {
		for(var i=0;i < thisInstance[id + 'Listeners'].length;i++) {
			called.push(i);
			
			thisInstance[id + 'Listeners'][i](id, data);
		}	
		
		for(var i=0; i < called.length;i++) {
			if (thisInstance.boardEvents.indexOf(id) == -1) {
				thisInstance[id + 'Listeners'].splice(i, 1);
			}
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

// Send a command to the agent, when response is received callback is
// called
agent.prototype.send = function(command, callback) {
	var thisInstance = this;

	if (thisInstance.socket) {
		// Install a listener for this command
		thisInstance.addListener(command.command, callback);
	
		// Send command
		thisInstance.socket.send(JSON.stringify(command));
	} else {
		callback({});
	}
};