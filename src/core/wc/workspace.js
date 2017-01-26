/*
 * Whitecat Blocky Environment, whitecat workspace
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
'use strict';

goog.require('Blockly.Workspace');

goog.require('goog.array');
goog.require('goog.math');

Blockly.Workspace.prototype.wcInit = function() {
	if (typeof this.sensors == "undefined") {
		this.sensors = {
			"names": [], // Array of sensor names in workspace
			"provides": [], // Array of provides structure for each sensor {id: xxxx, type: xxx}
			"settings": [], // Array of settings structure for each sensor {id: xxxx, type: xxx}
			"setup": [], // Array of setup structure for each sensor {id: TMP36|DHT11|.., name: ..., interface: xxx, pin: xxx}		
		};
	}
}

Blockly.Workspace.prototype.sensorIndexOf = function(name) {
	for (var i = 0, sensorName; sensorName = this.sensors.names[i]; i++) {
		if (Blockly.Names.equals(sensorName, name)) {
			return i;
		}
	}

	return -1;
};

Blockly.Workspace.prototype.createSensor = function(oldName, setup) {
	var thisInstance = this;
	var update = (typeof oldName != "undefined");

	// Get sensor name in workspace
	var sname;

	if (update) {
		sname = oldName;
	} else {
		sname = setup.name;
	}

	// Get sensor index
	var index = this.sensorIndexOf(sname);

	if (update) {
		this.sensors.names[index] = setup.name;

		// Find sensor in board structures and copy setup, provides and settings
		Board.sensors.forEach(function(item, idx) {
			if (item.id == setup.id) {
				thisInstance.sensors.setup[index] = setup;
				thisInstance.sensors.provides[index] = item.provides;
				thisInstance.sensors.settings[index] = item.settings;
			}
		});

	    var blocks = this.getAllBlocks();

	    for (var i = 0; i < blocks.length; i++) {
			if ((blocks[i].type == 'sensor_attach') || (blocks[i].type == 'sensor_read') || (blocks[i].type == 'sensor_set')) {
				if (blocks[i].name == oldName) {
					blocks[i].interface = setup.interface;
					blocks[i].pin = setup.pin;
					blocks[i].sid = setup.id;
					blocks[i].name = setup.name;
					blocks[i].updateShape_();					
				}
			}
	    }
	} else {
		// If sensor is not created, create it
		if (index == -1) {
			// Push sensor name
			this.sensors.names.push(sname);

			// Get sensor index
			index = this.sensorIndexOf(sname);

			// Find sensor in board structures and copy setup, provides and settings
			Board.sensors.forEach(function(item, idx) {
				if (item.id == setup.id) {
					thisInstance.sensors.setup[index] = setup;
					thisInstance.sensors.provides[index] = item.provides;
					thisInstance.sensors.settings[index] = item.settings;
				}
			});
		}
	}
};
