/*
 * Whitecat Blocky Environment, sensors block code generation
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

goog.provide('Blockly.Lua.sensors');

goog.require('Blockly.Lua');

Blockly.Lua['sensor_attach'] = function(block) {
	var code = '';

	code  = 'if (_' + block.name + '_' + block.sid + ' == nil) then\n';
	if (block.interface == 'GPIO') {
		code += Blockly.Lua.prefixLines('_' + block.name + '_' + block.sid + ' = sensor.setup("' + block.sid + '", pio.' + Code.status.maps.digitalPins[block.pin] + ')\n', Blockly.Lua.INDENT);
	} else if (block.interface == 'ADC') {
		code += Blockly.Lua.prefixLines('_' + block.name + '_' + block.sid + ' = sensor.setup("' + block.sid + '", adc.ADC1, adc.' + Code.status.maps.analogPinsChannel[block.pin] + ', 12)\n', Blockly.Lua.INDENT);
	}
	code += 'end\n';
	
	return code;
};

Blockly.Lua['sensor_read'] = function(block) {
	var code = '';
	var magnitude = block.getFieldValue('PROVIDES');
	
	if (Code.blockAbstraction == blockAbstraction.Low) {
		code = '_' + block.name + '_' + block.sid + ':read("'+magnitude+'")';
	} else {
		if (codeSection["require"].indexOf('require("block-sensor")') == -1) {
			codeSection["require"].push('require("block-sensor")');
		}
				
		var int = '';
		
		if (block.interface == 'GPIO') {
			int = 'pio.' + Code.status.maps.digitalPins[block.pin];
		} else if (block.interface == 'ADC') {
			int = 'adc.ADC1, adc.' + Code.status.maps.analogPinsChannel[block.pin] + ', 12';
		}

		code = 'wcBlock.sensor.read("' + block.id + '", "' + block.name + '", "' + block.sid + '", "' + magnitude + '", ' + int + ')';
	}
	return [code, Blockly.Lua.ORDER_HIGH];	
};

Blockly.Lua['sensor_set'] = function(block) {
	var code = '';
	var property = block.getFieldValue('PROVIDES');
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE);

	if (Code.blockAbstraction == blockAbstraction.Low) {
		code = '_' + block.name + '_' + block.sid + ':set("'+property+'", ' + value + ')\r\n';
	} else {
		if (codeSection["require"].indexOf('require("block-sensor")') == -1) {
			codeSection["require"].push('require("block-sensor")');
		}
		
		var int = '';
		
		if (block.interface == 'GPIO') {
			int = 'pio.' + Code.status.maps.digitalPins[block.pin];
		} else if (block.interface == 'ADC') {
			int = 'adc.ADC1, adc.' + Code.status.maps.analogPinsChannel[block.pin] + ', 12';
		}

		code = 'wcBlock.sensor.set("' + block.id + '", "' + block.name + '", "' + block.sid + '", "' + property + '", ' + value + ', ' + int + ')\r\n';		
	}
	
	return code;	
};