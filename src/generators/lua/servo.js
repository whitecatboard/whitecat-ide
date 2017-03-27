/*
 * Whitecat Blocky Environment, servo block code generation
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

goog.provide('Blockly.Lua.servo');

goog.require('Blockly.Lua');

Blockly.Lua['servo_move'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pioName = Code.status.maps.pwmPins[pin];
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE) || '\'\'';
	var code = '';
	
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	var tryCode = '';	
	tryCode += Blockly.Lua.indent(1,'local instance = "_servo'+pioName+'"') + "\n\n";
	tryCode += Blockly.Lua.indent(1,'if (_G[instance] == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(2,'_G[instance] = servo.attach(pio.'+pioName+')') + "\n";
	tryCode += Blockly.Lua.indent(1,'end') + "\n\n";
	tryCode += Blockly.Lua.indent(1,'_G[instance]:write('+value+')') + "\n";
		
	code += Blockly.Lua.indent(0,'-- move servo at pin ' + pioName + ' by ' + value + 'º') + "\n";
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(block,tryCode)) + "\n";
	
	return code;
}