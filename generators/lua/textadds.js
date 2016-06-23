/*
 * Whitecat Blocky Environment, text additions code generation
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

goog.provide('Blockly.Lua.textadds');

goog.require('Blockly.Lua');


Blockly.Lua['text_pack'] = function(block) {
	var to = Blockly.Lua.valueToCode(block, 'ADD' + (block.itemCount_ - 1), Blockly.Lua.ORDER_NONE);
    var code = [];
    for (var n = 0; n < block.itemCount_ - 1; n++) {
      code[n] = Blockly.Lua.valueToCode(block, 'ADD' + n,
          Blockly.Lua.ORDER_NONE) || '\'\'';
    }
    code = to + ' = pack.pack(' + code.join(', ') + ')\n';
    return code;
};

Blockly.Lua['text_unpack'] = function(block) {
	var packed = Blockly.Lua.valueToCode(block, 'ADD0', Blockly.Lua.ORDER_NONE);
    var code = '';
    
	for (var n = 1; n < block.itemCount_; n++) {
		code += Blockly.Lua.valueToCode(block, 'ADD' + n, Blockly.Lua.ORDER_NONE) + ', ' + packed + ' = pack.unpack(' + packed + ', true)\n';
    }
	
    return code;
};