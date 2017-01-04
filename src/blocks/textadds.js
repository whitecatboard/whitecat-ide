/*
 * Whitecat Blocky Environment, additions on text blocks
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

goog.provide('Blockly.Blocks.textadds');

goog.require('Blockly.Blocks');

Blockly.Blocks['pack_create_container'] = {
  /**
   * Mutator block for container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.texts.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.TEXT_PACK_TITLE1);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.TEXT_PACK_TITLE1);
    this.contextMenu = false;    
  }
};

Blockly.Blocks['pack_create_item_with'] = {
  /**
   * Mutator block for add items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.texts.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.TEXT_PACK_TITLE2);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.TEXT_PACK_TITLE2);
    this.contextMenu = true;
  }
};

Blockly.Blocks['text_pack'] = {
  /**
   * Block for creating a string made up of any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.TEXT_PACK_HELPURL);
    this.setColour(Blockly.Blocks.texts.HUE);

    this.appendValueInput('TO0')
        .appendField(Blockly.Msg.TEXT_PACK_TITLE1);

    this.appendValueInput('WITH0')
        .appendField(Blockly.Msg.TEXT_PACK_TITLE2).setAlign(Blockly.ALIGN_RIGHT);

    this.withCount_ = 1;
    this.toCount_ = 1;
    this.setOutput(false, null);
    this.setMutator(new Blockly.Mutator(['pack_create_item_with']));
    this.setTooltip(Blockly.Msg.TEXT_PACK_TOOLTIP);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
  },
  /**
   * Create XML to represent number of text inputs.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    if (!this.withCount_ && !this.toCount_) {
      return null;
    }
    var container = document.createElement('mutation');
    if (this.withCount_) {
      container.setAttribute('with', this.withCount_);
    }
    if (this.toCount_) {
      container.setAttribute('to', this.toCount_);
    }
    return container;
  },
  /**
   * Parse XML to restore the text inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.withCount_ = parseInt(xmlElement.getAttribute('with'), 10) || 0;
    this.toCount_ = parseInt(xmlElement.getAttribute('to'), 10) || 0;
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('pack_create_container');
    containerBlock.initSvg();
    var connection = containerBlock.nextConnection;
    
    for (var i = 1; i <= this.withCount_; i++) {
      var withBlock = workspace.newBlock('pack_create_item_with');
      withBlock.initSvg();
      connection.connect(withBlock.previousConnection);
      connection = withBlock.nextConnection;
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

    this.withCount_ = 0;
    this.toCount_ = 0;

    var withConnections = [null];
    var toConnections = [null];

    while (itemBlock) {
      switch (itemBlock.type) {
        case 'pack_create_item_with':
          this.withCount_++;
          withConnections.push(itemBlock.withConnection_);
          break;
        case 'pack_create_item_to':
          this.toCount_++;
          toConnections.push(itemBlock.toConnection_);
          break;
        default:
          throw 'Unknown block type.';
      }
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    this.updateShape_();
    
    // Reconnect any child blocks.
    for (var i = 1; i <= this.withCount_; i++) {
      Blockly.Mutator.reconnect(withConnections[i], this, 'WITH' + i);
    }
      	
    for (var i = 1; i <= this.toCount_; i++) {
      Blockly.Mutator.reconnect(toConnections[i], this, 'TO' + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var intemBlock = containerBlock.nextConnection.targetBlock();
    var i = 1;
    while (intemBlock) {
      switch (intemBlock.type) {
        case 'pack_create_item_with':
          var inputWith = this.getInput('WITH' + i);
          intemBlock.withConnection_ =
              inputWith && inputWith.connection.targetConnection;
          i++;
          break;
        case 'pack_create_item_to':
          var inputTo = this.getInput('TO' + i);
          intemBlock.toConnection_ =
              inputTo && inputTo.connection.targetConnection;
          i++;
          break;
        default:
          throw 'Unknown block type.';
      }
      intemBlock = intemBlock.nextConnection &&
          intemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    var i = 1;
    while (this.getInput('WITH' + i)) {
      this.removeInput('WITH' + i);
      i++;
    }

    var i = 1;
    while (this.getInput('TO' + i)) {
      this.removeInput('TO' + i);
      i++;
    }

    for (var i = 0; i < this.withCount_; i++) {
      if (!this.getInput('WITH' + i)) {
        var input = this.appendValueInput('WITH' + i);
        input.appendField(Blockly.Msg.TEXT_PACK_TITLE2).setAlign(Blockly.ALIGN_RIGHT);
      }
    }

    for (var i = 0; i < this.toCount_; i++) {
      if (!this.getInput('TO' + i)) {
        var input = this.appendValueInput('TO' + i);
        input.appendField(Blockly.Msg.TEXT_PACK_TITLE3).setAlign(Blockly.ALIGN_RIGHT);
      }
    }
  }
};

Blockly.Blocks['unpack_create_container'] = {
  /**
   * Mutator block for container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.texts.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.TEXT_UNPACK_TITLE1);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.TEXT_UNPACK_TITLE1);
    this.contextMenu = false;    
  }
};

Blockly.Blocks['unpack_create_item_to'] = {
  /**
   * Mutator block for add items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.texts.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.TEXT_UNPACK_TITLE2);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.TEXT_UNPACK_TITLE2);
    this.contextMenu = true;
  }
};

Blockly.Blocks['text_unpack'] = {
  /**
   * Block for creating a string made up of any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.TEXT_UNPACK_HELPURL);
    this.setColour(Blockly.Blocks.texts.HUE);

    this.appendValueInput('FROM0')
        .appendField(Blockly.Msg.TEXT_UNPACK_TITLE1);

    this.appendValueInput('TO0')
        .appendField(Blockly.Msg.TEXT_UNPACK_TITLE2).setAlign(Blockly.ALIGN_RIGHT);

    this.toCount_ = 1;
    this.fromCount_ = 1;
    this.setOutput(false, null);
    this.setMutator(new Blockly.Mutator(['unpack_create_item_to']));
    this.setTooltip(Blockly.Msg.TEXT_UNPACK_TOOLTIP);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
  },
  /**
   * Create XML to represent number of text inputs.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    if (!this.toCount_ && !this.fromCount_) {
      return null;
    }
    var container = document.createElement('mutation');
    if (this.toCount_) {
      container.setAttribute('with', this.toCount_);
    }
    if (this.fromCount_) {
      container.setAttribute('from', this.fromCount_);
    }
    return container;
  },
  /**
   * Parse XML to restore the text inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.toCount_ = parseInt(xmlElement.getAttribute('with'), 10) || 0;
    this.fromCount_ = parseInt(xmlElement.getAttribute('from'), 10) || 0;
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('unpack_create_container');
    containerBlock.initSvg();
    var connection = containerBlock.nextConnection;
    
    for (var i = 1; i <= this.toCount_; i++) {
      var toBlock = workspace.newBlock('unpack_create_item_to');
      toBlock.initSvg();
      connection.connect(toBlock.previousConnection);
      connection = toBlock.nextConnection;
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

    this.toCount_ = 0;
    this.fromCount_ = 0;

    var toConnections = [null];
    var fromConnections = [null];

    while (itemBlock) {
      switch (itemBlock.type) {
        case 'unpack_create_item_to':
          this.toCount_++;
          toConnections.push(itemBlock.toConnection_);
          break;
        case 'unpack_create_item_from':
          this.fromCount_++;
          fromConnections.push(itemBlock.fromConnection_);
          break;
        default:
          throw 'Unknown block type.';
      }
      itemBlock = itemBlock.nextConnection && itemBlock.nextConnection.targetBlock();
    }
    this.updateShape_();
    
    // Reconnect any child blocks.
    for (var i = 1; i <= this.toCount_; i++) {
      Blockly.Mutator.reconnect(toConnections[i], this, 'TO' + i);
    }
      	
    for (var i = 1; i <= this.fromCount_; i++) {
      Blockly.Mutator.reconnect(fromConnections[i], this, 'FROM' + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var intemBlock = containerBlock.nextConnection.targetBlock();
    var i = 1;
    while (intemBlock) {
      switch (intemBlock.type) {
        case 'unpack_create_item_to':
          var inputWith = this.getInput('TO' + i);
          intemBlock.toConnection_ =
              inputWith && inputWith.connection.targetConnection;
          i++;
          break;
        case 'unpack_create_item_from':
          var inputTo = this.getInput('FROM' + i);
          intemBlock.fromConnection_ =
              inputTo && inputTo.connection.targetConnection;
          i++;
          break;
        default:
          throw 'Unknown block type.';
      }
      intemBlock = intemBlock.nextConnection &&
          intemBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    var i = 1;
    while (this.getInput('TO' + i)) {
      this.removeInput('TO' + i);
      i++;
    }

    var i = 1;
    while (this.getInput('FROM' + i)) {
      this.removeInput('FROM' + i);
      i++;
    }

    for (var i = 0; i < this.toCount_; i++) {
      if (!this.getInput('TO' + i)) {
        var input = this.appendValueInput('TO' + i);
        input.appendField(Blockly.Msg.TEXT_UNPACK_TITLE2).setAlign(Blockly.ALIGN_RIGHT);
      }
    }

    for (var i = 0; i < this.fromCount_; i++) {
      if (!this.getInput('FROM' + i)) {
        var input = this.appendValueInput('FROM' + i);
        input.appendField(Blockly.Msg.TEXT_UNPACK_TITLE3).setAlign(Blockly.ALIGN_RIGHT);
      }
    }
  }
};
