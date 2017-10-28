goog.provide('Blockly.Blocks');/*
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

goog.provide('Blockly.Blocks.bitlogic');

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
          "check": "Boolean"
        }
      ],
      "output": "Boolean",
      "colour": Blockly.Blocks.logic.HUE,
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
          "check": "Boolean"
        }
      ],
      "output": "Boolean",
      "colour": Blockly.Blocks.logic.HUE,
      "tooltip": Blockly.Msg.BITLOGIC_LSB_TOOLTIP,
      "helpUrl": Blockly.Msg.BITLOGIC_LSB_HELPURL
    });
  }
};/*
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
          "check": "Boolean"
        }
      ],
      "output": "Boolean",
      "colour": Blockly.Blocks.logic.HUE,
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
          "check": "Boolean"
        }
      ],
      "output": "Boolean",
      "colour": Blockly.Blocks.logic.HUE,
      "tooltip": Blockly.Msg.BITLOGIC_LSB_TOOLTIP,
      "helpUrl": Blockly.Msg.BITLOGIC_LSB_HELPURL
    });
  }
};

Blockly.Blocks['bitwise_op'] = {
	module: "nitwise",
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
	module: "nitwise",
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
};/*
 * Whitecat Blocky Environment, can block definition
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

goog.provide('Blockly.Blocks.can');

goog.require('Blockly.Blocks');

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.can.HUE = 20;

Blockly.Blocks['cansetspeed'] = {
	module: "can",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.canUnits) {
			modules.push([Code.status.maps.canUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.CAN_SET_SPEED)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");

		this.appendDummyInput()
			.appendField(Blockly.Msg.TO);

		this.appendValueInput("SPEED")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField("Kbps");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_SET_SPEED_TOOLTIP);
	}
};

Blockly.Blocks['cansetfilter'] = {
	module: "can",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.canUnits) {
			modules.push([Code.status.maps.canUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.CAN_SET_FILTER)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE")
			.appendField(Blockly.Msg.CAN_SET_FILTER_FROM);

		this.appendValueInput("FROM")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(Blockly.Msg.CAN_SET_FILTER_TO);

		this.appendValueInput("TO")
			.setCheck('Number');

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_SET_SPEED_TOOLTIP);
	}
};

Blockly.Blocks['canread'] = {
	module: "can",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.canUnits) {
			modules.push([Code.status.maps.canUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.CAN_READ)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE")
			.appendField(Blockly.Msg.CAN_GET_TO_FRAME)
			.appendField(new Blockly.wc.FieldCanFrame("frame"), "FRAME");
			
			
			this.setInputsInline(true);
			this.setPreviousStatement(true, null);
			this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_READ_TOOLTIP);
	}
};

Blockly.Blocks['canframeget'] = {
	module: "can",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.canUnits) {
			modules.push([Code.status.maps.canUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
		    .appendField(Blockly.Msg.CAN_GET)
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.CAN_GET_IDENTIFIER, "id"],
				[Blockly.Msg.CAN_GET_TYPE, "type"],
				[Blockly.Msg.CAN_GET_LEN, "len"],
				[Blockly.Msg.CAN_GET_D0, "d0"],
				[Blockly.Msg.CAN_GET_D1, "d1"],
				[Blockly.Msg.CAN_GET_D2, "d2"],
				[Blockly.Msg.CAN_GET_D3, "d3"],
				[Blockly.Msg.CAN_GET_D4, "d4"],
				[Blockly.Msg.CAN_GET_D5, "d5"],
				[Blockly.Msg.CAN_GET_D6, "d6"],
				[Blockly.Msg.CAN_GET_D7, "d7"],
			]), "FIELD")
			.appendField(Blockly.Msg.CAN_GET_FROM_FRAME)
			.appendField(new Blockly.wc.FieldCanFrame("frame"), "FRAME");

			
		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_GET_TOOLTIP);
	}
};

Blockly.Blocks['canframeset'] = {
	module: "can",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.canUnits) {
			modules.push([Code.status.maps.canUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
		    .appendField(Blockly.Msg.CAN_SET)
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.CAN_GET_IDENTIFIER, "id"],
				[Blockly.Msg.CAN_GET_TYPE, "type"],
				[Blockly.Msg.CAN_GET_LEN, "len"],
				[Blockly.Msg.CAN_GET_D0, "d0"],
				[Blockly.Msg.CAN_GET_D1, "d1"],
				[Blockly.Msg.CAN_GET_D2, "d2"],
				[Blockly.Msg.CAN_GET_D3, "d3"],
				[Blockly.Msg.CAN_GET_D4, "d4"],
				[Blockly.Msg.CAN_GET_D5, "d5"],
				[Blockly.Msg.CAN_GET_D6, "d6"],
				[Blockly.Msg.CAN_GET_D7, "d7"],
			]), "FIELD")
			.appendField(Blockly.Msg.CAN_SET_TO_FRAME)
			.appendField(new Blockly.wc.FieldCanFrame("frame"), "FRAME");

		this.appendDummyInput()
			.appendField(Blockly.Msg.CAN_SET_TO_VALUE);

		this.appendValueInput("VALUE");
		
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_SET_TOOLTIP);
	},
	onchange: function(e) {
		if (!this.workspace.isDragging || this.workspace.isDragging()) {
			return;
		}

		var field = this.getFieldValue('FIELD');
		var value = Blockly.Lua.valueToCode(this, 'VALUE', Blockly.Lua.ORDER_NONE)
	
		if (field == "type") {
			if ((value != "0") && (value != "1") && (value != "can.STD") && (value != "can.EXT")) {
				this.setWarningText(Blockly.Msg.WARNING_CAN_INVALID_TYPE);			
				this.setDisabled(true);	
			} else {
				this.setDisabled(false);
				this.setWarningText(null);				
			}
		} else if ((field == "d0") || (field == "d1") || (field == "d2") || (field == "d3") || (field == "d4") || (field == "d5") || (field == "d6") || (field == "d7"))  {
			if ((parseInt(value) < 0) || (parseInt(value) > 255)) {
				this.setWarningText(Blockly.Msg.WARNING_CAN_INVALID_DATA);	
				this.setDisabled(true);											
			} else {
				this.setDisabled(false);
				this.setWarningText(null);	
			}
		} else if (field == "len") {
			if ((parseInt(value) < 0) || (parseInt(value) > 8)) {
				this.setWarningText(Blockly.Msg.WARNING_CAN_INVALID_LEN);			
				this.setDisabled(true);	
			} else {
				this.setDisabled(false);
				this.setWarningText(null);					
			}
		}
	},
};

Blockly.Blocks['canframewrite'] = {
	module: "can",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.canUnits) {
			modules.push([Code.status.maps.canUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.CAN_WRITE)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE")
			.appendField(Blockly.Msg.CAN_WRITE_FRAME)
		.appendField(new Blockly.wc.FieldCanFrame("frame"), "FRAME");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_WRITE_TOOLTIP);
	}
};

Blockly.Blocks['cantype'] = {
	module: "can",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
		.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.CAN_STD, "std"],
				[Blockly.Msg.CAN_EXT, "ext"],
			]), "TYPE");
		
		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.can.HUE);
		this.setTooltip(Blockly.Msg.CAN_TYPE_TOOLTIP);
	}
};
/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Colour blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.colour');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.colour.HUE = 20;

Blockly.Blocks['colour_picker'] = {
  /**
   * Block for colour picker.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_colour",
          "name": "COLOUR",
          "colour": "#ff0000"
        }
      ],
      "output": "Colour",
      "colour": Blockly.Blocks.colour.HUE,
      "helpUrl": Blockly.Msg.COLOUR_PICKER_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    // Colour block is trivial.  Use tooltip of parent block if it exists.
    this.setTooltip(function() {
      var parent = thisBlock.getParent();
      return (parent && parent.getInputsInline() && parent.tooltip) ||
          Blockly.Msg.COLOUR_PICKER_TOOLTIP;
    });
  }
};

Blockly.Blocks['colour_random'] = {
  /**
   * Block for random colour.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.COLOUR_RANDOM_TITLE,
      "output": "Colour",
      "colour": Blockly.Blocks.colour.HUE,
      "tooltip": Blockly.Msg.COLOUR_RANDOM_TOOLTIP,
      "helpUrl": Blockly.Msg.COLOUR_RANDOM_HELPURL
    });
  }
};

Blockly.Blocks['colour_rgb'] = {
  /**
   * Block for composing a colour from RGB components.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.COLOUR_RGB_HELPURL);
    this.setColour(Blockly.Blocks.colour.HUE);
    this.appendValueInput('RED')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.COLOUR_RGB_TITLE)
        .appendField(Blockly.Msg.COLOUR_RGB_RED);
    this.appendValueInput('GREEN')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.COLOUR_RGB_GREEN);
    this.appendValueInput('BLUE')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.COLOUR_RGB_BLUE);
    this.setOutput(true, 'Colour');
    this.setTooltip(Blockly.Msg.COLOUR_RGB_TOOLTIP);
  }
};

Blockly.Blocks['colour_blend'] = {
  /**
   * Block for blending two colours together.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.COLOUR_BLEND_HELPURL);
    this.setColour(Blockly.Blocks.colour.HUE);
    this.appendValueInput('COLOUR1')
        .setCheck('Colour')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.COLOUR_BLEND_TITLE)
        .appendField(Blockly.Msg.COLOUR_BLEND_COLOUR1);
    this.appendValueInput('COLOUR2')
        .setCheck('Colour')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.COLOUR_BLEND_COLOUR2);
    this.appendValueInput('RATIO')
        .setCheck('Number')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.COLOUR_BLEND_RATIO);
    this.setOutput(true, 'Colour');
    this.setTooltip(Blockly.Msg.COLOUR_BLEND_TOOLTIP);
  }
};
/*
 * Whitecat Blocky Environment, control block definition
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

goog.provide('Blockly.Blocks.control');

goog.require('Blockly.Blocks');

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.control.HUE = 290;

Blockly.Blocks['wait_for'] = {
	module: "tmr",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.wait_for);

		this.appendValueInput("TIME")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.microseconds, "microseconds"],
				[Blockly.Msg.milliseconds, "milliseconds"],
				[Blockly.Msg.seconds, "seconds"]
			]), "units");
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.control.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['cpu_sleep'] = {
	module: "os",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.CPU_SLEEP);

		this.appendValueInput("SECONDS")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(Blockly.Msg.seconds);

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.control.HUE);
		this.setTooltip('');
	}
};
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
		if (!this.workspace.isDragging || this.workspace.isDragging()) {
			return;
		}

		if ((typeof e.element != "undefined") && (this.warning != null) && (e.element == "disabled")) {
			if (e.blockId == this.id) {
				this.setDisabled(true);
				return;
			}
		}

		if ((typeof e.element != "undefined") && (e.element == "disabled")) {
			if ((e.newValue != e.oldValue) && (e.blockId == this.id)) {
				this.disabledByUser = e.newValue;
			}
		}

		var instances = 0;
		var blocks = this.workspace.getTopBlocks(true);
		for (var x = 0, block; block = blocks[x]; x++) {
			if (blocks[x].type == this.type) {
				instances++;
			}
		}

		if (instances > 1) {
			this.setWarningText(Blockly.Msg.WARNING_ONLY_ONE_INSTANCE_ALLOWED);
			if (!this.isInFlyout) {
				this.setDisabled(true);
			}
		} else {
			var wasInWarning = (this.warning != null);
			
			this.setWarningText(null);
			if (!this.isInFlyout && wasInWarning & (typeof this.disabledByUser == "undefined"?true:(!this.disabledByUser))) {
				this.setDisabled(false);
			} else {
				if (typeof this.disabledByUser != "undefined") {
					this.setDisabled(this.disabledByUser);
				}	
			}
		}
	},
	section: function() {
		return 'start';
	}
};

Blockly.Blocks['thread'] = {
	module: "event",
	init: function() {
		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.FOREVER).setAlign(Blockly.ALIGN_RIGHT);

		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.events.HUE);
		this.setTooltip(Blockly.Msg.EVENT_THREAD_TOOLTIP);
	},
};

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
		if (!this.workspace.isDragging || this.workspace.isDragging()) {
			return;
		}
		
		if ((typeof e.element != "undefined") && (this.warning != null) && (e.element == "disabled")) {
			if (e.blockId == this.id) {
				this.setDisabled(true);
				return;
			}
		}

		if ((typeof e.element != "undefined") && (e.element == "disabled")) {
			if ((e.newValue != e.oldValue) && (e.blockId == this.id)) {
				this.disabledByUser = e.newValue;
			}
		}

		var uses = 0;
		var blocks = this.workspace.getTopBlocks(true);
		for (var x = 0, block; block = blocks[x]; x++) {
			if ((blocks[x].getFieldValue('WHEN') == this.getFieldValue('WHEN')) && (blocks[x].type == this.type)) {
				uses++;
			}
		}

		if (uses > 1) {
			this.setWarningText(Blockly.Msg.WARNING_EVENTS_CAN_ONLY_PROCESSED_IN_ONE_EVENT_BLOCK);
			if (!this.isInFlyout) {
				this.setDisabled(true);
			}
		} else {
			var wasInWarning = (this.warning != null);
			
			this.setWarningText(null);
			if (!this.isInFlyout && wasInWarning & (typeof this.disabledByUser == "undefined"?true:(!this.disabledByUser))) {
				this.setDisabled(false);
			} else {
				if (typeof this.disabledByUser != "undefined") {
					this.setDisabled(this.disabledByUser);
				}	
			}
		}
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
/*
 * Whitecat Blocky Environment, i2c block definition
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

goog.provide('Blockly.Blocks.i2c');

goog.require('Blockly.Blocks');

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.i2c.HUE = 20;

Blockly.Blocks['i2csetspeed'] = {
	module: "i2c",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.i2cUnits) {
			modules.push([Code.status.maps.i2cUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.i2cSetSpeedFor)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");

		this.appendDummyInput()
			.appendField(Blockly.Msg.i2cSpeed);
		this.appendValueInput("SPEED")
			.setCheck('Number');
		this.appendDummyInput()
			.appendField(Blockly.Msg.hz);

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.i2c.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['i2cstartcondition'] = {
	module: "i2c",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.i2cUnits) {
			modules.push([Code.status.maps.i2cUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.i2cStartConditionFor)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");

			this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.i2c.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['i2cstopcondition'] = {
	module: "i2c",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.i2cUnits) {
			modules.push([Code.status.maps.i2cUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.i2cStopConditionFor)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.i2c.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['i2caddress'] = {
	module: "i2c",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.i2cUnits) {
			modules.push([Code.status.maps.i2cUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.i2cAddress)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");

		this.appendValueInput("ADDRESS")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(Blockly.Msg.for)
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.read, 'read'],
				[Blockly.Msg.write, 'write']
			]), "DIRECTION");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.i2c.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['i2cread'] = {
	module: "i2c",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.i2cUnits) {
			modules.push([Code.status.maps.i2cUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.i2cReadFrom)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");
		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.i2c.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['i2cwrite'] = {
	module: "i2c",
	init: function() {
		var modules = [];

		for (var key in Code.status.maps.i2cUnits) {
			modules.push([Code.status.maps.i2cUnits[key][0], key]);
		}

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.i2cWriteTo)
			.appendField(new Blockly.FieldDropdown(modules), "MODULE");

		this.appendValueInput("VALUE")
			.setCheck('Number');

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.i2c.HUE);
		this.setTooltip('');
	}
};
/*
 * Whitecat Blocky Environment, io block definition
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

goog.provide('Blockly.Blocks.io');
goog.provide('Blockly.Blocks.io.helper');

goog.require('Blockly.Blocks');

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.io.HUE = 260;

Blockly.Blocks.io.helper = {
	getDigitalPins: function() {
		var pins = [];

		for (var key in Code.status.maps.digitalPins) {
			pins.push([Code.status.maps.digitalPins[key][3] + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
		}

		return pins;
	},

	getInputDigitalPins: function() {
		var pins = [];

		for (var key in Code.status.maps.digitalPins) {
			if (Code.status.maps.digitalPins[key][1]) {
				pins.push([Code.status.maps.digitalPins[key][3] + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
			}
		}

		return pins;
	},

	getOutputDigitalPins: function() {
		var pins = [];

		for (var key in Code.status.maps.digitalPins) {
			if (Code.status.maps.digitalPins[key][2]) {
				pins.push([Code.status.maps.digitalPins[key][3] + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
			}
		}

		return pins;
	},

	getInputOutputDigitalPins: function() {
		var pins = [];

		for (var key in Code.status.maps.digitalPins) {
			if (Code.status.maps.digitalPins[key][1] && Code.status.maps.digitalPins[key][2]) {
				pins.push([Code.status.maps.digitalPins[key][3] + ' - ' + Code.status.maps.digitalPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
			}
		}

		return pins;
	},

	getAnalogPins: function() {
		var pins = [];

		for (var key in Code.status.maps.analogPins) {
			pins.push([Code.status.maps.analogPins[key][1] + ' - ' + Code.status.maps.analogPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
		}

		return pins;
	},

	getExternalAdcUnits: function() {
		var units = [];

		for (var key in Code.status.maps.externalAdcUnits) {
			units.push([Code.status.maps.externalAdcUnits[key][0], key]);
		}

		return units;
	},

	getExternalAdcChannels: function(unit) {
		var channels = [];
		var i;		
		
		for(i=0; i < Code.status.maps.externalAdcUnits[unit][1];i++) {
			channels.push(["channel%1".replace("%1", String(i)), i.toString()]);
		}
		
		return channels;
	},
	
	getPwmPins: function() {
		var pins = [];

		for (var key in Code.status.maps.pwmPins) {
			pins.push([Code.status.maps.pwmPins[key][1] + ' - ' + Code.status.maps.pwmPins[key][0].replace(/pio\.P/i, '').replace(/_/i, ''), key]);
		}

		return pins;
	},
};

Blockly.Blocks['output_digital_pin'] = {
	module: "pio",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getOutputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");

		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['input_digital_pin'] = {
	module: "pio",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getInputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");

		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['pwm_pins'] = {
	module: "pwm",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getPwmPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");

		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['analog_pins'] = {
	module: "adc",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getAnalogPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(pins), "PIN");

		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	}
};

Blockly.Blocks['external_analog_units'] = {
	module: "adc",
	init: function() {
		var thisInstance = this;
		var units = Blockly.Blocks.io.helper.getExternalAdcUnits();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(units), "UNIT");

		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	},
	onchange: function(e) {
		if (!this.workspace.isDragging || this.workspace.isDragging()) {
			return;
		}
		
		if (e.name != "UNIT") return;
		
		var unit = this.getFieldValue("UNIT");
		if (unit) {
			var drop = this.parentBlock_.childBlocks_[1].getField("CHANNEL");
			
			drop.menuGenerator_ = Blockly.Blocks.io.helper.getExternalAdcChannels(unit);	
			drop.setText("channel0");
			drop.setValue("0");				
		}		
	},
};

Blockly.Blocks['external_analog_channels'] = {
	module: "adc",
	init: function() {
		var thisInstance = this;
		var channels = Blockly.Blocks.io.helper.getExternalAdcChannels(2);

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(new Blockly.FieldDropdown(channels), "CHANNEL");

		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	},
};


Blockly.Blocks['setpwmpin'] = {
	module: "pwm",
	init: function() {
		var pins = Blockly.Blocks.io.helper.getPwmPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.setpwmpin);

		this.appendValueInput("PIN")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(Blockly.Msg.FREQUENCY);
		this.appendValueInput("FREQUENCY")
			.setCheck('Number');
		this.appendDummyInput()
			.appendField(Blockly.Msg.HERTZS)
			.appendField(Blockly.Msg.DUTY);
		this.appendValueInput("DUTY")
			.setCheck('Number');
		this.appendDummyInput()
			.appendField(Blockly.Msg.PERCENT);
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');

		this.updateBoardAtFieldChange("PIN");
		this.updateBoardAtFieldChange("FREQUENCY");
		this.updateBoardAtFieldChange("DUTY");
		this.updateBoardAtFieldChange("NUM");
	}
};

Blockly.Blocks['setdigitalpin'] = {
	module: "pio",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getOutputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.setdigitalpin)

		this.appendValueInput("PIN")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(' ' + Blockly.Msg.TO + ' ')
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.HIGH, "1"],
				[Blockly.Msg.LOW, "0"]
			]), "VALUE");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');

		this.updateBoardAtFieldChange("PIN");
		this.updateBoardAtFieldChange("VALUE");
	}
};

Blockly.Blocks['invertdigitalpin'] = {
	module: "pio",
	init: function() {
		var thisInstance = this;
		var pins = Blockly.Blocks.io.helper.getOutputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.invertdigitalpin)

		this.appendValueInput("PIN")
			.setCheck('Number');

			this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');

		this.updateBoardAtFieldChange("PIN");
		this.updateBoardAtFieldChange("VALUE");
	}
};

Blockly.Blocks['getdigitalpin'] = {
	module: "pio",
	init: function() {
		var pins = Blockly.Blocks.io.helper.getInputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.getdigitalpin);

		this.appendValueInput("PIN")
			.setCheck('Number');

		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	},

	hasWatcher: true,
};

Blockly.Blocks['getanalogpin'] = {
	module: "adc",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.getanalogpin);

		this.appendValueInput("PIN")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(Blockly.Msg.IN)
			.appendField(new Blockly.FieldDropdown([
				["mvolts", "mvolts"],
				["raw", "raw"]
			]), "FORMAT");
		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	},

	hasWatcher: true,
};

Blockly.Blocks['getexternalanalogchannel'] = {
	module: "adc",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.getexternalanalogchannel);

		this.appendValueInput("UNIT")
			.setCheck('Number');

		this.appendValueInput("CHANNEL")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(Blockly.Msg.IN)
			.appendField(new Blockly.FieldDropdown([
				["mvolts", "mvolts"],
				["raw", "raw"]
			]), "FORMAT");
		this.setOutput(true, null);
		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip('');
	},

	hasWatcher: true,
};

Blockly.Blocks['when_digital_pin'] = {
	module: "pio",
	init: function() {
		var pins = Blockly.Blocks.io.helper.getInputDigitalPins();

		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.EVENT_WHEN_DIGITAL_PIN);

		this.appendValueInput("PIN")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(Blockly.Msg.EVENT_WHEN_DIGITAL_CHANGES)
			.appendField(new Blockly.FieldDropdown(
				[
					[Blockly.Msg["positive_edge"], "IntrPosEdge"],
					[Blockly.Msg["negative_edge"], "IntrNegEdge"],
					[Blockly.Msg["any_edge"], "IntrAnyEdge"],
					[Blockly.Msg["low_level"], "IntrLowLevel"],
					[Blockly.Msg["high_level"], "IntrHighLevel"],
				]), "WHEN");

		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);

		this.setInputsInline(true);
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.io.HUE);
		this.setTooltip(Blockly.Msg.EVENT_WHEN_DIGITAL_PIN_TOOLTIP);
	},
	onchange: function(e) {
		if (!this.workspace.isDragging || this.workspace.isDragging()) {
			return;
		}

		var uses = 0;
		var blocks = this.workspace.getTopBlocks(true);
		for (var x = 0, block; block = blocks[x]; x++) {
			if ((blocks[x].getFieldValue('PIN') == this.getFieldValue('PIN')) && (blocks[x].type == this.type)) {
				uses++;
			}
		}

		if (uses > 1) {
			this.setWarningText(Blockly.Msg.WARNING_EVENTS_CAN_ONLY_PROCESSED_IN_ONE_EVENT_BLOCK);
			if (!this.isInFlyout && !this.getInheritedDisabled()) {
				this.setDisabled(true);
			}
		} else {
			this.setWarningText(null);
			if (!this.isInFlyout) {
				this.setDisabled(false);
			}
		}
	},
};
/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview List blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.lists');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.lists.HUE = 260;

Blockly.Blocks['lists_create_empty'] = {
  /**
   * Block for creating an empty list.
   * The 'list_create_with' block is preferred as it is more flexible.
   * <block type="lists_create_with">
   *   <mutation items="0"></mutation>
   * </block>
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.LISTS_CREATE_EMPTY_TITLE,
      "output": "Array",
      "colour": Blockly.Blocks.lists.HUE,
      "tooltip": Blockly.Msg.LISTS_CREATE_EMPTY_TOOLTIP,
      "helpUrl": Blockly.Msg.LISTS_CREATE_EMPTY_HELPURL
    });
  }
};

Blockly.Blocks['lists_create_with'] = {
  /**
   * Block for creating a list with any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LISTS_CREATE_WITH_HELPURL);
    this.setColour(Blockly.Blocks.lists.HUE);
    this.itemCount_ = 3;
    this.updateShape_();
    this.setOutput(true, 'Array');
    this.setMutator(new Blockly.Mutator(['lists_create_with_item']));
    this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_TOOLTIP);
  },
  /**
   * Create XML to represent list inputs.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the list inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('lists_create_with_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.itemCount_; i++) {
      var itemBlock = workspace.newBlock('lists_create_with_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    // Count number of inputs.
    var connections = [];
    while (itemBlock) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (var i = 0; i < this.itemCount_; i++) {
      var connection = this.getInput('ADD' + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) == -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (var i = 0; i < this.itemCount_; i++) {
      Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var i = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
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
    if (this.itemCount_ && this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
      this.appendDummyInput('EMPTY')
          .appendField(Blockly.Msg.LISTS_CREATE_EMPTY_TITLE);
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput('ADD' + i)) {
        var input = this.appendValueInput('ADD' + i);
        if (i == 0) {
          input.appendField(Blockly.Msg.LISTS_CREATE_WITH_INPUT_WITH);
        }
      }
    }
    // Remove deleted inputs.
    while (this.getInput('ADD' + i)) {
      this.removeInput('ADD' + i);
      i++;
    }
  }
};

Blockly.Blocks['lists_create_with_container'] = {
  /**
   * Mutator block for list container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.lists.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TITLE_ADD);
    this.appendStatementInput('STACK');
    this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_CONTAINER_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['lists_create_with_item'] = {
  /**
   * Mutator block for adding items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.lists.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.LISTS_CREATE_WITH_ITEM_TITLE);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.LISTS_CREATE_WITH_ITEM_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['lists_repeat'] = {
  /**
   * Block for creating a list with one element repeated.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.LISTS_REPEAT_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "ITEM"
        },
        {
          "type": "input_value",
          "name": "NUM",
          "check": "Number"
        }
      ],
      "output": "Array",
      "colour": Blockly.Blocks.lists.HUE,
      "tooltip": Blockly.Msg.LISTS_REPEAT_TOOLTIP,
      "helpUrl": Blockly.Msg.LISTS_REPEAT_HELPURL
    });
  }
};

Blockly.Blocks['lists_length'] = {
  /**
   * Block for list length.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.LISTS_LENGTH_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE",
          "check": ['String', 'Array']
        }
      ],
      "output": 'Number',
      "colour": Blockly.Blocks.lists.HUE,
      "tooltip": Blockly.Msg.LISTS_LENGTH_TOOLTIP,
      "helpUrl": Blockly.Msg.LISTS_LENGTH_HELPURL
    });
  }
};

Blockly.Blocks['lists_isEmpty'] = {
  /**
   * Block for is the list empty?
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.LISTS_ISEMPTY_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE",
          "check": ['String', 'Array']
        }
      ],
      "output": 'Boolean',
      "colour": Blockly.Blocks.lists.HUE,
      "tooltip": Blockly.Msg.LISTS_ISEMPTY_TOOLTIP,
      "helpUrl": Blockly.Msg.LISTS_ISEMPTY_HELPURL
    });
  }
};

Blockly.Blocks['lists_indexOf'] = {
  /**
   * Block for finding an item in the list.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.LISTS_INDEX_OF_FIRST, 'FIRST'],
         [Blockly.Msg.LISTS_INDEX_OF_LAST, 'LAST']];
    this.setHelpUrl(Blockly.Msg.LISTS_INDEX_OF_HELPURL);
    this.setColour(Blockly.Blocks.lists.HUE);
    this.setOutput(true, 'Number');
    this.appendValueInput('VALUE')
        .setCheck('Array')
        .appendField(Blockly.Msg.LISTS_INDEX_OF_INPUT_IN_LIST);
    this.appendValueInput('FIND')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'END');
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.LISTS_INDEX_OF_TOOLTIP.replace('%1',
          this.workspace.options.oneBasedIndex ? '0' : '-1');
    });
  }
};

Blockly.Blocks['lists_getIndex'] = {
  /**
   * Block for getting element at index.
   * @this Blockly.Block
   */
  init: function() {
    var MODE =
        [[Blockly.Msg.LISTS_GET_INDEX_GET, 'GET'],
         [Blockly.Msg.LISTS_GET_INDEX_GET_REMOVE, 'GET_REMOVE'],
         [Blockly.Msg.LISTS_GET_INDEX_REMOVE, 'REMOVE']];
    this.WHERE_OPTIONS =
        [[Blockly.Msg.LISTS_GET_INDEX_FROM_START, 'FROM_START'],
         [Blockly.Msg.LISTS_GET_INDEX_FROM_END, 'FROM_END'],
         [Blockly.Msg.LISTS_GET_INDEX_FIRST, 'FIRST'],
         [Blockly.Msg.LISTS_GET_INDEX_LAST, 'LAST'],
         [Blockly.Msg.LISTS_GET_INDEX_RANDOM, 'RANDOM']];
    this.setHelpUrl(Blockly.Msg.LISTS_GET_INDEX_HELPURL);
    this.setColour(Blockly.Blocks.lists.HUE);
    var modeMenu = new Blockly.FieldDropdown(MODE, function(value) {
      var isStatement = (value == 'REMOVE');
      this.sourceBlock_.updateStatement_(isStatement);
    });
    this.appendValueInput('VALUE')
        .setCheck('Array')
        .appendField(Blockly.Msg.LISTS_GET_INDEX_INPUT_IN_LIST);
    this.appendDummyInput()
        .appendField(modeMenu, 'MODE')
        .appendField('', 'SPACE');
    this.appendDummyInput('AT');
    if (Blockly.Msg.LISTS_GET_INDEX_TAIL) {
      this.appendDummyInput('TAIL')
          .appendField(Blockly.Msg.LISTS_GET_INDEX_TAIL);
    }
    this.setInputsInline(true);
    this.setOutput(true);
    this.updateAt_(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('MODE');
      var where = thisBlock.getFieldValue('WHERE');
      var tooltip = '';
      switch (mode + ' ' + where) {
        case 'GET FROM_START':
        case 'GET FROM_END':
          tooltip = Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_FROM;
          break;
        case 'GET FIRST':
          tooltip = Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_FIRST;
          break;
        case 'GET LAST':
          tooltip = Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_LAST;
          break;
        case 'GET RANDOM':
          tooltip = Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_RANDOM;
          break;
        case 'GET_REMOVE FROM_START':
        case 'GET_REMOVE FROM_END':
          tooltip = Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FROM;
          break;
        case 'GET_REMOVE FIRST':
          tooltip = Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_FIRST;
          break;
        case 'GET_REMOVE LAST':
          tooltip = Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_LAST;
          break;
        case 'GET_REMOVE RANDOM':
          tooltip = Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_GET_REMOVE_RANDOM;
          break;
        case 'REMOVE FROM_START':
        case 'REMOVE FROM_END':
          tooltip = Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_FROM;
          break;
        case 'REMOVE FIRST':
          tooltip = Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_FIRST;
          break;
        case 'REMOVE LAST':
          tooltip = Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_LAST;
          break;
        case 'REMOVE RANDOM':
          tooltip = Blockly.Msg.LISTS_GET_INDEX_TOOLTIP_REMOVE_RANDOM;
          break;
      }
      if (where == 'FROM_START' || where == 'FROM_END') {
        var msg = (where == 'FROM_START') ?
            Blockly.Msg.LISTS_INDEX_FROM_START_TOOLTIP :
            Blockly.Msg.LISTS_INDEX_FROM_END_TOOLTIP;
        tooltip += '  ' + msg.replace('%1',
                thisBlock.workspace.options.oneBasedIndex ? '#1' : '#0');
      }
      return tooltip;
    });
  },
  /**
   * Create XML to represent whether the block is a statement or a value.
   * Also represent whether there is an 'AT' input.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    var isStatement = !this.outputConnection;
    container.setAttribute('statement', isStatement);
    var isAt = this.getInput('AT').type == Blockly.INPUT_VALUE;
    container.setAttribute('at', isAt);
    return container;
  },
  /**
   * Parse XML to restore the 'AT' input.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    // Note: Until January 2013 this block did not have mutations,
    // so 'statement' defaults to false and 'at' defaults to true.
    var isStatement = (xmlElement.getAttribute('statement') == 'true');
    this.updateStatement_(isStatement);
    var isAt = (xmlElement.getAttribute('at') != 'false');
    this.updateAt_(isAt);
  },
  /**
   * Switch between a value block and a statement block.
   * @param {boolean} newStatement True if the block should be a statement.
   *     False if the block should be a value.
   * @private
   * @this Blockly.Block
   */
  updateStatement_: function(newStatement) {
    var oldStatement = !this.outputConnection;
    if (newStatement != oldStatement) {
      this.unplug(true, true);
      if (newStatement) {
        this.setOutput(false);
        this.setPreviousStatement(true);
        this.setNextStatement(true);
      } else {
        this.setPreviousStatement(false);
        this.setNextStatement(false);
        this.setOutput(true);
      }
    }
  },
  /**
   * Create or delete an input for the numeric index.
   * @param {boolean} isAt True if the input should exist.
   * @private
   * @this Blockly.Block
   */
  updateAt_: function(isAt) {
    // Destroy old 'AT' and 'ORDINAL' inputs.
    this.removeInput('AT');
    this.removeInput('ORDINAL', true);
    // Create either a value 'AT' input or a dummy input.
    if (isAt) {
      this.appendValueInput('AT').setCheck('Number');
      if (Blockly.Msg.ORDINAL_NUMBER_SUFFIX) {
        this.appendDummyInput('ORDINAL')
            .appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX);
      }
    } else {
      this.appendDummyInput('AT');
    }
    var menu = new Blockly.FieldDropdown(this.WHERE_OPTIONS, function(value) {
      var newAt = (value == 'FROM_START') || (value == 'FROM_END');
      // The 'isAt' variable is available due to this function being a closure.
      if (newAt != isAt) {
        var block = this.sourceBlock_;
        block.updateAt_(newAt);
        // This menu has been destroyed and replaced.  Update the replacement.
        block.setFieldValue(value, 'WHERE');
        return null;
      }
      return undefined;
    });
    this.getInput('AT').appendField(menu, 'WHERE');
    if (Blockly.Msg.LISTS_GET_INDEX_TAIL) {
      this.moveInputBefore('TAIL', null);
    }
  }
};

