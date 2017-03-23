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
	
	code = 'pio.pin.setdir(' + directionCode + ', pio.' + Code.status.maps.digitalPins[pin][0] +')\n';
	
	if (needsPull) {
		code += 'pio.pin.setpull(pio.PULLUP, pio.' + Code.status.maps.digitalPins[pin][0] +')\n';
	} else {
		code += 'pio.pin.setpull(pio.NOPULL, pio.' + Code.status.maps.digitalPins[pin][0] +')\n';
	}
	
	return code;
};

Blockly.Lua['configureanalogpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var resolution = block.getFieldValue('RESOLUTION');
	
	var code = '';
	
	code  = 'if (adc1 == nil) then\n';
	code += '  adc1 = adc.setup(adc.ADC1)\n';
	code += 'end\n';
	code += 'adc1_chan' + Code.status.maps.analogPinsChannel[pin] + ' = adc1:setupchan(' + resolution + ', adc.' + Code.status.maps.analogPinsChannel[pin] + ')\n';

	return code;
};

Blockly.Lua['setpwmpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var frequency = Blockly.Lua.valueToCode(block, 'FREQUENCY', Blockly.Lua.ORDER_NONE);	
	var duty = Blockly.Lua.valueToCode(block, 'DUTY', Blockly.Lua.ORDER_NONE);	
	
	console.log(1);
	if (!frequency) {
		frequency = '1000';
	}
	console.log(1);

	if (!duty) {
		duty = '0';
	}
	console.log(1);
	
	var code = '';

	console.log(1);
	if (Code.blockAbstraction == blockAbstraction.Low) {	
		code = '';
	} else {
		if (codeSection["require"].indexOf('require("block-pwm")') == -1) {
			codeSection["require"].push('require("block-pwm")');
		}

		code = 'wcBlock.pwm.set("' + block.id + '", pio.' + Code.status.maps.pwmPins[pin] + ', ' + frequency + ', ' + duty + ' / 100)\n';
	}
	console.log(1);

	return code;
}

Blockly.Lua['setdigitalpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var value = block.getFieldValue('VALUE');
	
	var code = '';
	
	if (Code.blockAbstraction == blockAbstraction.Low) {	
		code = 'pio.pin.setval(' + value + ', pio.' + Code.status.maps.digitalPins[pin][0] +')\n';
	} else {
		if (codeSection["require"].indexOf('require("block-gpio")') == -1) {
			codeSection["require"].push('require("block-gpio")');
		}

		code = 'wcBlock.gpio.set("' + block.id + '", pio.' + Code.status.maps.digitalPins[pin][0] + ', ' + value + ')\n';
	}
	return code;
};

Blockly.Lua['getdigitalpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var value = block.getFieldValue('VALUE');
	
	var code = '';
	
	if (Code.blockAbstraction == blockAbstraction.Low) {	
		code = 'pio.pin.getval(pio.' + Code.status.maps.digitalPins[pin][0] +')';
	} else {
		if (codeSection["require"].indexOf('require("block-gpio")') == -1) {
			codeSection["require"].push('require("block-gpio")');
		}

		code = 'wcBlock.gpio.get("' + block.id + '", pio.' + Code.status.maps.digitalPins[pin][0] + ')\n';		
	}
	
	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['getanalogpin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	
	var code = '';

	if (Code.blockAbstraction == blockAbstraction.Low) {	
		code = 'adc1_chan' + Code.status.maps.analogPinsChannel[pin] + ':read()\n';
	} else {
		if (codeSection["require"].indexOf('require("block-adc")') == -1) {
			codeSection["require"].push('require("block-adc")');
		}

		code = 'wcBlock.adc.get("' + block.id + '", adc.' + Code.status.maps.analogPinsChannel[pin] + ')\n';
	}

	return [code, Blockly.Lua.ORDER_HIGH];
};

