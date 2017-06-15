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

Blockly.Lua['sensor_read'] = function(block) {
	var magnitude = block.getFieldValue('PROVIDES');
	var code = '';
	
	// Get interface
	var int = '';	
	if (block.interface == 'GPIO') {
		int = 'pio.' + Code.status.maps.digitalPins[block.pin][0];
	} else if (block.interface == 'ADC') {
		int = 'adc.ADC1, adc.' + Code.status.maps.analogPinsChannel[block.pin][0] + ', 12';
	} else if (block.interface == 'I2C') {
		int = 'i2c.' + Code.status.maps.i2cUnits[block.pin][0];
	} else if (block.interface == 'UART') {
		int = 'uart.' + Code.status.maps.uartUnits[block.pin][0] + ', 115200, 8, uart.PARNONE, uart.STOP1';
	}
		
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	// Generate code for get sensor value
	// This code goes to the declaration section
	var getCode = '';
	getCode += Blockly.Lua.indent(0, 'function _get'+block.name+'_' + block.sid + '()') + "\n";

	var tryCode = '';	
	tryCode += Blockly.Lua.indent(1,'if (_'+block.name+'_'+block.sid+' == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(2,'_'+block.name+'_'+block.sid+' = sensor.attach("'+block.sid+'", '+int+')') + "\n";
	tryCode += Blockly.Lua.indent(1,'end') + "\n\n";
	tryCode += Blockly.Lua.indent(1,'value = _'+block.name+'_'+block.sid+':read("'+magnitude+'")') + "\n";

	getCode += Blockly.Lua.indent(1, 'local value\n') + "\n";
	getCode += Blockly.Lua.indent(1,Blockly.Lua.tryBlock(1, block,tryCode)) + "\n\n";
	
	getCode += Blockly.Lua.indent(1, 'return value\n');
	getCode += Blockly.Lua.indent(0, 'end\n');
		
	codeSection["declaration"].push(getCode);

	return ['_get'+block.name+'_' + block.sid + '()', Blockly.Lua.ORDER_HIGH];	
};

Blockly.Lua['sensor_set'] = function(block) {
	var property = block.getFieldValue('PROPERTIES');
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE);
	var code = '';
	
	// Get interface
	var int = '';	
	if (block.interface == 'GPIO') {
		int = 'pio.' + Code.status.maps.digitalPins[block.pin][0];
	} else if (block.interface == 'ADC') {
		int = 'adc.ADC1, adc.' + Code.status.maps.analogPinsChannel[block.pin][0] + ', 12';
	} else if (block.interface == 'I2C') {
		int = 'i2c.' + Code.status.maps.i2cUnits[block.pin][0];
	} else if (block.interface == 'UART') {
		int = 'uart.' + Code.status.maps.uartUnits[block.pin][0] + ', 115200, 8, uart.PARNONE, uart.STOP1';
	}

	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	var tryCode = '';	
	tryCode += Blockly.Lua.indent(1,'local instance = "_'+block.name+'_'+block.sid+'"') + "\n\n";
	tryCode += Blockly.Lua.indent(1,'if (_'+block.name+'_'+block.sid+' == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(2,'_'+block.name+'_'+block.sid+' = sensor.attach("'+block.sid+'", '+int+')') + "\n";
	tryCode += Blockly.Lua.indent(1,'end') + "\n\n";
	tryCode += Blockly.Lua.indent(1,'_'+block.name+'_'+block.sid+':set("'+property+'", '+value+')') + "\n";

	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(0, block,tryCode)) + "\n";
	
	return code;	
};