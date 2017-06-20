/*
 * Whitecat Blocky Environment, lora blocks
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

goog.provide('Blockly.Blocks.lora');

goog.require('Blockly.Blocks');

Blockly.Blocks.lora.HUE = 20;

Blockly.Blocks['lora_configure'] = {
	module: "lora",
	init: function() {
		var bands = [];

		bands.push(['868', 'lora.BAND868']);
		bands.push(['433', 'lora.BAND433']);

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.configureLora)
			.appendField(new Blockly.FieldDropdown(bands), "BAND");
		this.appendDummyInput()
			.appendField(' ' + Blockly.Msg.MHZ + ' ' + Blockly.Msg.BAND);

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},
};

Blockly.Blocks['lora_set_deveui'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_DEVEUI);

		this.appendValueInput("DEVEUI");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},
};

Blockly.Blocks['lora_set_appeui'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_APPEUI);

		this.appendValueInput("APPEUI");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},
};

Blockly.Blocks['lora_set_devaddr'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_DEVADDR);

		this.appendValueInput("DEVADDR");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},
};

Blockly.Blocks['lora_set_nwkskey'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_NWKSKEY);

		this.appendValueInput("NWKSKEY");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},
};

Blockly.Blocks['lora_set_appskey'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_APPSKEY);

		this.appendValueInput("APPSKEY");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},
};

Blockly.Blocks['lora_set_appkey'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_APPKEY);

		this.appendValueInput("APPKEY");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},
};

Blockly.Blocks['lora_set_adr'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_ADR);

		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.TRUE, "1"],
				[Blockly.Msg.FALSE, "0"]
			]), "ON_OFF");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},
};

Blockly.Blocks['lora_set_dr'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_DR);

		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown([
				["0", "0"],
				["1", "1"],
				["2", "2"],
				["3", "3"],
				["4", "4"],
				["5", "5"],
				["6", "6"],
				["7", "7"]
			]), "DR");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},
};

Blockly.Blocks['lora_set_retx'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_RETX);

		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown([
				["0", "0"],
				["1", "1"],
				["2", "2"],
				["3", "3"],
				["4", "4"],
				["5", "5"],
				["6", "6"],
				["7", "7"]
			]), "RETX");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},
};

Blockly.Blocks['lora_join'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_JOIN);

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},

	mutationToDom: function() {
		var container = document.createElement('mutation');

		container.setAttribute('band', this.band);
		container.setAttribute('activation', this.activation);
		container.setAttribute("dr", this.dr);
		container.setAttribute("adr", this.adr);
		container.setAttribute("retx", this.retx);
		container.setAttribute("deveui", this.deveui);
		container.setAttribute("appeui", this.appeui);
		container.setAttribute("appkey", this.appkey);
		container.setAttribute("devaddr", this.devaddr);
		container.setAttribute("nwkskey", this.nwkskey);
		container.setAttribute("appskey", this.appskey);

		return container;
	},

	domToMutation: function(xmlElement) {
		this.interface = xmlElement.getAttribute('interface');

		this.band = xmlElement.getAttribute('band');
		this.activation = xmlElement.getAttribute("activation");
		this.dr = xmlElement.getAttribute("dr");
		this.adr = xmlElement.getAttribute("adr");
		this.retx = xmlElement.getAttribute("retx");
		this.deveui = xmlElement.getAttribute("deveui");
		this.appeui = xmlElement.getAttribute("appeui");
		this.appkey = xmlElement.getAttribute("appkey");
		this.devaddr = xmlElement.getAttribute("devaddr");
		this.nwkskey = xmlElement.getAttribute("nwkskey");
		this.appskey = xmlElement.getAttribute("appskey");

		this.updateShape_();
	},

	updateShape_: function() {
		this.configureLora(this);
	},

	configureLora: function(instance) {
		instance.workspace.configureLora({
			"band": instance.band,
			"activation": instance.activation,
			"dr": instance.dr,
			"retx": instance.retx,
			"adr": instance.adr,
			"deveui": instance.deveui,
			"appeui": instance.appeui,
			"appkey": instance.appkey,
			"devaddr": instance.devaddr,
			"nwkskey": instance.nwkskey,
			"appskey": instance.appskey
		});
	},
};

Blockly.Blocks['lora_tx'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_TX);

		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.LORA_CONFIRMED, "1"],
				[Blockly.Msg.LORA_UNCONFIRMED, "0"]
			]), "CONF")
			.appendField(Blockly.Msg.LORA_FRAME);

		this.appendValueInput("PORT")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(Blockly.Msg.LORA_PAYLOAD);

		this.appendValueInput("PAYLOAD");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},

	configureLora: Blockly.Blocks['lora_join'].configureLora,
	mutationToDom: Blockly.Blocks['lora_join'].mutationToDom,
	domToMutation: Blockly.Blocks['lora_join'].domToMutation,
	updateShape_: Blockly.Blocks['lora_join'].updateShape_,
};

Blockly.Blocks['when_i_receive_a_lora_frame'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_WHEN_I_RECEIVE_A_LORA_FRAME)
			.appendField(Blockly.Msg.PROCEDURES_BEFORE_PARAMS + " port, payload");


		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);


		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip(Blockly.Msg.EVENT_WHEN_I_RECEIVE_A_LORA_FRAME_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.EVENT_WHEN_I_RECEIVE_A_LORA_FRAME_HELPURL);
	},
	onchange: function(e) {
		if (!this.workspace.isDragging || this.workspace.isDragging()) {
			return;
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
			if (!this.isInFlyout && !this.getInheritedDisabled()) {
				this.setDisabled(true);
			}
		} else {
			this.setWarningText(null);
			if (!this.isInFlyout) {
				this.setDisabled(false);
			}
		}
	},
	section: function() {
		return 'declaration';
	},
	customContextMenu: function(options) {
		if (!this.isCollapsed()) {
			// Optin for create port getter
			var option = {
				enabled: true
			};
			var name = "port";
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