Blockly.Blocks['lists_setIndex'] = {
  /**
   * Block for setting the element at index.
   * @this Blockly.Block
   */
  init: function() {
    var MODE =
        [[Blockly.Msg.LISTS_SET_INDEX_SET, 'SET'],
         [Blockly.Msg.LISTS_SET_INDEX_INSERT, 'INSERT']];
    this.WHERE_OPTIONS =
        [[Blockly.Msg.LISTS_GET_INDEX_FROM_START, 'FROM_START'],
         [Blockly.Msg.LISTS_GET_INDEX_FROM_END, 'FROM_END'],
         [Blockly.Msg.LISTS_GET_INDEX_FIRST, 'FIRST'],
         [Blockly.Msg.LISTS_GET_INDEX_LAST, 'LAST'],
         [Blockly.Msg.LISTS_GET_INDEX_RANDOM, 'RANDOM']];
    this.setHelpUrl(Blockly.Msg.LISTS_SET_INDEX_HELPURL);
    this.setColour(Blockly.Blocks.lists.HUE);
    this.appendValueInput('LIST')
        .setCheck('Array')
        .appendField(Blockly.Msg.LISTS_SET_INDEX_INPUT_IN_LIST);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(MODE), 'MODE')
        .appendField('', 'SPACE');
    this.appendDummyInput('AT');
    this.appendValueInput('TO')
        .appendField(Blockly.Msg.LISTS_SET_INDEX_INPUT_TO);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.LISTS_SET_INDEX_TOOLTIP);
    this.updateAt_(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('MODE');
      var where = thisBlock.getFieldValue('WHERE');
      var tooltip = '';
      switch (mode + ' ' + where) {
        case 'SET FROM_START':
        case 'SET FROM_END':
          tooltip = Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_FROM;
          break;
        case 'SET FIRST':
          tooltip = Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_FIRST;
          break;
        case 'SET LAST':
          tooltip = Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_LAST;
          break;
        case 'SET RANDOM':
          tooltip = Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_SET_RANDOM;
          break;
        case 'INSERT FROM_START':
        case 'INSERT FROM_END':
          tooltip = Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_FROM;
          break;
        case 'INSERT FIRST':
          tooltip = Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_FIRST;
          break;
        case 'INSERT LAST':
          tooltip = Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_LAST;
          break;
        case 'INSERT RANDOM':
          tooltip = Blockly.Msg.LISTS_SET_INDEX_TOOLTIP_INSERT_RANDOM;
          break;
      }
      if (where == 'FROM_START' || where == 'FROM_END') {
        tooltip += '  ' + Blockly.Msg.LISTS_INDEX_FROM_START_TOOLTIP
            .replace('%1',
                thisBlock.workspace.options.oneBasedIndex ? '#1' : '#0');
      }
      return tooltip;
    });
  },
  /**
   * Create XML to represent whether there is an 'AT' input.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    var isAt = this.getInput('AT').type == Blockly.INPUT_VALUE;
    container.setAttribute('at', isAt);
    return container;
  },
  /**
   * Parse XML to restore the 'AT' input.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    // Note: Until January 2013 this block did not have mutations,
    // so 'at' defaults to true.
    var isAt = (xmlElement.getAttribute('at') != 'false');
    this.updateAt_(isAt);
  },
  /**
   * Create or delete an input for the numeric index.
   * @param {boolean} isAt True if the input should exist.
   * @private
   * @this Blockly.Block
   */
  updateAt_: function(isAt) {
    // Destroy old 'AT' and 'ORDINAL' input.
    this.removeInput('AT');
    this.removeInput('ORDINAL', true);
    // Create either a value 'AT' input or a dummy input.
    if (isAt) {
      this.appendValueInput('AT').setCheck('Number');
      if (Blockly.Msg.ORDINAL_NUMBER_SUFFIX) {
        this.appendDummyInput('ORDINAL')
            .appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX);
      }
    } else {
      this.appendDummyInput('AT');
    }
    var menu = new Blockly.FieldDropdown(this.WHERE_OPTIONS, function(value) {
      var newAt = (value == 'FROM_START') || (value == 'FROM_END');
      // The 'isAt' variable is available due to this function being a closure.
      if (newAt != isAt) {
        var block = this.sourceBlock_;
        block.updateAt_(newAt);
        // This menu has been destroyed and replaced.  Update the replacement.
        block.setFieldValue(value, 'WHERE');
        return null;
      }
      return undefined;
    });
    this.moveInputBefore('AT', 'TO');
    if (this.getInput('ORDINAL')) {
      this.moveInputBefore('ORDINAL', 'TO');
    }

    this.getInput('AT').appendField(menu, 'WHERE');
  }
};

