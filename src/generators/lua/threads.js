/*
 * Whitecat Blocky Environment, thread block code generation
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

goog.provide('Blockly.Lua.threads');

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

Blockly.Lua['thread_create'] = function(block) {
	var thid = Blockly.Lua.valueToCode(block, 'THID', Blockly.Lua.ORDER_NONE);	
	var thread_code = Blockly.Lua.statementToCode(block, 'DO');
	
	if (thid != '') {
		thid = thid + ' = ';
	}
	var code = thid + 'thread.create(function()\r\n' +
			   thread_code + 
			   'end)\r\n';
	
	return code;
};

Blockly.Lua['thread_stop'] = function(block) {
	var thid = block.getFieldValue('THID');
	
	if (thid == 'all') {
		thid = "";
	}

	var code = 'thread.stop(' + thid + ')\r\n';
	
	return code;
};

Blockly.Lua['thread_resume'] = function(block) {
	var thid = block.getFieldValue('THID');
	
	if (thid == 'all') {
		thid = "";
	}

	var code = 'thread.resume(' + thid + ')\r\n';
	
	return code;
};

Blockly.Lua['thread_suspend'] = function(block) {
	var thid = block.getFieldValue('THID');
	
	if (thid == 'all') {
		thid = "";
	}

	var code = 'thread.suspend(' + thid + ')\r\n';
	
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