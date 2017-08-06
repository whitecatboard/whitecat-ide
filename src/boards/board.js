/*
 * Whitecat Ecosystem Blockly Based Web IDE
 *
 * Board definition functions
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

function board() {
	var thisInstance = this;
	
	// List of supported boards
	thisInstance.list = [
		{id: "N1ESP32", desc: "Whitecat N1 ESP32"},
		{id: "ESP32THING", desc: "ESP32 Thing"},
		{id: "ESP32COREBOARD", desc: "ESP32 Core Board"},
	];
}

// Get the board description identified by this id
board.prototype.getDesc = function(id) {
	var desc = "";
	
	this.list.forEach(function(element, index) {
		if (element.id == id) {
			desc = element.desc;
			
			return;
		}
	});
	
	return desc;
}

// Get the board definition identified by this id
board.prototype.get = function(id, callback) {
	if (typeof require != "undefined") {
		if (typeof require('nw.gui') != "undefined") {
		    var fs = require("fs");
		    var path = require('path');

		    var file = 'boards/defs/' + id + '.json';
		    var filePath = path.join(process.cwd(), file);  

			try {
				var data = fs.readFileSync(filePath, "utf8");
			} catch (error) {
				return;
			}

			try {
				var def = JSON.parse(data);

				callback(def);
			} catch (error) {
				callback(JSON.parse("{}"));			
			}
		} else {
			jQuery.ajax({
				url: Code.folder + "/boards/defs/" + id + ".json",
				success: function(result) {
					callback(result);
					return;
				},
		
				error: function() {
					callback(JSON.parse("{}"));			
				}
			});		
		}
	} else {
		jQuery.ajax({
			url: Code.folder + "/boards/defs/" + id + ".json",
			success: function(result) {
				callback(result);
				return;
			},
			error: function() {
				callback(JSON.parse("{}"));			
			}
		});				
	}
}

// Get the board definition identified by this id
board.prototype.getMaps = function(id, callback) {
	var thisInstance = this;

	thisInstance.get(id, function(board) {
		var maps = [];
	
		if (board.hasOwnProperty("digitalPins")) {
			maps["digitalPins"] = board.digitalPins;
		}

		if (board.hasOwnProperty("analogPins")) {
			maps["analogPins"] = board.analogPins;
		}

		if (board.hasOwnProperty("analogPinsChannel")) {
			maps["analogPinsChannel"] = board.analogPinsChannel;
		}

		if (board.hasOwnProperty("pwmPins")) {
			maps["pwmPins"] = board.pwmPins;
		}

		if (board.hasOwnProperty("pwmPinsChannel")) {
			maps["pwmPinsChannel"] = board.pwmPinsChannel;
		}

		if (board.hasOwnProperty("i2cUnits")) {
			maps["i2cUnits"] = board.i2cUnits;
		}

		if (board.hasOwnProperty("spiUnits")) {
			maps["spiUnits"] = board.spiUnits;
		}

		if (board.hasOwnProperty("uartUnits")) {
			maps["uartUnits"] = board.uartUnits;
		}

		if (board.hasOwnProperty("externalAdcUnits")) {
			maps["externalAdcUnits"] = board.externalAdcUnits;
		}
		
		callback(maps);		
	});
}