Blockly.Blocks['lists_getSublist'] = {
  /**
   * Block for getting sublist.
   * @this Blockly.Block
   */
  init: function() {
    this['WHERE_OPTIONS_1'] =
        [[Blockly.Msg.LISTS_GET_SUBLIST_START_FROM_START, 'FROM_START'],
         [Blockly.Msg.LISTS_GET_SUBLIST_START_FROM_END, 'FROM_END'],
         [Blockly.Msg.LISTS_GET_SUBLIST_START_FIRST, 'FIRST']];
    this['WHERE_OPTIONS_2'] =
        [[Blockly.Msg.LISTS_GET_SUBLIST_END_FROM_START, 'FROM_START'],
         [Blockly.Msg.LISTS_GET_SUBLIST_END_FROM_END, 'FROM_END'],
         [Blockly.Msg.LISTS_GET_SUBLIST_END_LAST, 'LAST']];
    this.setHelpUrl(Blockly.Msg.LISTS_GET_SUBLIST_HELPURL);
    this.setColour(Blockly.Blocks.lists.HUE);
    this.appendValueInput('LIST')
        .setCheck('Array')
        .appendField(Blockly.Msg.LISTS_GET_SUBLIST_INPUT_IN_LIST);
    this.appendDummyInput('AT1');
    this.appendDummyInput('AT2');
    if (Blockly.Msg.LISTS_GET_SUBLIST_TAIL) {
      this.appendDummyInput('TAIL')
          .appendField(Blockly.Msg.LISTS_GET_SUBLIST_TAIL);
    }
    this.setInputsInline(true);
    this.setOutput(true, 'Array');
    this.updateAt_(1, true);
    this.updateAt_(2, true);
    this.setTooltip(Blockly.Msg.LISTS_GET_SUBLIST_TOOLTIP);
  },
  /**
   * Create XML to represent whether there are 'AT' inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    var isAt1 = this.getInput('AT1').type == Blockly.INPUT_VALUE;
    container.setAttribute('at1', isAt1);
    var isAt2 = this.getInput('AT2').type == Blockly.INPUT_VALUE;
    container.setAttribute('at2', isAt2);
    return container;
  },
  /**
   * Parse XML to restore the 'AT' inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var isAt1 = (xmlElement.getAttribute('at1') == 'true');
    var isAt2 = (xmlElement.getAttribute('at2') == 'true');
    this.updateAt_(1, isAt1);
    this.updateAt_(2, isAt2);
  },
  /**
   * Create or delete an input for a numeric index.
   * This block has two such inputs, independant of each other.
   * @param {number} n Specify first or second input (1 or 2).
   * @param {boolean} isAt True if the input should exist.
   * @private
   * @this Blockly.Block
   */
  updateAt_: function(n, isAt) {
    // Create or delete an input for the numeric index.
    // Destroy old 'AT' and 'ORDINAL' inputs.
    this.removeInput('AT' + n);
    this.removeInput('ORDINAL' + n, true);
    // Create either a value 'AT' input or a dummy input.
    if (isAt) {
      this.appendValueInput('AT' + n).setCheck('Number');
      if (Blockly.Msg.ORDINAL_NUMBER_SUFFIX) {
        this.appendDummyInput('ORDINAL' + n)
            .appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX);
      }
    } else {
      this.appendDummyInput('AT' + n);
    }
    var menu = new Blockly.FieldDropdown(this['WHERE_OPTIONS_' + n],
        function(value) {
          var newAt = (value == 'FROM_START') || (value == 'FROM_END');
          // The 'isAt' variable is available due to this function being a
          // closure.
          if (newAt != isAt) {
            var block = this.sourceBlock_;
            block.updateAt_(n, newAt);
            // This menu has been destroyed and replaced.
            // Update the replacement.
            block.setFieldValue(value, 'WHERE' + n);
            return null;
          }
          return undefined;
        });
    this.getInput('AT' + n)
        .appendField(menu, 'WHERE' + n);
    if (n == 1) {
      this.moveInputBefore('AT1', 'AT2');
      if (this.getInput('ORDINAL1')) {
        this.moveInputBefore('ORDINAL1', 'AT2');
      }
    }
    if (Blockly.Msg.LISTS_GET_SUBLIST_TAIL) {
      this.moveInputBefore('TAIL', null);
    }
  }
};

Blockly.Blocks['lists_sort'] = {
  /**
   * Block for sorting a list.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.LISTS_SORT_TITLE,
      "args0": [
        {
          "type": "field_dropdown",
          "name": "TYPE",
          "options": [
            [Blockly.Msg.LISTS_SORT_TYPE_NUMERIC, "NUMERIC"],
            [Blockly.Msg.LISTS_SORT_TYPE_TEXT, "TEXT"],
            [Blockly.Msg.LISTS_SORT_TYPE_IGNORECASE, "IGNORE_CASE"]
          ]
        },
        {
          "type": "field_dropdown",
          "name": "DIRECTION",
          "options": [
            [Blockly.Msg.LISTS_SORT_ORDER_ASCENDING, "1"],
            [Blockly.Msg.LISTS_SORT_ORDER_DESCENDING, "-1"]
          ]
        },
        {
          "type": "input_value",
          "name": "LIST",
          "check": "Array"
        }
      ],
      "output": "Array",
      "colour": Blockly.Blocks.lists.HUE,
      "tooltip": Blockly.Msg.LISTS_SORT_TOOLTIP,
      "helpUrl": Blockly.Msg.LISTS_SORT_HELPURL
    });
  }
};

Blockly.Blocks['lists_split'] = {
  /**
   * Block for splitting text into a list, or joining a list into text.
   * @this Blockly.Block
   */
  init: function() {
    // Assign 'this' to a variable for use in the closures below.
    var thisBlock = this;
    var dropdown = new Blockly.FieldDropdown(
        [[Blockly.Msg.LISTS_SPLIT_LIST_FROM_TEXT, 'SPLIT'],
         [Blockly.Msg.LISTS_SPLIT_TEXT_FROM_LIST, 'JOIN']],
        function(newMode) {
          thisBlock.updateType_(newMode);
        });
    this.setHelpUrl(Blockly.Msg.LISTS_SPLIT_HELPURL);
    this.setColour(Blockly.Blocks.lists.HUE);
    this.appendValueInput('INPUT')
        .setCheck('String')
        .appendField(dropdown, 'MODE');
    this.appendValueInput('DELIM')
        .setCheck('String')
        .appendField(Blockly.Msg.LISTS_SPLIT_WITH_DELIMITER);
    this.setInputsInline(true);
    this.setOutput(true, 'Array');
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('MODE');
      if (mode == 'SPLIT') {
        return Blockly.Msg.LISTS_SPLIT_TOOLTIP_SPLIT;
      } else if (mode == 'JOIN') {
        return Blockly.Msg.LISTS_SPLIT_TOOLTIP_JOIN;
      }
      throw 'Unknown mode: ' + mode;
    });
  },
  /**
   * Modify this block to have the correct input and output types.
   * @param {string} newMode Either 'SPLIT' or 'JOIN'.
   * @private
   * @this Blockly.Block
   */
  updateType_: function(newMode) {
    if (newMode == 'SPLIT') {
      this.outputConnection.setCheck('Array');
      this.getInput('INPUT').setCheck('String');
    } else {
      this.outputConnection.setCheck('String');
      this.getInput('INPUT').setCheck('Array');
    }
  },
  /**
   * Create XML to represent the input and output types.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('mode', this.getFieldValue('MODE'));
    return container;
  },
  /**
   * Parse XML to restore the input and output types.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.updateType_(xmlElement.getAttribute('mode'));
  }
};
/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Logic blocks for Blockly.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Blocks.logic');
goog.provide('Blockly.Blocks.constant');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.logic.HUE = 210;

Blockly.Blocks['controls_if'] = {
  /**
   * Block for if/elseif/else condition.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.CONTROLS_IF_HELPURL);
    this.setColour(Blockly.Blocks.logic.HUE);
    this.appendValueInput('IF0')
        .setCheck('Boolean')
        .appendField(Blockly.Msg.CONTROLS_IF_MSG_IF);
    this.appendStatementInput('DO0')
        .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setMutator(new Blockly.Mutator(['controls_if_elseif',
                                         'controls_if_else']));
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
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
  },
  /**
   * Create XML to represent the number of else-if and else inputs.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    if (!this.elseifCount_ && !this.elseCount_) {
      return null;
    }
    var container = document.createElement('mutation');
    if (this.elseifCount_) {
      container.setAttribute('elseif', this.elseifCount_);
    }
    if (this.elseCount_) {
      container.setAttribute('else', 1);
    }
    return container;
  },
  /**
   * Parse XML to restore the else-if and else inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.elseifCount_ = parseInt(xmlElement.getAttribute('elseif'), 10) || 0;
    this.elseCount_ = parseInt(xmlElement.getAttribute('else'), 10) || 0;
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('controls_if_if');
    containerBlock.initSvg();
    var connection = containerBlock.nextConnection;
    for (var i = 1; i <= this.elseifCount_; i++) {
      var elseifBlock = workspace.newBlock('controls_if_elseif');
      elseifBlock.initSvg();
      connection.connect(elseifBlock.previousConnection);
      connection = elseifBlock.nextConnection;
    }
    if (this.elseCount_) {
      var elseBlock = workspace.newBlock('controls_if_else');
      elseBlock.initSvg();
      connection.connect(elseBlock.previousConnection);
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    var clauseBlock = containerBlock.nextConnection.targetBlock();
    // Count number of inputs.
    this.elseifCount_ = 0;
    this.elseCount_ = 0;
    var valueConnections = [null];
    var statementConnections = [null];
    var elseStatementConnection = null;
    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'controls_if_elseif':
          this.elseifCount_++;
          valueConnections.push(clauseBlock.valueConnection_);
          statementConnections.push(clauseBlock.statementConnection_);
          break;
        case 'controls_if_else':
          this.elseCount_++;
          elseStatementConnection = clauseBlock.statementConnection_;
          break;
        default:
          throw 'Unknown block type.';
      }
      clauseBlock = clauseBlock.nextConnection &&
          clauseBlock.nextConnection.targetBlock();
    }
    this.updateShape_();
    // Reconnect any child blocks.
    for (var i = 1; i <= this.elseifCount_; i++) {
      Blockly.Mutator.reconnect(valueConnections[i], this, 'IF' + i);
      Blockly.Mutator.reconnect(statementConnections[i], this, 'DO' + i);
    }
    Blockly.Mutator.reconnect(elseStatementConnection, this, 'ELSE');
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var clauseBlock = containerBlock.nextConnection.targetBlock();
    var i = 1;
    while (clauseBlock) {
      switch (clauseBlock.type) {
        case 'controls_if_elseif':
          var inputIf = this.getInput('IF' + i);
          var inputDo = this.getInput('DO' + i);
          clauseBlock.valueConnection_ =
              inputIf && inputIf.connection.targetConnection;
          clauseBlock.statementConnection_ =
              inputDo && inputDo.connection.targetConnection;
          i++;
          break;
        case 'controls_if_else':
          var inputDo = this.getInput('ELSE');
          clauseBlock.statementConnection_ =
              inputDo && inputDo.connection.targetConnection;
          break;
        default:
          throw 'Unknown block type.';
      }
      clauseBlock = clauseBlock.nextConnection &&
          clauseBlock.nextConnection.targetBlock();
    }
  },
  /**
   * Modify this block to have the correct number of inputs.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    // Delete everything.
    if (this.getInput('ELSE')) {
      this.removeInput('ELSE');
    }
    var i = 1;
    while (this.getInput('IF' + i)) {
      this.removeInput('IF' + i);
      this.removeInput('DO' + i);
      i++;
    }
    // Rebuild block.
    for (var i = 1; i <= this.elseifCount_; i++) {
      this.appendValueInput('IF' + i)
          .setCheck('Boolean')
          .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSEIF);
      this.appendStatementInput('DO' + i)
          .appendField(Blockly.Msg.CONTROLS_IF_MSG_THEN);
    }
    if (this.elseCount_) {
      this.appendStatementInput('ELSE')
          .appendField(Blockly.Msg.CONTROLS_IF_MSG_ELSE);
    }
  }
};

Blockly.Blocks['controls_if_if'] = {
  /**
   * Mutator block for if container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.logic.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CONTROLS_IF_IF_TITLE_IF);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.CONTROLS_IF_IF_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['controls_if_elseif'] = {
  /**
   * Mutator block for else-if condition.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.logic.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CONTROLS_IF_ELSEIF_TITLE_ELSEIF);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.CONTROLS_IF_ELSEIF_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['controls_if_else'] = {
  /**
   * Mutator block for else condition.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.logic.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.CONTROLS_IF_ELSE_TITLE_ELSE);
    this.setPreviousStatement(true);
    this.setTooltip(Blockly.Msg.CONTROLS_IF_ELSE_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['controls_ifelse'] = {
  /**
   * If/else block that does not use a mutator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%{BKY_CONTROLS_IF_MSG_IF} %1",
      "args0": [
        {
          "type": "input_value",
          "name": "IF0",
          "check": "Boolean"
        }
      ],
      "message1": "%{BKY_CONTROLS_IF_MSG_THEN} %1",
      "args1": [
        {
          "type": "input_statement",
          "name": "DO0"
        }
      ],
      "message2": "%{BKY_CONTROLS_IF_MSG_ELSE} %1",
      "args2": [
        {
          "type": "input_statement",
          "name": "ELSE"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.logic.HUE,
      "tooltip": Blockly.Msg.CONTROLS_IF_TOOLTIP_2,
      "helpUrl": Blockly.Msg.CONTROLS_IF_HELPURL
    });
  }
};

Blockly.Blocks['logic_compare'] = {
  /**
   * Block for comparison operator.
   * @this Blockly.Block
   */
  init: function() {
    var rtlOperators = [
      ['=', 'EQ'],
      ['\u2260', 'NEQ'],
      ['\u200F<\u200F', 'LT'],
      ['\u200F\u2264\u200F', 'LTE'],
      ['\u200F>\u200F', 'GT'],
      ['\u200F\u2265\u200F', 'GTE']
    ];
    var ltrOperators = [
      ['=', 'EQ'],
      ['\u2260', 'NEQ'],
      ['<', 'LT'],
      ['\u2264', 'LTE'],
      ['>', 'GT'],
      ['\u2265', 'GTE']
    ];
    var OPERATORS = this.RTL ? rtlOperators : ltrOperators;
    this.setHelpUrl(Blockly.Msg.LOGIC_COMPARE_HELPURL);
    this.setColour(Blockly.Blocks.operators.HUE);
    this.setOutput(true, 'Boolean');
    this.appendValueInput('A');
    this.appendValueInput('B')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var op = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'EQ': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_EQ,
        'NEQ': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_NEQ,
        'LT': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LT,
        'LTE': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_LTE,
        'GT': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GT,
        'GTE': Blockly.Msg.LOGIC_COMPARE_TOOLTIP_GTE
      };
      return TOOLTIPS[op];
    });
    this.prevBlocks_ = [null, null];
  },
  /**
   * Called whenever anything on the workspace changes.
   * Prevent mismatched types from being compared.
   * @param {!Blockly.Events.Abstract} e Change event.
   * @this Blockly.Block
   */
  onchange: function(e) {
    var blockA = this.getInputTargetBlock('A');
    var blockB = this.getInputTargetBlock('B');
    // Disconnect blocks that existed prior to this change if they don't match.
    if (blockA && blockB &&
        !blockA.outputConnection.checkType_(blockB.outputConnection)) {
      // Mismatch between two inputs.  Disconnect previous and bump it away.
      // Ensure that any disconnections are grouped with the causing event.
      Blockly.Events.setGroup(e.group);
      for (var i = 0; i < this.prevBlocks_.length; i++) {
        var block = this.prevBlocks_[i];
        if (block === blockA || block === blockB) {
          block.unplug();
          block.bumpNeighbours_();
        }
      }
      Blockly.Events.setGroup(false);
    }
    this.prevBlocks_[0] = blockA;
    this.prevBlocks_[1] = blockB;
  }
};

Blockly.Blocks['logic_operation'] = {
  /**
   * Block for logical operations: 'and', 'or'.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.LOGIC_OPERATION_AND, 'AND'],
         [Blockly.Msg.LOGIC_OPERATION_OR, 'OR']];
    this.setHelpUrl(Blockly.Msg.LOGIC_OPERATION_HELPURL);
    this.setColour(Blockly.Blocks.operators.HUE);
    this.setOutput(true, 'Boolean');
    this.appendValueInput('A')
        .setCheck('Boolean');
    this.appendValueInput('B')
        .setCheck('Boolean')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'OP');
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var op = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'AND': Blockly.Msg.LOGIC_OPERATION_TOOLTIP_AND,
        'OR': Blockly.Msg.LOGIC_OPERATION_TOOLTIP_OR
      };
      return TOOLTIPS[op];
    });
  }
};

Blockly.Blocks['logic_negate'] = {
  /**
   * Block for negation.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.LOGIC_NEGATE_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "BOOL",
          "check": "Boolean"
        }
      ],
      "output": "Boolean",
      "colour": Blockly.Blocks.operators.HUE,
      "tooltip": Blockly.Msg.LOGIC_NEGATE_TOOLTIP,
      "helpUrl": Blockly.Msg.LOGIC_NEGATE_HELPURL
    });
  }
};

Blockly.Blocks['logic_boolean'] = {
  /**
   * Block for boolean data type: true and false.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "BOOL",
          "options": [
            [Blockly.Msg.LOGIC_BOOLEAN_TRUE, "TRUE"],
            [Blockly.Msg.LOGIC_BOOLEAN_FALSE, "FALSE"]
          ]
        }
      ],
      "output": "Boolean",
      "colour": Blockly.Blocks.constant.HUE,
      "tooltip": Blockly.Msg.LOGIC_BOOLEAN_TOOLTIP,
      "helpUrl": Blockly.Msg.LOGIC_BOOLEAN_HELPURL
    });
  }
};

Blockly.Blocks['logic_null'] = {
  /**
   * Block for null data type.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.LOGIC_NULL,
      "output": null,
      "colour": Blockly.Blocks.constant.HUE,
      "tooltip": Blockly.Msg.LOGIC_NULL_TOOLTIP,
      "helpUrl": Blockly.Msg.LOGIC_NULL_HELPURL
    });
  }
};

Blockly.Blocks['logic_ternary'] = {
  /**
   * Block for ternary operator.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.LOGIC_TERNARY_HELPURL);
    this.setColour(Blockly.Blocks.logic.HUE);
    this.appendValueInput('IF')
        .setCheck('Boolean')
        .appendField(Blockly.Msg.LOGIC_TERNARY_CONDITION);
    this.appendValueInput('THEN')
        .appendField(Blockly.Msg.LOGIC_TERNARY_IF_TRUE);
    this.appendValueInput('ELSE')
        .appendField(Blockly.Msg.LOGIC_TERNARY_IF_FALSE);
    this.setOutput(true);
    this.setTooltip(Blockly.Msg.LOGIC_TERNARY_TOOLTIP);
    this.prevParentConnection_ = null;
  },
  /**
   * Called whenever anything on the workspace changes.
   * Prevent mismatched types.
   * @param {!Blockly.Events.Abstract} e Change event.
   * @this Blockly.Block
   */
  onchange: function(e) {
    var blockA = this.getInputTargetBlock('THEN');
    var blockB = this.getInputTargetBlock('ELSE');
    var parentConnection = this.outputConnection.targetConnection;
    // Disconnect blocks that existed prior to this change if they don't match.
    if ((blockA || blockB) && parentConnection) {
      for (var i = 0; i < 2; i++) {
        var block = (i == 1) ? blockA : blockB;
        if (block && !block.outputConnection.checkType_(parentConnection)) {
          // Ensure that any disconnections are grouped with the causing event.
          Blockly.Events.setGroup(e.group);
          if (parentConnection === this.prevParentConnection_) {
            this.unplug();
            parentConnection.getSourceBlock().bumpNeighbours_();
          } else {
            block.unplug();
            block.bumpNeighbours_();
          }
          Blockly.Events.setGroup(false);
        }
      }
    }
    this.prevParentConnection_ = parentConnection;
  }
};
/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Loop blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.loops');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.loops.HUE = 120;

