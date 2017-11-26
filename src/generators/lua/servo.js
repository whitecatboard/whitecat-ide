/*
 * Whitecat Blocky Environment, servo block code generation
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

goog.provide('Blockly.Lua.servo');
goog.provide('Blockly.Lua.servo.helper');

goog.require('Blockly.Lua');

Blockly.Lua.servo.helper = {
	isServo: function(block, test) {
		return (
			((test.type == 'servo_move') && (block.getFieldValue('PIN') == test.getFieldValue('PIN')))
		);						
	},
	
	hasAncestors: function(block) {
		var previous = block.previousConnection;

		while (previous) {
			previous = previous.targetBlock();
			if (previous) {
				if (Blockly.Lua.servo.helper.isServo(block, previous)) {
					return true;
				}
			
				previous = previous.previousConnection;				
			}
		}
		
		return false;
	},
	
	instance: function(block) {
		return "_servo_" + Blockly.Lua.io.helper.nameDigital(block);
	},

	attach: function(block) {
		var code = '';
		
		if (!Blockly.Lua.servo.helper.hasAncestors(block)) {
			code += Blockly.Lua.indent(0,'if ('+Blockly.Lua.servo.helper.instance(block)+' == nil) then') + "\n";
			code += Blockly.Lua.indent(1,Blockly.Lua.servo.helper.instance(block) + " = servo.attach("+Blockly.Lua.io.helper.nameDigital(block)+")") + "\n";
			code += Blockly.Lua.indent(0,'end') + "\n\n";				
		}
		
		return code;
	},
};

Blockly.Lua['servo_move'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pioName = Code.status.maps.pwmPins[pin];
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE) || '\'\'';
	var code='', tryCode = '';	
	
	Blockly.Lua.require("block");
	
	tryCode += Blockly.Lua.servo.helper.attach(block);	
	tryCode += Blockly.Lua.indent(0, Blockly.Lua.servo.helper.instance(block) + ':write('+value+')') + "\n";
		
	code += Blockly.Lua.tryBlock(0, block, tryCode, 'move servo at pin ' + Blockly.Lua.io.helper.nameDigital(block) + ' by ' + value);
		
	return code;
}