/*
 * Whitecat Blocky Environment, MQTT blocks
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

goog.provide('Blockly.Blocks.MQTT');

goog.require('Blockly.Blocks');

Blockly.Blocks.MQTT.HUE = 20;

Blockly.Blocks['mqtt_publish'] = {
	module: "mqtt",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.MQTT_PUBLISH);
		this.appendValueInput("PAYLOAD")
			.setCheck(null);
		this.appendValueInput("TOPIC")
			.setCheck(null)
			.appendField(Blockly.Msg.MQTT_TO_TOPIC);
		this.appendDummyInput()
			.appendField(Blockly.Msg.MQTT_QOS)
			.appendField(new Blockly.FieldDropdown([
				["QOS0", "0"],
				["QOS1", "1"],
				["QOS2", "2"]
			]), "QOS");
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.MQTT.HUE);
		this.setTooltip('');
	},

	mutationToDom: function() {
		var container = document.createElement('mutation');

		container.setAttribute('clientid', this.clientid);
		container.setAttribute('host', this.host);
		container.setAttribute("port", this.port);
		container.setAttribute("secure", this.secure);
		container.setAttribute("username", this.username);
		container.setAttribute("password", this.password);

		return container;
	},

	domToMutation: function(xmlElement) {
		this.clientid = xmlElement.getAttribute('clientid');
		this.host = xmlElement.getAttribute("host");
		this.port = xmlElement.getAttribute("port");
		this.secure = xmlElement.getAttribute("secure");
		this.username = xmlElement.getAttribute("username");
		this.password = xmlElement.getAttribute("password");

		this.updateShape_();
	},

	updateShape_: function() {
		this.configureMQTT(this);
	},

	configureMQTT: function(instance) {
		instance.workspace.configureMQTT({
			"clientid": instance.clientid,
			"host": instance.host,
			"port": instance.port,
			"secure": instance.secure,
			"username": instance.username,
			"password": instance.password,
		});
	},
};

Blockly.Blocks['mqtt_subscribe'] = {
	module: "mqtt",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.MQTT_SUBSCRIBE);
		this.appendValueInput("TOPIC")
			.setCheck(null);
		this.appendDummyInput()
			.appendField(Blockly.Msg.MQTT_QOS)
			.appendField(new Blockly.FieldDropdown([
				["QOS0", "0"],
				["QOS1", "1"],
				["QOS2", "2"]
			]), "QOS")
			.appendField(Blockly.Msg.PROCEDURES_BEFORE_PARAMS + " length, payload");

		this.appendStatementInput("DO")
			.setCheck(null);
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(230);
		this.setTooltip('');
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.MQTT.HUE);
		this.setTooltip('');
	},
	onchange: function(e) {	
		var self = this;
		
		this.checkUses(e, function(block) {
			return (Blockly.Lua.valueToCode(block, 'TOPIC', Blockly.Lua.ORDER_NONE) == Blockly.Lua.valueToCode(self, 'TOPIC', Blockly.Lua.ORDER_NONE));
		}, Blockly.Msg.WARNING_EVENTS_CAN_ONLY_PROCESSED_IN_ONE_EVENT_BLOCK);		
	},
	section: function() {
		return 'default';
	},

	configureMQTT: Blockly.Blocks['mqtt_publish'].configureMQTT,
	mutationToDom: Blockly.Blocks['mqtt_publish'].mutationToDom,
	domToMutation: Blockly.Blocks['mqtt_publish'].domToMutation,
	updateShape_: Blockly.Blocks['mqtt_publish'].updateShape_,
	customContextMenu: function(options) {
		if (!this.isCollapsed()) {
			// Optin for create port getter
			var option = {
				enabled: true
			};
			var name = "length";
			option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
			var xmlField = goog.dom.createDom('field', null, name);
			xmlField.setAttribute('name', 'VAR');
			var xmlBlock = goog.dom.createDom('block', null, xmlField);
			xmlBlock.setAttribute('type', 'variables_get');
			option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
			options.push(option);

			// Optin for create payload getter
			var option = {
				enabled: true
			};
			var name = "payload";
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