Blockly.Blocks['controls_repeat_ext'] = {
  /**
   * Block for repeat n times (external number).
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_REPEAT_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "TIMES",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "tooltip": Blockly.Msg.CONTROLS_REPEAT_TOOLTIP,
      "helpUrl": Blockly.Msg.CONTROLS_REPEAT_HELPURL
    });
    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
  }
};

Blockly.Blocks['controls_repeat'] = {
  /**
   * Block for repeat n times (internal number).
   * The 'controls_repeat_ext' block is preferred as it is more flexible.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_REPEAT_TITLE,
      "args0": [
        {
          "type": "field_number",
          "name": "TIMES",
          "value": 10,
          "min": 0,
          "precision": 1
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "tooltip": Blockly.Msg.CONTROLS_REPEAT_TOOLTIP,
      "helpUrl": this.getHelpUrl("controls_repeat")
    });
    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.CONTROLS_REPEAT_INPUT_DO);
  }
};

Blockly.Blocks['controls_whileUntil'] = {
  /**
   * Block for 'do while/until' loop.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_WHILE, 'WHILE'],
         [Blockly.Msg.CONTROLS_WHILEUNTIL_OPERATOR_UNTIL, 'UNTIL']];
    this.setHelpUrl(Blockly.Msg.CONTROLS_WHILEUNTIL_HELPURL);
    this.setColour(Blockly.Blocks.loops.HUE);
    this.appendValueInput('BOOL')
        .setCheck('Boolean')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'MODE');
    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.CONTROLS_WHILEUNTIL_INPUT_DO);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var op = thisBlock.getFieldValue('MODE');
      var TOOLTIPS = {
        'WHILE': Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_WHILE,
        'UNTIL': Blockly.Msg.CONTROLS_WHILEUNTIL_TOOLTIP_UNTIL
      };
      return TOOLTIPS[op];
    });
  }
};

Blockly.Blocks['controls_for'] = {
  /**
   * Block for 'for' loop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_FOR_TITLE,
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": null
        },
        {
          "type": "input_value",
          "name": "FROM",
          "check": "Number",
          "align": "RIGHT"
        },
        {
          "type": "input_value",
          "name": "TO",
          "check": "Number",
          "align": "RIGHT"
        },
        {
          "type": "input_value",
          "name": "BY",
          "check": "Number",
          "align": "RIGHT"
        }
      ],
      "inputsInline": true,
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "helpUrl": Blockly.Msg.CONTROLS_FOR_HELPURL
    });
    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.CONTROLS_FOR_INPUT_DO);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CONTROLS_FOR_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  },
  /**
   * Add menu option to create getter block for loop variable.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    if (!this.isCollapsed()) {
      var option = {enabled: true};
      var name = this.getFieldValue('VAR');
      option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
      var xmlField = goog.dom.createDom('field', null, name);
      xmlField.setAttribute('name', 'VAR');
      var xmlBlock = goog.dom.createDom('block', null, xmlField);
      xmlBlock.setAttribute('type', 'variables_get');
      option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
      options.push(option);
    }
  }
};

Blockly.Blocks['controls_forEach'] = {
  /**
   * Block for 'for each' loop.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.CONTROLS_FOREACH_TITLE,
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": null
        },
        {
          "type": "input_value",
          "name": "LIST",
          "check": "Array"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.loops.HUE,
      "helpUrl": Blockly.Msg.CONTROLS_FOREACH_HELPURL
    });
    this.appendStatementInput('DO')
        .appendField(Blockly.Msg.CONTROLS_FOREACH_INPUT_DO);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.CONTROLS_FOREACH_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  },
  customContextMenu: Blockly.Blocks['controls_for'].customContextMenu
};

Blockly.Blocks['controls_flow_statements'] = {
  /**
   * Block for flow statements: continue, break.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_BREAK, 'BREAK'],
         [Blockly.Msg.CONTROLS_FLOW_STATEMENTS_OPERATOR_CONTINUE, 'CONTINUE']];
    this.setHelpUrl(Blockly.Msg.CONTROLS_FLOW_STATEMENTS_HELPURL);
    this.setColour(Blockly.Blocks.loops.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'FLOW');
    this.setPreviousStatement(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var op = thisBlock.getFieldValue('FLOW');
      var TOOLTIPS = {
        'BREAK': Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_BREAK,
        'CONTINUE': Blockly.Msg.CONTROLS_FLOW_STATEMENTS_TOOLTIP_CONTINUE
      };
      return TOOLTIPS[op];
    });
  },
  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @param {!Blockly.Events.Abstract} e Change event.
   * @this Blockly.Block
   */
  onchange: function(e) {
    if (!this.workspace.isDragging || this.workspace.isDragging()) {
      return;  // Don't change state at the start of a drag.
    }
    var legal = false;
    // Is the block nested in a loop?
    var block = this;
    do {
      if (this.LOOP_TYPES.indexOf(block.type) != -1) {
        legal = true;
        break;
      }
      block = block.getSurroundParent();
    } while (block);
    if (legal) {
      this.setWarningText(null);
      if (!this.isInFlyout) {
        this.setDisabled(false);
      }
    } else {
      this.setWarningText(Blockly.Msg.CONTROLS_FLOW_STATEMENTS_WARNING);
      if (!this.isInFlyout && !this.getInheritedDisabled()) {
        this.setDisabled(true);
      }
    }
  },
  /**
   * List of block types that are loops and thus do not need warnings.
   * To add a new loop type add this to your code:
   * Blockly.Blocks['controls_flow_statements'].LOOP_TYPES.push('custom_loop');
   */
  LOOP_TYPES: ['controls_repeat', 'controls_repeat_ext', 'controls_forEach',
      'controls_for', 'controls_whileUntil']
};
/*
 * Whitecat Blocky Environment, lora blocks
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

goog.provide('Blockly.Blocks.lora');

goog.require('Blockly.Blocks');

Blockly.Blocks.lora.HUE = 20;

Blockly.Blocks['lora_configure'] = {
	module: "lora",
	init: function() {
		var bands = [];

		bands.push(['868', 'lora.BAND868']);
		bands.push(['433', 'lora.BAND433']);

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
	},
};

Blockly.Blocks['lora_set_deveui'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_DEVEUI);

		this.appendValueInput("DEVEUI");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
	},
};

Blockly.Blocks['lora_set_appeui'] = {
	module: "lora",
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
	},
};

Blockly.Blocks['lora_set_devaddr'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_DEVADDR);

		this.appendValueInput("DEVADDR");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
	},
};

Blockly.Blocks['lora_set_nwkskey'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_NWKSKEY);

		this.appendValueInput("NWKSKEY");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
	},
};

Blockly.Blocks['lora_set_appskey'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_APPSKEY);

		this.appendValueInput("APPSKEY");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
	},
};

Blockly.Blocks['lora_set_appkey'] = {
	module: "lora",
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
	},
};

Blockly.Blocks['lora_set_adr'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_ADR);

		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.TRUE, "1"],
				[Blockly.Msg.FALSE, "0"]
			]), "ON_OFF");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
	},
};

Blockly.Blocks['lora_set_dr'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_DR);

		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown([
				["0", "0"],
				["1", "1"],
				["2", "2"],
				["3", "3"],
				["4", "4"],
				["5", "5"],
				["6", "6"],
				["7", "7"]
			]), "DR");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
	},
};

Blockly.Blocks['lora_set_retx'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_SET_RETX);

		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown([
				["0", "0"],
				["1", "1"],
				["2", "2"],
				["3", "3"],
				["4", "4"],
				["5", "5"],
				["6", "6"],
				["7", "7"]
			]), "RETX");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
	},
};

Blockly.Blocks['lora_join'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_JOIN);

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
	},

	mutationToDom: function() {
		var container = document.createElement('mutation');

		container.setAttribute('band', this.band);
		container.setAttribute('activation', this.activation);
		container.setAttribute("dr", this.dr);
		container.setAttribute("adr", this.adr);
		container.setAttribute("retx", this.retx);
		container.setAttribute("deveui", this.deveui);
		container.setAttribute("appeui", this.appeui);
		container.setAttribute("appkey", this.appkey);
		container.setAttribute("devaddr", this.devaddr);
		container.setAttribute("nwkskey", this.nwkskey);
		container.setAttribute("appskey", this.appskey);

		return container;
	},

	domToMutation: function(xmlElement) {
		this.interface = xmlElement.getAttribute('interface');

		this.band = xmlElement.getAttribute('band');
		this.activation = xmlElement.getAttribute("activation");
		this.dr = xmlElement.getAttribute("dr");
		this.adr = xmlElement.getAttribute("adr");
		this.retx = xmlElement.getAttribute("retx");
		this.deveui = xmlElement.getAttribute("deveui");
		this.appeui = xmlElement.getAttribute("appeui");
		this.appkey = xmlElement.getAttribute("appkey");
		this.devaddr = xmlElement.getAttribute("devaddr");
		this.nwkskey = xmlElement.getAttribute("nwkskey");
		this.appskey = xmlElement.getAttribute("appskey");

		this.updateShape_();
	},

	updateShape_: function() {
		this.configureLora(this);
	},

	configureLora: function(instance) {
		instance.workspace.configureLora({
			"band": instance.band,
			"activation": instance.activation,
			"dr": instance.dr,
			"retx": instance.retx,
			"adr": instance.adr,
			"deveui": instance.deveui,
			"appeui": instance.appeui,
			"appkey": instance.appkey,
			"devaddr": instance.devaddr,
			"nwkskey": instance.nwkskey,
			"appskey": instance.appskey
		});
	},
};

Blockly.Blocks['lora_tx'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.LORA_TX);

		this.appendDummyInput()
			.appendField(new Blockly.FieldDropdown([
				[Blockly.Msg.LORA_CONFIRMED, "1"],
				[Blockly.Msg.LORA_UNCONFIRMED, "0"]
			]), "CONF")
			.appendField(Blockly.Msg.LORA_FRAME);

		this.appendValueInput("PORT")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(Blockly.Msg.LORA_PAYLOAD);

		this.appendValueInput("PAYLOAD");

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip('');
	},

	configureLora: Blockly.Blocks['lora_join'].configureLora,
	mutationToDom: Blockly.Blocks['lora_join'].mutationToDom,
	domToMutation: Blockly.Blocks['lora_join'].domToMutation,
	updateShape_: Blockly.Blocks['lora_join'].updateShape_,
};

Blockly.Blocks['when_i_receive_a_lora_frame'] = {
	module: "lora",
	init: function() {
		this.appendDummyInput()
		.appendField(Blockly.Msg.EVENT_WHEN_I_RECEIVE_A_LORA_FRAME + ' ' + Blockly.Msg.PROCEDURES_BEFORE_PARAMS + " port, payload");

		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);


		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.lora.HUE);
		this.setTooltip(Blockly.Msg.EVENT_WHEN_I_RECEIVE_A_LORA_FRAME_TOOLTIP);
	},
	onchange: function(e) {
		if (!this.workspace.isDragging || this.workspace.isDragging()) {
			return;
		}

		var instances = 0;
		var blocks = this.workspace.getTopBlocks(true);
		for (var x = 0, block; block = blocks[x]; x++) {
			if (blocks[x].type == this.type) {
				instances++;
			}
		}

		if (instances > 1) {
			this.setWarningText(Blockly.Msg.WARNING_ONLY_ONE_INSTANCE_ALLOWED);
			if (!this.isInFlyout && !this.getInheritedDisabled()) {
				this.setDisabled(true);
			}
		} else {
			this.setWarningText(null);
			if (!this.isInFlyout) {
				this.setDisabled(false);
			}
		}
	},
	section: function() {
		return 'declaration';
	},
	customContextMenu: function(options) {
		if (!this.isCollapsed()) {
			// Optin for create port getter
			var option = {
				enabled: true
			};
			var name = "port";
			option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
			var xmlField = goog.dom.createDom('field', null, name);
			xmlField.setAttribute('name', 'VAR');
			var xmlBlock = goog.dom.createDom('block', null, xmlField);
			xmlBlock.setAttribute('type', 'variables_get');
			option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
			options.push(option);

			// Optin for create payload getter
			var option = {
				enabled: true
			};
			var name = "payload";
			option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
			var xmlField = goog.dom.createDom('field', null, name);
			xmlField.setAttribute('name', 'VAR');
			var xmlBlock = goog.dom.createDom('block', null, xmlField);
			xmlBlock.setAttribute('type', 'variables_get');
			option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
			options.push(option);
		}
	},
};
/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Math blocks for Blockly.
 * @author q.neutron@gmail.com (Quynh Neutron)
 */
'use strict';

goog.provide('Blockly.Blocks.math');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.math.HUE = 230;

