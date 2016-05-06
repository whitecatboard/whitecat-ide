/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Generating Lua for logic blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
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

