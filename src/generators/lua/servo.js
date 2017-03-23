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

Blockly.Lua['servo_attach'] = function(block) {
	var pin = block.getFieldValue('PIN');
    var code = '';
	
	code = '_servo' + pin + ' = servo.attach(pio.' + Code.status.maps.pwmPins[pin] + ')\r\n';

	return code;
}

Blockly.Lua['servo_move'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var value;
    var code = '';

	value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE);
	if (block.value != -1) {
		value = block.value;
	}

	if (Code.blockAbstraction == blockAbstraction.Low) {
		code = '_servo' + pin + ':move(' + value + ')\r\n';			
	} else {
		if (codeSection["require"].indexOf('require("block-servo")') == -1) {
			codeSection["require"].push('require("block-servo")');
		}

		code = 'wcBlock.servo.move("' + block.id + '", pio.' + Code.status.maps.pwmPins[pin] + ', ' + value + ')\r\n'			
	}
	
	return code;
}