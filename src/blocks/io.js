/*
 * Whitecat Blocky Environment, io block definition
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

goog.provide('Blockly.Blocks.io');
goog.provide('Blockly.Blocks.io.helper');

goog.require('Blockly.Blocks');

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.io.HUE = 260;

Blockly.Blocks.io.helper = {
	getDigitalPins: function() {
		var pins = [];

		for (var key in Code.status.maps.digitalPins) {
			pins.push([key + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
		}	
	
		return pins;		
	},

	getInputDigitalPins: function() {
		var pins = [];

		for (var key in Code.status.maps.digitalPins) {
			if (Code.status.maps.digitalPins[key][1]) {
				pins.push([key + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
			}
		}	
	
		return pins;		
	},
	
	getOutputDigitalPins: function() {
		var pins = [];

		for (var key in Code.status.maps.digitalPins) {
			if (Code.status.maps.digitalPins[key][2]) {
				pins.push([key + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
			}
		}	
	
		return pins;		
	},

	getAnalogPins: function() {
		var pins = [];

		for (var key in Code.status.maps.analogPins) {
			pins.push([key + ' - ' + Code.status.maps.analogPins[key].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
		}

		return pins;		
	},

	getPwmPins: function() {
		var pins = [];

		for (var key in Code.status.maps.pwmPins) {
			pins.push([key + ' - ' + Code.status.maps.pwmPins[key].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
		}

		return pins;		
	},
};

Blockly.Blocks['setpwmpin'] = {
	init: function() {
		var pins = Blockly.Blocks.io.helper.getPwmPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.setpwmpin)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");
		this.appendDummyInput()
			.appendField(Blockly.Msg.FREQUENCY);
		this.appendValueInput("FREQUENCY")
			.setCheck('Number');
		this.appendDummyInput()
			.appendField(Blockly.Msg.HERTZS)
			.appendField(Blockly.Msg.DUTY);
		this.appendValueInput("DUTY")
			.setCheck('Number');
		this.appendDummyInput()
			.appendField(Blockly.Msg.PERCENT);
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');

		this.updateBoardAtFieldChange("PIN");
		this.updateBoardAtFieldChange("FREQUENCY");
		this.updateBoardAtFieldChange("DUTY");
		this.updateBoardAtFieldChange("NUM");
	}
};

Blockly.Blocks['setdigitalpin'] = {
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getOutputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.setdigitalpin)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");
			
		this.appendDummyInput()
			.appendField(' ' + Blockly.Msg.TO + ' ')
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.HIGH, "1"],
				[Blockly.Msg.LOW, "0"]
			]), "VALUE");
			
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');

		this.updateBoardAtFieldChange("PIN");
		this.updateBoardAtFieldChange("VALUE");
	}
};

Blockly.Blocks['getdigitalpin'] = {
	init: function() {
		var pins = Blockly.Blocks.io.helper.getInputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.getdigitalpin)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");
		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},

	hasWatcher: true,
};

Blockly.Blocks['getanalogpin'] = {
	init: function() {
		var pins = Blockly.Blocks.io.helper.getAnalogPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.getanalogpin)
			.appendField(new Blockly.FieldDropdown(pins), "PIN")
			.appendField(Blockly.Msg.IN)
			.appendField(new Blockly.FieldDropdown([["mvolts", "mvolts"],["raw", "raw"]]), "FORMAT");
		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
		this.setHelpUrl('http://www.example.com/');
	},

	hasWatcher: true,
};

Blockly.Blocks['when_digital_pin'] = {
	init: function() {
		var pins = Blockly.Blocks.io.helper.getInputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.EVENT_WHEN_DIGITAL_PIN)
			.appendField(new Blockly.FieldDropdown(pins), "PIN")
			.appendField(Blockly.Msg.EVENT_WHEN_DIGITAL_CHANGES)
			.appendField(new Blockly.FieldDropdown(
				[
					[Blockly.Msg["positive_edge"],"IntrPosEdge"],
					[Blockly.Msg["negative_edge"],"IntrNegEdge"],
					[Blockly.Msg["any_edge"],"IntrAnyEdge"],
					[Blockly.Msg["low_level"],"IntrLowLevel"],
					[Blockly.Msg["high_level"],"IntrHighLevel"],
				]), "WHEN");

		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);
				
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip(Blockly.Msg.EVENT_WHEN_DIGITAL_PIN_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.EVENT_WHEN_DIGITAL_PIN_HELPURL);
	}
};