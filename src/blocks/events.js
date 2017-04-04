/*
 * Whitecat Blocky Environment, events block definition
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

goog.provide('Blockly.Blocks.events');

goog.require('Blockly.Blocks');

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.events.HUE = 290;

Blockly.Blocks['when_board_starts'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_WHEN_BOARD_STARTS);

		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);

		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_WHEN_BOARD_STARTS_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.EVENT_WHEN_BOARD_STARTS_HELPURL);
	},
    section: function() {
		return 'start';
    }
};

Blockly.Blocks['when_i_receive'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_WHEN_I_RECEIVE)
		    .appendField(new Blockly.wc.FieldEvent(Blockly.Msg.DEFAULT_EVENT),"WHEN");

		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);

		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_WHEN_I_RECEIVE_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.EVENT_WHEN_I_RECEIVE_HELPURL);
	},
    section: function() {
		return 'declaration';
    }
};

Blockly.Blocks['broadcast'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_BROADCAST)
		    .appendField(new Blockly.wc.FieldEvent(Blockly.Msg.DEFAULT_EVENT),"WHEN");

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_BROADCAST_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.EVENT_BROADCAST_HELPURL);
	}
};

Blockly.Blocks['broadcast_and_wait'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_BROADCAST)
		    .appendField(new Blockly.wc.FieldEvent(Blockly.Msg.DEFAULT_EVENT),"WHEN")
			.appendField(Blockly.Msg.EVENT_BROADCAST_AND_WAIT);

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_BROADCAST_AND_WAIT_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.EVENT_BROADCAST_AND_WAIT_HELPURL);
	}
};

Blockly.Blocks['event_is_being_processed'] = {
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_IS_BEING_PROCESSED_P)
		    .appendField(new Blockly.wc.FieldEvent(Blockly.Msg.DEFAULT_EVENT),"WHEN")
			.appendField(Blockly.Msg.EVENT_IS_BEING_PROCESSED);

		this.setOutput(true, null);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_IS_BEING_PROCESSED_TOOLTIP);
		this.setHelpUrl(Blockly.Msg.EVENT_IS_BEING_PROCESSED_HELPURL);
	}
};