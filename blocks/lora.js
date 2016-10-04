/*
 * Whitecat Blocky Environment, lora blocks
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

goog.provide('Blockly.Blocks.lora');

goog.require('Blockly.Blocks');

Blockly.Blocks.lora.HUE = 260;

Blockly.Blocks['lora_configure'] = {
  init: function() {
	var bands = [];
	
	bands.push(['868','lora.BAND868']);
	bands.push(['433','lora.BAND433']);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.configureLora)
        .appendField(new Blockly.FieldDropdown(bands), "BAND");
    this.appendDummyInput()
        .appendField(' ' + Blockly.Msg.MHZ + ' ' + Blockly.Msg.BAND);
    
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Blockly.Blocks.lora.HUE);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  },
};

Blockly.Blocks['lora_set_appeui'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.LORA_SET_APPEUI);
        
	this.appendValueInput("APPEUI");
	    
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Blockly.Blocks.lora.HUE);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  },
};

Blockly.Blocks['lora_set_appkey'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.LORA_SET_APPKEY);
        
	this.appendValueInput("APPKEY");
	    
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Blockly.Blocks.lora.HUE);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  },
};

Blockly.Blocks['lora_set_adr'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.LORA_SET_ADR);
        
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg.TRUE, "1"], [Blockly.Msg.FALSE, "0"]]), "ON_OFF");
	    
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Blockly.Blocks.lora.HUE);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  },
};

Blockly.Blocks['lora_set_ar'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.LORA_SET_AR);
        
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg.TRUE, "1"], [Blockly.Msg.FALSE, "0"]]), "ON_OFF");
	    
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Blockly.Blocks.lora.HUE);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  },
};

Blockly.Blocks['lora_set_dr'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.LORA_SET_DR);
        
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["0", "0"], ["1", "1"], ["2", "2"], ["3", "3"], ["4", "4"], ["5", "5"]]), "DR");
	    
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Blockly.Blocks.lora.HUE);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  },
};

Blockly.Blocks['lora_join'] = {
  init: function() {
	var joinTypes = [];
	
	joinTypes.push(['OTAA','lora.OTAA']);
	joinTypes.push(['ABP','lora.ABP']);

    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.LORA_JOIN)
        .appendField(new Blockly.FieldDropdown(joinTypes), "TYPE");
    
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Blockly.Blocks.lora.HUE);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  },
};