Blockly.Blocks['math_number'] = {
  /**
   * Block for numeric value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.MATH_NUMBER_HELPURL);
    this.setColour(Blockly.Blocks.constant.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldNumber('0'), 'NUM');
    this.setOutput(true, 'Number');
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    // Number block is trivial.  Use tooltip of parent block if it exists.
    this.setTooltip(function() {
      var parent = thisBlock.getParent();
      return (parent && parent.getInputsInline() && parent.tooltip) ||
          Blockly.Msg.MATH_NUMBER_TOOLTIP;
    });
  }
};

Blockly.Blocks['math_arithmetic'] = {
  /**
   * Block for basic arithmetic operator.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2 %3",
      "args0": [
        {
          "type": "input_value",
          "name": "A",
          "check": "Number"
        },
        {
          "type": "field_dropdown",
          "name": "OP",
          "options":
            [[Blockly.Msg.MATH_ADDITION_SYMBOL, 'ADD'],
             [Blockly.Msg.MATH_SUBTRACTION_SYMBOL, 'MINUS'],
             [Blockly.Msg.MATH_MULTIPLICATION_SYMBOL, 'MULTIPLY'],
             [Blockly.Msg.MATH_DIVISION_SYMBOL, 'DIVIDE'],
             [Blockly.Msg.MATH_POWER_SYMBOL, 'POWER']]
        },
        {
          "type": "input_value",
          "name": "B",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "helpUrl": Blockly.Msg.MATH_ARITHMETIC_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'ADD': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_ADD,
        'MINUS': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MINUS,
        'MULTIPLY': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_MULTIPLY,
        'DIVIDE': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_DIVIDE,
        'POWER': Blockly.Msg.MATH_ARITHMETIC_TOOLTIP_POWER
      };
      return TOOLTIPS[mode];
    });
  }
};

Blockly.Blocks['math_single'] = {
  /**
   * Block for advanced math operators with single operand.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "OP",
          "options": [
            [Blockly.Msg.MATH_SINGLE_OP_ROOT, 'ROOT'],
            [Blockly.Msg.MATH_SINGLE_OP_ABSOLUTE, 'ABS'],
            ['-', 'NEG'],
            ['ln', 'LN'],
            ['log10', 'LOG10'],
            ['e^', 'EXP'],
            ['10^', 'POW10']
          ]
        },
        {
          "type": "input_value",
          "name": "NUM",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "helpUrl": Blockly.Msg.MATH_SINGLE_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'ROOT': Blockly.Msg.MATH_SINGLE_TOOLTIP_ROOT,
        'ABS': Blockly.Msg.MATH_SINGLE_TOOLTIP_ABS,
        'NEG': Blockly.Msg.MATH_SINGLE_TOOLTIP_NEG,
        'LN': Blockly.Msg.MATH_SINGLE_TOOLTIP_LN,
        'LOG10': Blockly.Msg.MATH_SINGLE_TOOLTIP_LOG10,
        'EXP': Blockly.Msg.MATH_SINGLE_TOOLTIP_EXP,
        'POW10': Blockly.Msg.MATH_SINGLE_TOOLTIP_POW10
      };
      return TOOLTIPS[mode];
    });
  }
};

Blockly.Blocks['math_trig'] = {
  /**
   * Block for trigonometry operators.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "OP",
          "options": [
            [Blockly.Msg.MATH_TRIG_SIN, 'SIN'],
            [Blockly.Msg.MATH_TRIG_COS, 'COS'],
            [Blockly.Msg.MATH_TRIG_TAN, 'TAN'],
            [Blockly.Msg.MATH_TRIG_ASIN, 'ASIN'],
            [Blockly.Msg.MATH_TRIG_ACOS, 'ACOS'],
            [Blockly.Msg.MATH_TRIG_ATAN, 'ATAN']
          ]
        },
        {
          "type": "input_value",
          "name": "NUM",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "helpUrl": Blockly.Msg.MATH_TRIG_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'SIN': Blockly.Msg.MATH_TRIG_TOOLTIP_SIN,
        'COS': Blockly.Msg.MATH_TRIG_TOOLTIP_COS,
        'TAN': Blockly.Msg.MATH_TRIG_TOOLTIP_TAN,
        'ASIN': Blockly.Msg.MATH_TRIG_TOOLTIP_ASIN,
        'ACOS': Blockly.Msg.MATH_TRIG_TOOLTIP_ACOS,
        'ATAN': Blockly.Msg.MATH_TRIG_TOOLTIP_ATAN
      };
      return TOOLTIPS[mode];
    });
  }
};

Blockly.Blocks['math_constant'] = {
  /**
   * Block for constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "CONSTANT",
          "options": [
            ['\u03c0', 'PI'],
            ['e', 'E'],
            ['\u03c6', 'GOLDEN_RATIO'],
            ['sqrt(2)', 'SQRT2'],
            ['sqrt(\u00bd)', 'SQRT1_2'],
            ['\u221e', 'INFINITY']
          ]
        }
      ],
      "output": "Number",
      "colour": Blockly.Blocks.constant.HUE,
      "tooltip": Blockly.Msg.MATH_CONSTANT_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_CONSTANT_HELPURL
    });
  }
};

Blockly.Blocks['math_number_property'] = {
  /**
   * Block for checking if a number is even, odd, prime, whole, positive,
   * negative or if it is divisible by certain number.
   * @this Blockly.Block
   */
  init: function() {
    var PROPERTIES =
        [[Blockly.Msg.MATH_IS_EVEN, 'EVEN'],
         [Blockly.Msg.MATH_IS_ODD, 'ODD'],
         [Blockly.Msg.MATH_IS_PRIME, 'PRIME'],
         [Blockly.Msg.MATH_IS_WHOLE, 'WHOLE'],
         [Blockly.Msg.MATH_IS_POSITIVE, 'POSITIVE'],
         [Blockly.Msg.MATH_IS_NEGATIVE, 'NEGATIVE'],
         [Blockly.Msg.MATH_IS_DIVISIBLE_BY, 'DIVISIBLE_BY']];
    this.setColour(Blockly.Blocks.math.HUE);
    this.appendValueInput('NUMBER_TO_CHECK')
        .setCheck('Number');
    var dropdown = new Blockly.FieldDropdown(PROPERTIES, function(option) {
      var divisorInput = (option == 'DIVISIBLE_BY');
      this.sourceBlock_.updateShape_(divisorInput);
    });
    this.appendDummyInput()
        .appendField(dropdown, 'PROPERTY');
    this.setInputsInline(true);
    this.setOutput(true, 'Boolean');
    this.setTooltip(Blockly.Msg.MATH_IS_TOOLTIP);
  },
  /**
   * Create XML to represent whether the 'divisorInput' should be present.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    var divisorInput = (this.getFieldValue('PROPERTY') == 'DIVISIBLE_BY');
    container.setAttribute('divisor_input', divisorInput);
    return container;
  },
  /**
   * Parse XML to restore the 'divisorInput'.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var divisorInput = (xmlElement.getAttribute('divisor_input') == 'true');
    this.updateShape_(divisorInput);
  },
  /**
   * Modify this block to have (or not have) an input for 'is divisible by'.
   * @param {boolean} divisorInput True if this block has a divisor input.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function(divisorInput) {
    // Add or remove a Value Input.
    var inputExists = this.getInput('DIVISOR');
    if (divisorInput) {
      if (!inputExists) {
        this.appendValueInput('DIVISOR')
            .setCheck('Number');
      }
    } else if (inputExists) {
      this.removeInput('DIVISOR');
    }
  }
};

Blockly.Blocks['math_change'] = {
  /**
   * Block for adding to a variable in place.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.MATH_CHANGE_TITLE,
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": Blockly.Msg.MATH_CHANGE_TITLE_ITEM
        },
        {
          "type": "input_value",
          "name": "DELTA",
          "check": "Number"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.variables.HUE,
      "helpUrl": Blockly.Msg.MATH_CHANGE_HELPURL
    });
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.MATH_CHANGE_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  }
};

Blockly.Blocks['math_round'] = {
  /**
   * Block for rounding functions.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": "%1 %2",
      "args0": [
        {
          "type": "field_dropdown",
          "name": "OP",
          "options": [
            [Blockly.Msg.MATH_ROUND_OPERATOR_ROUND, 'ROUND'],
            [Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDUP, 'ROUNDUP'],
            [Blockly.Msg.MATH_ROUND_OPERATOR_ROUNDDOWN, 'ROUNDDOWN']
          ]
        },
        {
          "type": "input_value",
          "name": "NUM",
          "check": "Number"
        }
      ],
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_ROUND_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_ROUND_HELPURL
    });
  }
};

Blockly.Blocks['math_on_list'] = {
  /**
   * Block for evaluating a list of numbers to return sum, average, min, max,
   * etc.  Some functions also work on text (min, max, mode, median).
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.MATH_ONLIST_OPERATOR_SUM, 'SUM'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_MIN, 'MIN'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_MAX, 'MAX'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_AVERAGE, 'AVERAGE'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_MEDIAN, 'MEDIAN'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_MODE, 'MODE'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_STD_DEV, 'STD_DEV'],
         [Blockly.Msg.MATH_ONLIST_OPERATOR_RANDOM, 'RANDOM']];
    // Assign 'this' to a variable for use in the closures below.
    var thisBlock = this;
    this.setHelpUrl(Blockly.Msg.MATH_ONLIST_HELPURL);
    this.setColour(Blockly.Blocks.math.HUE);
    this.setOutput(true, 'Number');
    var dropdown = new Blockly.FieldDropdown(OPERATORS, function(newOp) {
      thisBlock.updateType_(newOp);
    });
    this.appendValueInput('LIST')
        .setCheck('Array')
        .appendField(dropdown, 'OP');
    this.setTooltip(function() {
      var mode = thisBlock.getFieldValue('OP');
      var TOOLTIPS = {
        'SUM': Blockly.Msg.MATH_ONLIST_TOOLTIP_SUM,
        'MIN': Blockly.Msg.MATH_ONLIST_TOOLTIP_MIN,
        'MAX': Blockly.Msg.MATH_ONLIST_TOOLTIP_MAX,
        'AVERAGE': Blockly.Msg.MATH_ONLIST_TOOLTIP_AVERAGE,
        'MEDIAN': Blockly.Msg.MATH_ONLIST_TOOLTIP_MEDIAN,
        'MODE': Blockly.Msg.MATH_ONLIST_TOOLTIP_MODE,
        'STD_DEV': Blockly.Msg.MATH_ONLIST_TOOLTIP_STD_DEV,
        'RANDOM': Blockly.Msg.MATH_ONLIST_TOOLTIP_RANDOM
      };
      return TOOLTIPS[mode];
    });
  },
  /**
   * Modify this block to have the correct output type.
   * @param {string} newOp Either 'MODE' or some op than returns a number.
   * @private
   * @this Blockly.Block
   */
  updateType_: function(newOp) {
    if (newOp == 'MODE') {
      this.outputConnection.setCheck('Array');
    } else {
      this.outputConnection.setCheck('Number');
    }
  },
  /**
   * Create XML to represent the output type.
   * @return {Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('op', this.getFieldValue('OP'));
    return container;
  },
  /**
   * Parse XML to restore the output type.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.updateType_(xmlElement.getAttribute('op'));
  }
};

Blockly.Blocks['math_modulo'] = {
  /**
   * Block for remainder of a division.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.MATH_MODULO_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "DIVIDEND",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "DIVISOR",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_MODULO_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_MODULO_HELPURL
    });
  }
};

Blockly.Blocks['math_constrain'] = {
  /**
   * Block for constraining a number between two limits.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.MATH_CONSTRAIN_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "LOW",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "HIGH",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_CONSTRAIN_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_CONSTRAIN_HELPURL
    });
  }
};

Blockly.Blocks['math_random_int'] = {
  /**
   * Block for random integer between [X] and [Y].
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.MATH_RANDOM_INT_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "FROM",
          "check": "Number"
        },
        {
          "type": "input_value",
          "name": "TO",
          "check": "Number"
        }
      ],
      "inputsInline": true,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_RANDOM_INT_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_RANDOM_INT_HELPURL
    });
  }
};

Blockly.Blocks['math_random_float'] = {
  /**
   * Block for random fraction between 0 and 1.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.MATH_RANDOM_FLOAT_TITLE_RANDOM,
      "output": "Number",
      "colour": Blockly.Blocks.math.HUE,
      "tooltip": Blockly.Msg.MATH_RANDOM_FLOAT_TOOLTIP,
      "helpUrl": Blockly.Msg.MATH_RANDOM_FLOAT_HELPURL
    });
  }
};
/*
 * Whitecat Blocky Environment, MQTT blocks
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

goog.provide('Blockly.Blocks.MQTT');

goog.require('Blockly.Blocks');

Blockly.Blocks.MQTT.HUE = 20;

Blockly.Blocks['mqtt_publish'] = {
	module: "mqtt",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.MQTT_PUBLISH);
		this.appendValueInput("PAYLOAD")
			.setCheck(null);
		this.appendValueInput("TOPIC")
			.setCheck(null)
			.appendField(Blockly.Msg.MQTT_TO_TOPIC);
		this.appendDummyInput()
			.appendField(Blockly.Msg.MQTT_QOS)
			.appendField(new Blockly.FieldDropdown([
				["QOS0", "0"],
				["QOS1", "1"],
				["QOS2", "2"]
			]), "QOS");
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.MQTT.HUE);
		this.setTooltip('');
	},

	mutationToDom: function() {
		var container = document.createElement('mutation');

		container.setAttribute('clientid', this.clientid);
		container.setAttribute('host', this.host);
		container.setAttribute("port", this.port);
		container.setAttribute("secure", this.secure);
		container.setAttribute("username", this.username);
		container.setAttribute("password", this.password);

		return container;
	},

	domToMutation: function(xmlElement) {
		this.clientid = xmlElement.getAttribute('clientid');
		this.host = xmlElement.getAttribute("host");
		this.port = xmlElement.getAttribute("port");
		this.secure = xmlElement.getAttribute("secure");
		this.username = xmlElement.getAttribute("username");
		this.password = xmlElement.getAttribute("password");

		this.updateShape_();
	},

	updateShape_: function() {
		this.configureMQTT(this);
	},

	configureMQTT: function(instance) {
		instance.workspace.configureMQTT({
			"clientid": instance.clientid,
			"host": instance.host,
			"port": instance.port,
			"secure": instance.secure,
			"username": instance.username,
			"password": instance.password,
		});
	},
};

Blockly.Blocks['mqtt_subscribe'] = {
	module: "mqtt",
	init: function() {
		this.appendDummyInput()
			.appendField(Blockly.Msg.MQTT_SUBSCRIBE);
		this.appendValueInput("TOPIC")
			.setCheck(null);
		this.appendDummyInput()
			.appendField(Blockly.Msg.MQTT_QOS)
			.appendField(new Blockly.FieldDropdown([
				["QOS0", "0"],
				["QOS1", "1"],
				["QOS2", "2"]
			]), "QOS")
			.appendField(Blockly.Msg.PROCEDURES_BEFORE_PARAMS + " length, payload");

		this.appendStatementInput("DO")
			.setCheck(null);
		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(230);
		this.setTooltip('');
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setColour(Blockly.Blocks.MQTT.HUE);
		this.setTooltip('');
	},
	onchange: function(e) {
		if (!this.workspace.isDragging || this.workspace.isDragging()) {
			return;
		}

		var uses = 0;
		var blocks = this.workspace.getTopBlocks(true);
		for (var x = 0, block; block = blocks[x]; x++) {
			if ((Blockly.Lua.valueToCode(blocks[x], 'TOPIC', Blockly.Lua.ORDER_NONE) == Blockly.Lua.valueToCode(this, 'TOPIC', Blockly.Lua.ORDER_NONE)) && (blocks[x].type == this.type)) {
				uses++;
			}
		}

		if (uses > 1) {
			this.setWarningText(Blockly.Msg.WARNING_EVENTS_CAN_ONLY_PROCESSED_IN_ONE_EVENT_BLOCK);
			if (!this.isInFlyout && !this.getInheritedDisabled()) {
				this.setDisabled(true);
			}
		} else {
			this.setWarningText(null);
			if (!this.isInFlyout) {
				this.setDisabled(false);
			}
		}
	},
	section: function() {
		return 'default';
	},

	configureMQTT: Blockly.Blocks['mqtt_publish'].configureMQTT,
	mutationToDom: Blockly.Blocks['mqtt_publish'].mutationToDom,
	domToMutation: Blockly.Blocks['mqtt_publish'].domToMutation,
	updateShape_: Blockly.Blocks['mqtt_publish'].updateShape_,
	customContextMenu: function(options) {
		if (!this.isCollapsed()) {
			// Optin for create port getter
			var option = {
				enabled: true
			};
			var name = "length";
			option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
			var xmlField = goog.dom.createDom('field', null, name);
			xmlField.setAttribute('name', 'VAR');
			var xmlBlock = goog.dom.createDom('block', null, xmlField);
			xmlBlock.setAttribute('type', 'variables_get');
			option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
			options.push(option);

			// Optin for create payload getter
			var option = {
				enabled: true
			};
			var name = "payload";
			option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
			var xmlField = goog.dom.createDom('field', null, name);
			xmlField.setAttribute('name', 'VAR');
			var xmlBlock = goog.dom.createDom('block', null, xmlField);
			xmlBlock.setAttribute('type', 'variables_get');
			option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
			options.push(option);
		}
	},
};
/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Procedure blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.procedures');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.procedures.HUE = 290;

Blockly.Blocks['procedures_defnoreturn'] = {
  /**
   * Block for defining a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    var nameField = new Blockly.FieldTextInput('',
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
        .appendField(Blockly.Msg.PROCEDURES_DEFNORETURN_TITLE)
        .appendField(nameField, 'NAME')
        .appendField('', 'PARAMS');
    this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
    if ((this.workspace.options.comments ||
         (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
        Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT) {
      this.setCommentText(Blockly.Msg.PROCEDURES_DEFNORETURN_COMMENT);
    }
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFNORETURN_TOOLTIP);
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFNORETURN_HELPURL);
    this.arguments_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  /**
   * Add or remove the statement block from this function definition.
   * @param {boolean} hasStatements True if a statement block is needed.
   * @this Blockly.Block
   */
  setStatements_: function(hasStatements) {
    if (this.hasStatements_ === hasStatements) {
      return;
    }
    if (hasStatements) {
      this.appendStatementInput('STACK')
          .appendField(Blockly.Msg.PROCEDURES_DEFNORETURN_DO);
      if (this.getInput('RETURN')) {
        this.moveInputBefore('STACK', 'RETURN');
      }
    } else {
      this.removeInput('STACK', true);
    }
    this.hasStatements_ = hasStatements;
  },
  /**
   * Update the display of parameters for this procedure definition block.
   * Display a warning if there are duplicately named parameters.
   * @private
   * @this Blockly.Block
   */
  updateParams_: function() {
    // Check for duplicated arguments.
    var badArg = false;
    var hash = {};
    for (var i = 0; i < this.arguments_.length; i++) {
      if (hash['arg_' + this.arguments_[i].toLowerCase()]) {
        badArg = true;
        break;
      }
      hash['arg_' + this.arguments_[i].toLowerCase()] = true;
    }
    if (badArg) {
      this.setWarningText(Blockly.Msg.PROCEDURES_DEF_DUPLICATE_WARNING);
    } else {
      this.setWarningText(null);
    }
    // Merge the arguments into a human-readable list.
    var paramString = '';
    if (this.arguments_.length) {
      paramString = Blockly.Msg.PROCEDURES_BEFORE_PARAMS +
          ' ' + this.arguments_.join(', ');
    }
    // The params field is deterministic based on the mutation,
    // no need to fire a change event.
    Blockly.Events.disable();
    try {
      this.setFieldValue(paramString, 'PARAMS');
    } finally {
      Blockly.Events.enable();
    }
  },
  /**
   * Create XML to represent the argument inputs.
   * @param {=boolean} opt_paramIds If true include the IDs of the parameter
   *     quarks.  Used by Blockly.Procedures.mutateCallers for reconnection.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function(opt_paramIds) {
    var container = document.createElement('mutation');
    if (opt_paramIds) {
      container.setAttribute('name', this.getFieldValue('NAME'));
    }
    for (var i = 0; i < this.arguments_.length; i++) {
      var parameter = document.createElement('arg');
      parameter.setAttribute('name', this.arguments_[i]);
      if (opt_paramIds && this.paramIds_) {
        parameter.setAttribute('paramId', this.paramIds_[i]);
      }
      container.appendChild(parameter);
    }

    // Save whether the statement input is visible.
    if (!this.hasStatements_) {
      container.setAttribute('statements', 'false');
    }
    return container;
  },
  /**
   * Parse XML to restore the argument inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.arguments_ = [];
    for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        this.arguments_.push(childNode.getAttribute('name'));
      }
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);

    // Show or hide the statement input.
    this.setStatements_(xmlElement.getAttribute('statements') !== 'false');
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('procedures_mutatorcontainer');
    containerBlock.initSvg();

    // Check/uncheck the allow statement box.
    if (this.getInput('RETURN')) {
      containerBlock.setFieldValue(this.hasStatements_ ? 'TRUE' : 'FALSE',
                                   'STATEMENTS');
    } else {
      containerBlock.getInput('STATEMENT_INPUT').setVisible(false);
    }

    // Parameter list.
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.arguments_.length; i++) {
      var paramBlock = workspace.newBlock('procedures_mutatorarg');
      paramBlock.initSvg();
      paramBlock.setFieldValue(this.arguments_[i], 'NAME');
      // Store the old location.
      paramBlock.oldLocation = i;
      connection.connect(paramBlock.previousConnection);
      connection = paramBlock.nextConnection;
    }
    // Initialize procedure's callers with blank IDs.
    Blockly.Procedures.mutateCallers(this);
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    // Parameter list.
    this.arguments_ = [];
    this.paramIds_ = [];
    var paramBlock = containerBlock.getInputTargetBlock('STACK');
    while (paramBlock) {
      this.arguments_.push(paramBlock.getFieldValue('NAME'));
      this.paramIds_.push(paramBlock.id);
      paramBlock = paramBlock.nextConnection &&
          paramBlock.nextConnection.targetBlock();
    }
    this.updateParams_();
    Blockly.Procedures.mutateCallers(this);

    // Show/hide the statement input.
    var hasStatements = containerBlock.getFieldValue('STATEMENTS');
    if (hasStatements !== null) {
      hasStatements = hasStatements == 'TRUE';
      if (this.hasStatements_ != hasStatements) {
        if (hasStatements) {
          this.setStatements_(true);
          // Restore the stack, if one was saved.
          Blockly.Mutator.reconnect(this.statementConnection_, this, 'STACK');
          this.statementConnection_ = null;
        } else {
          // Save the stack, then disconnect it.
          var stackConnection = this.getInput('STACK').connection;
          this.statementConnection_ = stackConnection.targetConnection;
          if (this.statementConnection_) {
            var stackBlock = stackConnection.targetBlock();
            stackBlock.unplug();
            stackBlock.bumpNeighbours_();
          }
          this.setStatements_(false);
        }
      }
    }
  },
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - that it DOES NOT have a return value.
   * @this Blockly.Block
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, false];
  },
  /**
   * Return all variables referenced by this block.
   * @return {!Array.<string>} List of variable names.
   * @this Blockly.Block
   */
  getVars: function() {
    return this.arguments_;
  },
  /**
   * Notification that a variable is renaming.
   * If the name matches one of this block's variables, rename it.
   * @param {string} oldName Previous name of variable.
   * @param {string} newName Renamed variable.
   * @this Blockly.Block
   */
  renameVar: function(oldName, newName) {
    var change = false;
    for (var i = 0; i < this.arguments_.length; i++) {
      if (Blockly.Names.equals(oldName, this.arguments_[i])) {
        this.arguments_[i] = newName;
        change = true;
      }
    }
    if (change) {
      this.updateParams_();
      // Update the mutator's variables if the mutator is open.
      if (this.mutator.isVisible()) {
        var blocks = this.mutator.workspace_.getAllBlocks();
        for (var i = 0, block; block = blocks[i]; i++) {
          if (block.type == 'procedures_mutatorarg' &&
              Blockly.Names.equals(oldName, block.getFieldValue('NAME'))) {
            block.setFieldValue(newName, 'NAME');
          }
        }
      }
    }
  },
  /**
   * Add custom menu options to this block's context menu.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    // Add option to create caller.
    var option = {enabled: true};
    var name = this.getFieldValue('NAME');
    option.text = Blockly.Msg.PROCEDURES_CREATE_DO.replace('%1', name);
    var xmlMutation = goog.dom.createDom('mutation');
    xmlMutation.setAttribute('name', name);
    for (var i = 0; i < this.arguments_.length; i++) {
      var xmlArg = goog.dom.createDom('arg');
      xmlArg.setAttribute('name', this.arguments_[i]);
      xmlMutation.appendChild(xmlArg);
    }
    var xmlBlock = goog.dom.createDom('block', null, xmlMutation);
    xmlBlock.setAttribute('type', this.callType_);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);

    // Add options to create getters for each parameter.
    if (!this.isCollapsed()) {
      for (var i = 0; i < this.arguments_.length; i++) {
        var option = {enabled: true};
        var name = this.arguments_[i];
        option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
        var xmlField = goog.dom.createDom('field', null, name);
        xmlField.setAttribute('name', 'VAR');
        var xmlBlock = goog.dom.createDom('block', null, xmlField);
        xmlBlock.setAttribute('type', 'variables_get');
        option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
        options.push(option);
      }
    }
  },
  callType_: 'procedures_callnoreturn'
};

Blockly.Blocks['procedures_defreturn'] = {
  /**
   * Block for defining a procedure with a return value.
   * @this Blockly.Block
   */
  init: function() {
    var nameField = new Blockly.FieldTextInput('',
        Blockly.Procedures.rename);
    nameField.setSpellcheck(false);
    this.appendDummyInput()
        .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_TITLE)
        .appendField(nameField, 'NAME')
        .appendField('', 'PARAMS');
    this.appendValueInput('RETURN')
        .setAlign(Blockly.ALIGN_RIGHT)
        .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
    this.setMutator(new Blockly.Mutator(['procedures_mutatorarg']));
    if ((this.workspace.options.comments ||
         (this.workspace.options.parentWorkspace &&
          this.workspace.options.parentWorkspace.options.comments)) &&
        Blockly.Msg.PROCEDURES_DEFRETURN_COMMENT) {
      this.setCommentText(Blockly.Msg.PROCEDURES_DEFRETURN_COMMENT);
    }
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_DEFRETURN_TOOLTIP);
    this.setHelpUrl(Blockly.Msg.PROCEDURES_DEFRETURN_HELPURL);
    this.arguments_ = [];
    this.setStatements_(true);
    this.statementConnection_ = null;
  },
  setStatements_: Blockly.Blocks['procedures_defnoreturn'].setStatements_,
  updateParams_: Blockly.Blocks['procedures_defnoreturn'].updateParams_,
  mutationToDom: Blockly.Blocks['procedures_defnoreturn'].mutationToDom,
  domToMutation: Blockly.Blocks['procedures_defnoreturn'].domToMutation,
  decompose: Blockly.Blocks['procedures_defnoreturn'].decompose,
  compose: Blockly.Blocks['procedures_defnoreturn'].compose,
  /**
   * Return the signature of this procedure definition.
   * @return {!Array} Tuple containing three elements:
   *     - the name of the defined procedure,
   *     - a list of all its arguments,
   *     - that it DOES have a return value.
   * @this Blockly.Block
   */
  getProcedureDef: function() {
    return [this.getFieldValue('NAME'), this.arguments_, true];
  },
  getVars: Blockly.Blocks['procedures_defnoreturn'].getVars,
  renameVar: Blockly.Blocks['procedures_defnoreturn'].renameVar,
  customContextMenu: Blockly.Blocks['procedures_defnoreturn'].customContextMenu,
  callType_: 'procedures_callreturn'
};

