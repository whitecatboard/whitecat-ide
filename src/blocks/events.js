/*
 * Whitecat Blocky Environment, events block definition
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L.
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
	module: "event",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_WHEN_BOARD_STARTS);

		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);

		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_WHEN_BOARD_STARTS_TOOLTIP);
	},
	onchange: function(e) {
		var self = this;
		
		this.checkUses(e, function(block) {
			return true;
		}, Blockly.Msg.WARNING_ONLY_ONE_INSTANCE_ALLOWED);	
	},
	section: function() {
		return 'start';
	}
};

Blockly.Blocks['forever'] = {
	module: "event",
	init: function() {
		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.FOREVER).setAlign(Blockly.ALIGN_RIGHT);

		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_THREAD_TOOLTIP);
	}
};

Blockly.Blocks['thread'] = Blockly.Blocks['forever'];

Blockly.Blocks['when_i_receive'] = {
	module: "event",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_WHEN_I_RECEIVE)
			.appendField(new Blockly.wc.FieldEvent(Blockly.Msg.DEFAULT_EVENT), "WHEN");

		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);

		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_WHEN_I_RECEIVE_TOOLTIP);
	},
	onchange: function(e) {	
		var self = this;
		
		this.checkUses(e, function(block) {
			return (block.getFieldValue('WHEN') == self.getFieldValue('WHEN'));
		}, Blockly.Msg.WARNING_EVENTS_CAN_ONLY_PROCESSED_IN_ONE_EVENT_BLOCK);	
	},
};

Blockly.Blocks['broadcast'] = {
	module: "event",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_BROADCAST)
			.appendField(new Blockly.wc.FieldEvent(Blockly.Msg.DEFAULT_EVENT), "WHEN");

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_BROADCAST_TOOLTIP);
	},
};

Blockly.Blocks['broadcast_and_wait'] = {
	module: "event",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_BROADCAST)
			.appendField(new Blockly.wc.FieldEvent(Blockly.Msg.DEFAULT_EVENT), "WHEN")
			.appendField(Blockly.Msg.EVENT_BROADCAST_AND_WAIT);

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_BROADCAST_AND_WAIT_TOOLTIP);
	},
};

Blockly.Blocks['event_is_being_processed'] = {
	module: "event",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_IS_BEING_PROCESSED_P)
			.appendField(new Blockly.wc.FieldEvent(Blockly.Msg.DEFAULT_EVENT), "WHEN")
			.appendField(Blockly.Msg.EVENT_IS_BEING_PROCESSED);

		this.setOutput(true, null);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_IS_BEING_PROCESSED_TOOLTIP);
	},
};

Blockly.Blocks['execute_every'] = {
	module: "event",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_EVERY);

		this.appendValueInput("TIME")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.milliseconds, "milliseconds"],
				[Blockly.Msg.seconds, "seconds"]
			]), "units");

		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);

		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_EVERY_TOOLTIP);
	},
};
