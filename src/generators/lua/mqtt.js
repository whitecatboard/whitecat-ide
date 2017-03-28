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

goog.require('Blockly.Lua');

Blockly.Lua['mqtt_publish'] = function(block) {
    var topic = Blockly.Lua.valueToCode(block, 'TOPIC', Blockly.Lua.ORDER_NONE) || '\'\'';	
    var payload = Blockly.Lua.valueToCode(block, 'PAYLOAD', Blockly.Lua.ORDER_NONE) || '\'\'';	
    var qos = block.getFieldValue('QOS');
	var code = '';

	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	var tryCode = '';	
	tryCode += Blockly.Lua.indent(1,'local instance = "_mqtt"') + "\n\n";
	tryCode += Blockly.Lua.indent(1,'if (_G[instance] == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(2,'_G[instance] = mqtt.client("'+block.clientid+'", "'+block.host+'", '+block.port+', '+block.secure+')') + "\n";
	tryCode += Blockly.Lua.indent(2,'_G[instance]:connect("'+block.username+'","'+block.password+'")') + "\n";
	tryCode += Blockly.Lua.indent(1,'end') + "\n\n";

	tryCode += Blockly.Lua.indent(1,'_G[instance]:publish('+topic+', '+payload+', mqtt.QOS'+qos+')') + "\n";

	code += Blockly.Lua.indent(0,'-- publish to MQTT topic ' + topic) + "\n";
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(block,tryCode)) + "\n";
	
	return code;
};

Blockly.Lua['mqtt_subscribe'] = function(block) {
    var topic = Blockly.Lua.valueToCode(block, 'TOPIC', Blockly.Lua.ORDER_NONE) || '\'\'';	
	var statement = Blockly.Lua.statementToCode(block, 'DO');
    var qos = block.getFieldValue('QOS');
	var code = '';

	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	var tryCode = '';	
	tryCode += Blockly.Lua.indent(1,'local instance = "_mqtt"') + "\n\n";
	tryCode += Blockly.Lua.indent(1,'if (_G[instance] == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(2,'_G[instance] = mqtt.client("'+block.clientid+'", "'+block.host+'", '+block.port+', '+block.secure+')') + "\n";
	tryCode += Blockly.Lua.indent(2,'_G[instance]:connect("'+block.username+'","'+block.password+'")') + "\n";
	tryCode += Blockly.Lua.indent(1,'end') + "\n\n";

	tryCode += Blockly.Lua.indent(1,'_G[instance]:subscribe('+topic+', mqtt.QOS'+qos+', function(_len, _payload)') + "\n";
	if (statement != "") {
		tryCode += Blockly.Lua.indent(2, "thread.start(function()" + "\n");
		tryCode += Blockly.Lua.indent(2, statement);
		tryCode += Blockly.Lua.indent(2, "end)\n");
	}
	tryCode += Blockly.Lua.indent(1,'end)') + "\n";
	
	code += Blockly.Lua.indent(0,'-- subscribe to MQTT topic ' + topic) + "\n";
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(block,tryCode)) + "\n";
	
	return code;
};

Blockly.Lua['mqtt_get_len'] = function(block) {
  return ['_len', Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['mqtt_get_payload'] = function(block) {
    return ['_payload', Blockly.Lua.ORDER_HIGH];
};
