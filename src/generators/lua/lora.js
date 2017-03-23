/*
 * Whitecat Blocky Environment, Lora code generation
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

goog.provide('Blockly.Lua.lora');

goog.require('Blockly.Lua');

Blockly.Lua['lora_configure'] = function(block) {
  var band = block.getFieldValue('BAND');

  return 'lora.setup(' + band + ')\n';
};

Blockly.Lua['lora_set_devaddr'] = function(block) {
  var devAddr = Blockly.Lua.valueToCode(block, 'DEVADDR', Blockly.Lua.ORDER_NONE) || '\'\'';	

  return 'lora.setDevAddr(' + devAddr + ')\n';
};

Blockly.Lua['lora_set_nwkskey'] = function(block) {
  var nwkSKey = Blockly.Lua.valueToCode(block, 'NWKSKEY', Blockly.Lua.ORDER_NONE) || '\'\'';	

  return 'lora.setNwksKey(' + nwkSKey + ')\n';
};

Blockly.Lua['lora_set_appskey'] = function(block) {
  var appSKey = Blockly.Lua.valueToCode(block, 'APPSKEY', Blockly.Lua.ORDER_NONE) || '\'\'';	

  return 'lora.setAppsKey(' + appSKey + ')\n';
};

Blockly.Lua['lora_set_deveui'] = function(block) {
  var devEui = Blockly.Lua.valueToCode(block, 'DEVEUI', Blockly.Lua.ORDER_NONE) || '\'\'';	

  return 'lora.setDevEui(' + devEui + ')\n';
};

Blockly.Lua['lora_set_appeui'] = function(block) {
  var appEui = Blockly.Lua.valueToCode(block, 'APPEUI', Blockly.Lua.ORDER_NONE) || '\'\'';	

  return 'lora.setAppEui(' + appEui + ')\n';
};

Blockly.Lua['lora_set_appkey'] = function(block) {
  var appKey = Blockly.Lua.valueToCode(block, 'APPKEY', Blockly.Lua.ORDER_NONE) || '\'\'';	

  return 'lora.setAppKey(' + appKey + ')\n';
};

Blockly.Lua['lora_set_adr'] = function(block) {
  var on_off = block.getFieldValue('ON_OFF');
  var value = "true";
  
  if (on_off == "0") {
  	value = "false";
  }
  
  return 'lora.setAdr(' + value + ')\n';
};

Blockly.Lua['lora_set_dr'] = function(block) {
  var value = block.getFieldValue('DR');

  return 'lora.setDr(' + value + ')\n';
};

Blockly.Lua['lora_set_retx'] = function(block) {
  var value = block.getFieldValue('RETX');

  return 'lora.setReTx(' + value + ')\n';
};

Blockly.Lua['lora_join'] = function(block) {
	var code = '';
	
	if (Code.blockAbstraction == blockAbstraction.Low) {
		code = 'lora.join()\n';
	} else {
		if (codeSection["require"].indexOf('require("block-lora")') == -1) {
			codeSection["require"].push('require("block-lora")');
		}
		
		code = 'wcBlock.lora.join("' + block.id + '", lora.BAND' + block.band + ', ' + block.dr + ', ' + block.retx + ', ' + 
		       block.adr + ', "' + block.deveui + '", "' + block.appeui + '", "' + block.appkey + '");\n';			
	}
	
	return code;
};

Blockly.Lua['lora_tx'] = function(block) {
	var code = '';
    var payload = Blockly.Lua.valueToCode(block, 'PAYLOAD', Blockly.Lua.ORDER_NONE) || '\'\'';
    var port = Blockly.Lua.valueToCode(block, 'PORT', Blockly.Lua.ORDER_NONE);
    var confirmed = block.getFieldValue('CONF');

	if (confirmed == "0") {
		confirmed = "false";
	} else {
		confirmed = "true";
	}
	
	if (Code.blockAbstraction == blockAbstraction.Low) {
    	 code = 'lora.tx(' + confirmed + ', ' + port + ', ' + payload + ')\n';
	 } else {
 		if (codeSection["require"].indexOf('require("block-lora")') == -1) {
 			codeSection["require"].push('require("block-lora")');
 		}

 		if (block.activation == 'OTAA') {
			code = 'wcBlock.lora.tx("' + block.id + '", true, lora.BAND' + block.band + ', ' + block.dr + ', ' + block.retx + ', ' + 
	                block.adr + ', "' + block.deveui + '", "' + block.appeui + '", "' + block.appkey + '", '+confirmed+', ' +
				    payload+', '+port+');\n';
		} else {
			code = 'wcBlock.lora.tx("' + block.id + '", false, lora.BAND' + block.band + ', ' + block.dr + ', ' + block.retx + ', ' + 
		            block.adr + ', "' + block.devaddr + '", "' + block.nwkskey + '", "' + block.appskey + '", '+confirmed+', ' +
				    payload+', '+port+');\n';					
		}	
	 }
	 
	 return code;
};

Blockly.Lua['lora_get_port'] = function(block) {
  return ['_port', Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['lora_get_payload'] = function(block) {
    return ['_payload', Blockly.Lua.ORDER_HIGH];
};
