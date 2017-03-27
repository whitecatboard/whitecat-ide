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
	if (typeof this.lora == "undefined") {
		this.lora = {
			"band": "868",
			"activation": "ABP",
			"dr": "0",
			"retx": "0",
			"adr": "false",
			"deveui": "",
			"appeui": "",
			"appkey": "",
			"devaddr": "",
			"nwkskey": "",
			"appskey": ""
		}
	}
	
	if (typeof this.Wifi == "undefined") {
		this.Wifi = {
			"wtype": "STA",
			"ssid": "",
			"password": ""
		}
	}

	if (typeof this.sensors == "undefined") {
		this.sensors = {
			"names": [], // Array of sensor names in workspace
			"provides": [], // Array of provides structure for each sensor {id: xxxx, type: xxx}
			"properties": [], // Array of property structure for each sensor {id: xxxx, type: xxx}
			"setup": [], // Array of setup structure for each sensor {id: TMP36|DHT11|.., name: ..., interface: xxx, pin: xxx}		
		};
	}

	if (typeof this.events == "undefined") {
		this.events = {
			"builtIn": [
				'event'
			],

			"names": [], // Array of event names in workspace
		};

		// Add built in events
		var i;
		for (i = 0; i < this.events.builtIn.length; i++) {
			this.events.names.push(this.events.builtIn[i]);
		}
	}
}

Blockly.Workspace.prototype.eventIndexOf = function(name) {
	for (var i = 0, eventName; eventName = this.events.names[i]; i++) {
		if (Blockly.Names.equals(eventName, name)) {
			return i;
		}
	}

	return -1;
};

Blockly.Workspace.prototype.doCreateEvent = function(oldName, newName) {
	// When we want to create event oldName = undefined, newName <> undefined
	// When we want to rename event oldName <> undefined, newName <> undefined
	var update = (typeof oldName != "undefined");
	if (!update) {
		oldName = newName;
	}

	// Get event index for oldName
	var index = this.eventIndexOf(oldName);
	if (update) {
		if (index == -1) {
			// Nothing to update, oldName doesn't exists
			return -1;
		} else {
			if (this.eventIndexOf(newName) == -1) {
				this.events.names[index] = newName;
			} else {
				// Nothing to update, newName exists	
				return -1;
			}
		}
	} else {
		if (this.eventIndexOf(newName) == -1) {
			this.events.names.push(newName);
		} else {
			// Nothing to create, newName exists	
			return -1;
		}
	}

	return this.eventIndexOf(newName);
};

Blockly.Workspace.prototype.createEvent = function(oldName, focus) {
	var thisInstance = this;
	var dialogForm = "";
	var edit = false;

	if (typeof oldName != "undefined") edit = true;

	if (edit) {
		// Get event index
		var index = this.eventIndexOf(oldName);

		if (index < this.events.builtIn.length) {
			Code.showError(Blockly.Msg.ERROR, Blockly.Msg.EVENT_CANNOT_RENAME, function() {});

			return;
		}

	}

	dialogForm = '<form id="event_form">';

	dialogForm += '<div>';
	dialogForm += '<label for="event_name">' + Blockly.Msg.EVENT_NAME + ':&nbsp;&nbsp;</label>';

	if (edit) {
		dialogForm += '<input id="event_name" event_name="name" value="' + oldName + '">';
	} else {
		dialogForm += '<input id="event_name" name="event_name" value="">';
	}
	dialogForm += '</div>';
	dialogForm += '</form>';

	var dialog = bootbox.dialog({
		title: edit ? Blockly.Msg.EDIT_EVENT_TITLE : Blockly.Msg.NEW_EVENT_TITLE,
		message: dialogForm,
		buttons: {
			main: {
				label: edit ? Blockly.Msg.UPDATE : Blockly.Msg.EVENT_CREATE,
				clasevent: "btn-primary",
				callback: function() {
					var newName = jQuery("#event_form").find("#event_name").val();
					if (newName) {
						if ((thisInstance.eventIndexOf(newName) == -1) || (edit && oldName == newName)) {
							var index = thisInstance.doCreateEvent(
								edit ? oldName : undefined,
								newName
							);

							focus.setValue(newName);
							focus.setText(newName);
						} else {
							Code.showError(Blockly.Msg.ERROR, Blockly.Msg.EVENT_ALREADY_EXISTS.replace('%1', newName), function() {});
						}
					}
				}
			},
			danger: {
				label: Blockly.Msg.EVENT_CANCEL,
				clasevent: "btn-danger",
				callback: function() {}
			},
		},
		closable: false
	});

	dialog.one("shown.bs.modal", function() {
		dialog.find("#event_name").focus();
	});
};

