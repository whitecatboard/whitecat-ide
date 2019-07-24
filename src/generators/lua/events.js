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

	Blockly.Lua.addDependency("block", block);
	
	code += Blockly.Lua.indent(0, '-- when board starts') + "\n";
	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";

	code += Blockly.Lua.blockStart(1, block);
	code += Blockly.Lua.tryBlock(1, block, statement);
	code += Blockly.Lua.blockEnd(1, block) + "\n";

	code += Blockly.Lua.indent(1,'-- board is started, broadcast to threads that are waiting') + "\n";
	code += Blockly.Lua.indent(1,'_eventBoardStarted:broadcast(false)') + "\n";

	code += Blockly.Lua.indent(0, 'end)');
	
	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['forever'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var chunkCode = '';
	var code = '';

	Blockly.Lua.addDependency("block", block);
	
	// Generate a block chunk, that contains the forever's script
	var chunk = Blockly.Lua.getChunkId(block);
	
	if (statement == "") {
		// If the script is empty program a delay to prevent CPU starving
		statement = "tmr.delayms(100)";
	}
	
	chunkCode += Blockly.Lua.indent(0, '-- forever chunks') + "\n";
	chunkCode += Blockly.Lua.indent(0, 'function _chunk_' + chunk + '()') + "\n";
	chunkCode += Blockly.Lua.indent(1, statement) + "\n";
	chunkCode += Blockly.Lua.indent(0, 'end') + "\n";
	
	Blockly.Lua.addFragment("chunks","_chunk_" + chunk, block, chunkCode);
	
	//  Generate block code:
	//  
	//	thread.start(function()
	//		_eventBoardStarted:wait()
    //
	//		while true do
	//			chunk call
	//		end
	//	end)
	//
	code += Blockly.Lua.indent(0, '-- forever') + "\n";
	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";
	code += Blockly.Lua.indent(1, '_eventBoardStarted:wait()') + "\n";
	code += Blockly.Lua.indent(1, '_eventBoardStarted:done()') + "\n\n";
	code += Blockly.Lua.blockStart(1, block);
	code += Blockly.Lua.indent(1, 'while true do') + "\n";
	code += Blockly.Lua.tryBlock(2, block, '_chunk_' + chunk + '()') + "\n";
	code += Blockly.Lua.indent(1, 'end') + "\n";
	code += Blockly.Lua.blockEnd(1, block);
	code += Blockly.Lua.indent(0, 'end)');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['thread'] = Blockly.Lua['forever'];

Blockly.Lua['when_i_receive'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);
	var chunkCode = '';
	var code = '';
	var tryCode = '';

	Blockly.Lua.addDependency("block", block);

	// Generate a block chunk, that contains the event declaration and
	// the block script
	var chunk = Blockly.Lua.getChunkId(block);

	if (statement == "") {
		// If the script is empty program a delay to prevent CPU starving
		statement = "tmr.delayms(100)";
	}

	chunkCode += Blockly.Lua.indent(0, '-- when I receive ' + when + ' chunks') + "\n";
	chunkCode += Blockly.Lua.indent(0, '-- event ' + when + ' creation' ) + "\n";
	
	if ((typeof block.eventId != "undefined") && (block.eventId != eventId)) {
		chunkCode += Blockly.Lua.indent(1, '-- disable previous event') + "\n";
		chunkCode += Blockly.Lua.indent(0, 'if (not (_event' + block.eventId + ' == nil)) then' ) + "\n";
		chunkCode += Blockly.Lua.indent(1, '_event' + block.eventId + ':disable()') + "\n";
		chunkCode += Blockly.Lua.indent(0, 'end') + "\n\n";		
	}
	
	chunkCode += Blockly.Lua.indent(0, 'if (not (_event' + eventId + ' == nil)) then' ) + "\n";
	chunkCode += Blockly.Lua.indent(1, '-- disable event "' + when ) + "\n";
	chunkCode += Blockly.Lua.indent(1, '_event' + eventId + ':disable()') + "\n";
	chunkCode += Blockly.Lua.indent(0, 'else') + "\n";
	chunkCode += Blockly.Lua.indent(1, '-- create event "' + when ) + "\n";
	chunkCode += Blockly.Lua.indent(1, '_event' + eventId + ' = event.create()') + "\n";
	chunkCode += Blockly.Lua.indent(0, 'end') + "\n\n";
		
	chunkCode += Blockly.Lua.indent(0, 'function _chunk_' + chunk + '()') + "\n";
	chunkCode += Blockly.Lua.indent(1, '-- wait for event "' + when + '"') + "\n";
	chunkCode += Blockly.Lua.indent(1, 'if (_event' + eventId + ':wait()) then') + "\n";
	chunkCode += Blockly.Lua.blockStart(2, block);
	chunkCode += Blockly.Lua.indent(2, statement) + "\n";
	chunkCode += Blockly.Lua.indent(2, '_event' + eventId + ':done()') + "\n";
	chunkCode += Blockly.Lua.blockEnd(2, block);
	chunkCode += Blockly.Lua.indent(1, 'else') + "\n";
	chunkCode += Blockly.Lua.indent(2, '_event' + eventId + ':done()') + "\n";
	chunkCode += Blockly.Lua.indent(1, 'end') + "\n";	
	chunkCode += Blockly.Lua.indent(0, 'end') + "\n\n";

	chunkCode += Blockly.Lua.indent(0, '-- enable event ' + when ) + "\n";
	chunkCode += Blockly.Lua.indent(0, '_event' + eventId + ':enable()') + "\n";

	Blockly.Lua.addFragment("chunks","_chunk_" + chunk, block, chunkCode);

	// Generate block code:
	//
    // thread.start(function()
    //     _eventBoardStarted:wait()
    //
    //    while true do
    //       chunk call
    //    end
    // end)
	tryCode += Blockly.Lua.indent(0,'-- we need to wait for the completion of the board start') + "\n";
	tryCode += Blockly.Lua.indent(0, '_eventBoardStarted:wait()') + "\n";
	tryCode += Blockly.Lua.indent(0, '_eventBoardStarted:done()') + "\n\n";
	tryCode += Blockly.Lua.indent(0, 'while true do') + "\n";
	tryCode += Blockly.Lua.tryBlock(1, block, '_chunk_' + chunk + '()') + "\n";	
	tryCode += Blockly.Lua.indent(0, 'end') + "\n";

	code += Blockly.Lua.indent(0, '-- when I receive ' + when) + "\n";
	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";	
	code += Blockly.Lua.tryBlock(1, block,tryCode);	
	code += Blockly.Lua.indent(0, 'end)');

	block.eventId = eventId;
	
	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['execute_every'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var every = Blockly.Lua.statementToCodeNoIndent(block, 'TIME');
	var units = block.getFieldValue('units');
	var chunkCode = '';
	var code = '';

	Blockly.Lua.addDependency("block", block);

	// Convert time to milliseconds, if required
	if (units == "seconds") {
		every[0] = every[0] * 1000;
	}
	
	// Generate a block chunk, that contains the every's script and the required delay
	var chunk = Blockly.Lua.getChunkId(block);
	
	chunkCode += Blockly.Lua.indent(0, '-- every ' + every[0] + ' milliseconds chunks') + "\n";
	chunkCode += Blockly.Lua.indent(0, 'function _chunk_' + chunk + '()') + "\n";
	chunkCode += Blockly.Lua.blockStart(1, block);
	chunkCode += Blockly.Lua.indent(1, statement) + "\n";
	chunkCode += Blockly.Lua.blockEnd(1, block);
	chunkCode += Blockly.Lua.indent(1, 'tmr.delayms(' + every[0] + ')') + "\n";
	chunkCode += Blockly.Lua.indent(0, 'end') + "\n";
	
	Blockly.Lua.addFragment("chunks","_chunk_" + chunk, block, chunkCode);	

	// Generate block code:
    // thread.start(function()
    //     _eventBoardStarted:wait()
    //
    //     while true do
	//         chunk call
    //     end
    // end)
	code += Blockly.Lua.indent(0, '-- every ' + every[0] + ' milliseconds') + "\n";
	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";
	code += Blockly.Lua.indent(1, '_eventBoardStarted:wait()') + "\n";
	code += Blockly.Lua.indent(1, '_eventBoardStarted:done()') + "\n\n";
	code += Blockly.Lua.indent(1, 'while true do') + "\n";
	code += Blockly.Lua.tryBlock(2, block, '_chunk_' + chunk + '()') + "\n";
	code += Blockly.Lua.indent(1, 'end') + "\n";
	code += Blockly.Lua.indent(0, 'end)');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['broadcast'] = function(block) {
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);
	var code = '';

	Blockly.Lua.addDependency("block", block);

	code += Blockly.Lua.indent(0, 'if (not (_event' + eventId + ' == nil)) then' + '\n');
	code += Blockly.Lua.indent(1, '_event' + eventId + ':broadcast(false)' + '  -- boardcast "' + when + '"' + '\n');
	code += Blockly.Lua.indent(0, 'end');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['broadcast_and_wait'] = function(block) {
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);
	var code = '';

	Blockly.Lua.addDependency("block", block);

	code += Blockly.Lua.indent(0, 'if (not (_event' + eventId + ' == nil)) then' + '\n');
	code += Blockly.Lua.indent(1, '_event' + eventId + ':broadcast(true)' + '  -- boardcast and wait "' + when + '"' + '\n');
	code += Blockly.Lua.indent(0, 'end');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['event_is_being_processed'] = function(block) {
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);

	Blockly.Lua.addDependency("block", block);

	return ['(function() if (not (_event' + eventId + '== nil)) then return _event' + eventId + ':pending() else return false end end)()', Blockly.Lua.ORDER_HIGH];
}
