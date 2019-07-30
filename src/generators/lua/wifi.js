/*
 * Whitecat Blocky Environment, Wi-Fi code generation
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

goog.provide('Blockly.Lua.Wifi');
goog.provide('Blockly.Lua.Wifi.helper');

goog.require('Blockly.Lua');

Blockly.Lua['wifi_start'] = function(block) {
	var code = '';
	var tryCode = '';
	
	tryCode += Blockly.Lua.blockStart(0, block);
	tryCode += Blockly.Lua.indent(0, 'net.wf.setup(net.wf.mode.'+block.wtype+', "'+block.ssid+'","'+block.password+'")') + "\n";
	tryCode += Blockly.Lua.indent(0, 'net.wf.start(false)') + "\n";
	tryCode += Blockly.Lua.blockEnd(0, block);
		
	code += Blockly.Lua.indent(0,'-- configure wifi and start wifi') + "\n";
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(0, block,tryCode)) + "\n";

	return code;
};

Blockly.Lua['wifi_stop'] = function(block) {
	var code = '';
	var tryCode = '';
	
	tryCode += Blockly.Lua.indent(0, 'net.wf.setup(net.wf.mode.'+block.wtype+', "'+block.ssid+'","'+block.password+'")') + "\n";
	tryCode += Blockly.Lua.indent(0, 'net.wf.stop()') + "\n";
		
	code += Blockly.Lua.indent(0,'-- configure wifi and stop wifi') + "\n";
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(0, block,tryCode)) + "\n";

	return code;
};

Blockly.Lua['when_wifi_is_conneted'] = function(block) {
	var code = '';
	var tryCode = '';
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	
	tryCode += Blockly.Lua.blockStart(0, block);
	if (statement != "") {
		tryCode += Blockly.Lua.indent(0,statement);
	}
	tryCode += Blockly.Lua.blockEnd(0, block);
	
	code += Blockly.Lua.indent(0,'-- when Wi-Fi is connected') + "\n";
	code += Blockly.Lua.indent(0,'_network_callback_wifi_connected = function()') + "\n";
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";
	code += Blockly.Lua.indent(0,'end') + "\n";

	Blockly.Lua.addFragment("declaration", "_wifi_connected_callback", block, code);

	return "";
};

Blockly.Lua['when_wifi_is_disconneted'] = function(block) {
	var code = '';
	var tryCode = '';
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	
	tryCode += Blockly.Lua.blockStart(0, block);
	if (statement != "") {
		tryCode += Blockly.Lua.indent(0,statement);
	}
	tryCode += Blockly.Lua.blockEnd(0, block);
	
	code += Blockly.Lua.indent(0,'-- when Wi-Fi is disconnected') + "\n";
	code += Blockly.Lua.indent(0,'_network_callback_wifi_disconnected = function()') + "\n";
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";
	code += Blockly.Lua.indent(0,'end') + "\n";

	Blockly.Lua.addFragment("declaration", "_wifi_disconnected_callback", block, code);

	return "";
};