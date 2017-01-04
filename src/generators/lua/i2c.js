/*
 * Whitecat Blocky Environment, i2c block code generation
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

goog.provide('Blockly.Lua.i2c');

goog.require('Blockly.Lua');

Blockly.Lua['configurei2c'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var sda = block.getFieldValue('SDA');
	var scl = block.getFieldValue('SCL');
	var speed = Blockly.Lua.valueToCode(block, 'SPEED', Blockly.Lua.ORDER_NONE);	
	
	var code = '';
	
	code = 'i2c.setup(' + Board.i2cModules[module] + ', ' + speed + ', ' + Board.digitalPins[sda] + ', ' + Board.digitalPins[scl] +')\n';

	return code;
};

Blockly.Lua['i2cstartcondition'] = function(block) {
	var module = block.getFieldValue('MODULE');
	
	var code = '';
	
	code = 'i2c.start(' + Board.i2cModules[module]  + ')\n';

	return code;
};

Blockly.Lua['i2cstopcondition'] = function(block) {
	var module = block.getFieldValue('MODULE');
	
	var code = '';
	
	code = 'i2c.stop(' + Board.i2cModules[module]  + ')\n';

	return code;
};

Blockly.Lua['i2caddress'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var address = Blockly.Lua.valueToCode(block, 'ADDRESS', Blockly.Lua.ORDER_NONE);	
	var direction = block.getFieldValue('DIRECTION');
	
	var code = '';

	if (direction == 'read') {
		direction = 'i2c.READ';
	}

	if (direction == 'write') {
		direction = 'i2c.WRITE';
	}
	
	code = 'i2c.address(' + Board.i2cModules[module]  + ', ' + address + ', ' + direction + ')\n';

	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['i2cread'] = function(block) {
	var module = block.getFieldValue('MODULE');
	
	var code = '';
	
	code = 'i2c.read(' + Board.i2cModules[module]  + ')\n';

	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['i2cwrite'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE);	
	
	var code = '';
	
	code = 'i2c.write(' + Board.i2cModules[module]  + ', ' + value + ')\n';

	return [code, Blockly.Lua.ORDER_HIGH];
};