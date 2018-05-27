/*
 * Whitecat Blocky Environment, Wi-Fi blocks
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

goog.provide('Blockly.Blocks.Wifi');

goog.require('Blockly.Blocks');

Blockly.Blocks.Wifi.HUE = 20;

Blockly.Blocks['wifi_start'] = {
	module: "net.wf",
	init: function() {
	    this.appendDummyInput()
	        .appendField(Blockly.Msg.WIFI_START);
	    this.setPreviousStatement(true, null);
	    this.setNextStatement(true, null);
	    this.setColour(Blockly.Blocks.Wifi.HUE);
	    this.setTooltip('');
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
	module: "net.wf",
	init: function() {
	    this.appendDummyInput()
	        .appendField(Blockly.Msg.WIFI_STOP);
	    this.setPreviousStatement(true, null);
	    this.setNextStatement(true, null);
	    this.setColour(Blockly.Blocks.Wifi.HUE);
	    this.setTooltip('');
	},

	configureWifi: Blockly.Blocks['wifi_start'].configureWifi,
	mutationToDom: Blockly.Blocks['wifi_start'].mutationToDom,
	domToMutation: Blockly.Blocks['wifi_start'].domToMutation,
	updateShape_: Blockly.Blocks['wifi_start'].updateShape_,
};

Blockly.Blocks['when_wifi_is_conneted'] = {
	module: "event",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_WHEN_WIFI_IS_CONNECTED);

		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);

		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_WHEN_WIFI_IS_CONNECTED_TOOLTIP);
	},
	onchange: function(e) {
		if (!this.workspace.isDragging || this.workspace.isDragging()) {
			return;
		}

		if ((typeof e.element != "undefined") && (this.warning != null) && (e.element == "disabled")) {
			if (e.blockId == this.id) {
				this.setDisabled(true);
				return;
			}
		}

		if ((typeof e.element != "undefined") && (e.element == "disabled")) {
			if ((e.newValue != e.oldValue) && (e.blockId == this.id)) {
				this.disabledByUser = e.newValue;
			}
		}

		var instances = 0;
		var blocks = this.workspace.getTopBlocks(true);
		for (var x = 0, block; block = blocks[x]; x++) {
			if (blocks[x].type == this.type) {
				instances++;
			}
		}

		if (instances > 1) {
			this.setWarningText(Blockly.Msg.WARNING_ONLY_ONE_INSTANCE_ALLOWED);
			if (!this.isInFlyout) {
				this.setDisabled(true);
			}
		} else {
			var wasInWarning = (this.warning != null);
			
			this.setWarningText(null);
			if (!this.isInFlyout && wasInWarning & (typeof this.disabledByUser == "undefined"?true:(!this.disabledByUser))) {
				this.setDisabled(false);
			} else {
				if (typeof this.disabledByUser != "undefined") {
					this.setDisabled(this.disabledByUser);
				}	
			}
		}
	},
	section: function() {
		return 'start';
	}
};

Blockly.Blocks['when_wifi_is_disconneted'] = {
	module: "event",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_WHEN_WIFI_IS_DISCONNECTED);

		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);

		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_WHEN_WIFI_IS_DISCONNECTED_TOOLTIP);
	},
	onchange: function(e) {
		if (!this.workspace.isDragging || this.workspace.isDragging()) {
			return;
		}

		if ((typeof e.element != "undefined") && (this.warning != null) && (e.element == "disabled")) {
			if (e.blockId == this.id) {
				this.setDisabled(true);
				return;
			}
		}

		if ((typeof e.element != "undefined") && (e.element == "disabled")) {
			if ((e.newValue != e.oldValue) && (e.blockId == this.id)) {
				this.disabledByUser = e.newValue;
			}
		}

		var instances = 0;
		var blocks = this.workspace.getTopBlocks(true);
		for (var x = 0, block; block = blocks[x]; x++) {
			if (blocks[x].type == this.type) {
				instances++;
			}
		}

		if (instances > 1) {
			this.setWarningText(Blockly.Msg.WARNING_ONLY_ONE_INSTANCE_ALLOWED);
			if (!this.isInFlyout) {
				this.setDisabled(true);
			}
		} else {
			var wasInWarning = (this.warning != null);
			
			this.setWarningText(null);
			if (!this.isInFlyout && wasInWarning & (typeof this.disabledByUser == "undefined"?true:(!this.disabledByUser))) {
				this.setDisabled(false);
			} else {
				if (typeof this.disabledByUser != "undefined") {
					this.setDisabled(this.disabledByUser);
				}	
			}
		}
	},
	section: function() {
		return 'start';
	}
};