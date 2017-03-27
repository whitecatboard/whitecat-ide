/*
 * Whitecat Blocky Environment, Wi-Fi blocks
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

goog.provide('Blockly.Blocks.Wifi');

goog.require('Blockly.Blocks');

Blockly.Blocks.Wifi.HUE = 20;

Blockly.Blocks['wifi_start'] = {
	init: function() {
	    this.appendDummyInput()
	        .appendField(Blockly.Msg.WIFI_START);
	    this.setPreviousStatement(true, null);
	    this.setNextStatement(true, null);
	    this.setColour(Blockly.Blocks.Wifi.HUE);
	    this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},

	mutationToDom: function() {
		var container = document.createElement('mutation');

		container.setAttribute('wtype', this.wtype);
		container.setAttribute('ssid', this.ssid);
		container.setAttribute("password", this.password);

		return container;
	},

	domToMutation: function(xmlElement) {
		this.wtype = xmlElement.getAttribute('wtype');
		
		this.ssid = xmlElement.getAttribute('ssid');
		this.password = xmlElement.getAttribute("password");

		this.updateShape_();
	},

	updateShape_: function() {
		this.configureWifi(this);
	},

	configureWifi: function(instance) {
		instance.workspace.configureWifi({
			"wtype": instance.wtype,
			"ssid": instance.ssid,
			"password": instance.password,
		});
	},
};

Blockly.Blocks['wifi_stop'] = {
	init: function() {
	    this.appendDummyInput()
	        .appendField(Blockly.Msg.WIFI_STOP);
	    this.setPreviousStatement(true, null);
	    this.setNextStatement(true, null);
	    this.setColour(Blockly.Blocks.Wifi.HUE);
	    this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},

	configureWifi: Blockly.Blocks['wifi_start'].configureWifi,
	mutationToDom: Blockly.Blocks['wifi_start'].mutationToDom,
	domToMutation: Blockly.Blocks['wifi_start'].domToMutation,
	updateShape_: Blockly.Blocks['wifi_start'].updateShape_,
};