Blockly.Workspace.prototype.deleteEvent = function(name, focus) {
	// Get event index
	var index = this.eventIndexOf(name);

	if (index < this.events.builtIn.length) {
		Code.showError(Blockly.Msg.ERROR, Blockly.Msg.EVENT_CANNOT_REMOVE, function() {});
	} else {
		// Remove from names
		this.events.names.splice(index, 1);
		focus.setValue(this.events.names[0]);
		focus.setText(this.events.names[0]);
	}
};

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

		// Find sensor in board structures and copy setup, provides and properties
		Code.status.sensors.forEach(function(item, idx) {
			if (item.id == setup.id) {
				thisInstance.sensors.setup[index] = setup;
				thisInstance.sensors.provides[index] = item.provides;
				thisInstance.sensors.properties[index] = item.properties;
			}
		});

		var blocks = this.getAllBlocks();

		for (var i = 0; i < blocks.length; i++) {
			if ((blocks[i].type == 'sensor_attach') || (blocks[i].type == 'sensor_read') || (blocks[i].type == 'sensor_set')) {
				if (blocks[i]['name'] == oldName) {
					blocks[i]['interface'] = setup['interface'];
					blocks[i].pin = setup.pin;
					blocks[i].sid = setup.id;
					blocks[i]['name'] = setup['name'];
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

			// Find sensor in board structures and copy setup, provides and properties
			Code.status.sensors.forEach(function(item, idx) {
				if (item.id == setup.id) {
					thisInstance.sensors.setup[index] = setup;
					thisInstance.sensors.provides[index] = item.provides;
					thisInstance.sensors.properties[index] = item.properties;
				}
			});
		}
	}
};

Blockly.Workspace.prototype.configureLora = function(setup) {
	var thisInstance = this;
	
	thisInstance.lora = setup;
	
	var blocks = this.getAllBlocks();
	
    for (var i = 0; i < blocks.length; i++) {
		var block = blocks[i];
				
		if ((block.type == 'lora_join') || (block.type == 'lora_tx')) {
			block.band = setup.band;
			block.activation = setup.activation;
			block.dr = setup.dr;
			block.retx = setup.retx;
			block.deveui = setup.deveui;
			block.appeui = setup.appeui;
			block.appkey = setup.appkey;
			block.devaddr = setup.devaddr;
			block.nwkskey = setup.nwkskey;
			block.appskey = setup.appskey;
		}
	}
};

Blockly.Workspace.prototype.configureWifi = function(setup) {
	var thisInstance = this;
	
	thisInstance.Wifi = setup;
	
	var blocks = this.getAllBlocks();
	
    for (var i = 0; i < blocks.length; i++) {
		var block = blocks[i];
				
		if ((block.type == 'wifi_start') || (block.type == 'wifi_stop')) {
			block.wtype = setup.wtype;
			block.ssid = setup.ssid;
			block.password = setup.password;
		}
	}
};

Blockly.Workspace.prototype.removeSensor = function(sensor) {
	// Get sensor index
	var index = this.sensorIndexOf(sensor.name);

	// Remove from names
	this.sensors.names.splice(index, 1);
	this.sensors.provides.splice(index, 1);
	this.sensors.properties.splice(index, 1);
	this.sensors.setup.splice(index, 1);

	// Refresh toolbox
	this.toolbox_.refreshSelection();

	// Remove from workspace
	var blocks = this.getAllBlocks();

	for (var i = 0; i < blocks.length; i++) {
		if ((blocks[i].type == 'sensor_attach') || (blocks[i].type == 'sensor_read') || (blocks[i].type == 'sensor_set')) {
			if (blocks[i].name == sensor.name) {
				blocks[i].dispose(true);
			}
		}
	}
}

