/*
 * Whitecat Blocky Environment, io block code generation
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

goog.provide('Blockly.Lua.io');

goog.require('Blockly.Lua');

Blockly.Lua['configuredigitalpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var direction = block.getFieldValue('DIRECTION');
	
	var code = '';
	var directionCode = '';
	var needsPull = false;
	
	if (direction == 'Input') {
		directionCode = 'pio.INPUT';
		needsPull = true;
	} else {
		directionCode = 'pio.OUTPUT';
	}
	
	code = 'pio.pin.setdir(' + directionCode + ', ' + Board.digitalPins[pin] +')\n';
	
	if (needsPull) {
		code += 'pio.pin.setpull(pio.PULLUP, ' + Board.digitalPins[pin] +')\n';
	} else {
		code += 'pio.pin.setpull(pio.NOPULL, ' + Board.digitalPins[pin] +')\n';
	}
	
	return code;
};

Blockly.Lua['configureanalogpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var resolution = block.getFieldValue('RESOLUTION');
	
	var code = '';
	
	code  = 'if (adc1 == nil) then\n';
	code += '  adc1 = adc.setup(adc.ADC1, adc.AVDD, 3220)\n';
	code += 'end\n';
	code += 'adc1_chan' + Board.analogPinsChannel[pin] + ' = adc1:setupchan(' + resolution + ', ' + Board.analogPinsChannel[pin] + ')\n';

	return code;
};

Blockly.Lua['setdigitalpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var value = block.getFieldValue('VALUE');
	
	var code = '';
	
	code = 'pio.pin.setval(' + value + ', ' + Board.digitalPins[pin] +')\n';
	
	return code;
};

Blockly.Lua['getdigitalpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var value = block.getFieldValue('VALUE');
	
	var code = '';
	
	code = 'pio.pin.getval(' + Board.digitalPins[pin] +')';
	
	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['getanalogpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	
	var code = '';
	
	code = 'adc1_chan' + Board.analogPinsChannel[pin] + ':read()[1]\n';
		
	return [code, Blockly.Lua.ORDER_HIGH];
};

