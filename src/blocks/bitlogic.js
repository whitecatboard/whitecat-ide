/*
 * Whitecat Blocky Environment, bit manipulation blocks
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

goog.require('Blockly.Blocks');

Blockly.Blocks['bitlogic_msb'] = {
  /**
   * Block for negation.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.BITLOGIC_MSB_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "BOOL",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": Blockly.Blocks.operators.HUE,
      "tooltip": Blockly.Msg.BITLOGIC_MSB_TOOLTIP,
      "helpUrl": Blockly.Msg.BITLOGIC_MSB_HELPURL
    });
  }
};

Blockly.Blocks['bitlogic_lsb'] = {
  /**
   * Block for negation.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.BITLOGIC_LSB_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "BOOL",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": Blockly.Blocks.operators.HUE,
      "tooltip": Blockly.Msg.BITLOGIC_LSB_TOOLTIP,
      "helpUrl": Blockly.Msg.BITLOGIC_LSB_HELPURL
    });
  }
};

Blockly.Blocks['bitwise_op'] = {
	module: "bitwise",
	hasWatcher: true,
	init: function() {
		var ops = [];

		ops.push(["&", "and"]);
		ops.push(["|", "or"]);
		ops.push([">>", "rshift"]);
		ops.push(["<<", "lshift"]);

		this.appendValueInput("OP1")
			.setCheck('Number');

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(ops), "OP");

		this.appendValueInput("OP2")
			.setCheck('Number');

		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.operators.HUE);
		this.setTooltip(Blockly.Msg.BITWISE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.BITWISE_HELPURL);
	}
};

Blockly.Blocks['bitwise_unary_op'] = {
	module: "bitwise",
	hasWatcher: true,
	init: function() {
		var ops = [];

		ops.push(["~", "not"]);

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(ops), "OP");

		this.appendValueInput("OP1")
			.setCheck('Number');

		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.operators.HUE);
		this.setTooltip(Blockly.Msg.UNARY_BITWISE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.UNARY_BITWISE_HELPURL);

	}
};