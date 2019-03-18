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
goog.provide('Blockly.Lua.sensors.helper');

goog.require('Blockly.Lua');

Blockly.Lua.sensors.helper = {
	getInterface: function(block) {
		var int = '';	
		var interfaces = block.interface.split(",");
		
		for(var i=0;i < interfaces.length;i++) {
			if (interfaces[i] == 'GPIO') {
				if (int != "") int = int + ", ";
				int += 'pio.' + Code.status.maps.digitalPins[block['interface'+i+'_unit']][0];
			} else if (interfaces[i] == 'ADC') {
				if (block['interface'+i+'_unit'] == 1) {
					if (int != "") int = int + ", ";
					int += 'adc.ADC1, pio.' + Code.status.maps.analogPins[block['interface'+i+'_subunit']][0];
				} else {
					if (int != "") int = int + ", ";
					int += 'adc.' + Code.status.maps.externalAdcUnits[block['interface'+i+'_unit']][0] + ', ' + block['interface'+i+'_subunit'];
				}
			} else if (interfaces[i] == 'I2C') {
				if (int != "") int = int + ", ";
				int += 'i2c.' + Code.status.maps.i2cUnits[block['interface'+i+'_unit']][1] + ', 0';
			} else if (interfaces[i] == 'UART') {
				if (int != "") int = int + ", ";
				int += 'uart.' + Code.status.maps.uartUnits[block['interface'+i+'_unit']][1];
			} else if (interfaces[i] == '1-WIRE') {
				if (int != "") int = int + ", ";
				int += 'pio.' + Code.status.maps.digitalPins[block['interface'+i+'_unit']][0] + ', ' + block['interface'+i+'_device'];
			}			
		}
		
		return int;
	},
	
	nameSensor: function(block) {
		return block.sid.replace(/\s|-/g, '_');
	},
	
	attach: function(block) {
		var code = '';
		
		var int = Blockly.Lua.sensors.helper.getInterface(block);	
		
		code += Blockly.Lua.indent(0,'if (_'+block.name+'_'+Blockly.Lua.sensors.helper.nameSensor(block)+' == nil) then') + "\n";
		code += Blockly.Lua.indent(1,'_'+block.name+'_'+Blockly.Lua.sensors.helper.nameSensor(block)+' = sensor.attach("'+block.sid+'"'+(int!=""?", ":"")+int+')') + "\n";
		code += Blockly.Lua.indent(0,'end') + "\n\n";
		
		return code;
	}
}

Blockly.Lua['sensor_read'] = function(block) {
	var magnitude = block.getFieldValue('PROVIDES');
	var code = '';
	
	Blockly.Lua.require("block");
	
	// Generate code for get sensor value
	// This code goes to the declaration section
	var getCode = '';
	getCode += Blockly.Lua.indent(0, 'function _get'+block.name+'_' + magnitude.replace(/\s|-/g, '_') + '()') + "\n";

	var tryCode = '';	
	tryCode += Blockly.Lua.sensors.helper.attach(block);
	tryCode += Blockly.Lua.indent(0,'value = _'+block.name+'_'+Blockly.Lua.sensors.helper.nameSensor(block)+':read("'+magnitude+'")') + "\n";

	getCode += Blockly.Lua.indent(1, 'local value\n') + "\n";
	getCode += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(1, block, tryCode)) + "\n";
	getCode += Blockly.Lua.indent(1, 'return value\n');
	getCode += Blockly.Lua.indent(0, 'end\n');
		
	codeSection["declaration"].push(getCode);

	return [Blockly.Lua.annotateFunctionCall(block,'_get'+block.name+'_' + magnitude.replace(/\s|-/g, '_') + '()'), Blockly.Lua.ORDER_HIGH];	
};

Blockly.Lua['sensor_set'] = function(block) {
	var property = block.getFieldValue('PROPERTIES');
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE);
	var code = '';
	
	Blockly.Lua.require("block");
	
	var tryCode = '';	
	tryCode += Blockly.Lua.indent(1,'local instance = "_'+block.name+'_'+Blockly.Lua.sensors.helper.nameSensor(block)+'"') + "\n\n";
	tryCode += Blockly.Lua.sensors.helper.attach(block);
	tryCode += Blockly.Lua.indent(1,Blockly.Lua.annotateFunctionCall(block, '_'+block.name+'_'+Blockly.Lua.sensors.helper.nameSensor(block)+':set("'+property+'", '+value+')')) + "\n";

	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(0, block,tryCode)) + "\n";
	
	return code;	
};

Blockly.Lua['sensor_when'] = function(block) {
	var magnitude = block.getFieldValue('PROVIDES');
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var code = '';
	
	Blockly.Lua.require("block");
	
	var tryCode = '';
	
	tryCode += Blockly.Lua.indent(0,'-- we need to wait for the completion of the board start') + "\n";
	tryCode += Blockly.Lua.indent(0,'_eventBoardStarted:wait()') + "\n\n";

	tryCode += Blockly.Lua.indent(0,Blockly.Lua.sensors.helper.attach(block));
	
	tryCode += Blockly.Lua.indent(0, '_' + block.name+'_'+Blockly.Lua.sensors.helper.nameSensor(block)+':callback(function(magnitude)') + "\n";
	tryCode += Blockly.Lua.indent(1, 'local value = magnitude.' + magnitude) + "\n\n";	
	tryCode += Blockly.Lua.indent(1, 'if value == nil then return end') + "\n\n";

	tryCode += Blockly.Lua.blockStart(2, block);

	if (statement != "") {
		tryCode += Blockly.Lua.indent(2, statement);
	}
	
	tryCode += Blockly.Lua.blockEnd(2, block);

	tryCode += Blockly.Lua.indent(1, 'end)') + "\n";	
	

	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";	
	code += Blockly.Lua.tryBlock(1, block,tryCode);	
	code += Blockly.Lua.indent(0, 'end)') + "\n";	

	
	return code;
};