/**
 * Select this block.  Highlight it visually as block has an error.
 */
Blockly.BlockSvg.prototype.addError = function() {
  Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
                    'blocklyError');
  // Move the selected block to the top of the stack.
  var block = this;
  do {
    var root = block.getSvgRoot();
    root.parentNode.appendChild(root);
    block = block.getParent();
  } while (block);
};

/**
 * Unselect this block.  Remove its highlighting as block has not an error.
 */
Blockly.BlockSvg.prototype.removeError = function() {
  Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_),
                       'blocklyError');
};

/**
 * Select this block.  Highlight it visually as block is running.
 */
Blockly.BlockSvg.prototype.addStart = function() {
  Blockly.utils.addClass(/** @type {!Element} */ (this.svgGroup_),
                    'blocklyStarted');
  // Move the selected block to the top of the stack.
  var block = this;
  do {
    var root = block.getSvgRoot();
    root.parentNode.appendChild(root);
    block = block.getParent();
  } while (block);
};

/**
 * Unselect this block.  Remove its highlighting as block is not running.
 */
Blockly.BlockSvg.prototype.removeStart = function() {
  Blockly.utils.removeClass(/** @type {!Element} */ (this.svgGroup_),
                       'blocklyStarted');
};

Blockly.Css.CONTENT.push(
  '.blocklyStarted>.blocklyPath {',
    'stroke: #00c800;',
    'stroke-width: 4px;',
  '}'
);

Blockly.Css.CONTENT.push(
  '.blocklyStarted>.blocklyPathLight {',
    'display: none;',
  '}'
);

Blockly.Css.CONTENT.push(
  '.blocklyError>.blocklyPath {',
    'stroke: #ff0000;',
    'stroke-width: 4px;',
  '}'
);

Blockly.Css.CONTENT.push(
  '.blocklyError>.blocklyPathLight {',
    'display: none;',
  '}'
);

/**
 * Change the colour of a block.
 */
Blockly.BlockSvg.prototype.updateColour = function() {
  if (this.disabled) {
    // Disabled blocks don't have colour.
    return;
  }
  var hexColour = this.getColour();
  var rgb = goog.color.hexToRgb(hexColour);
  if (this.isShadow()) {
    //rgb = goog.color.lighten(rgb, 0.6);
    hexColour = goog.color.rgbArrayToHex(rgb);
    this.svgPathLight_.style.display = 'none';
    this.svgPathDark_.setAttribute('fill', hexColour);
  } else {
    this.svgPathLight_.style.display = '';
    var hexLight = goog.color.rgbArrayToHex(goog.color.lighten(rgb, 0.3));
    var hexDark = goog.color.rgbArrayToHex(goog.color.darken(rgb, 0.2));
    this.svgPathLight_.setAttribute('stroke', hexLight);
    this.svgPathDark_.setAttribute('fill', hexDark);
  }
  this.svgPath_.setAttribute('fill', hexColour);

  var icons = this.getIcons();
  for (var i = 0; i < icons.length; i++) {
    icons[i].updateColour();
  }

  // Bump every dropdown to change its colour.
  for (var x = 0, input; input = this.inputList[x]; x++) {
    for (var y = 0, field; field = input.fieldRow[y]; y++) {
      field.setText(null);
    }
  }
};

Blockly.WorkspaceSvg.prototype.removeErrors = function() {
	var blocks = this.getAllBlocks();
	
    for (var i = 0; i < blocks.length; i++) {
		blocks[i].removeError();
		blocks[i].setWarningText(null);
	}
}

Blockly.WorkspaceSvg.prototype.removeStarts = function() {
	var blocks = this.getAllBlocks();
	
    for (var i = 0; i < blocks.length; i++) {
		blocks[i].removeStart();
	}
}
