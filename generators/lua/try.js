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
  
  if (tryStatement != '') {
	  tryStatement = Blockly.Lua.prefixLines(tryStatement, Blockly.Lua.INDENT);
  }

  if (catchStatement != '') {
	  catchStatement = Blockly.Lua.prefixLines(catchStatement, Blockly.Lua.INDENT);
  }

  if (finallyStatement != '') {
	  finallyStatement = Blockly.Lua.prefixLines(finallyStatement, Blockly.Lua.INDENT);
  }
  
  var code = 'try(\n';
  code += '  function()\n';
  code += tryStatement;
  code += '  end,\n';
  code += '  function(where, line, errCode, msg)\n';
  code += catchStatement;
  code += '  end';
  
  if (finallyStatement != '') {
	code += ',\n';
	code += '  function()\n';
    code += finallyStatement;
  	code += '  end';
  }
  	code += '\n)\n';
  
  return code;
};

Blockly.Lua['exception_catch_error'] = function(block) {
    var doStatement = Blockly.Lua.statementToCode(block, 'DO');

    if (doStatement != '') {
  	  doStatement = Blockly.Lua.prefixLines(doStatement, Blockly.Lua.INDENT);
    }

	var code = "  if (errCode ~= nil) then\n";
	code += doStatement;
	code += "    return\n";
	code += "  end\n";
	
	return code;
}

Blockly.Lua['exception_catch_other_error'] = function(block) {
    var doStatement = Blockly.Lua.statementToCode(block, 'DO');

	var code = doStatement;
	
	return code;
}

Blockly.Lua['exception_raise_again'] = function(block) {
	return 'error(errCode..":"..msg)';
}