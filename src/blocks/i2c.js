/*
 * Whitecat Blocky Environment, i2c block definition
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

goog.provide('Blockly.Blocks.i2c');

goog.require('Blockly.Blocks');

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.i2c.HUE = 20;

Blockly.Blocks['i2csetspeed'] = {
	module: "i2c",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.i2cUnits) {
			modules.push([Code.status.maps.i2cUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.i2cSetSpeedFor)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");

		this.appendDummyInput()
			.appendField(Blockly.Msg.i2cSpeed);
		this.appendValueInput("SPEED")
			.setCheck('Number');
		this.appendDummyInput()
			.appendField(Blockly.Msg.hz);

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.i2c.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	}
};

Blockly.Blocks['i2cstartcondition'] = {
	module: "i2c",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.i2cUnits) {
			modules.push([Code.status.maps.i2cUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.i2cStartConditionFor)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");

			this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.i2c.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	}
};

Blockly.Blocks['i2cstopcondition'] = {
	module: "i2c",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.i2cUnits) {
			modules.push([Code.status.maps.i2cUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.i2cStopConditionFor)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.i2c.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	}
};

Blockly.Blocks['i2caddress'] = {
	module: "i2c",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.i2cUnits) {
			modules.push([Code.status.maps.i2cUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.i2cAddress)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");

		this.appendValueInput("ADDRESS")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(Blockly.Msg.for)
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.read, 'read'],
				[Blockly.Msg.write, 'write']
			]), "DIRECTION");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.i2c.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	}
};

Blockly.Blocks['i2cread'] = {
	module: "i2c",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.i2cUnits) {
			modules.push([Code.status.maps.i2cUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.i2cReadFrom)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");
		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.i2c.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	}
};

Blockly.Blocks['i2cwrite'] = {
	module: "i2c",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.i2cUnits) {
			modules.push([Code.status.maps.i2cUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.i2cWriteTo)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");

		this.appendValueInput("VALUE")
			.setCheck('Number');

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.i2c.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	}
};
