/*
 * Whitecat Blocky Environment, sensor blocks
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

goog.provide('Blockly.Blocks.sensor');

goog.require('Blockly.Blocks');

Blockly.Blocks.sensor.HUE = 290;

Blockly.Blocks['sensor_attach'] = {
	module: "sensor",
	createSensorIfNeeded: function(instance) {
		if (typeof instance.workspace.sensors == "undefined") return -1;

		// Get index for sensor
		var index = instance.workspace.sensorIndexOf(instance.name);

		// Sensor must be created
		if (index == -1) {
			instance.workspace.createSensor(
				undefined,
				Blockly.Sensors.createSetupStructure(instance.sid, instance.name, instance.interface, instance.pin, instance.unit, instance.device)
			);

			//Get index for sensor
			index = instance.workspace.sensorIndexOf(instance.name);
		}

		return index;
	},

	init: function() {
		this.setHelpUrl(Blockly.Msg.SENSOR_ATTACH_HELPURL);
		this.setColour(Blockly.Blocks.sensor.HUE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.SENSOR_ATTACH, "NAME");

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);

		this.setTooltip(Blockly.Msg.SENSOR_ATTACH_TOOLTIP);
	},

	mutationToDom: function() {
		var container = document.createElement('mutation');

		container.setAttribute('interface', this.interface);
		container.setAttribute('pin', this.pin);
		container.setAttribute('unit', this.unit);
		container.setAttribute('sid', this.sid);
		container.setAttribute('name', this.name);
		container.setAttribute('device', this.device);

		return container;
	},

	domToMutation: function(xmlElement) {
		this.interface = xmlElement.getAttribute('interface');
		this.pin = xmlElement.getAttribute('pin');
		this.unit = xmlElement.getAttribute('unit');
		this.sid = xmlElement.getAttribute('sid');
		this.name = xmlElement.getAttribute('name');
		this.device = xmlElement.getAttribute('device');

		this.updateShape_();
	},

	updateShape_: function() {
		this.createSensorIfNeeded(this);
		
		var label = this.sid;
		if (typeof Blockly.Msg[label] != "undefined") {
			label = Blockly.Msg[label];
		}
		
		this.getField("NAME").setText(Blockly.Msg.SENSOR_ATTACH.replace("%1", this.name).replace("%2", label));
	},

	customContextMenu: function(options) {
		var thisInstance = this;

		options.push({
			enabled: true,
			text: Blockly.Msg.EDIT_SENSOR,
			callback: function() {
				Blockly.Sensors.edit(thisInstance);
				return false;
			}
		});

		options.push({
			enabled: true,
			text: Blockly.Msg.REMOVE_SENSOR,
			callback: function() {
				Blockly.Sensors.remove(thisInstance);
				return false;
			}
		});

	},
};

Blockly.Blocks['sensor_read'] = {
	module: "sensor",
	createSensorIfNeeded: Blockly.Blocks['sensor_attach'].createSensorIfNeeded,

	init: function() {
		this.setHelpUrl(Blockly.Msg.SENSOR_READ_HELPURL);
		this.setColour(Blockly.Blocks.sensor.HUE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.SENSOR_READ1)
			.appendField(new Blockly.FieldDropdown([
				['magnitude', '']
			]), "PROVIDES")
			.appendField(Blockly.Msg.SENSOR_READ2, "NAME");
		this.setOutput(true);
		this.setTooltip(Blockly.Msg.SENSOR_READ_TOOLTIP);
	},

	mutationToDom: Blockly.Blocks['sensor_attach'].mutationToDom,
	domToMutation: Blockly.Blocks['sensor_attach'].domToMutation,

	updateShape_: function() {
		var index = this.createSensorIfNeeded(this);
		if (index == -1) return;

		// Build provides option list
		var provides = [];
		this.workspace.sensors.provides[index].forEach(function(item, index) {
			provides.push([item.id, item.id]);
		});

		var label = this.sid;
		if (typeof Blockly.Msg[label] != "undefined") {
			label = Blockly.Msg[label];
		}

		this.getField("NAME").setText(Blockly.Msg.SENSOR_READ2.replace("%1", this.name).replace("%2", label));
		this.getField("PROVIDES").menuGenerator_ = provides;
	},

	customContextMenu: Blockly.Blocks['sensor_attach'].customContextMenu,

	hasWatcher: true,
};

Blockly.Blocks['sensor_set'] = {
	module: "sensor",
	createSensorIfNeeded: Blockly.Blocks['sensor_attach'].createSensorIfNeeded,

	/**
	 * Mutator block for container.
	 * @this Blockly.Block
	 */
	init: function() {
		this.setHelpUrl(Blockly.Msg.SENSOR_SET_HELPURL);
		this.setColour(Blockly.Blocks.sensor.HUE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.SENSOR_SET1)
			.appendField(new Blockly.FieldDropdown([
				['', '']
			]), "PROPERTIES")
			.appendField(Blockly.Msg.SENSOR_SET2);

		this.appendValueInput("VALUE");

		this.appendDummyInput()
			.appendField("", "NAME");

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);

		this.setTooltip(Blockly.Msg.SENSOR_SET_TOOLTIP);
	},
	mutationToDom: Blockly.Blocks['sensor_attach'].mutationToDom,
	domToMutation: Blockly.Blocks['sensor_attach'].domToMutation,

	updateShape_: function() {
		var index = this.createSensorIfNeeded(this);
		if (index == -1) return;

		// Build properties option list
		var properties = [];
		this.workspace.sensors.properties[index].forEach(function(item, index) {
			properties.push([item.id, item.id]);
		});

		var label = this.sid;
		if (typeof Blockly.Msg[label] != "undefined") {
			label = Blockly.Msg[label];
		}

		this.getField("NAME").setText(Blockly.Msg.SENSOR_SET3.replace("%1", this.name).replace("%2", label));
		this.getField("PROPERTIES").menuGenerator_ = properties;
	},

	customContextMenu: Blockly.Blocks['sensor_attach'].customContextMenu,
};

