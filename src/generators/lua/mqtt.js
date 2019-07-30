/*
 * Whitecat Blocky Environment, MQTT code generation
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

goog.provide('Blockly.Lua.MQTT');
goog.provide('Blockly.Lua.MQTT.helper');

goog.require('Blockly.Lua');

Blockly.Lua['mqtt_publish'] = function(block) {
    var topic = Blockly.Lua.valueToCode(block, 'TOPIC', Blockly.Lua.ORDER_NONE) || '\'\'';	
    var payload = Blockly.Lua.valueToCode(block, 'PAYLOAD', Blockly.Lua.ORDER_NONE) || '\'\'';	
    var qos = block.getFieldValue('QOS');
	var code = '';

	Blockly.Lua.addDependency("block", block);
	
	var tryCode = "";

	tryCode += Blockly.Lua.blockStart(0, block);
	
	tryCode += Blockly.Lua.indent(0,'-- create the MQTT client and connect, if needed') + "\n";
	tryCode += Blockly.Lua.indent(0,'_mqtt_lock:lock()') + "\n";
	tryCode += Blockly.Lua.indent(0,'if (_mqtt == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(1,'_mqtt = mqtt.client("'+block.clientid+'", "'+block.host+'", '+block.port+', false, nil, ' + ((qos > 0)?"true":"false") + ')') + "\n";
	tryCode += Blockly.Lua.indent(1,'_mqtt:connect("'+block.username+'","'+block.password+'")') + "\n";
	tryCode += Blockly.Lua.indent(0,'end') + "\n";
	tryCode += Blockly.Lua.indent(0,'_mqtt_lock:unlock()') + "\n\n";
	
	tryCode += Blockly.Lua.indent(0,'-- publish to topic') + "\n";
	tryCode += Blockly.Lua.indent(0,'_mqtt:publish('+topic+', '+payload+', mqtt.QOS'+qos+')') + "\n";;

	tryCode += Blockly.Lua.blockEnd(0, block);

	code += Blockly.Lua.indent(0,'-- publish to MQTT topic ' + topic) + "\n";
	code += Blockly.Lua.tryBlock(0,block,tryCode) + "\n";
	
	return code;
};

Blockly.Lua['mqtt_subscribe'] = function(block) {
    var topic = Blockly.Lua.valueToCode(block, 'TOPIC', Blockly.Lua.ORDER_NONE) || '\'\'';	
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
    var qos = block.getFieldValue('QOS');
	var code = '';

	Blockly.Lua.addDependency("block", block);
	
	var tryCode = '';	

	tryCode += Blockly.Lua.indent(0,'-- create the MQTT client and connect, if needed') + "\n";
	tryCode += Blockly.Lua.indent(0,'_mqtt_lock:lock()') + "\n";
	tryCode += Blockly.Lua.indent(0,'if (_mqtt == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(1,'_mqtt = mqtt.client("'+block.clientid+'", "'+block.host+'", '+block.port+', false, nil, ' + ((qos > 0)?"true":"false") + ')') + "\n";
	tryCode += Blockly.Lua.indent(1,'_mqtt:connect("'+block.username+'","'+block.password+'")') + "\n";
	tryCode += Blockly.Lua.indent(0,'end') + "\n";
	tryCode += Blockly.Lua.indent(0,'_mqtt_lock:unlock()') + "\n\n";
	
	tryCode += Blockly.Lua.indent(0,'-- subscribe to topic') + "\n";
	tryCode += Blockly.Lua.indent(0,'_mqtt:subscribe('+topic+', mqtt.QOS'+qos+', function(length, payload)') + "\n";
	tryCode += Blockly.Lua.indent(1,'-- a new message is available in length / payload arguments') + "\n";

	tryCode += Blockly.Lua.blockStart(1, block);
	if (statement != '') {
		tryCode += Blockly.Lua.tryBlock(1,block, statement);
	}
	tryCode += Blockly.Lua.blockEnd(1, block);

	tryCode += Blockly.Lua.indent(0,'end)') + "\n";
	
	code += Blockly.Lua.indent(0,'-- subscribe to MQTT topic ' + topic) + "\n";
	
	code += Blockly.Lua.indent(0,'thread.start(function()') + "\n";
	code += Blockly.Lua.indent(1, '_eventBoardStarted:wait()') + "\n";
	code += Blockly.Lua.indent(1, '_eventBoardStarted:done()') + "\n\n";
	code += Blockly.Lua.tryBlock(1, block, tryCode);
	code += Blockly.Lua.indent(0,'end)') + "\n";
		
	return code;
};