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
	
	code = 'pio.pin.setdir(' + directionCode + ', pio.' + Board.digitalPins[pin] +')\n';
	
	if (needsPull) {
		code += 'pio.pin.setpull(pio.PULLUP, pio.' + Board.digitalPins[pin] +')\n';
	} else {
		code += 'pio.pin.setpull(pio.NOPULL, pio.' + Board.digitalPins[pin] +')\n';
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

Blockly.Lua['configuredacpwmpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var resolution = block.getFieldValue('RESOLUTION');
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE);	
	
	if (!value) {
		value = '0';
	}
	
	var code = '';
	
	code += 'pwm.setup(' + Board.pwmPinsChannel[pin] + ', pwm.DAC, ' + resolution + ', ' + value + ')\n';

	return code;
}


Blockly.Lua['configuredefaultpwmpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var frequency = Blockly.Lua.valueToCode(block, 'FREQUENCY', Blockly.Lua.ORDER_NONE);	
	var duty = Blockly.Lua.valueToCode(block, 'DUTY', Blockly.Lua.ORDER_NONE);	
	

	if (!frequency) {
		frequency = '1000';
	}

	if (!duty) {
		duty = '0';
	}
	
	var code = '';
	
	code += 'pwm.setup(' + Board.pwmPinsChannel[pin] + ', pwm.DEFAULT, ' + frequency + ', ' + duty + ')\n';

	return code;
}

Blockly.Lua['pwmstart'] = function(block) {
	var pin = block.getFieldValue('PIN');
	
	var code = '';
	
	code += 'pwm.start(' + Board.pwmPinsChannel[pin] + ')\n';

	return code;
}

Blockly.Lua['pwmstop'] = function(block) {
	var pin = block.getFieldValue('PIN');
	
	var code = '';
	
	code += 'pwm.stop(' + Board.pwmPinsChannel[pin] + ')\n';

	return code;
}

Blockly.Lua['pwmsetduty'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var duty = Blockly.Lua.valueToCode(block, 'DUTY', Blockly.Lua.ORDER_NONE);	
	
	var code = '';

	if (!duty) {
		duty = '0';
	}
	
	code += 'pwm.setduty(' + Board.pwmPinsChannel[pin] + ', ' + duty + ')\n';

	return code;
}

Blockly.Lua['pwmwrite'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE);	
	
	var code = '';

	if (!value) {
		value = '0';
	}
	
	code += 'pwm.write(' + Board.pwmPinsChannel[pin] + ', ' + value + ')\n';

	return code;
}

Blockly.Lua['setdigitalpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var value = block.getFieldValue('VALUE');
	
	var code = '';
	
	code = 'pio.pin.setval(' + value + ', pio.' + Board.digitalPins[pin] +')\n';
	
	return code;
};

Blockly.Lua['getdigitalpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var value = block.getFieldValue('VALUE');
	
	var code = '';
	
	code = 'pio.pin.getval(pio.' + Board.digitalPins[pin] +')';
	
	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['getanalogpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	
	var code = '';
	
	code = 'adc1_chan' + Board.analogPinsChannel[pin] + ':read()\n';
		
	return [code, Blockly.Lua.ORDER_HIGH];
};

