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

Blockly.Lua['lora_set_appeui'] = function(block) {
  var appEui = Blockly.Lua.valueToCode(block, 'APPEUI', Blockly.Lua.ORDER_NONE);	

  appEui = appEui.replace(/\'/g, '');
  appEui = appEui.replace(/\s/g, '');
  
  return 'lora.setAppEui("' + appEui + '")\n';
};

Blockly.Lua['lora_set_appkey'] = function(block) {
  var appKey = Blockly.Lua.valueToCode(block, 'APPKEY', Blockly.Lua.ORDER_NONE);	

  appKey = appKey.replace(/\'/g, '');
  appKey = appKey.replace(/\s/g, '');
  
  return 'lora.setAppKey("' + appKey + '")\n';
};

Blockly.Lua['lora_set_adr'] = function(block) {
  var on_off = block.getFieldValue('ON_OFF');
  var value = "true";
  
  if (on_off == "0") {
  	value = "false";
  }
  
  return 'lora.setAdr(' + value + ')\n';
};

Blockly.Lua['lora_set_ar'] = function(block) {
  var on_off = block.getFieldValue('ON_OFF');
  var value = "true";
  
  if (on_off == "0") {
  	value = "false";
  }
  
  return 'lora.setAr(' + value + ')\n';
};

Blockly.Lua['lora_set_dr'] = function(block) {
  var value = block.getFieldValue('DR');

  return 'lora.setDr(' + value + ')\n';
};

Blockly.Lua['lora_join'] = function(block) {
  var joinType = block.getFieldValue('TYPE');

  return 'lora.join(' + joinType + ')\n';
};