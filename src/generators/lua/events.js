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
	var statement = Blockly.Lua.statementToCode(block, 'DO');
	var code = '';
	var initCode = '';
	
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	initCode += Blockly.Lua.indent(0,'-- this event syncronizes events that can\'t start before the "when board starts" event') + "\n";
	initCode += Blockly.Lua.indent(0,'_eventBoardStarted = event.create()') + "\n";
	codeSection["events"].push(initCode);
	
	code += Blockly.Lua.indent(0,'-- when board starts') + "\n";
	
	if (statement != '') {
		code += Blockly.Lua.indent(0,'wcBlock.blockStart("'+block.id+'")') + "\n";
		code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(block, statement)) + "\n\n";
		code += Blockly.Lua.indent(0,'wcBlock.blockEnd("'+block.id+'")') + "\n";
		code += Blockly.Lua.indent(0,'_eventBoardStarted:broadcast(false)') + "\n";
	}
		
	return code;
}

Blockly.Lua['when_i_receive'] = function(block) {
	var statement = Blockly.Lua.statementToCode(block, 'DO');
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);
	var code = '';
	var initCode = '';
	var tryCode = '';
	
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}

	initCode += Blockly.Lua.indent(0,'-- event "' + when + '" declaration') + "\n";
	initCode += Blockly.Lua.indent(0,'_event'+eventId+' = event.create()') + "\n";
	codeSection["events"].push(initCode);
		
	tryCode += Blockly.Lua.indent(1,'_event'+eventId+':addlistener(function()') + "\n";
	tryCode += Blockly.Lua.indent(2,'thread.start(function()') + "\n";
	tryCode += Blockly.Lua.indent(3,'wcBlock.blockStart("'+block.id+'")') + "\n";
	
	if (statement != "") {
		tryCode += Blockly.Lua.indent(2, statement);
	}
	
	tryCode += Blockly.Lua.indent(3,'wcBlock.blockEnd("'+block.id+'")') + "\n";
	tryCode += Blockly.Lua.indent(2,'end)') + "\n";
	tryCode += Blockly.Lua.indent(1,'end)') + "\n";
	
	code += Blockly.Lua.indent(0, '-- when I receive ' + when) + "\n";
	code += Blockly.Lua.indent(0, Blockly.Lua.tryBlock(block, tryCode)) + "\n";
	
	return code;
}

Blockly.Lua['when_i_receive_a_lora_frame'] = function(block) {
	var statement = Blockly.Lua.statementToCode(block, 'DO');
	var code = '';
	
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	code += Blockly.Lua.indent(0,'-- when I receive a LoRa frame') + "\n";
	code += Blockly.Lua.indent(0,'lora.whenReceived(function(_port, _payload)') + "\n";
	code += Blockly.Lua.indent(1,'wcBlock.blockStart("'+block.id+'")') + "\n";
	
	if (statement != '') {
		code += Blockly.Lua.indent(1,Blockly.Lua.tryBlock(block, statement)) + "\n";
	}
	
	code += Blockly.Lua.indent(1,'wcBlock.blockEnd("'+block.id+'")') + "\n";
	code += Blockly.Lua.indent(0,'end)') + "\n";
	
	return code;
}

Blockly.Lua['broadcast'] = function(block) {
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);
	var code = '';
	
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	code += Blockly.Lua.indent(0,'-- boardcast ' + when) + "\n";
	
	var statement = '';
	statement += Blockly.Lua.indent(1,'_event'+eventId+':broadcast(false)') + "\n";
	
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(block, statement)) + "\n";
	
	return code;
}

Blockly.Lua['broadcast_and_wait'] = function(block) {
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);
	var code = '';
	
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	code += Blockly.Lua.indent(0,'-- boardcast and wait ' + when) + "\n";
	
	var statement = '';
	
	statement += '_event'+eventId+':broadcast(false)';
	code += Blockly.Lua.indent(1,Blockly.Lua.tryBlock(block, statement)) + "\n";
	
	return code;
}