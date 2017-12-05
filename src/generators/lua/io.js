/*
 * Whitecat Blocky Environment, io block code generation
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

goog.provide('Blockly.Lua.io');
goog.provide('Blockly.Lua.io.helper');

goog.require('Blockly.Lua');

Blockly.Lua.io.helper = {
	isDigital: function(block, test, output) {
		if (output) {
			return (
				((test.type == 'setdigitalpin') && (block.getFieldValue('PIN') == test.getFieldValue('PIN')))
			);			
		} else {
			return (
				((test.type == 'getdigitalpin') && (block.getFieldValue('PIN') == test.getFieldValue('PIN')))
			);						
		}
	},
	
	hasAncestorsDigital: function(block, output) {
		var previous = block.previousConnection;

		while (previous) {
			previous = previous.targetBlock();
			if (previous) {
				if (Blockly.Lua.io.helper.isDigital(block, previous, output)) {
					return true;
				}
			
				previous = previous.previousConnection;				
			}
		}
		
		return false;
	},
	
	nameDigital: function(block, name) {
		if (typeof name == "undefined") {
			name = "PIN";
		}
		
		var pin = Blockly.Lua.statementToCodeNoIndent(block,name)[0];
		if (typeof pin == "undefined") {
			pin = block.getFieldValue(name);
		}
		
		return pin;
	},
	
	instanceDigital: function(block, name) {
		if (typeof name == "undefined") {
			name = "PIN";
		}

		var pin = Blockly.Lua.statementToCodeNoIndent(block,name)[0];
		if (typeof pin == "undefined") {
			pin = block.getFieldValue(name);
		}
		
		if (pin.indexOf("pio.") === 0) {
			pin = pin.replace("pio.","");
		}
		
		return "_pio_" + pin;
	},

	attachDigital: function(block, output) {
		var code = '';

		if (!Blockly.Lua.io.helper.hasAncestorsDigital(block, output)) {
			code += Blockly.Lua.indent(0,'if (('+Blockly.Lua.io.helper.instanceDigital(block)+' == nil) or ('+Blockly.Lua.io.helper.instanceDigital(block)+' == ' + (output?"pio.INPUT":"pio.OUTPUT")+')) then') + "\n";
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instanceDigital(block) + " = ") + (output?"pio.OUTPUT":"pio.INPUT") + "\n";
			
			if (output) {
				code += Blockly.Lua.indent(1,'pio.pin.setdir(pio.OUTPUT, ' + Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";
				code += Blockly.Lua.indent(1,'pio.pin.setpull(pio.NOPULL, '+ Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";
				code += Blockly.Lua.indent(0,'end') + "\n\n";
			} else {
				code += Blockly.Lua.indent(1,'pio.pin.setdir(pio.INPUT, ' + Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";
				code += Blockly.Lua.indent(1,'pio.pin.setpull(pio.PULLUP, '+ Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";
				code += Blockly.Lua.indent(0,'end') + "\n\n";				
			}
		}

		return code;
	},
	
	isAnalog: function(block, test) {
		return (
			((test.type == 'getanalogpin') && (block.getFieldValue('PIN') == test.getFieldValue('PIN')))
		);			
	},

	isExternalAnalog: function(block, test) {
		return (
			((test.type == 'getexternalanalogchannel') && (block.getFieldValue('UNIT') == test.getFieldValue('UNIT')) && (block.getFieldValue('CHANNEL') == test.getFieldValue('CHANNEL')))
		);			
	},
	
	hasAncestorsAnalog: function(block) {
		var previous = block.previousConnection;

		while (previous) {
			previous = previous.targetBlock();
			if (previous) {
				if (Blockly.Lua.io.helper.isAnalog(block, previous)) {
					return true;
				}
			
				previous = previous.previousConnection;				
			}
		}
		
		return false;
	},

	hasAncestorsExternalAnalog: function(block) {
		var previous = block.previousConnection;

		while (previous) {
			previous = previous.targetBlock();
			if (previous) {
				if (Blockly.Lua.io.helper.isExternalAnalog(block, previous)) {
					return true;
				}
			
				previous = previous.previousConnection;				
			}
		}
		
		return false;
	},

	nameAnalog: function(block) {
		var pin = Blockly.Lua.statementToCodeNoIndent(block,'PIN')[0];

		if (pin.indexOf("pio.") === 0) {
			pin = pin.replace("pio.","");
		}
		
		return pin;
	},

	nameExternalAnalog: function(block) {
		var unit = Blockly.Lua.statementToCodeNoIndent(block,'UNIT')[0];
		var channel = Blockly.Lua.statementToCodeNoIndent(block,'CHANNEL')[0];

		return unit.replace("adc.","") + "_" + channel;
	},
	
	instanceAnalog: function(block) {
		return "_adc_" + Blockly.Lua.io.helper.nameAnalog(block);
	},

	instanceExternalAnalog: function(block) {
		return "_adc_" + Blockly.Lua.io.helper.nameExternalAnalog(block);
	},
	
	attachAnalog: function(block) {
		var code = '';

		if (!Blockly.Lua.io.helper.hasAncestorsAnalog(block)) {
			code += Blockly.Lua.indent(0,'if ('+Blockly.Lua.io.helper.instanceAnalog(block)+' == nil) then') + "\n";
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instanceAnalog(block) + ' = adc.attach(adc.ADC1, '+ Blockly.Lua.io.helper.nameDigital(block)+', 12)') + "\n";			
			code += Blockly.Lua.indent(0,'end') + "\n";				
		}

		return code;
	},

	attachExternalAnalog: function(block) {
		var code = '';
		var unit = Blockly.Lua.statementToCodeNoIndent(block,'UNIT')[0];
		var channel = Blockly.Lua.statementToCodeNoIndent(block,'CHANNEL')[0];
		var bits = 12;
		
		for (var key in Code.status.maps.externalAdcUnits) {
			if (Code.status.maps.externalAdcUnits[key][0] == unit.replace("adc.","")) {
				bits = Code.status.maps.externalAdcUnits[key][2];
			}
		}
		
		if (!Blockly.Lua.io.helper.hasAncestorsExternalAnalog(block)) {
			code += Blockly.Lua.indent(0,'if ('+Blockly.Lua.io.helper.instanceExternalAnalog(block)+' == nil) then') + "\n";
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instanceExternalAnalog(block) + ' = adc.attach(' + unit + ',' + channel + ',' + bits + ')') + "\n";			
			code += Blockly.Lua.indent(0,'end') + "\n";				
		}

		return code;
	},

	isPwm: function(block, test) {
		return (
			((test.type == 'setpwmpin') && (block.getFieldValue('PIN') == test.getFieldValue('PIN')))
		);			
	},
	
	hasAncestorsPwm: function(block) {
		var previous = block.previousConnection;

		while (previous) {
			previous = previous.targetBlock();
			if (previous) {
				if (Blockly.Lua.io.helper.isPwm(block, previous)) {
					return true;
				}
			
				previous = previous.previousConnection;				
			}
		}
		
		return false;
	},

	namePwm: function(block) {
		var pin = Blockly.Lua.statementToCodeNoIndent(block,'PIN')[0];

		if (pin.indexOf("pio.") === 0) {
			pin = pin.replace("pio.","");
		}
		
		return pin;
	},
	
	instancePwm: function(block) {
		return "_pwm" + Blockly.Lua.io.helper.namePwm(block);
	},
	
	
	attachPwm: function(block) {
	    var freq = Blockly.Lua.valueToCode(block, 'FREQUENCY', Blockly.Lua.ORDER_NONE) || '\'\'';
	    var duty = Blockly.Lua.valueToCode(block, 'DUTY', Blockly.Lua.ORDER_NONE) || '\'\'';	
		var code = '';

		if (!Blockly.Lua.io.helper.hasAncestorsPwm(block)) {
			code += Blockly.Lua.indent(0,'if ('+Blockly.Lua.io.helper.instancePwm(block)+' == nil) then') + "\n";
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ' = pwm.attach('+ Blockly.Lua.io.helper.nameDigital(block)+', '+freq+', (' + duty + ') * 0.01)') + "\n";	
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ':start()') + "\n";	
			code += Blockly.Lua.indent(0,'else') + "\n";				
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ':setfreq('+freq+')') + "\n";	
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ':setduty('+duty+' * 0.01)') + "\n";	
			code += Blockly.Lua.indent(0,'end') + "\n";				
		} else {
			code += Blockly.Lua.indent(0,Blockly.Lua.io.helper.instancePwm(block) + ':setfreq('+freq+')') + "\n";	
			code += Blockly.Lua.indent(0,Blockly.Lua.io.helper.instancePwm(block) + ':setduty('+duty+' * 0.01)') + "\n";	
		}

		return code;
	},
};

Blockly.Lua['setdigitalpin'] = function(block) {
	var value = block.getFieldValue('VALUE');
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.io.helper.attachDigital(block, true);
	tryCode += Blockly.Lua.indent(0,'pio.pin.setval('+value+', ' + Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";


	code += Blockly.Lua.tryBlock(0, block, tryCode, 'set digital pin ' + Blockly.Lua.io.helper.nameDigital(block) + ' to ' + value);
	
	return code;
};

Blockly.Lua['invertdigitalpin'] = function(block) {
	var value = block.getFieldValue('VALUE');
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.io.helper.attachDigital(block, true);
	tryCode += Blockly.Lua.indent(0,'pio.pin.inv(' + Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";


	code += Blockly.Lua.tryBlock(0, block, tryCode, 'invert digital pin value ' + Blockly.Lua.io.helper.nameDigital(block));
	
	return code;
};

Blockly.Lua['getdigitalpin'] = function(block) {
	var tryCode = '', getCode = '', code = '';

	Blockly.Lua.require("block");

	var tryCode = '';
	tryCode += Blockly.Lua.io.helper.attachDigital(block, false);
	tryCode += Blockly.Lua.indent(0, 'val = pio.pin.getval(' + Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";

	getCode += Blockly.Lua.indent(0, "function _getDigitalPin_" + Blockly.Lua.io.helper.nameDigital(block) + "()") + "\n";
	getCode += Blockly.Lua.indent(1, "local val") + "\n\n";

	getCode += Blockly.Lua.indent(1, Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";

	getCode += Blockly.Lua.indent(1, "return val") + "\n";
	getCode += Blockly.Lua.indent(0, "end") + "\n";

	codeSection["functions"].push(getCode);

	code += Blockly.Lua.indent(0, "_getDigitalPin_" + Blockly.Lua.io.helper.nameDigital(block) + "()");

	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['getanalogpin'] = function(block) {
	var format = block.getFieldValue('FORMAT');
	var tryCode = '', getCode = '', code = '';

	Blockly.Lua.require("block");

	var tryCode = '';
	tryCode += Blockly.Lua.io.helper.attachAnalog(block, false);
	
	getCode += Blockly.Lua.indent(0, "-- get analog pin value " + Blockly.Lua.io.helper.nameAnalog(block)) + " \n";
	getCode += Blockly.Lua.indent(0, "function _getAnalogPin_" + Blockly.Lua.io.helper.nameAnalog(block) + "_" + format +  "()") + "\n";
	getCode += Blockly.Lua.indent(1, "local raw = nil") + "\n";
	getCode += Blockly.Lua.indent(1, "local mvolts = nil") + "\n\n";

	getCode += Blockly.Lua.indent(1, Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";

	getCode += Blockly.Lua.indent(1, 'raw, mvolts = '+Blockly.Lua.io.helper.instanceAnalog(block)+':read()') + "\n";
	if (format == 'mvolts') {
		getCode += Blockly.Lua.indent(1, 'val = mvolts') + "\n\n";
	} else {
		getCode += Blockly.Lua.indent(1, 'val = raw') + "\n\n";		
	}
	getCode += Blockly.Lua.indent(1, "return val") + "\n";
	getCode += Blockly.Lua.indent(0, "end") + "\n";

	codeSection["functions"].push(getCode);

	code += Blockly.Lua.indent(0, "_getAnalogPin_" + Blockly.Lua.io.helper.nameAnalog(block) + "_" + format + "()");

	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['getexternalanalogchannel'] = function(block) {
	var format = block.getFieldValue('FORMAT');
	var tryCode = '', getCode = '', code = '';

	Blockly.Lua.require("block");

	var tryCode = '';
	tryCode += Blockly.Lua.io.helper.attachExternalAnalog(block, false);
	
	getCode += Blockly.Lua.indent(0, "function _getAnalogPin_" + Blockly.Lua.io.helper.nameExternalAnalog(block) + "_" + format +  "()") + "\n";
	getCode += Blockly.Lua.indent(1, "local raw = nil") + "\n";
	getCode += Blockly.Lua.indent(1, "local mvolts = nil") + "\n\n";

	getCode += Blockly.Lua.indent(1, Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";

	getCode += Blockly.Lua.indent(1, 'raw, mvolts = '+Blockly.Lua.io.helper.instanceExternalAnalog(block)+':read()') + "\n";
	if (format == 'mvolts') {
		getCode += Blockly.Lua.indent(1, 'val = mvolts') + "\n\n";
	} else {
		getCode += Blockly.Lua.indent(1, 'val = raw') + "\n\n";		
	}
	getCode += Blockly.Lua.indent(1, "return val") + "\n";
	getCode += Blockly.Lua.indent(0, "end") + "\n";

	codeSection["functions"].push(getCode);

	code += Blockly.Lua.indent(0, "_getAnalogPin_" + Blockly.Lua.io.helper.nameExternalAnalog(block) + "_" + format + "()");

	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['output_digital_pin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['output_digital_pin_sel'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['input_digital_pin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['input_digital_pin_Sel'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['pwm_pins'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['pwm_pins_sel'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['analog_pins'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['analog_pins_sel'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['uart_units'] = function(block) {
	var unit = block.getFieldValue('UNIT');
	var unitName = Code.status.maps.uartUnits[unit][1];
	
	return ['uart.' + unitName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['external_analog_units'] = function(block) {
	var unit = block.getFieldValue('UNIT');
	var unitName = Code.status.maps.externalAdcUnits[unit][0];
	
	return ['adc.' + unitName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['external_analog_channels'] = function(block) {
	var channel = block.getFieldValue('CHANNEL');
	
	return [channel, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['setpwmpin'] = function(block) {
    var freq = Blockly.Lua.valueToCode(block, 'FREQUENCY', Blockly.Lua.ORDER_NONE) || '\'\'';
    var duty = Blockly.Lua.valueToCode(block, 'DUTY', Blockly.Lua.ORDER_NONE) || '\'\'';	
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.io.helper.attachPwm(block);

	code += Blockly.Lua.tryBlock(0, block, tryCode, 'set pwm pin ' + Blockly.Lua.io.helper.namePwm(block) + ' to freq ' + freq + ' hz, duty (' + duty + ')%');
	
	return code;
};

Blockly.Lua['when_digital_pin'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var when = block.getFieldValue('WHEN');
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.indent(0,'-- we need to wait for the completion of the board start') + "\n";
	tryCode += Blockly.Lua.indent(0,'_eventBoardStarted:wait()') + "\n\n";

	tryCode += Blockly.Lua.io.helper.attachDigital(block, false);
	tryCode += Blockly.Lua.indent(0,'pio.pin.interrupt(' + Blockly.Lua.io.helper.nameDigital(block)+', function()') + "\n";

	tryCode += Blockly.Lua.blockStart(1, block);

	if (statement != "") {
		tryCode += Blockly.Lua.indent(1, statement);
	}

	tryCode += Blockly.Lua.blockEnd(1, block);

	tryCode += Blockly.Lua.indent(0,'end, pio.pin.'+when+')') + "\n";


	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";	
	code += Blockly.Lua.tryBlock(1, block,tryCode);	
	code += Blockly.Lua.indent(0, 'end)') + "\n";	

	return code;
};