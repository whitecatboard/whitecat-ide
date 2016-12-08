/*
 * Whitecat Blocky Environment, exception control blocks
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

goog.provide('Blockly.Blocks.try');

goog.require('Blockly.Blocks');

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.try.HUE = 290;


Blockly.Blocks['exception_try_container'] = {
  /**
   * Mutator block for container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.try.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.TEXT_TRY_TITLE);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.TEXT_TRY_TITLE);
    this.contextMenu = false;    
    this.finallyCount_ = 0;
  }
};

Blockly.Blocks['exception_try_finally'] = {
  /**
   * Mutator block for add items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.try.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.TEXT_FINALLY);
    this.setPreviousStatement(true);
    this.setNextStatement(false);
    this.setTooltip(Blockly.Msg.TEXT_FINALLY);
    this.contextMenu = true;
  }
};

Blockly.Blocks['exception_try'] = {
  init: function() {
    this.setHelpUrl(Blockly.Msg.TEXT_TRY_HELPURL);
    
    this.appendStatementInput('TRY0')
        .appendField(Blockly.Msg.TEXT_TRY_TITLE).setAlign(Blockly.ALIGN_RIGHT);

    this.appendStatementInput('CATCH0')
        .appendField(Blockly.Msg.TEXT_CATCH_TITLE).setAlign(Blockly.ALIGN_RIGHT);

	this.setTooltip(Blockly.Msg.TEXT_TRY_TOOLTIP);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.try.HUE);

	this.finallyCount_ = 0;
    this.setMutator(new Blockly.Mutator(['exception_try_finally']));
    
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    /*
    this.setTooltip(function() {
      if (!thisBlock.elseifCount_ && !thisBlock.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_1;
      } else if (!thisBlock.elseifCount_ && thisBlock.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_2;
      } else if (thisBlock.elseifCount_ && !thisBlock.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_3;
      } else if (thisBlock.elseifCount_ && thisBlock.elseCount_) {
        return Blockly.Msg.CONTROLS_IF_TOOLTIP_4;
      }
      return '';
    });
    this.elseifCount_ = 0;
    this.elseCount_ = 0;
    */
  },
  /**
   * Create XML to represent the number of else-if and else inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    if (!this.finallyCount_) {
      return null;
    }

    var container = document.createElement('mutation');
    if (this.finallyCount_) {
      container.setAttribute('finally', this.finallyCount_);
    }
    return container;
  },
  /**
   * Parse XML to restore the else-if and else inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.finallyCount_ = parseInt(xmlElement.getAttribute('finally'), 10) || 0;
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('exception_try_container');
    containerBlock.initSvg();
    var connection = containerBlock.nextConnection;
    for (var i = 1; i <= this.finallyCount_; i++) {
      var finallyBlock = workspace.newBlock('exception_try_finally');
      finallyBlock.initSvg();
      connection.connect(finallyBlock.previousConnection);
      connection = finallyBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    var itemBlock = containerBlock.nextConnection.targetBlock();
    // Count number of inputs.
    this.finallyCount_ = 0;
    var finallyConnections = [null];
    while (itemBlock) {
      switch (itemBlock.type) {
        case 'exception_try_finally':
          this.finallyCount_++;
          finallyConnections.push(itemBlock.finallyConnection_);
          break;
        default:
          throw 'Unknown block type.';
      }
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    this.updateShape_();
    // Reconnect any child blocks.
    for (var i = 0; i < this.finallyCount_; i++) {
      Blockly.Mutator.reconnect(finallyConnections[i], this, 'FINALLY' + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.nextConnection.targetBlock();
    var i = 0;
    while (itemBlock) {
      switch (itemBlock.type) {
        case 'exception_try_finally':
          var inputFinally = this.getInput('FINALLY' + i);
          itemBlock.finallyConnection_ =
              inputFinally && inputFinally.connection.targetConnection;
          i++;
          break;
        default:
          throw 'Unknown block type.';
      }
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    var i = 0;
    while (this.getInput('FINALLY' + i)) {
      this.removeInput('FINALLY' + i);
      i++;
    }
    // Rebuild block.
    for (var i = 0; i < this.finallyCount_; i++) {
	    this.appendStatementInput('FINALLY' + i)
    	    .appendField(Blockly.Msg.TEXT_FINALLY).setAlign(Blockly.ALIGN_RIGHT);
    }
  }
};

Blockly.Blocks['exception_catch_error'] = {
  init: function() {
	var errors = [];
	
	for(var key in Board.digitalPins) {
		errors.push([key + ' - ' + Board.digitalPins[key].replace(/pio\.P/i,'').replace(/_/i,''),key]);
	}  
	
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.TEXT_TRY_CATCH_ERROR)
        .appendField(new Blockly.FieldDropdown(errors), "ERROR");
    this.appendDummyInput()
        .appendField(' ' + Blockly.Msg.TEXT_TRY_CATCHED );

    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);

    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(Blockly.Blocks.try.HUE);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


Blockly.Blocks['exception_catch_other_error'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
 	    .appendField(Blockly.Msg.TEXT_TRY_CATCH_OTHER_ERROR);

    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);

    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(false, null);
    this.setColour(Blockly.Blocks.try.HUE);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};

Blockly.Blocks['exception_raise_again'] = {
  init: function() {
    this.appendDummyInput()
        .setAlign(Blockly.ALIGN_RIGHT)
 	    .appendField(Blockly.Msg.TEXT_TRY_CATCH_RAISE_AGAIN);

    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(false, null);
    this.setColour(Blockly.Blocks.try.HUE);
    this.setTooltip('');
    this.setHelpUrl('http://www.example.com/');
  }
};


