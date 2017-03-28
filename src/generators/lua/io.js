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

goog.require('Blockly.Lua');

Blockly.Lua['setdigitalpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pioName = Code.status.maps.digitalPins[pin][0];
	var value = block.getFieldValue('VALUE');
	var code = '';
	
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	var tryCode = '';	
	tryCode += Blockly.Lua.indent(1,'pio.pin.setdir(pio.OUTPUT, pio.'+pioName+')') + "\n";
	tryCode += Blockly.Lua.indent(1,'pio.pin.setpull(pio.NOPULL, pio.'+pioName+')') + "\n";
	tryCode += Blockly.Lua.indent(1,'pio.pin.setval('+value+', pio.'+pioName+')') + "\n";
		
	code += Blockly.Lua.indent(0,'-- set digital pin ' + pioName + ' to ' + value) + "\n";
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(block,tryCode)) + "\n";
	
	return code;
};

Blockly.Lua['getdigitalpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pioName = Code.status.maps.digitalPins[pin][0];
	var code = '';
		
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}

	// Generate code for get digital value
	// This code goes to the declaration section
	var getCode = '';
	getCode += Blockly.Lua.indent(0, '-- configure ' + pioName + ' as input and get value') + "\n";
	getCode += Blockly.Lua.indent(0, 'function _getDigitalPin' + pioName + '()') + "\n";
	
	var tryCode = '';
	tryCode += Blockly.Lua.indent(1, 'pio.pin.setdir(pio.INPUT, pio.'+pioName+')') + "\n";
	tryCode += Blockly.Lua.indent(1, 'pio.pin.setpull(pio.PULLUP, pio.'+pioName+')') + "\n";
	tryCode += Blockly.Lua.indent(1, 'value = pio.pin.getval(pio.'+pioName+')') + "\n";

	getCode += Blockly.Lua.indent(1, 'local value\n') + "\n";
	getCode += Blockly.Lua.indent(1,Blockly.Lua.tryBlock(block,tryCode)) + "\n";
	
	getCode += Blockly.Lua.indent(1, 'return value\n');
	getCode += Blockly.Lua.indent(0, 'end\n');
			
	codeSection["functions"].push(getCode);
	
	return ['_getDigitalPin' + pioName + '()', Blockly.Lua.ORDER_HIGH];	
};

Blockly.Lua['getanalogpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var adcName = Code.status.maps.analogPinsChannel[pin];
	var format = block.getFieldValue('FORMAT');
	var code = '';
		
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}

	// Generate code for get analog value
	// This code goes to the declaration section
	var getCode = '';
	getCode += Blockly.Lua.indent(0, '-- configure ' + adcName + ' and get value') + "\n";
	getCode += Blockly.Lua.indent(0, 'function _getAnalogPin' + adcName + '()') + "\n";
	
	var tryCode = '';
	tryCode += Blockly.Lua.indent(1, 'if (_G["_adc'+adcName+'"] == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(2, '_G["_adc'+adcName+'"] = adc.setup(adc.ADC1, adc.'+adcName+', 12)') + "\n";
	tryCode += Blockly.Lua.indent(1, 'end') + "\n\n";
	tryCode += Blockly.Lua.indent(1, 'raw, mvolts = _G["_adc'+adcName+'"]:read()') + "\n";

	getCode += Blockly.Lua.indent(1, 'local raw = nil') + "\n";
	getCode += Blockly.Lua.indent(1, 'local mvolts = nil\n') + "\n";
	getCode += Blockly.Lua.indent(1,Blockly.Lua.tryBlock(block,tryCode)) + "\n\n";
	
	if (format == 'mvolts') {
		getCode += Blockly.Lua.indent(1, 'return mvolts\n');
	} else {
		getCode += Blockly.Lua.indent(1, 'return raw\n');		
	}
	
	getCode += Blockly.Lua.indent(0, 'end\n');
			
	codeSection["functions"].push(getCode);
	
	return ['_getAnalogPin' + adcName + '()', Blockly.Lua.ORDER_HIGH];	
};

Blockly.Lua['setpwmpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
    var frequency = Blockly.Lua.valueToCode(block, 'FREQUENCY', Blockly.Lua.ORDER_NONE) || '\'\'';
    var duty = Blockly.Lua.valueToCode(block, 'DUTY', Blockly.Lua.ORDER_NONE) || '\'\'';	
	var pioName = Code.status.maps.digitalPins[pin][0];
	var code = '';
	
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}

	if (frequency == "") {
		frequency = "0";
	}
	
	if (duty == "") {
		duty = "0";
	}
	
	var tryCode = '';	
	tryCode += Blockly.Lua.indent(1,'local instance = "_pwm'+pioName+'"') + "\n\n";
	tryCode += Blockly.Lua.indent(1,'if (_G[instance] == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(2,'_G[instance] = pwm.attach(pio.'+pioName+', '+frequency+', '+duty * 0.01 +')') + "\n";
	tryCode += Blockly.Lua.indent(2,'_G[instance]:start()') + "\n";
	tryCode += Blockly.Lua.indent(1,'else') + "\n";
	tryCode += Blockly.Lua.indent(2,'_G[instance]:setduty('+duty * 0.01 +')') + "\n";
	tryCode += Blockly.Lua.indent(1,'end') + "\n";

	code += Blockly.Lua.indent(0,'-- set pwm pin ' + pioName + ' to freq ' + frequency + ' hz,  duty ' + duty + '%') + "\n";
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(block,tryCode)) + "\n";
	
	return code;
};

