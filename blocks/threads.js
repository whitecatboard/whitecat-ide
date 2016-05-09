/*
 * Whitecat Blocky Environment, thread block definition
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

goog.provide('Blockly.Blocks.threads');

goog.require('Blockly.Blocks');

Blockly.Blocks.threads.renameVar = function(instance, oldName, newName) {
	var thid = instance.getField("THID");
	
	if (Blockly.Names.equals(oldName, thid.getValue())) {
    	thid.setValue(newName);
  	}

	thid.menuGenerator_ = Blockly.Blocks.threads.dropdownVariables();
	
	if ((oldName == newName) && (oldName == 'newVariable')) {
		thid.menuGenerator_.push([oldName, newName]);
	}
	
	for(var i = 0; i < thid.menuGenerator_.length; i++) {
		if (Blockly.Names.equals(oldName, thid.menuGenerator_[i][0])) {
			thid.menuGenerator_[i][0] = newName;
			thid.menuGenerator_[i][1] = newName;
		}
	}
};

/*
 * Returns a list suitable for fill a dropdown with thread variables
 */
Blockly.Blocks.threads.dropdownVariables = function() {
	var blocks = Code.workspace.getAllBlocks();
	var variableList = [];
	var variable;

    variableList.push(['all', 'all']);

	for(var i = 0;i < blocks.length;i++) {
	  if (blocks[i].type == 'thread_start') {
		  variable = Blockly.Lua.valueToCode(blocks[i], 'THID', Blockly.Lua.ORDER_NONE);
		  
		  variableList.push([variable, variable]);
	  }
	}

	return variableList;
}

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.threads.HUE = 20;
  
Blockly.Blocks['thread_start'] = {
	  init: function() {
	    this.appendDummyInput()
	        .appendField(Blockly.Msg.thread_start);
	    this.appendStatementInput("DO")
	        .setCheck(null)
	        .setAlign(Blockly.ALIGN_RIGHT)
	    this.appendValueInput("THID")
	        .setCheck(null)
	        .appendField(Blockly.Msg.THREAD_RETURN);
	    this.appendDummyInput()
	        .setAlign(Blockly.ALIGN_RIGHT);
	    this.setColour(Blockly.Blocks.threads.HUE);
	    this.setTooltip('');
	    this.setHelpUrl('http://www.example.com/');
	  }
  };

  Blockly.Blocks['thread_create'] = {
  	  init: function() {
  	    this.appendDummyInput()
  	        .appendField(Blockly.Msg.thread_create);
  	    this.appendStatementInput("DO")
  	        .setCheck(null)
  	        .setAlign(Blockly.ALIGN_RIGHT)
  	    this.appendValueInput("THID")
  	        .setCheck(null)
  	        .appendField(Blockly.Msg.THREAD_RETURN);
  	    this.appendDummyInput()
  	        .setAlign(Blockly.ALIGN_RIGHT);
  	    this.setColour(Blockly.Blocks.threads.HUE);
  	    this.setTooltip('');
  	    this.setHelpUrl('http://www.example.com/');
  	  }
};

Blockly.Blocks['thread_suspend'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(Blockly.Msg.thread_suspend)
      .appendField(new Blockly.FieldDropdown(Blockly.Blocks.threads.dropdownVariables()), "THID");
	this.setPreviousStatement(true, null);
	this.setNextStatement(true, null);
	this.setColour(Blockly.Blocks.threads.HUE);
	this.setTooltip('');
	this.setHelpUrl('http://www.example.com/');  
  },
  renameVar: function(oldName, newName) {
	  Blockly.Blocks.threads.renameVar(this, oldName, newName);
  }
};

Blockly.Blocks['thread_stop'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(Blockly.Msg.thread_stop)
      .appendField(new Blockly.FieldDropdown(Blockly.Blocks.threads.dropdownVariables()), "THID");
	this.setPreviousStatement(true, null);
	this.setNextStatement(true, null);
	this.setColour(Blockly.Blocks.threads.HUE);
	this.setTooltip('');
	this.setHelpUrl('http://www.example.com/');  
  },
  renameVar: function(oldName, newName) {
	  Blockly.Blocks.threads.renameVar(this, oldName, newName);
  }
};

Blockly.Blocks['thread_resume'] = {
  init: function() {
    this.appendDummyInput()
      .appendField(Blockly.Msg.thread_resume)
      .appendField(new Blockly.FieldDropdown(Blockly.Blocks.threads.dropdownVariables()), "THID");
	this.setPreviousStatement(true, null);
	this.setNextStatement(true, null);
	this.setColour(Blockly.Blocks.threads.HUE);
	this.setTooltip('');
	this.setHelpUrl('http://www.example.com/');  
  },
  renameVar: function(oldName, newName) {
	  Blockly.Blocks.threads.renameVar(this, oldName, newName);
  }
};


Blockly.Blocks['thread_sleep'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.thread_sleep)
        .appendField(new Blockly.FieldTextInput("1"), "TIME")
        .appendField(new Blockly.FieldDropdown([[Blockly.Msg.microseconds, "microseconds"], [Blockly.Msg.milliseconds, "milliseconds"], [Blockly.Msg.seconds, "seconds"]]), "UNITS");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Blockly.Blocks.threads.HUE);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};