Blockly.Blocks['procedures_mutatorcontainer'] = {
  /**
   * Mutator block for procedure container.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput()
        .appendField(Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TITLE);
    this.appendStatementInput('STACK');
    this.appendDummyInput('STATEMENT_INPUT')
        .appendField(Blockly.Msg.PROCEDURES_ALLOW_STATEMENTS)
        .appendField(new Blockly.FieldCheckbox('TRUE'), 'STATEMENTS');
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_MUTATORCONTAINER_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['procedures_mutatorarg'] = {
  /**
   * Mutator block for procedure argument.
   * @this Blockly.Block
   */
  init: function() {
    var field = new Blockly.FieldTextInput('x', this.validator_);
    this.appendDummyInput()
        .appendField(Blockly.Msg.PROCEDURES_MUTATORARG_TITLE)
        .appendField(field, 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_MUTATORARG_TOOLTIP);
    this.contextMenu = false;

    // Create the default variable when we drag the block in from the flyout.
    // Have to do this after installing the field on the block.
    field.onFinishEditing_ = this.createNewVar_;
    field.onFinishEditing_('x');
  },
  /**
   * Obtain a valid name for the procedure.
   * Merge runs of whitespace.  Strip leading and trailing whitespace.
   * Beyond this, all names are legal.
   * @param {string} newVar User-supplied name.
   * @return {?string} Valid name, or null if a name was not specified.
   * @private
   * @this Blockly.Block
   */
  validator_: function(newVar) {
    newVar = newVar.replace(/[\s\xa0]+/g, ' ').replace(/^ | $/g, '');
    return newVar || null;
  },
  /**
   * Called when focusing away from the text field.
   * Creates a new variable with this name.
   * @param {string} newText The new variable name.
   * @private
   * @this Blockly.FieldTextInput
   */
  createNewVar_: function(newText) {
    var source = this.sourceBlock_;
    if (source && source.workspace && source.workspace.options &&
        source.workspace.options.parentWorkspace) {
      source.workspace.options.parentWorkspace.createVariable(newText);
    }
  }
};

Blockly.Blocks['procedures_callnoreturn'] = {
  /**
   * Block for calling a procedure with no return value.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput('TOPROW')
        .appendField(this.id, 'NAME');
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.procedures.HUE);
    // Tooltip is set in renameProcedure.
    this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLNORETURN_HELPURL);
    this.arguments_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;
  },
  /**
   * Returns the name of the procedure this block calls.
   * @return {string} Procedure name.
   * @this Blockly.Block
   */
  getProcedureCall: function() {
    // The NAME field is guaranteed to exist, null will never be returned.
    return /** @type {string} */ (this.getFieldValue('NAME'));
  },
  /**
   * Notification that a procedure is renaming.
   * If the name matches this block's procedure, rename it.
   * @param {string} oldName Previous name of procedure.
   * @param {string} newName Renamed procedure.
   * @this Blockly.Block
   */
  renameProcedure: function(oldName, newName) {
    if (Blockly.Names.equals(oldName, this.getProcedureCall())) {
      this.setFieldValue(newName, 'NAME');
      this.setTooltip(
          (this.outputConnection ? Blockly.Msg.PROCEDURES_CALLRETURN_TOOLTIP :
           Blockly.Msg.PROCEDURES_CALLNORETURN_TOOLTIP)
          .replace('%1', newName));
    }
  },
  /**
   * Notification that the procedure's parameters have changed.
   * @param {!Array.<string>} paramNames New param names, e.g. ['x', 'y', 'z'].
   * @param {!Array.<string>} paramIds IDs of params (consistent for each
   *     parameter through the life of a mutator, regardless of param renaming),
   *     e.g. ['piua', 'f8b_', 'oi.o'].
   * @private
   * @this Blockly.Block
   */
  setProcedureParameters_: function(paramNames, paramIds) {
    // Data structures:
    // this.arguments = ['x', 'y']
    //     Existing param names.
    // this.quarkConnections_ {piua: null, f8b_: Blockly.Connection}
    //     Look-up of paramIds to connections plugged into the call block.
    // this.quarkIds_ = ['piua', 'f8b_']
    //     Existing param IDs.
    // Note that quarkConnections_ may include IDs that no longer exist, but
    // which might reappear if a param is reattached in the mutator.
    var defBlock = Blockly.Procedures.getDefinition(this.getProcedureCall(),
        this.workspace);
    var mutatorOpen = defBlock && defBlock.mutator &&
        defBlock.mutator.isVisible();
    if (!mutatorOpen) {
      this.quarkConnections_ = {};
      this.quarkIds_ = null;
    }
    if (!paramIds) {
      // Reset the quarks (a mutator is about to open).
      return;
    }
    if (goog.array.equals(this.arguments_, paramNames)) {
      // No change.
      this.quarkIds_ = paramIds;
      return;
    }
    if (paramIds.length != paramNames.length) {
      throw 'Error: paramNames and paramIds must be the same length.';
    }
    this.setCollapsed(false);
    if (!this.quarkIds_) {
      // Initialize tracking for this block.
      this.quarkConnections_ = {};
      if (paramNames.join('\n') == this.arguments_.join('\n')) {
        // No change to the parameters, allow quarkConnections_ to be
        // populated with the existing connections.
        this.quarkIds_ = paramIds;
      } else {
        this.quarkIds_ = [];
      }
    }
    // Switch off rendering while the block is rebuilt.
    var savedRendered = this.rendered;
    this.rendered = false;
    // Update the quarkConnections_ with existing connections.
    for (var i = 0; i < this.arguments_.length; i++) {
      var input = this.getInput('ARG' + i);
      if (input) {
        var connection = input.connection.targetConnection;
        this.quarkConnections_[this.quarkIds_[i]] = connection;
        if (mutatorOpen && connection &&
            paramIds.indexOf(this.quarkIds_[i]) == -1) {
          // This connection should no longer be attached to this block.
          connection.disconnect();
          connection.getSourceBlock().bumpNeighbours_();
        }
      }
    }
    // Rebuild the block's arguments.
    this.arguments_ = [].concat(paramNames);
    this.updateShape_();
    this.quarkIds_ = paramIds;
    // Reconnect any child blocks.
    if (this.quarkIds_) {
      for (var i = 0; i < this.arguments_.length; i++) {
        var quarkId = this.quarkIds_[i];
        if (quarkId in this.quarkConnections_) {
          var connection = this.quarkConnections_[quarkId];
          if (!Blockly.Mutator.reconnect(connection, this, 'ARG' + i)) {
            // Block no longer exists or has been attached elsewhere.
            delete this.quarkConnections_[quarkId];
          }
        }
      }
    }
    // Restore rendering and show the changes.
    this.rendered = savedRendered;
    if (this.rendered) {
      this.render();
    }
  },
  /**
   * Modify this block to have the correct number of arguments.
   * @private
   * @this Blockly.Block
   */
  updateShape_: function() {
    for (var i = 0; i < this.arguments_.length; i++) {
      var field = this.getField('ARGNAME' + i);
      if (field) {
        // Ensure argument name is up to date.
        // The argument name field is deterministic based on the mutation,
        // no need to fire a change event.
        Blockly.Events.disable();
        try {
          field.setValue(this.arguments_[i]);
        } finally {
          Blockly.Events.enable();
        }
      } else {
        // Add new input.
        field = new Blockly.FieldLabel(this.arguments_[i]);
        var input = this.appendValueInput('ARG' + i)
            .setAlign(Blockly.ALIGN_RIGHT)
            .appendField(field, 'ARGNAME' + i);
        input.init();
      }
    }
    // Remove deleted inputs.
    while (this.getInput('ARG' + i)) {
      this.removeInput('ARG' + i);
      i++;
    }
    // Add 'with:' if there are parameters, remove otherwise.
    var topRow = this.getInput('TOPROW');
    if (topRow) {
      if (this.arguments_.length) {
        if (!this.getField('WITH')) {
          topRow.appendField(Blockly.Msg.PROCEDURES_CALL_BEFORE_PARAMS, 'WITH');
          topRow.init();
        }
      } else {
        if (this.getField('WITH')) {
          topRow.removeField('WITH');
        }
      }
    }
  },
  /**
   * Create XML to represent the (non-editable) name and arguments.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('name', this.getProcedureCall());
    for (var i = 0; i < this.arguments_.length; i++) {
      var parameter = document.createElement('arg');
      parameter.setAttribute('name', this.arguments_[i]);
      container.appendChild(parameter);
    }
    return container;
  },
  /**
   * Parse XML to restore the (non-editable) name and parameters.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var name = xmlElement.getAttribute('name');
    this.renameProcedure(this.getProcedureCall(), name);
    var args = [];
    var paramIds = [];
    for (var i = 0, childNode; childNode = xmlElement.childNodes[i]; i++) {
      if (childNode.nodeName.toLowerCase() == 'arg') {
        args.push(childNode.getAttribute('name'));
        paramIds.push(childNode.getAttribute('paramId'));
      }
    }
    this.setProcedureParameters_(args, paramIds);
  },
  /**
   * Notification that a variable is renaming.
   * If the name matches one of this block's variables, rename it.
   * @param {string} oldName Previous name of variable.
   * @param {string} newName Renamed variable.
   * @this Blockly.Block
   */
  renameVar: function(oldName, newName) {
    for (var i = 0; i < this.arguments_.length; i++) {
      if (Blockly.Names.equals(oldName, this.arguments_[i])) {
        this.arguments_[i] = newName;
        this.getField('ARGNAME' + i).setValue(newName);
      }
    }
  },
  /**
   * Procedure calls cannot exist without the corresponding procedure
   * definition.  Enforce this link whenever an event is fired.
   * @this Blockly.Block
   */
  onchange: function(event) {
    if (!this.workspace || this.workspace.isFlyout) {
      // Block is deleted or is in a flyout.
      return;
    }
    if (event.type == Blockly.Events.CREATE &&
        event.ids.indexOf(this.id) != -1) {
      // Look for the case where a procedure call was created (usually through
      // paste) and there is no matching definition.  In this case, create
      // an empty definition block with the correct signature.
      var name = this.getProcedureCall();
      var def = Blockly.Procedures.getDefinition(name, this.workspace);
      if (def && (def.type != this.defType_ ||
          JSON.stringify(def.arguments_) != JSON.stringify(this.arguments_))) {
        // The signatures don't match.
        def = null;
      }
      if (!def) {
        Blockly.Events.setGroup(event.group);
        /**
         * Create matching definition block.
         * <xml>
         *   <block type="procedures_defreturn" x="10" y="20">
         *     <mutation name="test">
         *       <arg name="x"></arg>
         *     </mutation>
         *     <field name="NAME">test</field>
         *   </block>
         * </xml>
         */
        var xml = goog.dom.createDom('xml');
        var block = goog.dom.createDom('block');
        block.setAttribute('type', this.defType_);
        var xy = this.getRelativeToSurfaceXY();
        var x = xy.x + Blockly.SNAP_RADIUS * (this.RTL ? -1 : 1);
        var y = xy.y + Blockly.SNAP_RADIUS * 2;
        block.setAttribute('x', x);
        block.setAttribute('y', y);
        var mutation = this.mutationToDom();
        block.appendChild(mutation);
        var field = goog.dom.createDom('field');
        field.setAttribute('name', 'NAME');
        field.appendChild(document.createTextNode(this.getProcedureCall()));
        block.appendChild(field);
        xml.appendChild(block);
        Blockly.Xml.domToWorkspace(xml, this.workspace);
        Blockly.Events.setGroup(false);
      }
    } else if (event.type == Blockly.Events.DELETE) {
      // Look for the case where a procedure definition has been deleted,
      // leaving this block (a procedure call) orphaned.  In this case, delete
      // the orphan.
      var name = this.getProcedureCall();
      var def = Blockly.Procedures.getDefinition(name, this.workspace);
      if (!def) {
        Blockly.Events.setGroup(event.group);
        this.dispose(true, false);
        Blockly.Events.setGroup(false);
      }
    }
  },
  /**
   * Add menu option to find the definition block for this call.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    var option = {enabled: true};
    option.text = Blockly.Msg.PROCEDURES_HIGHLIGHT_DEF;
    var name = this.getProcedureCall();
    var workspace = this.workspace;
    option.callback = function() {
      var def = Blockly.Procedures.getDefinition(name, workspace);
      def && def.select();
    };
    options.push(option);
  },
  defType_: 'procedures_defnoreturn'
};

Blockly.Blocks['procedures_callreturn'] = {
  /**
   * Block for calling a procedure with a return value.
   * @this Blockly.Block
   */
  init: function() {
    this.appendDummyInput('TOPROW')
        .appendField('', 'NAME');
    this.setOutput(true);
    this.setColour(Blockly.Blocks.procedures.HUE);
    // Tooltip is set in domToMutation.
    this.setHelpUrl(Blockly.Msg.PROCEDURES_CALLRETURN_HELPURL);
    this.arguments_ = [];
    this.quarkConnections_ = {};
    this.quarkIds_ = null;
  },
  getProcedureCall: Blockly.Blocks['procedures_callnoreturn'].getProcedureCall,
  renameProcedure: Blockly.Blocks['procedures_callnoreturn'].renameProcedure,
  setProcedureParameters_:
      Blockly.Blocks['procedures_callnoreturn'].setProcedureParameters_,
  updateShape_: Blockly.Blocks['procedures_callnoreturn'].updateShape_,
  mutationToDom: Blockly.Blocks['procedures_callnoreturn'].mutationToDom,
  domToMutation: Blockly.Blocks['procedures_callnoreturn'].domToMutation,
  renameVar: Blockly.Blocks['procedures_callnoreturn'].renameVar,
  onchange: Blockly.Blocks['procedures_callnoreturn'].onchange,
  customContextMenu:
      Blockly.Blocks['procedures_callnoreturn'].customContextMenu,
  defType_: 'procedures_defreturn'
};

