/*
 * Whitecat Blocky Environment, io block definition
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
			pins.push([Code.status.maps.digitalPins[key][3] + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
		}

		return pins;
	},

	getInputDigitalPins: function() {
		var pins = [];

		for (var key in Code.status.maps.digitalPins) {
			if (Code.status.maps.digitalPins[key][1]) {
				pins.push([Code.status.maps.digitalPins[key][3] + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
			}
		}

		return pins;
	},

	getOutputDigitalPins: function() {
		var pins = [];

		for (var key in Code.status.maps.digitalPins) {
			if (Code.status.maps.digitalPins[key][2]) {
				pins.push([Code.status.maps.digitalPins[key][3] + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
			}
		}

		return pins;
	},

	getInputOutputDigitalPins: function() {
		var pins = [];

		for (var key in Code.status.maps.digitalPins) {
			if (Code.status.maps.digitalPins[key][1] && Code.status.maps.digitalPins[key][2]) {
				pins.push([Code.status.maps.digitalPins[key][3] + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
			}
		}

		return pins;
	},

	getAnalogPins: function() {
		var pins = [];

		for (var key in Code.status.maps.analogPins) {
			pins.push([Code.status.maps.analogPins[key][1] + ' - ' + Code.status.maps.analogPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
		}

		return pins;
	},

	getExternalAdcUnits: function() {
		var units = [];

		for (var key in Code.status.maps.externalAdcUnits) {
			if (Code.status.externalADC[Code.status.maps.externalAdcUnits[key][0]]) {
				units.push([Code.status.maps.externalAdcUnits[key][0], key]);
			}
		}

		return units;
	},

	getExternalAdcChannels: function(unit) {
		var channels = [];
		var i;

		for (i = 0; i < Code.status.maps.externalAdcUnits[unit][1]; i++) {
			if (Code.status.externalADC[Code.status.maps.externalAdcUnits[unit][0]]) {
				channels.push([Code.status.maps.externalAdcUnits[unit][3] + "%1".replace("%1", String(i)), i.toString()]);
			}
		}

		return channels;
	},

	getPwmPins: function() {
		var pins = [];

		for (var key in Code.status.maps.pwmPins) {
			pins.push([Code.status.maps.pwmPins[key][1] + ' - ' + Code.status.maps.pwmPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
		}

		return pins;
	},

	getUARTUnits: function() {
		var units = [];

		for (var key in Code.status.maps.uartUnits) {
			units.push([Code.status.maps.uartUnits[key][0], key]);
		}

		return units;
	},
};

Blockly.Blocks['output_digital_pin'] = {
	module: "pio",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getOutputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");

		this.setOutput(true, 'Pin');
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['output_digital_pin_sel'] = {
	module: "pio",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getOutputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.OUTPUT_PINS)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");

		this.setOutput(true, 'Pin');
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['input_digital_pin'] = {
	module: "pio",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getInputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");

		this.setOutput(true, 'Pin');
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['input_digital_pin_sel'] = {
	module: "pio",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getInputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.INPUT_PINS)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");

		this.setOutput(true, 'Pin');
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['pwm_pins'] = {
	module: "pwm",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getPwmPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");

		this.setOutput(true, 'Pin');
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['pwm_pins_sel'] = {
	module: "pwm",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getPwmPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.PWM_PINS)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");

		this.setOutput(true, 'Pin');
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['analog_pins'] = {
	module: "adc",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getAnalogPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");

		this.setOutput(true, 'Pin');
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['analog_pins_sel'] = {
	module: "adc",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getAnalogPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.ANALOG_PINS)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");

		this.setOutput(true, 'Pin');
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['uart_units'] = {
	module: "uart",
	init: function() {
		var thisInstance = this;
		var units = Blockly.Blocks.io.helper.getUARTUnits();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(units), "UNIT");

		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['external_analog_units'] = {
	module: "adc",
	init: function() {
		var thisInstance = this;
		var units = Blockly.Blocks.io.helper.getExternalAdcUnits();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(units), "UNIT");

		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	},
	onchange: function(e) {
		if (!this.workspace.isDragging || this.workspace.isDragging()) {
			return;
		}

		if (e.name != "UNIT") return;

		var unit = this.getFieldValue("UNIT");
		if (unit) {
			var drop = this.parentBlock_.childBlocks_[1].getField("CHANNEL");

			drop.menuGenerator_ = Blockly.Blocks.io.helper.getExternalAdcChannels(unit);
			drop.setText(Code.status.maps.externalAdcUnits[0][3] + "0");
			drop.setValue("0");
		}
	},
};

Blockly.Blocks['external_analog_channels'] = {
	module: "adc",
	init: function() {
		var thisInstance = this;
		var units = Blockly.Blocks.io.helper.getExternalAdcUnits();
		var channels = Blockly.Blocks.io.helper.getExternalAdcChannels(units[0][1]);

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(channels), "CHANNEL");

		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	},
};


Blockly.Blocks['setpwmpin'] = {
	module: "pwm",
	init: function() {
		var pins = Blockly.Blocks.io.helper.getPwmPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.setpwmpin);

		this.appendValueInput("PIN")
			.setCheck('Pin');

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

		this.updateBoardAtFieldChange("PIN");
		this.updateBoardAtFieldChange("FREQUENCY");
		this.updateBoardAtFieldChange("DUTY");
		this.updateBoardAtFieldChange("NUM");
	}
};

Blockly.Blocks['setdigitalpin'] = {
	module: "pio",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getOutputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.setdigitalpin)

		this.appendValueInput("PIN")
			.setCheck('Pin');

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

		this.updateBoardAtFieldChange("PIN");
		this.updateBoardAtFieldChange("VALUE");
	}
};

Blockly.Blocks['invertdigitalpin'] = {
	module: "pio",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getOutputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.invertdigitalpin)

		this.appendValueInput("PIN")
			.setCheck('Pin');

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');

		this.updateBoardAtFieldChange("PIN");
		this.updateBoardAtFieldChange("VALUE");
	}
};

Blockly.Blocks['getdigitalpin'] = {
	module: "pio",
	init: function() {
		var pins = Blockly.Blocks.io.helper.getInputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.getdigitalpin);

		this.appendValueInput("PIN")
			.setCheck('Pin');

		this.setOutput(true, 'Number');
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	},

	hasWatcher: true,
};

Blockly.Blocks['getanalogpin'] = {
	module: "adc",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.getanalogpin);

		this.appendValueInput("PIN")
			.setCheck('Pin');

		this.appendDummyInput()
			.appendField(Blockly.Msg.IN)
			.appendField(new Blockly.FieldDropdown([
				["mvolts", "mvolts"],
				["raw", "raw"]
			]), "FORMAT");
		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	},

	hasWatcher: true,
};

Blockly.Blocks['getexternalanalogchannel'] = {
	module: "adc",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.getexternalanalogchannel);

		this.appendValueInput("UNIT")
			.setCheck('Number');

		this.appendValueInput("CHANNEL")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(Blockly.Msg.IN)
			.appendField(new Blockly.FieldDropdown([
				["mvolts", "mvolts"],
				["raw", "raw"]
			]), "FORMAT");
		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	},

	hasWatcher: true,
};

Blockly.Blocks['when_digital_pin'] = {
	module: "pio",
	init: function() {
		var pins = Blockly.Blocks.io.helper.getInputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.EVENT_WHEN_DIGITAL_PIN);

		this.appendValueInput("PIN")
			.setCheck('Pin');

		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_WHEN_DIGITAL_CHANGES)
			.appendField(new Blockly.FieldDropdown(
				[
					[Blockly.Msg["positive_edge"], "IntrPosEdge"],
					[Blockly.Msg["negative_edge"], "IntrNegEdge"],
					[Blockly.Msg["any_edge"], "IntrAnyEdge"],
					[Blockly.Msg["low_level"], "IntrLowLevel"],
					[Blockly.Msg["high_level"], "IntrHighLevel"],
				]), "WHEN");

		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);

		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip(Blockly.Msg.EVENT_WHEN_DIGITAL_PIN_TOOLTIP);
	},
	onchange: function(e) {
		var self = this;
		
		this.checkUses(e, function(block) {
			return (
				(Blockly.Lua.valueToCode(block, 'PIN', Blockly.Lua.ORDER_NONE) == Blockly.Lua.valueToCode(self, 'PIN', Blockly.Lua.ORDER_NONE)) &&
				(block.getFieldValue('WHEN') == self.getFieldValue('WHEN'))
			);
		}, Blockly.Msg.WARNING_EVENTS_CAN_ONLY_PROCESSED_IN_ONE_EVENT_BLOCK);		
	},
};
