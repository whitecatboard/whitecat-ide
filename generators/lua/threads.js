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


Blockly.Lua['thread_start'] = function(block) {
	var thid = Blockly.Lua.valueToCode(block, 'THID', Blockly.Lua.ORDER_NONE);
	var thread_code = Blockly.Lua.statementToCode(block, 'DO');
	
	if (thid != '') {
		thid = thid + ' = ';
	}
	var code = thid + 'thread.start(function()\r\n' +
			   thread_code + 
			   'end)\r\n';
	
	return code;
};

Blockly.Lua['thread_sleep'] = function(block) {
	var time = block.getFieldValue('TIME');
	var units = block.getFieldValue('UNITS');
	
	var code = '';
	
	switch (units) {
		case 'microseconds':
			code += "thread.sleepus(" + time + ")\r\n";break;
		case 'milliseconds':
			code += "thread.sleepms(" + time + ")\r\n";break;
		case 'seconds':	
			code += "thread.sleep(" + time + ")\r\n";break;
	}
	
	return code;
};