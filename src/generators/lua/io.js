/*
 * Whitecat Blocky Environment, io block code generation
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
	
	nameDigital: function(block) {
		return Code.status.maps.digitalPins[block.getFieldValue('PIN')][0];

	},
	
	instanceDigital: function(block) {
		return "_pio" + Blockly.Lua.io.helper.nameDigital(block);
	},

	attachDigital: function(block, output) {
		var code = '';

		if (!Blockly.Lua.io.helper.hasAncestorsDigital(block, output)) {
			code += Blockly.Lua.indent(0,'if (('+Blockly.Lua.io.helper.instanceDigital(block)+' == nil) or ('+Blockly.Lua.io.helper.instanceDigital(block)+' == ' + (output?"pio.INPUT":"pio.OUTPUT")+')) then') + "\n";
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instanceDigital(block) + " = ") + (output?"pio.OUTPUT":"pio.INPUT") + "\n";
			
			if (output) {
				code += Blockly.Lua.indent(1,'pio.pin.setdir(pio.OUTPUT, pio.'+Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";
				code += Blockly.Lua.indent(1,'pio.pin.setpull(pio.NOPULL, pio.'+Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";
				code += Blockly.Lua.indent(0,'end') + "\n\n";
			} else {
				code += Blockly.Lua.indent(1,'pio.pin.setdir(pio.INPUT, pio.'+Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";
				code += Blockly.Lua.indent(1,'pio.pin.setpull(pio.PULLUP, pio.'+Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";
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

	nameAnalog: function(block) {
		return Code.status.maps.analogPinsChannel[block.getFieldValue('PIN')][0];

	},
	
	instanceAnalog: function(block) {
		return "_adc" + Blockly.Lua.io.helper.nameAnalog(block);
	},
	
	attachAnalog: function(block) {
		var code = '';

		if (!Blockly.Lua.io.helper.hasAncestorsAnalog(block)) {
			code += Blockly.Lua.indent(0,'if ('+Blockly.Lua.io.helper.instanceAnalog(block)+' == nil) then') + "\n";
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instanceAnalog(block) + ' = adc.setup(adc.ADC1, adc.'+Blockly.Lua.io.helper.nameAnalog(block)+', 12)') + "\n";			
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
		return Code.status.maps.digitalPins[block.getFieldValue('PIN')][0];

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
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ' = pwm.attach(pio.'+Blockly.Lua.io.helper.nameDigital(block)+', '+freq+', ' + duty + ' * 0.01)') + "\n";	
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ':start()') + "\n";	
			code += Blockly.Lua.indent(0,'else') + "\n";				
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ':stop()') + "\n";	
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ':setfreq('+freq+')') + "\n";	
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ':setduty('+duty+' * 0.01)') + "\n";	
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ':start()') + "\n";	
			code += Blockly.Lua.indent(0,'end') + "\n";				
		} else {
			code += Blockly.Lua.indent(0,Blockly.Lua.io.helper.instancePwm(block) + ':stop()') + "\n";	
			code += Blockly.Lua.indent(0,Blockly.Lua.io.helper.instancePwm(block) + ':setfreq('+freq+')') + "\n";	
			code += Blockly.Lua.indent(0,Blockly.Lua.io.helper.instancePwm(block) + ':setduty('+duty+' * 0.01)') + "\n";	
			code += Blockly.Lua.indent(0,Blockly.Lua.io.helper.instancePwm(block) + ':start()') + "\n";	
		}

		return code;
	},
};

Blockly.Lua['setdigitalpin'] = function(block) {
	var value = block.getFieldValue('VALUE');
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.io.helper.attachDigital(block, true);
	tryCode += Blockly.Lua.indent(0,'pio.pin.setval('+value+', pio.'+Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";


	code += Blockly.Lua.tryBlock(0, block, tryCode, 'set digital pin ' + Blockly.Lua.io.helper.nameDigital(block) + ' to ' + value);
	
	return code;
};

Blockly.Lua['getdigitalpin'] = function(block) {
	var tryCode = '', getCode = '', code = '';

	Blockly.Lua.require("block");

	var tryCode = '';
	tryCode += Blockly.Lua.io.helper.attachDigital(block, false);
	tryCode += Blockly.Lua.indent(0, 'val = pio.pin.getval(pio.'+Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";

	getCode += Blockly.Lua.indent(0, "function _getDigitalPin" + Blockly.Lua.io.helper.nameDigital(block) + "()") + "\n";
	getCode += Blockly.Lua.indent(1, "local val") + "\n\n";

	getCode += Blockly.Lua.indent(1, Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";

	getCode += Blockly.Lua.indent(1, "return val") + "\n";
	getCode += Blockly.Lua.indent(0, "end") + "\n";

	codeSection["functions"].push(getCode);

	code += Blockly.Lua.indent(0, "_getDigitalPin" + Blockly.Lua.io.helper.nameDigital(block) + "()") + "\n";

	if (block.nextConnection) {
		code += '\n';
	}

	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['getanalogpin'] = function(block) {
	var format = block.getFieldValue('FORMAT');
	var tryCode = '', getCode = '', code = '';

	Blockly.Lua.require("block");

	var tryCode = '';
	tryCode += Blockly.Lua.io.helper.attachAnalog(block, false);
	
	getCode += Blockly.Lua.indent(0, "function _getAnalogPin" + Blockly.Lua.io.helper.nameAnalog(block) + "()") + "\n";
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

	code += Blockly.Lua.indent(0, "_getAnalogPin" + Blockly.Lua.io.helper.nameAnalog(block) + "()") + "\n";

	if (block.nextConnection) {
		code += '\n';
	}

	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['setpwmpin'] = function(block) {
    var freq = Blockly.Lua.valueToCode(block, 'FREQUENCY', Blockly.Lua.ORDER_NONE) || '\'\'';
    var duty = Blockly.Lua.valueToCode(block, 'DUTY', Blockly.Lua.ORDER_NONE) || '\'\'';	
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.io.helper.attachPwm(block);

	code += Blockly.Lua.tryBlock(0, block, tryCode, 'set pwm pin ' + Blockly.Lua.io.helper.namePwm(block) + ' to freq ' + freq + ' hz, duty ' + duty + '%');
	
	return code;
};

Blockly.Lua['when_digital_pin'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var when = block.getFieldValue('WHEN');
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.io.helper.attachDigital(block, false);
	tryCode += Blockly.Lua.indent(0,'pio.pin.interrupt(pio.'+Blockly.Lua.io.helper.nameDigital(block)+', function()') + "\n";

	if (Blockly.Lua.developerMode) {
		tryCode += Blockly.Lua.indent(1,'wcBlock.blockStart("'+block.id+'")') + "\n";
	}

	if (statement != "") {
		tryCode += Blockly.Lua.indent(1, statement);
	}

	if (Blockly.Lua.developerMode) {
		tryCode += Blockly.Lua.indent(1,'wcBlock.blockEnd("'+block.id+'")') + "\n";
	}

	tryCode += Blockly.Lua.indent(0,'end, pio.pin.'+when+')') + "\n";


	code += Blockly.Lua.tryBlock(0, block, tryCode);
	
	return code;
};