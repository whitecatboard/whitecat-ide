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


Blockly.Lua['wait_for'] = function(block) {
	var time = block.getFieldValue('time');
	var units = block.getFieldValue('units');
	
	var code = '';
	
	switch (units) {
		case 'microseconds':
			code += "tmr.delayus(" + time + ")\r\n";break;
		case 'milliseconds':
			code += "tmr.delayms(" + time + ")\r\n";break;
		case 'seconds':	
			code += "tmr.delay(" + time  + ")\r\n";break;
	}
	
	return code;
};