Blockly.Blocks['sensor_when'] = {
	module: "sensor",
	createSensorIfNeeded: Blockly.Blocks['sensor_attach'].createSensorIfNeeded,

	init: function() {
		this.setHelpUrl(Blockly.Msg.SENSOR_WHEN_HELPURL);
		this.setColour(Blockly.Blocks.sensor.HUE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.SENSOR_WHEN1)
			.appendField(new Blockly.FieldDropdown([
				['magnitude', '']
			]), "PROVIDES")
			.appendField(Blockly.Msg.SENSOR_WHEN2, "NAME");
			
		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);
			
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setTooltip(Blockly.Msg.SENSOR_WHEN_TOOLTIP);		
	},

	mutationToDom: Blockly.Blocks['sensor_attach'].mutationToDom,
	domToMutation: Blockly.Blocks['sensor_attach'].domToMutation,

	updateShape_: function() {
		var index = this.createSensorIfNeeded(this);
		if (index == -1) return;

		// Build provides option list
		var provides = [];
		this.workspace.sensors.provides[index].forEach(function(item, index) {
			provides.push([item.id, item.id]);
		});

		var label = this.sid;
		if (typeof Blockly.Msg[label] != "undefined") {
			label = Blockly.Msg[label];
		}

		this.getField("NAME").setText(Blockly.Msg.SENSOR_WHEN2.replace("%1", this.name).replace("%2", label));
		this.getField("PROVIDES").menuGenerator_ = provides;
	},

	hasWatcher: false,
	customContextMenu: function(options) {
		if (!this.isCollapsed()) {
			// Optin for create magnitude getter
			var option = {
				enabled: true
			};
			var name = "value";
			option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
			var xmlField = goog.dom.createDom('field', null, name);
			xmlField.setAttribute('name', 'VAR');
			var xmlBlock = goog.dom.createDom('block', null, xmlField);
			xmlBlock.setAttribute('type', 'variables_get');
			option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
			options.push(option);
		}
	},
};
