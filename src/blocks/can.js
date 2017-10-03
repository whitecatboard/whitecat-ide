/*
 * Whitecat Blocky Environment, can block definition
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

goog.provide('Blockly.Blocks.can');

goog.require('Blockly.Blocks');

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.can.HUE = 20;

Blockly.Blocks['cansetspeed'] = {
	module: "can",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.canUnits) {
			modules.push([Code.status.maps.canUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.CAN_SET_SPEED)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");

		this.appendDummyInput()
			.appendField(Blockly.Msg.TO);

		this.appendValueInput("SPEED")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField("Kbps");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_SET_SPEED_TOOLTIP);
	}
};

Blockly.Blocks['cansetfilter'] = {
	module: "can",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.canUnits) {
			modules.push([Code.status.maps.canUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.CAN_SET_FILTER)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE")
			.appendField(Blockly.Msg.CAN_SET_FILTER_FROM);

		this.appendValueInput("FROM")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(Blockly.Msg.CAN_SET_FILTER_TO);

		this.appendValueInput("TO")
			.setCheck('Number');

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_SET_SPEED_TOOLTIP);
	}
};

Blockly.Blocks['canread'] = {
	module: "can",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.canUnits) {
			modules.push([Code.status.maps.canUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.CAN_READ)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE")
			.appendField(Blockly.Msg.CAN_GET_TO_FRAME)
			.appendField(new Blockly.wc.FieldCanFrame("frame"), "FRAME");
			
			
			this.setInputsInline(true);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_READ_TOOLTIP);
	}
};

Blockly.Blocks['canframeget'] = {
	module: "can",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.canUnits) {
			modules.push([Code.status.maps.canUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
		    .appendField(Blockly.Msg.CAN_GET)
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.CAN_GET_IDENTIFIER, "id"],
				[Blockly.Msg.CAN_GET_TYPE, "type"],
				[Blockly.Msg.CAN_GET_LEN, "len"],
				[Blockly.Msg.CAN_GET_D0, "d0"],
				[Blockly.Msg.CAN_GET_D1, "d1"],
				[Blockly.Msg.CAN_GET_D2, "d2"],
				[Blockly.Msg.CAN_GET_D3, "d3"],
				[Blockly.Msg.CAN_GET_D4, "d4"],
				[Blockly.Msg.CAN_GET_D5, "d5"],
				[Blockly.Msg.CAN_GET_D6, "d6"],
				[Blockly.Msg.CAN_GET_D7, "d7"],
			]), "FIELD")
			.appendField(Blockly.Msg.CAN_GET_FROM_FRAME)
			.appendField(new Blockly.wc.FieldCanFrame("frame"), "FRAME");

			
		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_GET_TOOLTIP);
	}
};

Blockly.Blocks['canframeset'] = {
	module: "can",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.canUnits) {
			modules.push([Code.status.maps.canUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
		    .appendField(Blockly.Msg.CAN_SET)
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.CAN_GET_IDENTIFIER, "id"],
				[Blockly.Msg.CAN_GET_TYPE, "type"],
				[Blockly.Msg.CAN_GET_LEN, "len"],
				[Blockly.Msg.CAN_GET_D0, "d0"],
				[Blockly.Msg.CAN_GET_D1, "d1"],
				[Blockly.Msg.CAN_GET_D2, "d2"],
				[Blockly.Msg.CAN_GET_D3, "d3"],
				[Blockly.Msg.CAN_GET_D4, "d4"],
				[Blockly.Msg.CAN_GET_D5, "d5"],
				[Blockly.Msg.CAN_GET_D6, "d6"],
				[Blockly.Msg.CAN_GET_D7, "d7"],
			]), "FIELD")
			.appendField(Blockly.Msg.CAN_SET_TO_FRAME)
			.appendField(new Blockly.wc.FieldCanFrame("frame"), "FRAME");

		this.appendDummyInput()
			.appendField(Blockly.Msg.CAN_SET_TO_VALUE);

		this.appendValueInput("VALUE");
		
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_SET_TOOLTIP);
	},
	onchange: function(e) {
		if (!this.workspace.isDragging || this.workspace.isDragging()) {
			return;
		}

		var field = this.getFieldValue('FIELD');
		var value = Blockly.Lua.valueToCode(this, 'VALUE', Blockly.Lua.ORDER_NONE)
	
		if (field == "type") {
			if ((value != "0") && (value != "1") && (value != "can.STD") && (value != "can.EXT")) {
				this.setWarningText(Blockly.Msg.WARNING_CAN_INVALID_TYPE);			
				this.setDisabled(true);	
			} else {
				this.setDisabled(false);
				this.setWarningText(null);				
			}
		} else if ((field == "d0") || (field == "d1") || (field == "d2") || (field == "d3") || (field == "d4") || (field == "d5") || (field == "d6") || (field == "d7"))  {
			if ((parseInt(value) < 0) || (parseInt(value) > 255)) {
				this.setWarningText(Blockly.Msg.WARNING_CAN_INVALID_DATA);	
				this.setDisabled(true);											
			} else {
				this.setDisabled(false);
				this.setWarningText(null);	
			}
		} else if (field == "len") {
			if ((parseInt(value) < 0) || (parseInt(value) > 8)) {
				this.setWarningText(Blockly.Msg.WARNING_CAN_INVALID_LEN);			
				this.setDisabled(true);	
			} else {
				this.setDisabled(false);
				this.setWarningText(null);					
			}
		}
	},
};

Blockly.Blocks['canframewrite'] = {
	module: "can",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.canUnits) {
			modules.push([Code.status.maps.canUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.CAN_WRITE)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE")
			.appendField(Blockly.Msg.CAN_WRITE_FRAME)
		.appendField(new Blockly.wc.FieldCanFrame("frame"), "FRAME");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_WRITE_TOOLTIP);
	}
};

Blockly.Blocks['cantype'] = {
	module: "can",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
		.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.CAN_STD, "std"],
				[Blockly.Msg.CAN_EXT, "ext"],
			]), "TYPE");
		
		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_TYPE_TOOLTIP);
	}
};
