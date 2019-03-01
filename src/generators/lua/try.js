/*
 * Whitecat Blocky Environment, exception control blocks code generation
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

goog.provide('Blockly.Lua.try');

goog.require('Blockly.Lua');

Blockly.Lua['exception_try'] = function(block) {
  var tryStatement = Blockly.Lua.statementToCode(block, 'TRY0');
  var catchStatement = Blockly.Lua.statementToCode(block, 'CATCH0');
  var finallyStatement = Blockly.Lua.statementToCode(block, 'FINALLY0');  
  var code = '';
  
   code += Blockly.Lua.indent(0, 'try(') + "\n";
   code += Blockly.Lua.indent(1, 'function()') + "\n";
   code += Blockly.Lua.indent(1, tryStatement);
   code += Blockly.Lua.indent(1, 'end, ') + "\n";
   code += Blockly.Lua.indent(1, 'function(where, line, errCode, msg)') + "\n";
   
   if (catchStatement != '') {
	   code += Blockly.Lua.indent(1, catchStatement);   	
   }
   
   if (Blockly.Lua.legacyGenCode) {
	   code += Blockly.Lua.blockErrorCatched(2, block);
   }

   if (finallyStatement != '') {
	   code += Blockly.Lua.indent(1, 'end, ') + "\n";
	   code += Blockly.Lua.indent(1, 'function()') + "\n";
	   code += Blockly.Lua.indent(1, finallyStatement);
	   code += Blockly.Lua.indent(1, 'end') + "\n";
   } else {
	   code += Blockly.Lua.indent(1, 'end') + "\n";
   }

   code += Blockly.Lua.indent(0, ')') + "\n";
  
  return code;
};

Blockly.Lua['exception_catch_error'] = function(block) {
    var doStatement = Blockly.Lua.statementToCode(block, 'DO');
	var error = block.getFieldValue('ERROR');
	var code = '';
	
	if (error == "any") {
		code += Blockly.Lua.indent(0, 'if (errCode ~= nil) then') + "\n";
		code += Blockly.Lua.indent(0, doStatement);
		if (Blockly.Lua.legacyGenCode) {
			code += Blockly.Lua.blockErrorCatched(1, block);
		}
		code += Blockly.Lua.indent(1, 'return') + "\n";
		code += Blockly.Lua.indent(0, 'end') + "\n";		
	} else {
		code += Blockly.Lua.indent(0, 'if ((errCode ~= nil) and (errCode == '+error+')) then') + "\n";
		code += Blockly.Lua.indent(0, doStatement);
		
		if (Blockly.Lua.legacyGenCode) {
			code += Blockly.Lua.blockErrorCatched(1, block);
		}
		
		code += Blockly.Lua.indent(1, 'return') + "\n";
		code += Blockly.Lua.indent(0, 'end') + "\n";		
	}
	
	return code;
}

Blockly.Lua['exception_raise_again'] = function(block) {
	return Blockly.Lua.indent(0, 'error(errCode..":"..msg)') + "\n";
}