Blockly.Blocks['procedures_ifreturn'] = {
  /**
   * Block for conditionally returning a value from a procedure.
   * @this Blockly.Block
   */
  init: function() {
    this.appendValueInput('CONDITION')
        .setCheck('Boolean')
        .appendField(Blockly.Msg.CONTROLS_IF_MSG_IF);
    this.appendValueInput('VALUE')
        .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
    this.setInputsInline(true);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setColour(Blockly.Blocks.procedures.HUE);
    this.setTooltip(Blockly.Msg.PROCEDURES_IFRETURN_TOOLTIP);
    this.setHelpUrl(Blockly.Msg.PROCEDURES_IFRETURN_HELPURL);
    this.hasReturnValue_ = true;
  },
  /**
   * Create XML to represent whether this block has a return value.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('value', Number(this.hasReturnValue_));
    return container;
  },
  /**
   * Parse XML to restore whether this block has a return value.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var value = xmlElement.getAttribute('value');
    this.hasReturnValue_ = (value == 1);
    if (!this.hasReturnValue_) {
      this.removeInput('VALUE');
      this.appendDummyInput('VALUE')
        .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
    }
  },
  /**
   * Called whenever anything on the workspace changes.
   * Add warning if this flow block is not nested inside a loop.
   * @param {!Blockly.Events.Abstract} e Change event.
   * @this Blockly.Block
   */
  onchange: function(e) {
    if (!this.workspace.isDragging || this.workspace.isDragging()) {
      return;  // Don't change state at the start of a drag.
    }
    var legal = false;
    // Is the block nested in a procedure?
    var block = this;
    do {
      if (this.FUNCTION_TYPES.indexOf(block.type) != -1) {
        legal = true;
        break;
      }
      block = block.getSurroundParent();
    } while (block);
    if (legal) {
      // If needed, toggle whether this block has a return value.
      if (block.type == 'procedures_defnoreturn' && this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendDummyInput('VALUE')
            .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
        this.hasReturnValue_ = false;
      } else if (block.type == 'procedures_defreturn' &&
                 !this.hasReturnValue_) {
        this.removeInput('VALUE');
        this.appendValueInput('VALUE')
            .appendField(Blockly.Msg.PROCEDURES_DEFRETURN_RETURN);
        this.hasReturnValue_ = true;
      }
      this.setWarningText(null);
      if (!this.isInFlyout) {
        this.setDisabled(false);
      }
    } else {
      this.setWarningText(Blockly.Msg.PROCEDURES_IFRETURN_WARNING);
      if (!this.isInFlyout && !this.getInheritedDisabled()) {
        this.setDisabled(true);
      }
    }
  },
  /**
   * List of block types that are functions and thus do not need warnings.
   * To add a new function type add this to your code:
   * Blockly.Blocks['procedures_ifreturn'].FUNCTION_TYPES.push('custom_func');
   */
  FUNCTION_TYPES: ['procedures_defnoreturn', 'procedures_defreturn']
};
/*
 * Whitecat Blocky Environment, sensor blocks
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

goog.provide('Blockly.Blocks.sensor');

goog.require('Blockly.Blocks');

Blockly.Blocks.sensor.HUE = 290;

Blockly.Blocks['sensor_attach'] = {
	module: "sensor",
	createSensorIfNeeded: function(instance) {
		if (typeof instance.workspace.sensors == "undefined") return -1;

		// Get index for sensor
		var index = instance.workspace.sensorIndexOf(instance.name);

		// Sensor must be created
		if (index == -1) {
			instance.workspace.createSensor(
				undefined,
				Blockly.Sensors.createSetupStructure(false, instance)
			);

			//Get index for sensor
			index = instance.workspace.sensorIndexOf(instance.name);
		}

		return index;
	},

	init: function() {
		this.setColour(Blockly.Blocks.sensor.HUE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.SENSOR_ATTACH, "NAME");

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);

		this.setTooltip(Blockly.Msg.SENSOR_ATTACH_TOOLTIP);
	},

	mutationToDom: function() {
		var container = document.createElement('mutation');

		container.setAttribute('interface', this.interface);
		container.setAttribute('name', this.name);
		container.setAttribute('sid', this.sid);
		
		for(var i=0; i < this.interface.split(",").length; i++) {
			container.setAttribute('interface'+i+'_unit', this['interface'+i+'_unit']);
			container.setAttribute('interface'+i+'_subunit', this['interface'+i+'_subunit']);
			container.setAttribute('interface'+i+'_device', this['interface'+i+'_device']);
		}
				
		return container;
	},

	domToMutation: function(xmlElement) {
		this.interface = xmlElement.getAttribute('interface');
		this.name = xmlElement.getAttribute('name');
		this.sid = xmlElement.getAttribute('sid');
			
		for(var i=0; i < this.interface.split(",").length; i++) {
			this['interface'+i+'_unit'] = xmlElement.getAttribute('interface'+i+'_unit');
			this['interface'+i+'_subunit'] = xmlElement.getAttribute('interface'+i+'_subunit');
			this['interface'+i+'_device'] = xmlElement.getAttribute('interface'+i+'_device');
		}
		
		this.updateShape_();
	},

	updateShape_: function() {
		this.createSensorIfNeeded(this);
		
		var label = this.sid;
		if (typeof Blockly.Msg[label] != "undefined") {
			label = Blockly.Msg[label];
		}
		
		this.getField("NAME").setText(Blockly.Msg.SENSOR_ATTACH.replace("%1", this.name).replace("%2", label));
	},

	customContextMenu: function(options) {
		var thisInstance = this;

		options.push({
			enabled: true,
			text: Blockly.Msg.EDIT_SENSOR,
			callback: function() {
				Blockly.Sensors.edit(thisInstance);
				return false;
			}
		});

		options.push({
			enabled: true,
			text: Blockly.Msg.REMOVE_SENSOR,
			callback: function() {
				Blockly.Sensors.remove(thisInstance);
				return false;
			}
		});
	},
};

Blockly.Blocks['sensor_read'] = {
	module: "sensor",
	createSensorIfNeeded: Blockly.Blocks['sensor_attach'].createSensorIfNeeded,

	init: function() {
		this.setColour(Blockly.Blocks.sensor.HUE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.SENSOR_READ1)
			.appendField(new Blockly.FieldDropdown([
				['magnitude', '']
			]), "PROVIDES")
			.appendField(Blockly.Msg.SENSOR_READ2, "NAME");
		this.setOutput(true);
		this.setTooltip(Blockly.Msg.SENSOR_READ_TOOLTIP);
	},

	mutationToDom: Blockly.Blocks['sensor_attach'].mutationToDom,
	domToMutation: Blockly.Blocks['sensor_attach'].domToMutation,

	updateShape_: function() {
		var index = this.createSensorIfNeeded(this);
		if (index == -1) return;

		// Build provides option list
		var provides = [];
		this.workspace.sensors.provides[index].forEach(function(item, index) {
			provides.push([item.id, item.id]);
		});

		var label = this.sid;
		if (typeof Blockly.Msg[label] != "undefined") {
			label = Blockly.Msg[label];
		}

		this.getField("NAME").setText(Blockly.Msg.SENSOR_READ2.replace("%1", this.name).replace("%2", label));
		this.getField("PROVIDES").menuGenerator_ = provides;
	},

	customContextMenu: Blockly.Blocks['sensor_attach'].customContextMenu,

	hasWatcher: true,
};

Blockly.Blocks['sensor_set'] = {
	module: "sensor",
	createSensorIfNeeded: Blockly.Blocks['sensor_attach'].createSensorIfNeeded,

	/**
	 * Mutator block for container.
	 * @this Blockly.Block
	 */
	init: function() {
		this.setColour(Blockly.Blocks.sensor.HUE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.SENSOR_SET1)
			.appendField(new Blockly.FieldDropdown([
				['', '']
			]), "PROPERTIES")
			.appendField(Blockly.Msg.SENSOR_SET2);

		this.appendValueInput("VALUE");

		this.appendDummyInput()
			.appendField("", "NAME");

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);

		this.setTooltip(Blockly.Msg.SENSOR_SET_TOOLTIP);
	},
	mutationToDom: Blockly.Blocks['sensor_attach'].mutationToDom,
	domToMutation: Blockly.Blocks['sensor_attach'].domToMutation,

	updateShape_: function() {
		var index = this.createSensorIfNeeded(this);
		if (index == -1) return;

		// Build properties option list
		var properties = [];
		this.workspace.sensors.properties[index].forEach(function(item, index) {
			properties.push([item.id, item.id]);
		});

		var label = this.sid;
		if (typeof Blockly.Msg[label] != "undefined") {
			label = Blockly.Msg[label];
		}

		this.getField("NAME").setText(Blockly.Msg.SENSOR_SET3.replace("%1", this.name).replace("%2", label));
		this.getField("PROPERTIES").menuGenerator_ = properties;
	},

	customContextMenu: Blockly.Blocks['sensor_attach'].customContextMenu,
};

Blockly.Blocks['sensor_when'] = {
	module: "sensor",
	createSensorIfNeeded: Blockly.Blocks['sensor_attach'].createSensorIfNeeded,

	init: function() {
		this.setColour(Blockly.Blocks.sensor.HUE);

		this.appendDummyInput()
			.appendField(Blockly.Msg.SENSOR_WHEN1)
			.appendField(new Blockly.FieldDropdown([
				['magnitude', '']
			]), "PROVIDES")
			.appendField(Blockly.Msg.SENSOR_WHEN2, "NAME");
			
		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);
			
		this.setPreviousStatement(false, null);
		this.setNextStatement(false, null);
		this.setTooltip(Blockly.Msg.SENSOR_WHEN_TOOLTIP);		
	},

	mutationToDom: Blockly.Blocks['sensor_attach'].mutationToDom,
	domToMutation: Blockly.Blocks['sensor_attach'].domToMutation,

	updateShape_: function() {
		var index = this.createSensorIfNeeded(this);
		if (index == -1) return;

		// Build provides option list
		var provides = [];
		this.workspace.sensors.provides[index].forEach(function(item, index) {
			provides.push([item.id, item.id]);
		});

		var label = this.sid;
		if (typeof Blockly.Msg[label] != "undefined") {
			label = Blockly.Msg[label];
		}

		this.getField("NAME").setText(Blockly.Msg.SENSOR_WHEN2.replace("%1", this.name).replace("%2", label));
		this.getField("PROVIDES").menuGenerator_ = provides;
	},

	hasWatcher: false,
	customContextMenu: function(options) {
		var thisInstance = this;
	
		options.push({
			enabled: true,
			text: Blockly.Msg.EDIT_SENSOR,
			callback: function() {
				Blockly.Sensors.edit(thisInstance);
				return false;
			}
		});

		options.push({
			enabled: true,
			text: Blockly.Msg.REMOVE_SENSOR,
			callback: function() {
				Blockly.Sensors.remove(thisInstance);
				return false;
			}
		});

		if (!this.isCollapsed()) {
			// Optin for create magnitude getter
			var option = {
				enabled: true
			};
			var name = "value";
			option.text = Blockly.Msg.VARIABLES_SET_CREATE_GET.replace('%1', name);
			var xmlField = goog.dom.createDom('field', null, name);
			xmlField.setAttribute('name', 'VAR');
			var xmlBlock = goog.dom.createDom('block', null, xmlField);
			xmlBlock.setAttribute('type', 'variables_get');
			option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
			options.push(option);
		}
	},
};
/*
 * Whitecat Blocky Environment, servo block definition
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

goog.provide('Blockly.Blocks.servo');
goog.provide('Blockly.Blocks.actuators');

goog.require('Blockly.Blocks');
goog.require('Blockly.Blocks.io.helper');

Blockly.Blocks.actuators.HUE = 260;

Blockly.Blocks['servo_move'] = {
	module: "servo",
	init: function() {
		var thisInstance = this;

		var pins = Blockly.Blocks.io.helper.getPwmPins();

		this.appendDummyInput()
			.appendField(Blockly.Msg.SERVO_MOVE);

		this.appendValueInput("PIN")
			.setCheck('Number');


		this.appendValueInput("VALUE")
			.setCheck('Number');

		this.appendDummyInput()
			.appendField(Blockly.Msg.SERVO_MOVE_DEGREES);

		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.actuators.HUE);
		this.setTooltip(Blockly.Msg.SERVO_MOVE_TOOLTIP);

		this.updateBoardAtFieldChange("NUM");
	},

	mutationToDom: function() {
		var container = document.createElement('mutation');

		if (typeof this.value == "undefined") {
			this.value = -1;
		}

		container.setAttribute('value', this.value);

		return container;
	},

	domToMutation: function(xmlElement) {
		this.value = xmlElement.getAttribute('value');
	},
};
/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Text blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.texts');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.texts.HUE = 160;

Blockly.Blocks['text'] = {
  /**
   * Block for text value.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.TEXT_TEXT_HELPURL);
    this.setColour(Blockly.Blocks.texts.HUE);
    this.appendDummyInput()
        .appendField(this.newQuote_(true))
        .appendField(new Blockly.FieldTextInput(''), 'TEXT')
        .appendField(this.newQuote_(false));
    this.setOutput(true, 'String');
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    // Text block is trivial.  Use tooltip of parent block if it exists.
    this.setTooltip(function() {
      var parent = thisBlock.getParent();
      return (parent && parent.getInputsInline() && parent.tooltip) ||
          Blockly.Msg.TEXT_TEXT_TOOLTIP;
    });
  },
  /**
   * Create an image of an open or closed quote.
   * @param {boolean} open True if open quote, false if closed.
   * @return {!Blockly.FieldImage} The field image of the quote.
   * @this Blockly.Block
   * @private
   */
  newQuote_: function(open) {
    if (open == this.RTL) {
      var file = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAqUlEQVQI1z3KvUpCcRiA8ef9E4JNHhI0aFEacm1o0BsI0Slx8wa8gLauoDnoBhq7DcfWhggONDmJJgqCPA7neJ7p934EOOKOnM8Q7PDElo/4x4lFb2DmuUjcUzS3URnGib9qaPNbuXvBO3sGPHJDRG6fGVdMSeWDP2q99FQdFrz26Gu5Tq7dFMzUvbXy8KXeAj57cOklgA+u1B5AoslLtGIHQMaCVnwDnADZIFIrXsoXrgAAAABJRU5ErkJggg==';
    } else {
      var file = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAwAAAAKCAQAAAAqJXdxAAAAn0lEQVQI1z3OMa5BURSF4f/cQhAKjUQhuQmFNwGJEUi0RKN5rU7FHKhpjEH3TEMtkdBSCY1EIv8r7nFX9e29V7EBAOvu7RPjwmWGH/VuF8CyN9/OAdvqIXYLvtRaNjx9mMTDyo+NjAN1HNcl9ZQ5oQMM3dgDUqDo1l8DzvwmtZN7mnD+PkmLa+4mhrxVA9fRowBWmVBhFy5gYEjKMfz9AylsaRRgGzvZAAAAAElFTkSuQmCC';
    }
    return new Blockly.FieldImage(file, 12, 12, '"');
  }
};

Blockly.Blocks['text_join'] = {
  /**
   * Block for creating a string made up of any number of elements of any type.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.TEXT_JOIN_HELPURL);
    this.setColour(Blockly.Blocks.texts.HUE);
    this.itemCount_ = 2;
    this.updateShape_();
    this.setOutput(true, 'String');
    this.setMutator(new Blockly.Mutator(['text_create_join_item']));
    this.setTooltip(Blockly.Msg.TEXT_JOIN_TOOLTIP);
  },
  /**
   * Create XML to represent number of text inputs.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('items', this.itemCount_);
    return container;
  },
  /**
   * Parse XML to restore the text inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.itemCount_ = parseInt(xmlElement.getAttribute('items'), 10);
    this.updateShape_();
  },
  /**
   * Populate the mutator's dialog with this block's components.
   * @param {!Blockly.Workspace} workspace Mutator's workspace.
   * @return {!Blockly.Block} Root block in mutator.
   * @this Blockly.Block
   */
  decompose: function(workspace) {
    var containerBlock = workspace.newBlock('text_create_join_container');
    containerBlock.initSvg();
    var connection = containerBlock.getInput('STACK').connection;
    for (var i = 0; i < this.itemCount_; i++) {
      var itemBlock = workspace.newBlock('text_create_join_item');
      itemBlock.initSvg();
      connection.connect(itemBlock.previousConnection);
      connection = itemBlock.nextConnection;
    }
    return containerBlock;
  },
  /**
   * Reconfigure this block based on the mutator dialog's components.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  compose: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    // Count number of inputs.
    var connections = [];
    while (itemBlock) {
      connections.push(itemBlock.valueConnection_);
      itemBlock = itemBlock.nextConnection &&
          itemBlock.nextConnection.targetBlock();
    }
    // Disconnect any children that don't belong.
    for (var i = 0; i < this.itemCount_; i++) {
      var connection = this.getInput('ADD' + i).connection.targetConnection;
      if (connection && connections.indexOf(connection) == -1) {
        connection.disconnect();
      }
    }
    this.itemCount_ = connections.length;
    this.updateShape_();
    // Reconnect any child blocks.
    for (var i = 0; i < this.itemCount_; i++) {
      Blockly.Mutator.reconnect(connections[i], this, 'ADD' + i);
    }
  },
  /**
   * Store pointers to any connected child blocks.
   * @param {!Blockly.Block} containerBlock Root block in mutator.
   * @this Blockly.Block
   */
  saveConnections: function(containerBlock) {
    var itemBlock = containerBlock.getInputTargetBlock('STACK');
    var i = 0;
    while (itemBlock) {
      var input = this.getInput('ADD' + i);
      itemBlock.valueConnection_ = input && input.connection.targetConnection;
      i++;
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
    if (this.itemCount_ && this.getInput('EMPTY')) {
      this.removeInput('EMPTY');
    } else if (!this.itemCount_ && !this.getInput('EMPTY')) {
      this.appendDummyInput('EMPTY')
          .appendField(this.newQuote_(true))
          .appendField(this.newQuote_(false));
    }
    // Add new inputs.
    for (var i = 0; i < this.itemCount_; i++) {
      if (!this.getInput('ADD' + i)) {
        var input = this.appendValueInput('ADD' + i);
        if (i == 0) {
          input.appendField(Blockly.Msg.TEXT_JOIN_TITLE_CREATEWITH);
        }
      }
    }
    // Remove deleted inputs.
    while (this.getInput('ADD' + i)) {
      this.removeInput('ADD' + i);
      i++;
    }
  },
  newQuote_: Blockly.Blocks['text'].newQuote_
};

Blockly.Blocks['text_create_join_container'] = {
  /**
   * Mutator block for container.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.texts.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.TEXT_CREATE_JOIN_TITLE_JOIN);
    this.appendStatementInput('STACK');
    this.setTooltip(Blockly.Msg.TEXT_CREATE_JOIN_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['text_create_join_item'] = {
  /**
   * Mutator block for add items.
   * @this Blockly.Block
   */
  init: function() {
    this.setColour(Blockly.Blocks.texts.HUE);
    this.appendDummyInput()
        .appendField(Blockly.Msg.TEXT_CREATE_JOIN_ITEM_TITLE_ITEM);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    this.setTooltip(Blockly.Msg.TEXT_CREATE_JOIN_ITEM_TOOLTIP);
    this.contextMenu = false;
  }
};

Blockly.Blocks['text_append'] = {
  /**
   * Block for appending to a variable in place.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.TEXT_APPEND_HELPURL);
    this.setColour(Blockly.Blocks.texts.HUE);
    this.appendValueInput('TEXT')
        .appendField(Blockly.Msg.TEXT_APPEND_TO)
        .appendField(new Blockly.FieldVariable(
        Blockly.Msg.TEXT_APPEND_VARIABLE), 'VAR')
        .appendField(Blockly.Msg.TEXT_APPEND_APPENDTEXT);
    this.setPreviousStatement(true);
    this.setNextStatement(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.TEXT_APPEND_TOOLTIP.replace('%1',
          thisBlock.getFieldValue('VAR'));
    });
  }
};

Blockly.Blocks['text_length'] = {
  /**
   * Block for string length.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.TEXT_LENGTH_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE",
          "check": ['String', 'Array']
        }
      ],
      "output": 'Number',
      "colour": Blockly.Blocks.texts.HUE,
      "tooltip": Blockly.Msg.TEXT_LENGTH_TOOLTIP,
      "helpUrl": Blockly.Msg.TEXT_LENGTH_HELPURL
    });
  }
};

Blockly.Blocks['text_isEmpty'] = {
  /**
   * Block for is the string null?
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.TEXT_ISEMPTY_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "VALUE",
          "check": ['String', 'Array']
        }
      ],
      "output": 'Boolean',
      "colour": Blockly.Blocks.texts.HUE,
      "tooltip": Blockly.Msg.TEXT_ISEMPTY_TOOLTIP,
      "helpUrl": Blockly.Msg.TEXT_ISEMPTY_HELPURL
    });
  }
};

Blockly.Blocks['text_indexOf'] = {
  /**
   * Block for finding a substring in the text.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.TEXT_INDEXOF_OPERATOR_FIRST, 'FIRST'],
         [Blockly.Msg.TEXT_INDEXOF_OPERATOR_LAST, 'LAST']];
    this.setHelpUrl(Blockly.Msg.TEXT_INDEXOF_HELPURL);
    this.setColour(Blockly.Blocks.texts.HUE);
    this.setOutput(true, 'Number');
    this.appendValueInput('VALUE')
        .setCheck('String')
        .appendField(Blockly.Msg.TEXT_INDEXOF_INPUT_INTEXT);
    this.appendValueInput('FIND')
        .setCheck('String')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'END');
    if (Blockly.Msg.TEXT_INDEXOF_TAIL) {
      this.appendDummyInput().appendField(Blockly.Msg.TEXT_INDEXOF_TAIL);
    }
    this.setInputsInline(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      return Blockly.Msg.TEXT_INDEXOF_TOOLTIP.replace('%1',
          thisBlock.workspace.options.oneBasedIndex ? '0' : '-1');
    });
  }
};

Blockly.Blocks['text_charAt'] = {
  /**
   * Block for getting a character from the string.
   * @this Blockly.Block
   */
  init: function() {
    this.WHERE_OPTIONS =
        [[Blockly.Msg.TEXT_CHARAT_FROM_START, 'FROM_START'],
         [Blockly.Msg.TEXT_CHARAT_FROM_END, 'FROM_END'],
         [Blockly.Msg.TEXT_CHARAT_FIRST, 'FIRST'],
         [Blockly.Msg.TEXT_CHARAT_LAST, 'LAST'],
         [Blockly.Msg.TEXT_CHARAT_RANDOM, 'RANDOM']];
    this.setHelpUrl(Blockly.Msg.TEXT_CHARAT_HELPURL);
    this.setColour(Blockly.Blocks.texts.HUE);
    this.setOutput(true, 'String');
    this.appendValueInput('VALUE')
        .setCheck('String')
        .appendField(Blockly.Msg.TEXT_CHARAT_INPUT_INTEXT);
    this.appendDummyInput('AT');
    this.setInputsInline(true);
    this.updateAt_(true);
    // Assign 'this' to a variable for use in the tooltip closure below.
    var thisBlock = this;
    this.setTooltip(function() {
      var where = thisBlock.getFieldValue('WHERE');
      var tooltip = Blockly.Msg.TEXT_CHARAT_TOOLTIP;
      if (where == 'FROM_START' || where == 'FROM_END') {
        var msg = (where == 'FROM_START') ?
            Blockly.Msg.LISTS_INDEX_FROM_START_TOOLTIP :
            Blockly.Msg.LISTS_INDEX_FROM_END_TOOLTIP;
        tooltip += '  ' + msg.replace('%1',
            thisBlock.workspace.options.oneBasedIndex ? '#1' : '#0');
      }
      return tooltip;
    });
  },
  /**
   * Create XML to represent whether there is an 'AT' input.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    var isAt = this.getInput('AT').type == Blockly.INPUT_VALUE;
    container.setAttribute('at', isAt);
    return container;
  },
  /**
   * Parse XML to restore the 'AT' input.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    // Note: Until January 2013 this block did not have mutations,
    // so 'at' defaults to true.
    var isAt = (xmlElement.getAttribute('at') != 'false');
    this.updateAt_(isAt);
  },
  /**
   * Create or delete an input for the numeric index.
   * @param {boolean} isAt True if the input should exist.
   * @private
   * @this Blockly.Block
   */
  updateAt_: function(isAt) {
    // Destroy old 'AT' and 'ORDINAL' inputs.
    this.removeInput('AT');
    this.removeInput('ORDINAL', true);
    // Create either a value 'AT' input or a dummy input.
    if (isAt) {
      this.appendValueInput('AT').setCheck('Number');
      if (Blockly.Msg.ORDINAL_NUMBER_SUFFIX) {
        this.appendDummyInput('ORDINAL')
            .appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX);
      }
    } else {
      this.appendDummyInput('AT');
    }
    if (Blockly.Msg.TEXT_CHARAT_TAIL) {
      this.removeInput('TAIL', true);
      this.appendDummyInput('TAIL')
          .appendField(Blockly.Msg.TEXT_CHARAT_TAIL);
    }
    var menu = new Blockly.FieldDropdown(this.WHERE_OPTIONS, function(value) {
      var newAt = (value == 'FROM_START') || (value == 'FROM_END');
      // The 'isAt' variable is available due to this function being a closure.
      if (newAt != isAt) {
        var block = this.sourceBlock_;
        block.updateAt_(newAt);
        // This menu has been destroyed and replaced.  Update the replacement.
        block.setFieldValue(value, 'WHERE');
        return null;
      }
      return undefined;
    });
    this.getInput('AT').appendField(menu, 'WHERE');
  }
};

