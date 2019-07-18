 /*
 * Whitecat Blocky Environment, whitecat workspace
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
'use strict';

goog.require('Blockly.Workspace');
goog.require('Blockly.Sensors');

goog.require('goog.array');
goog.require('goog.math');

Blockly.Workspace.prototype.getSensors = function(callback) {
	if (typeof require != "undefined") {
		if (typeof require('nw.gui') != "undefined") {
		    var fs = require("fs");
		    var path = require('path');

		    var file = 'boards/defs/sensors.json';
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
				url: Code.folder + "/boards/defs/sensors.json",
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
			url: Code.folder + "/boards/defs/sensors.json",
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


Blockly.Workspace.prototype.wcInit = function() {
	var thisInstance = this;
	
	if (typeof this.lora == "undefined") {
		this.lora = {
			"band": "868",
			"activation": "OTAA",
			"freq": "868100000",
			"dr": "4",
			"role": "",
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

	if (typeof this.MQTT == "undefined") {
		this.MQTT = {
			"clientid": "",
			"host": "",
			"port": "1883",
			"secure": false,
			"username": "",
			"password": "",
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

	if (typeof this.allSensors == "undefined") {
		this.getSensors(function(info) {
			thisInstance.allSensors = info;			
		});
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

	if (typeof this.canFrames == "undefined") {
		this.canFrames = {
			"builtIn": [
				'frame'
			],

			"names": [], // Array of can frame names names in workspace
		};

		// Add built in 
		var i;
		for (i = 0; i < this.canFrames.builtIn.length; i++) {
			this.canFrames.names.push(this.canFrames.builtIn[i]);
		}
	}
	
	this.registerToolboxCategoryCallback(Blockly.Sensors.NAME_TYPE, Blockly.Sensors.flyoutCategory);
	this.registerToolboxCategoryCallback(Blockly.Lora.NAME_TYPE, Blockly.Lora.flyoutCategory);
	this.registerToolboxCategoryCallback(Blockly.Wifi.NAME_TYPE, Blockly.Wifi.flyoutCategory);
	this.registerToolboxCategoryCallback(Blockly.MQTT.NAME_TYPE, Blockly.MQTT.flyoutCategory);
}

Blockly.Workspace.prototype.eventIndexOf = function(name) {
	for (var i = 0, eventName; eventName = this.events.names[i]; i++) {
		if (Blockly.Names.equals(eventName, name)) {
			return i;
		}
	}

	return -1;
};

Blockly.Workspace.prototype.canFrameIndexOf = function(name) {
	for (var i = 0, frameName; frameName = this.canFrames.names[i]; i++) {
		if (Blockly.Names.equals(frameName, name)) {
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

Blockly.Workspace.prototype.doCreateCanFrame = function(oldName, newName) {
	// When we want to create can frame oldName = undefined, newName <> undefined
	// When we want to rename can frame oldName <> undefined, newName <> undefined
	var update = (typeof oldName != "undefined");
	if (!update) {
		oldName = newName;
	}

	// Get event index for oldName
	var index = this.canFrameIndexOf(oldName);
	if (update) {
		if (index == -1) {
			// Nothing to update, oldName doesn't exists
			return -1;
		} else {
			if (this.canFrameIndexOf(newName) == -1) {
				this.canFrames.names[index] = newName;
			} else {
				// Nothing to update, newName exists	
				return -1;
			}
		}
	} else {
		if (this.canFrameIndexOf(newName) == -1) {
			this.canFrames.names.push(newName);
		} else {
			// Nothing to create, newName exists	
			return -1;
		}
	}

	return this.canFrameIndexOf(newName);
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

Blockly.Workspace.prototype.createCanFrame = function(oldName, focus) {
	var thisInstance = this;
	var dialogForm = "";
	var edit = false;

	if (typeof oldName != "undefined") edit = true;

	if (edit) {
		// Get event index
		var index = this.canFrameIndexOf(oldName);

		if (index < this.canFrames.builtIn.length) {
			Code.showError(Blockly.Msg.ERROR, Blockly.Msg.CAN_FRAME_CANNOT_RENAME, function() {});

			return;
		}

	}

	dialogForm = '<form id="can_frame_form">';

	dialogForm += '<div>';
	dialogForm += '<label for="frame_name">' + Blockly.Msg.CAN_FRAME_NAME + ':&nbsp;&nbsp;</label>';

	if (edit) {
		dialogForm += '<input id="frame_name" frame_name="name" value="' + oldName + '">';
	} else {
		dialogForm += '<input id="frame_name" name="frame_name" value="">';
	}
	dialogForm += '</div>';
	dialogForm += '</form>';

	var dialog = bootbox.dialog({
		title: edit ? Blockly.Msg.EDIT_CAN_FRAME_TITLE : Blockly.Msg.NEW_CAN_FRAME_TITLE,
		message: dialogForm,
		buttons: {
			main: {
				label: edit ? Blockly.Msg.UPDATE : Blockly.Msg.CAN_FRAME_CREATE,
				clasevent: "btn-primary",
				callback: function() {
					var newName = jQuery("#can_frame_form").find("#frame_name").val();
					if (newName) {
						if ((thisInstance.canFrameIndexOf(newName) == -1) || (edit && oldName == newName)) {
							var index = thisInstance.doCreateCanFrame(
								edit ? oldName : undefined,
								newName
							);

							focus.setValue(newName);
							focus.setText(newName);
						} else {
							Code.showError(Blockly.Msg.ERROR, Blockly.Msg.CAN_FRAME_ALREADY_EXISTS.replace('%1', newName), function() {});
						}
					}
				}
			},
			danger: {
				label: Blockly.Msg.CAN_FRAME_CANCEL,
				clasevent: "btn-danger",
				callback: function() {}
			},
		},
		closable: false
	});

	dialog.one("shown.bs.modal", function() {
		dialog.find("#frame_name").focus();
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

Blockly.Workspace.prototype.deleteCanFrame = function(name, focus) {
	// Get event index
	var index = this.canFrameIndexOf(name);

	if (index < this.canFrames.builtIn.length) {
		Code.showError(Blockly.Msg.ERROR, Blockly.Msg.CAN_FRAME_CANNOT_REMOVE, function() {});
	} else {
		// Remove from names
		this.canFrames.names.splice(index, 1);
		focus.setValue(this.canFrames.names[0]);
		focus.setText(this.canFrames.names[0]);
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
			if ((blocks[i].type == 'sensor_attach') || (blocks[i].type == 'sensor_read') || (blocks[i].type == 'sensor_set') || (blocks[i].type == 'sensor_when')) {
				if (blocks[i]['name'] == oldName) {
					blocks[i]['interface'] = setup['interface'];
					blocks[i]['name'] = setup['name'];

					for (var j=0;j < blocks[i]['interface'].split(",").length;j++) {
						blocks[i]['interface'+j+'_unit'] = setup['interface'+j+'_unit'];
						blocks[i]['interface'+j+'_subunit'] = setup['interface'+j+'_subunit'];
						blocks[i]['interface'+j+'_device'] = setup['interface'+j+'_device'];
					}
					
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
			block.freq = setup.freq;
			block.role = setup.role;
			block.dr = setup.dr;
			block.retx = setup.retx;
			block.deveui = setup.deveui;
			block.appeui = setup.appeui;
			block.appkey = setup.appkey;
			block.devaddr = setup.devaddr;
			block.nwkskey = setup.nwkskey;
			block.appskey = setup.appskey;
		} else if (block.type == 'lora_start_gw') {
			block.band = setup.band;
			block.role = setup.role;
			block.freq = setup.freq;
			block.dr = setup.dr;
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

Blockly.Workspace.prototype.configureMQTT = function(setup) {
	var thisInstance = this;
	
	thisInstance.MQTT = setup;
	
	var blocks = this.getAllBlocks();
	
    for (var i = 0; i < blocks.length; i++) {
		var block = blocks[i];
				
		if ((block.type == 'mqtt_publish') || (block.type == 'mqtt_subscribe')) {
			block.clientid = setup.clientid;
			block.host = setup.host;
			block.port = setup.port;
			block.secure = setup.secure;
			block.username = setup.username;
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

Blockly.WorkspaceSvg.prototype.removeErrors = function() {
	var blocks = this.getAllBlocks();
	
    for (var i = 0; i < blocks.length; i++) {
		blocks[i].removeError();
		blocks[i].setWarningText(null, 2);
	}
}

Blockly.WorkspaceSvg.prototype.removeStarts = function() {
	var blocks = this.getAllBlocks();
	
    for (var i = 0; i < blocks.length; i++) {
		blocks[i].removeStart();
	}
}

Blockly.Workspace.prototype.migratePinField = function(xml) {
	var childCount = xml.childNodes.length;
	
    for (var i = 0; i < childCount; i++) {
      var xmlChild = xml.childNodes[i];
      var name = xmlChild.nodeName.toLowerCase(); 	
	  
	  if (name == "field") {
	  	var aName = xmlChild.getAttribute('name');
		if (aName == 'PIN') {
			var value = goog.dom.createDom('value');
			value.setAttribute('name', 'PIN');

			var shadow = goog.dom.createDom('shadow');
			shadow.setAttribute('type', 'output_digital_pin');
			
			var field = goog.dom.createDom('field');
			field.setAttribute('name', 'PIN');
			field.innerText = xmlChild.innerText;
			
			shadow.appendChild(field);
			value.appendChild(shadow);
			
			xml.childNodes[i].outerHTML = value.outerHTML;
		}
	  }  
    }
	
	return xml;
}

Blockly.Workspace.prototype.migrateExternalADC = function(xml, name) {
	if (typeof name == "undefined") {
		name = "";
	}
	
	for (var key in xml.childNodes) {
		var xmlChild = xml.childNodes[key];
		
		if (typeof xmlChild.nodeName != "undefined") {
			var node = xmlChild.nodeName.toLowerCase(); 
		
			if (node != "#text") {
				var name = xmlChild.getAttribute('name');
		
				if ((node == "value") || (node == "field")) {
					if (name == "UNIT") {
						this.migrateExternalADC(xmlChild, name);
					}
				} else if (node == "shadow") {
					this.migrateExternalADC(xmlChild, name);			
				}			
			} else {
				if (name == "UNIT") {
					// Get unit
					var unit = parseInt(xmlChild.textContent);
				
					// Check if unit is supported
					var units = Blockly.Blocks.io.helper.getExternalAdcUnits();
					var supported = false;
				
					for(var key in units) {
						var supportedUnit = parseInt(units[key][1]);
				
						if (unit == supportedUnit) {
							supported = true;
							break;
						}
					}
				
					// If unit is not supported replace by the first supported
					if (!supported) {
						for(var key in units) {
							// Get first unit
							xmlChild.textContent = units[key][1];
							break;
						}
				
					}
				}
			}	
		}		
	}
	
	return xml;
}

Blockly.Workspace.prototype.migrateExternalADCs = function(xml) {
	var childCount = xml.childNodes.length;
	var units = Blockly.Blocks.io.helper.getExternalAdcUnits();
	
    for (var i = 0; i < childCount; i++) {
      var xmlChild = xml.childNodes[i];
      var name = xmlChild.nodeName.toLowerCase(); 	
	  
	  if (name == "value") {
	  	var aName = xmlChild.getAttribute('name');
		if (aName == 'UNIT') {
		}
	  }  
    }
	
	return xml;
}

Blockly.Workspace.prototype.migrateTimeField = function(xml) {
	var childCount = xml.childNodes.length;
	
    for (var i = 0; i < childCount; i++) {
      var xmlChild = xml.childNodes[i];
      var name = xmlChild.nodeName.toLowerCase(); 	
	  
	  if (name == "field") {
	  	var aName = xmlChild.getAttribute('name');
		if (aName == 'time') {
			var value = goog.dom.createDom('value');
			value.setAttribute('name', 'TIME');
			
			var shadow = goog.dom.createDom('shadow');
			shadow.setAttribute('type', 'math_number');
			
			var field = goog.dom.createDom('field');
			field.setAttribute('name', 'NUM');
			field.innerText = xmlChild.innerText;
			
			shadow.appendChild(field);
			value.appendChild(shadow);
			
			xml.childNodes[i].outerHTML = value.outerHTML;
		}
	  }  
    }
	
	return xml;
}

Blockly.Workspace.prototype.migrateMutation = function(xml) {
	var childCount = xml.childNodes.length;
	
    for (var i = 0; i < childCount; i++) {
      var xmlChild = xml.childNodes[i];
      var name = xmlChild.nodeName.toLowerCase(); 	
	  
	  if (name == "mutation") {
		  if (xmlChild.getAttribute("pin") || xmlChild.getAttribute("device") || xmlChild.getAttribute("unit")) {
			  if (xmlChild.getAttribute("interface") == "ADC") {
				  if (!xmlChild.getAttribute("unit")) {
					  xmlChild.setAttribute("interface0_unit", 1);
					  xmlChild.setAttribute("interface0_subunit", xmlChild.getAttribute("pin"));
					  xmlChild.setAttribute("interface0_device", xmlChild.getAttribute("device"));			  					  	
				  } else {
					  if (!xmlChild.getAttribute("unit")) {
						  xmlChild.setAttribute("unit", 1);
					  }

					  xmlChild.setAttribute("interface0_unit", xmlChild.getAttribute("unit"));
					  xmlChild.setAttribute("interface0_subunit", xmlChild.getAttribute("pin"));
					  xmlChild.setAttribute("interface0_device", xmlChild.getAttribute("device"));			  					  	
				  }
			  } else {
				  if (!xmlChild.getAttribute("unit")) {
					  xmlChild.setAttribute("unit", 1);
				  }

				  xmlChild.setAttribute("interface0_unit", xmlChild.getAttribute("pin"));
				  xmlChild.setAttribute("interface0_subunit", xmlChild.getAttribute("unit"));
				  xmlChild.setAttribute("interface0_device", xmlChild.getAttribute("device"));			  	
			  }
			  
			  xmlChild.removeAttribute("pin");
			  xmlChild.removeAttribute("unit");
			  xmlChild.removeAttribute("device");
		  } else if (xmlChild.getAttribute("interface") == "ADC") {
		  	  //var unit = xmlChild.getAttribute("interface0_unit");
		  	  //var channel = xmlChild.getAttribute("interface0_subunit");
			  //var units = Blockly.Blocks.io.helper.getExternalAdcUnits();
			  //var channels = Blockly.Blocks.io.helper.getExternalAdcChannels(units[0][1]);
			  
			  //if (units[0][1] != units) {
			  //	xmlChild.setAttribute("interface0_unit", units[0][1]);
			  //}
			  
			  //if (channel > channels.length) {
			  //	xmlChild.setAttribute("interface0_subunit", 0);
			  //}
		  }
	  }  
    }

	return xml;
}

Blockly.Workspace.prototype.migratessss = function(xml) {
	var childCount = xml.childNodes.length;
	
    for (var i = 0; i < childCount; i++) {
      var xmlChild = xml.childNodes[i];
      var name = xmlChild.nodeName.toLowerCase(); 	 
	  
	  var type = "";
	  if (typeof xmlChild.getAttribute == "function") {
		  type = xmlChild.getAttribute('type');
	  }

	  if (
		  (type == 'setdigitalpin') || (type == 'getdigitalpin') || (type == 'getanalogpin') || (type == 'setpwmpin') || (type == 'when_digital_pin') ||
		   (type == 'servo_move')
	  ) {
		  xmlChild = this.migratePinField(xmlChild);
		  xmlChild = this.migrate(xmlChild);
	  } else if (type == 'wait_for'){
		  xmlChild = this.migrateTimeField(xmlChild);
		  xmlChild = this.migrate(xmlChild);
	  } else if ((type == 'sensor_read') || (type == 'sensor_set') || (type == 'sensor_when')) {
		  xmlChild = this.migrateMutation(xmlChild);
		  xmlChild = this.migrate(xmlChild);
	  } else if (type == 'getexternalanalogchannel') {
		  xmlChild = this.migrateExternalADC(xmlChild);
		  xmlChild = this.migrate(xmlChild);
	  } else if (type == 'sensor_read') {
	  } else {
		  xmlChild = this.migrate(xmlChild);
	  }	 	  
  	}
  
	return xml;
}

Blockly.Workspace.prototype.migrate = function(xml) {
	var nodes = xml.childNodes;
	var nodeCount = nodes.length;
	
	for (var i = 0; i < nodeCount; i++) {
		var node = nodes[i];
		
		if (typeof node.nodeName != "undefined") {
	        var nodeName = node.nodeName.toLowerCase(); 	 
			
			if (nodeName == "block") {
				var blockType = node.getAttribute('type');
				
				if (typeof Blockly.Blocks[blockType] != "undefined") {
					if (typeof Blockly.Blocks[blockType].migrate == "function") {							
						node = Blockly.Blocks[blockType].migrate(node);
					}
				}
			}
			
			this.migrate(node);
		}
	}	
	
/*	var childCount = xml.childNodes.length;
	
    for (var i = 0; i < childCount; i++) {
      var xmlChild = xml.childNodes[i];
      var name = xmlChild.nodeName.toLowerCase(); 	 
	  
	  var type = "";
	  if (typeof xmlChild.getAttribute == "function") {
		  type = xmlChild.getAttribute('type');
	  }

	  if (
		  (type == 'setdigitalpin') || (type == 'getdigitalpin') || (type == 'getanalogpin') || (type == 'setpwmpin') || (type == 'when_digital_pin') ||
		   (type == 'servo_move')
	  ) {
		  xmlChild = this.migratePinField(xmlChild);
		  xmlChild = this.migrate(xmlChild);
	  } else if (type == 'wait_for'){
		  xmlChild = this.migrateTimeField(xmlChild);
		  xmlChild = this.migrate(xmlChild);
	  } else if ((type == 'sensor_read') || (type == 'sensor_set') || (type == 'sensor_when')) {
		  xmlChild = this.migrateMutation(xmlChild);
		  xmlChild = this.migrate(xmlChild);
	  } else if (type == 'getexternalanalogchannel') {
		  xmlChild = this.migrateExternalADC(xmlChild);
		  xmlChild = this.migrate(xmlChild);
	  } else if (type == 'sensor_read') {
	  } else {
		  xmlChild = this.migrate(xmlChild);
	  }	 	  
  	}
  */
	return xml;
}

Blockly.Workspace.prototype.clear = function() {
  var existingGroup = Blockly.Events.getGroup();
  if (!existingGroup) {
    Blockly.Events.setGroup(true);
  }
  while (this.topBlocks_.length) {
    this.topBlocks_[0].dispose();
  }
  if (!existingGroup) {
    Blockly.Events.setGroup(false);
  }

  this.variableList.length = 0;


  this.lora = undefined;
  this.Wifi = undefined;
  this.MQTT = undefined;
  this.sensors = undefined;
  this.events = undefined;
  this.canFrames = undefined;
  
  this.wcInit();
};