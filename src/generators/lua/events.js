/*
 * Whitecat Blocky Environment, events block code generation
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

goog.provide('Blockly.Lua.events');

goog.require('Blockly.Lua');

Blockly.Lua['when_board_starts'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var code = '';
	var initCode = '';

	//if (statement != '') {
		Blockly.Lua.addDependency("block", block);

		code += Blockly.Lua.indent(0, '-- when board starts') + "\n";
		code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";

		code += Blockly.Lua.blockStart(1, block);
		code += Blockly.Lua.tryBlock(1, block, statement);
		code += Blockly.Lua.blockEnd(1, block) + "\n";

		code += Blockly.Lua.indent(1,'-- board is started, broadcast to threads that are waiting') + "\n";
		code += Blockly.Lua.indent(1,'_eventBoardStarted:broadcast(false)') + "\n";

		code += Blockly.Lua.indent(0, 'end)');
		//}

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['thread'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var code = '';

	Blockly.Lua.addDependency("block", block);

	code += Blockly.Lua.indent(0, '-- thread') + "\n";
	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";
	code += Blockly.Lua.indent(1, '_eventBoardStarted:wait()') + "\n\n";
	code += Blockly.Lua.blockStart(1, block);
	code += Blockly.Lua.indent(1, 'while true do') + "\n";
	code += Blockly.Lua.tryBlock(2, block, statement);

	code += Blockly.Lua.indent(1, 'end') + "\n";
	code += Blockly.Lua.blockEnd(1, block);

	code += Blockly.Lua.indent(0, 'end)');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['when_i_receive'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);
	var code = '';
	var initCode = '';
	var tryCode = '';

	Blockly.Lua.addDependency("block", block);

	initCode += Blockly.Lua.indent(0, '-- event "' + when + '" declaration') + "\n";
	initCode += Blockly.Lua.indent(0, '_event' + eventId + ' = event.create()') + "\n";
	
	Blockly.Lua.addCodeToSection("events", initCode, block);

	tryCode += Blockly.Lua.indent(0,'-- we need to wait for the completion of the board start') + "\n";
	tryCode += Blockly.Lua.indent(0,'_eventBoardStarted:wait()') + "\n\n";
	tryCode += Blockly.Lua.indent(0, 'while true do') + "\n";
	tryCode += Blockly.Lua.indent(1, '-- wait for event "' + when + '"') + "\n";
	tryCode += Blockly.Lua.indent(1, '_event' + eventId + ':wait()') + "\n\n";

	tryCode += Blockly.Lua.blockStart(1, block);

	if (statement != "") {
		tryCode += Blockly.Lua.indent(1, statement);
	}

	tryCode += Blockly.Lua.indent(1, '_event' + eventId + ':done()') + "\n";

	tryCode += Blockly.Lua.blockEnd(1, block);

	tryCode += Blockly.Lua.indent(0, 'end') + "\n";

	code += Blockly.Lua.indent(0, '-- when I receive ' + when) + "\n";

	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";	
	code += Blockly.Lua.tryBlock(1, block,tryCode);	
	code += Blockly.Lua.indent(0, 'end)');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['execute_every'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var every = Blockly.Lua.statementToCodeNoIndent(block, 'TIME');
	var units = block.getFieldValue('units');
	var code = '';
	var initCode = '';
	var tryCode = '';
	var timerId = 0;
	var blockId = Blockly.Lua.blockIdToNum(block.id);

	Blockly.Lua.addDependency("block", block);

	// Convert time to milliseconds if needed
	if (units == "seconds") {
		every[0] = every[0] * 1000;
	}

	// Attach timer
	code += Blockly.Lua.indent(0, '-- attach timer every ' + every[0] + ' milliseconds') + "\n";
	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";
	code += Blockly.Lua.indent(1, '_eventBoardStarted:wait()') + "\n\n";
	code += Blockly.Lua.indent(1, 'while true do') + "\n";

	code += Blockly.Lua.blockStart(2, block);

	if (statement != "") {
		tryCode += Blockly.Lua.indent(0, statement);
		code += Blockly.Lua.tryBlock(2, block, tryCode);
	}

	code += Blockly.Lua.indent(2, 'tmr.delayms(' + every[0] + ')') + "\n";
	code += Blockly.Lua.blockEnd(2, block);
	code += Blockly.Lua.indent(1, 'end') + "\n";

	code += Blockly.Lua.indent(0, 'end)');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['broadcast'] = function(block) {
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);
	var code = '';

	Blockly.Lua.addDependency("block", block);

	code += Blockly.Lua.indent(0, '_event' + eventId + ':broadcast(false)' + '  -- boardcast "' + when + '"');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['broadcast_and_wait'] = function(block) {
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);
	var code = '';

	Blockly.Lua.addDependency("block", block);

	code += Blockly.Lua.indent(0, '_event' + eventId + ':broadcast(true)' + '  -- boardcast and wait "' + when + '"');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['event_is_being_processed'] = function(block) {
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);

	Blockly.Lua.addDependency("block", block);

	return ['_event' + eventId + ':pending()', Blockly.Lua.ORDER_HIGH];
}
