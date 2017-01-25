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

Blockly.Lua['sensor_acquire'] = function(block) {
	var code = '';

	code  = 'if (' + block.name + ' == nil) then\n';
	if (block.interface == 'GPIO') {
		code += '  ' + block.name + ' = sensor.setup("' + block.sid + '", pio.' + Board.digitalPins[block.pin] + ')\n';
	} else if (block.interface == 'ADC') {
		code += '  ' + block.name + ' = sensor.setup("' + block.sid + '", adc.ADC1, adc.' + Board.analogPinsChannel[block.pin] + ', 12)\n';
	}
	code += 'end\n';
	
	code += block.name + ':acquire()\r\n';
	
	return code;
};

Blockly.Lua['sensor_read'] = function(block) {
	var code = '';
	var magnitude = block.getFieldValue('PROVIDES');

	code = block.name + ':read("'+magnitude+'")';
	
	return [code, Blockly.Lua.ORDER_HIGH];	
};

Blockly.Lua['sensor_set'] = function(block) {
	var code = '';
	var setting = block.getFieldValue('SETTINGS');
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE);

	code = block.name + ':set("'+setting+'", ' + value + ')\r\n';
	
	return code;	
};