Blockly.Blocks['text_getSubstring'] = {
  /**
   * Block for getting substring.
   * @this Blockly.Block
   */
  init: function() {
    this['WHERE_OPTIONS_1'] =
        [[Blockly.Msg.TEXT_GET_SUBSTRING_START_FROM_START, 'FROM_START'],
         [Blockly.Msg.TEXT_GET_SUBSTRING_START_FROM_END, 'FROM_END'],
         [Blockly.Msg.TEXT_GET_SUBSTRING_START_FIRST, 'FIRST']];
    this['WHERE_OPTIONS_2'] =
        [[Blockly.Msg.TEXT_GET_SUBSTRING_END_FROM_START, 'FROM_START'],
         [Blockly.Msg.TEXT_GET_SUBSTRING_END_FROM_END, 'FROM_END'],
         [Blockly.Msg.TEXT_GET_SUBSTRING_END_LAST, 'LAST']];
    this.setHelpUrl(Blockly.Msg.TEXT_GET_SUBSTRING_HELPURL);
    this.setColour(Blockly.Blocks.texts.HUE);
    this.appendValueInput('STRING')
        .setCheck('String')
        .appendField(Blockly.Msg.TEXT_GET_SUBSTRING_INPUT_IN_TEXT);
    this.appendDummyInput('AT1');
    this.appendDummyInput('AT2');
    if (Blockly.Msg.TEXT_GET_SUBSTRING_TAIL) {
      this.appendDummyInput('TAIL')
          .appendField(Blockly.Msg.TEXT_GET_SUBSTRING_TAIL);
    }
    this.setInputsInline(true);
    this.setOutput(true, 'String');
    this.updateAt_(1, true);
    this.updateAt_(2, true);
    this.setTooltip(Blockly.Msg.TEXT_GET_SUBSTRING_TOOLTIP);
  },
  /**
   * Create XML to represent whether there are 'AT' inputs.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    var isAt1 = this.getInput('AT1').type == Blockly.INPUT_VALUE;
    container.setAttribute('at1', isAt1);
    var isAt2 = this.getInput('AT2').type == Blockly.INPUT_VALUE;
    container.setAttribute('at2', isAt2);
    return container;
  },
  /**
   * Parse XML to restore the 'AT' inputs.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    var isAt1 = (xmlElement.getAttribute('at1') == 'true');
    var isAt2 = (xmlElement.getAttribute('at2') == 'true');
    this.updateAt_(1, isAt1);
    this.updateAt_(2, isAt2);
  },
  /**
   * Create or delete an input for a numeric index.
   * This block has two such inputs, independant of each other.
   * @param {number} n Specify first or second input (1 or 2).
   * @param {boolean} isAt True if the input should exist.
   * @private
   * @this Blockly.Block
   */
  updateAt_: function(n, isAt) {
    // Create or delete an input for the numeric index.
    // Destroy old 'AT' and 'ORDINAL' inputs.
    this.removeInput('AT' + n);
    this.removeInput('ORDINAL' + n, true);
    // Create either a value 'AT' input or a dummy input.
    if (isAt) {
      this.appendValueInput('AT' + n).setCheck('Number');
      if (Blockly.Msg.ORDINAL_NUMBER_SUFFIX) {
        this.appendDummyInput('ORDINAL' + n)
            .appendField(Blockly.Msg.ORDINAL_NUMBER_SUFFIX);
      }
    } else {
      this.appendDummyInput('AT' + n);
    }
    // Move tail, if present, to end of block.
    if (n == 2 && Blockly.Msg.TEXT_GET_SUBSTRING_TAIL) {
      this.removeInput('TAIL', true);
      this.appendDummyInput('TAIL')
          .appendField(Blockly.Msg.TEXT_GET_SUBSTRING_TAIL);
    }
    var menu = new Blockly.FieldDropdown(this['WHERE_OPTIONS_' + n],
        function(value) {
          var newAt = (value == 'FROM_START') || (value == 'FROM_END');
          // The 'isAt' variable is available due to this function being a
          // closure.
          if (newAt != isAt) {
            var block = this.sourceBlock_;
            block.updateAt_(n, newAt);
            // This menu has been destroyed and replaced.
            // Update the replacement.
            block.setFieldValue(value, 'WHERE' + n);
            return null;
          }
          return undefined;
        });

    this.getInput('AT' + n)
        .appendField(menu, 'WHERE' + n);
    if (n == 1) {
      this.moveInputBefore('AT1', 'AT2');
    }
  }
};

Blockly.Blocks['text_changeCase'] = {
  /**
   * Block for changing capitalization.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.TEXT_CHANGECASE_OPERATOR_UPPERCASE, 'UPPERCASE'],
         [Blockly.Msg.TEXT_CHANGECASE_OPERATOR_LOWERCASE, 'LOWERCASE'],
         [Blockly.Msg.TEXT_CHANGECASE_OPERATOR_TITLECASE, 'TITLECASE']];
    this.setHelpUrl(Blockly.Msg.TEXT_CHANGECASE_HELPURL);
    this.setColour(Blockly.Blocks.texts.HUE);
    this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'CASE');
    this.setOutput(true, 'String');
    this.setTooltip(Blockly.Msg.TEXT_CHANGECASE_TOOLTIP);
  }
};

Blockly.Blocks['text_trim'] = {
  /**
   * Block for trimming spaces.
   * @this Blockly.Block
   */
  init: function() {
    var OPERATORS =
        [[Blockly.Msg.TEXT_TRIM_OPERATOR_BOTH, 'BOTH'],
         [Blockly.Msg.TEXT_TRIM_OPERATOR_LEFT, 'LEFT'],
         [Blockly.Msg.TEXT_TRIM_OPERATOR_RIGHT, 'RIGHT']];
    this.setHelpUrl(Blockly.Msg.TEXT_TRIM_HELPURL);
    this.setColour(Blockly.Blocks.texts.HUE);
    this.appendValueInput('TEXT')
        .setCheck('String')
        .appendField(new Blockly.FieldDropdown(OPERATORS), 'MODE');
    this.setOutput(true, 'String');
    this.setTooltip(Blockly.Msg.TEXT_TRIM_TOOLTIP);
  }
};

Blockly.Blocks['text_print'] = {
  /**
   * Block for print statement.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.TEXT_PRINT_TITLE,
      "args0": [
        {
          "type": "input_value",
          "name": "TEXT"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.texts.HUE,
      "tooltip": Blockly.Msg.TEXT_PRINT_TOOLTIP,
      "helpUrl": Blockly.Msg.TEXT_PRINT_HELPURL
    });
  }
};

Blockly.Blocks['text_prompt_ext'] = {
  /**
   * Block for prompt function (external message).
   * @this Blockly.Block
   */
  init: function() {
    var TYPES =
        [[Blockly.Msg.TEXT_PROMPT_TYPE_TEXT, 'TEXT'],
         [Blockly.Msg.TEXT_PROMPT_TYPE_NUMBER, 'NUMBER']];
    this.setHelpUrl(Blockly.Msg.TEXT_PROMPT_HELPURL);
    this.setColour(Blockly.Blocks.texts.HUE);
    // Assign 'this' to a variable for use in the closures below.
    var thisBlock = this;
    var dropdown = new Blockly.FieldDropdown(TYPES, function(newOp) {
      thisBlock.updateType_(newOp);
    });
    this.appendValueInput('TEXT')
        .appendField(dropdown, 'TYPE');
    this.setOutput(true, 'String');
    this.setTooltip(function() {
      return (thisBlock.getFieldValue('TYPE') == 'TEXT') ?
          Blockly.Msg.TEXT_PROMPT_TOOLTIP_TEXT :
          Blockly.Msg.TEXT_PROMPT_TOOLTIP_NUMBER;
    });
  },
  /**
   * Modify this block to have the correct output type.
   * @param {string} newOp Either 'TEXT' or 'NUMBER'.
   * @private
   * @this Blockly.Block
   */
  updateType_: function(newOp) {
    this.outputConnection.setCheck(newOp == 'NUMBER' ? 'Number' : 'String');
  },
  /**
   * Create XML to represent the output type.
   * @return {!Element} XML storage element.
   * @this Blockly.Block
   */
  mutationToDom: function() {
    var container = document.createElement('mutation');
    container.setAttribute('type', this.getFieldValue('TYPE'));
    return container;
  },
  /**
   * Parse XML to restore the output type.
   * @param {!Element} xmlElement XML storage element.
   * @this Blockly.Block
   */
  domToMutation: function(xmlElement) {
    this.updateType_(xmlElement.getAttribute('type'));
  }
};

Blockly.Blocks['text_prompt'] = {
  /**
   * Block for prompt function (internal message).
   * The 'text_prompt_ext' block is preferred as it is more flexible.
   * @this Blockly.Block
   */
  init: function() {
    var TYPES =
        [[Blockly.Msg.TEXT_PROMPT_TYPE_TEXT, 'TEXT'],
         [Blockly.Msg.TEXT_PROMPT_TYPE_NUMBER, 'NUMBER']];
    // Assign 'this' to a variable for use in the closures below.
    var thisBlock = this;
    this.setHelpUrl(Blockly.Msg.TEXT_PROMPT_HELPURL);
    this.setColour(Blockly.Blocks.texts.HUE);
    var dropdown = new Blockly.FieldDropdown(TYPES, function(newOp) {
      thisBlock.updateType_(newOp);
    });
    this.appendDummyInput()
        .appendField(dropdown, 'TYPE')
        .appendField(this.newQuote_(true))
        .appendField(new Blockly.FieldTextInput(''), 'TEXT')
        .appendField(this.newQuote_(false));
    this.setOutput(true, 'String');
    this.setTooltip(function() {
      return (thisBlock.getFieldValue('TYPE') == 'TEXT') ?
          Blockly.Msg.TEXT_PROMPT_TOOLTIP_TEXT :
          Blockly.Msg.TEXT_PROMPT_TOOLTIP_NUMBER;
    });
  },
  newQuote_: Blockly.Blocks['text'].newQuote_,
  updateType_: Blockly.Blocks['text_prompt_ext'].updateType_,
  mutationToDom: Blockly.Blocks['text_prompt_ext'].mutationToDom,
  domToMutation: Blockly.Blocks['text_prompt_ext'].domToMutation
};
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

/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.threads.HUE = 20;

/*
 * Common code for rename a variable in thread blocks
 */
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
	var blocks = Code.workspace.blocks.getAllBlocks();
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
};/*
 * Whitecat Blocky Environment, exception control blocks
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
		this.appendDummyInput()
			.setAlign(Blockly.ALIGN_RIGHT)
			.appendField(Blockly.Msg.TEXT_TRY_CATCH_ERROR)
			.appendField(new Blockly.wc.FieldException("any"), 'ERROR');
		this.appendDummyInput()
			.appendField(' ' + Blockly.Msg.TEXT_TRY_CATCHED);

		this.appendStatementInput('DO')
			.appendField(Blockly.Msg.DO).setAlign(Blockly.ALIGN_RIGHT);

		this.setInputsInline(true);
		this.setPreviousStatement(true, null);
		this.setNextStatement(true, null);
		this.setColour(Blockly.Blocks.try.HUE);
		this.setTooltip('');
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
	}
};
/**
 * @license
 * Visual Blocks Editor
 *
 * Copyright 2012 Google Inc.
 * https://developers.google.com/blockly/
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * @fileoverview Variable blocks for Blockly.
 * @author fraser@google.com (Neil Fraser)
 */
'use strict';

goog.provide('Blockly.Blocks.variables');

goog.require('Blockly.Blocks');


/**
 * Common HSV hue for all blocks in this category.
 */
Blockly.Blocks.variables.HUE = 330;

Blockly.Blocks['variables_get'] = {
  /**
   * Block for variable getter.
   * @this Blockly.Block
   */
  init: function() {
    this.setHelpUrl(Blockly.Msg.VARIABLES_GET_HELPURL);
    this.setColour(Blockly.Blocks.variables.HUE);
    this.appendDummyInput()
        .appendField(new Blockly.FieldVariable(
        Blockly.Msg.VARIABLES_DEFAULT_NAME), 'VAR');
    this.setOutput(true);
    this.setTooltip(Blockly.Msg.VARIABLES_GET_TOOLTIP);
    this.contextMenuMsg_ = Blockly.Msg.VARIABLES_GET_CREATE_SET;
  },
  contextMenuType_: 'variables_set',
  /**
   * Add menu option to create getter/setter block for this setter/getter.
   * @param {!Array} options List of menu options to add to.
   * @this Blockly.Block
   */
  customContextMenu: function(options) {
    var option = {enabled: true};
    var name = this.getFieldValue('VAR');
    option.text = this.contextMenuMsg_.replace('%1', name);
    var xmlField = goog.dom.createDom('field', null, name);
    xmlField.setAttribute('name', 'VAR');
    var xmlBlock = goog.dom.createDom('block', null, xmlField);
    xmlBlock.setAttribute('type', this.contextMenuType_);
    option.callback = Blockly.ContextMenu.callbackFactory(this, xmlBlock);
    options.push(option);
  }
};

Blockly.Blocks['variables_set'] = {
  /**
   * Block for variable setter.
   * @this Blockly.Block
   */
  init: function() {
    this.jsonInit({
      "message0": Blockly.Msg.VARIABLES_SET,
      "args0": [
        {
          "type": "field_variable",
          "name": "VAR",
          "variable": Blockly.Msg.VARIABLES_DEFAULT_NAME
        },
        {
          "type": "input_value",
          "name": "VALUE"
        }
      ],
      "previousStatement": null,
      "nextStatement": null,
      "colour": Blockly.Blocks.variables.HUE,
      "tooltip": Blockly.Msg.VARIABLES_SET_TOOLTIP,
      "helpUrl": Blockly.Msg.VARIABLES_SET_HELPURL
    });
    this.contextMenuMsg_ = Blockly.Msg.VARIABLES_SET_CREATE_GET;
  },
  contextMenuType_: 'variables_get',
  customContextMenu: Blockly.Blocks['variables_get'].customContextMenu
};
/*
 * Whitecat Blocky Environment, Wi-Fi blocks
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

goog.provide('Blockly.Blocks.Wifi');

goog.require('Blockly.Blocks');

Blockly.Blocks.Wifi.HUE = 20;

Blockly.Blocks['wifi_start'] = {
	module: "net.wf",
	init: function() {
	    this.appendDummyInput()
	        .appendField(Blockly.Msg.WIFI_START);
	    this.setPreviousStatement(true, null);
	    this.setNextStatement(true, null);
	    this.setColour(Blockly.Blocks.Wifi.HUE);
	    this.setTooltip('');
	},

	mutationToDom: function() {
		var container = document.createElement('mutation');

		container.setAttribute('wtype', this.wtype);
		container.setAttribute('ssid', this.ssid);
		container.setAttribute("password", this.password);

		return container;
	},

	domToMutation: function(xmlElement) {
		this.wtype = xmlElement.getAttribute('wtype');
		
		this.ssid = xmlElement.getAttribute('ssid');
		this.password = xmlElement.getAttribute("password");

		this.updateShape_();
	},

	updateShape_: function() {
		this.configureWifi(this);
	},

	configureWifi: function(instance) {
		instance.workspace.configureWifi({
			"wtype": instance.wtype,
			"ssid": instance.ssid,
			"password": instance.password,
		});
	},
};

Blockly.Blocks['wifi_stop'] = {
	module: "net.wf",
	init: function() {
	    this.appendDummyInput()
	        .appendField(Blockly.Msg.WIFI_STOP);
	    this.setPreviousStatement(true, null);
	    this.setNextStatement(true, null);
	    this.setColour(Blockly.Blocks.Wifi.HUE);
	    this.setTooltip('');
	},

	configureWifi: Blockly.Blocks['wifi_start'].configureWifi,
	mutationToDom: Blockly.Blocks['wifi_start'].mutationToDom,
	domToMutation: Blockly.Blocks['wifi_start'].domToMutation,
	updateShape_: Blockly.Blocks['wifi_start'].updateShape_,
};
