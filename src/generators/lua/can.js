/*
 * Whitecat Blocky Environment, can block code generation
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

goog.provide('Blockly.Lua.can');
goog.provide('Blockly.Lua.can.helper');

goog.require('Blockly.Lua');

Blockly.Lua.can.helper = {
	iscan: function(block, test) {
		return ((
			(test.type == 'cansetspeed') ||
			(test.type == 'cansetfilter') ||
			(test.type == 'canread') ||
			(test.type == 'canframewrite')
		) && (Blockly.Lua.can.helper.name(block) == Blockly.Lua.can.helper.name(test)));
	},

	isframe: function(block, test) {
		return ((
			(test.type == 'canframeset')
		) && (Blockly.Lua.valueToCode(block, 'FRAME', Blockly.Lua.ORDER_NONE) == Blockly.Lua.valueToCode(test, 'FRAME', Blockly.Lua.ORDER_NONE)));
	},
	
	hasAncestors: function(block) {
		var previous = block.previousConnection;

		while (previous) {
			previous = previous.targetBlock();
			if (previous) {
				if (Blockly.Lua.can.helper.iscan(block, previous)) {
					return true;
				}
			
				previous = previous.previousConnection;				
			}
		}
		
		return false;
	},

	hasFrameAncestors: function(block) {
		var previous = block.previousConnection;

		while (previous) {
			previous = previous.targetBlock();
			if (previous) {
				if (Blockly.Lua.can.helper.isframe(block, previous)) {
					return true;
				}
			
				previous = previous.previousConnection;				
			}
		}
		
		return false;
	},
	
	name: function(block) {
		var module = block.getFieldValue('MODULE');
		
		return  Code.status.maps.canUnits[module];
	},
	
	instance: function(block) {
		var module = block.getFieldValue('MODULE');

		return "_can" + Blockly.Lua.can.helper.name(block);
	},

	attach: function(block, speed) {
		var module = block.getFieldValue('MODULE');
		var code = '';

		if (!Blockly.Lua.can.helper.hasAncestors(block)) {
			code += Blockly.Lua.indent(0, 'if (' + Blockly.Lua.can.helper.instance(block) + ' == nil) then') + "\n";
			code += Blockly.Lua.indent(1, Blockly.Lua.can.helper.instance(block) + ' = true') + "\n";
			code += Blockly.Lua.indent(1, 'can.attach(can.' + Blockly.Lua.can.helper.name(block) + ', ' + speed + ')') + "\n";
			code += Blockly.Lua.indent(0, 'end') + "\n";			
		}

		return code;
	},

	newFrame: function(block) {
		var module = block.getFieldValue('MODULE');
		var code = '';

		if (!Blockly.Lua.can.helper.hasFrameAncestors(block)) {
			code += Blockly.Lua.indent(0, '-- init frame') + "\n";
			code += Blockly.Lua.indent(0, 'frame = {}') + "\n\n";
			code += Blockly.Lua.indent(0, 'frame.id = 0') + "\n";
			code += Blockly.Lua.indent(0, 'frame.type = 0') + "\n";
			code += Blockly.Lua.indent(0, 'frame.len = 0') + "\n";
			code += Blockly.Lua.indent(0, 'frame.d0 = nil') + "\n";
			code += Blockly.Lua.indent(0, 'frame.d1 = nil') + "\n";
			code += Blockly.Lua.indent(0, 'frame.d2 = nil') + "\n";
			code += Blockly.Lua.indent(0, 'frame.d3 = nil') + "\n";
			code += Blockly.Lua.indent(0, 'frame.d4 = nil') + "\n";
			code += Blockly.Lua.indent(0, 'frame.d5 = nil') + "\n";
			code += Blockly.Lua.indent(0, 'frame.d6 = nil') + "\n";
			code += Blockly.Lua.indent(0, 'frame.d7 = nil') + "\n";
		}

		return code;
	}
};

Blockly.Lua['cansetspeed'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var speed = Blockly.Lua.valueToCode(block, 'SPEED', Blockly.Lua.ORDER_NONE);
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.can.helper.attach(block, speed);
	if (tryCode != "") {
		tryCode += "\r\n";
	}

	code += Blockly.Lua.tryBlock(0, block, tryCode, 'set speed for ' + Blockly.Lua.can.helper.name(block) + ' speed '+speed+' Kbps');

	return code;
};

Blockly.Lua['cansetfilter'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var from = Blockly.Lua.valueToCode(block, 'FROM', Blockly.Lua.ORDER_NONE);
	var to = Blockly.Lua.valueToCode(block, 'TO', Blockly.Lua.ORDER_NONE);
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.can.helper.attach(block, 500);
	if (tryCode != "") {
		tryCode += "\r\n";
	}

	tryCode += Blockly.Lua.indent(0, 'can.addfilter(can.' + Blockly.Lua.can.helper.name(block) + ', ' + from + ', ' + to + ')') + "\n";
	
	code += Blockly.Lua.tryBlock(0, block, tryCode, 'add filter for ' + Blockly.Lua.can.helper.name(block) + ' from id '+from+' to id '+ to);

	return code;
};

Blockly.Lua['canread'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var tryCode = '', getCode = '', code = '';

	Blockly.Lua.require("block");

	var tryCode = '';
	tryCode += Blockly.Lua.can.helper.attach(block, 500);
	if (tryCode != "") {
		tryCode += "\r\n";
	}

	tryCode += Blockly.Lua.indent(0, '-- read from ' + Blockly.Lua.can.helper.name(block)) + "\n";
	tryCode += Blockly.Lua.indent(0, 'id, type, len, data = can.receive(can.' + Blockly.Lua.can.helper.name(block) + ')') + "\n\n";

	tryCode += Blockly.Lua.indent(0, '-- unpack data') + "\n";
	tryCode += Blockly.Lua.indent(0, 'd0, d1, d2, d3, d4, d5, d6, d7 = string.unpack(string.rep(\'b\', len), data)') + "\n\n";

	tryCode += Blockly.Lua.indent(0, '-- build frame') + "\n";
	tryCode += Blockly.Lua.indent(0, 'frame.id = id') + "\n";
	tryCode += Blockly.Lua.indent(0, 'frame.type = type') + "\n";
	tryCode += Blockly.Lua.indent(0, 'frame.len = len') + "\n";
	tryCode += Blockly.Lua.indent(0, 'frame.d0 = d0') + "\n";
	tryCode += Blockly.Lua.indent(0, 'frame.d1 = d1') + "\n";
	tryCode += Blockly.Lua.indent(0, 'frame.d2 = d2') + "\n";
	tryCode += Blockly.Lua.indent(0, 'frame.d3 = d3') + "\n";
	tryCode += Blockly.Lua.indent(0, 'frame.d4 = d4') + "\n";
	tryCode += Blockly.Lua.indent(0, 'frame.d5 = d5') + "\n";
	tryCode += Blockly.Lua.indent(0, 'frame.d6 = d6') + "\n";
	tryCode += Blockly.Lua.indent(0, 'frame.d7 = d7') + "\n";
	
	getCode += Blockly.Lua.indent(0, "function _read" + Blockly.Lua.can.helper.name(block) + "()") + "\n";
	getCode += Blockly.Lua.indent(1, "local id, type, len") + "\n";
	getCode += Blockly.Lua.indent(1, "local d0, d1, d2, d3, d4, d5, d6, d7 = nil") + "\n";
	getCode += Blockly.Lua.indent(1, "local frame = {}") + "\n\n";

	getCode += Blockly.Lua.indent(1, Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";

	getCode += Blockly.Lua.indent(1, "return frame") + "\n";
	getCode += Blockly.Lua.indent(0, "end") + "\n";

	codeSection["functions"].push(getCode);

	code += Blockly.Lua.indent(0, "_read" + Blockly.Lua.can.helper.name(block) + "()") + "\n";

	if (block.nextConnection) {
		code += '\n';
	}

	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['canframeget'] = function(block) {
	var field = block.getFieldValue('FIELD');
	var frame = Blockly.Lua.valueToCode(block, 'FRAME', Blockly.Lua.ORDER_NONE);
	
	return [frame + "." + field, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['canframeset'] = function(block) {
	var field = block.getFieldValue('FIELD');
	var frame = Blockly.Lua.valueToCode(block, 'FRAME', Blockly.Lua.ORDER_NONE);
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE);
	var code = '';
	
	code += Blockly.Lua.can.helper.newFrame(block);
	if (code != "") {
		code += "\n";
	}
	
	code += Blockly.Lua.indent(0, '-- set ' + field + ' to frame') + "\n";
	code += Blockly.Lua.indent(0, frame + "." + field + " = " + value) + "\n\n";

	return code;
};

Blockly.Lua['canframewrite'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var frame = Blockly.Lua.valueToCode(block, 'FRAME', Blockly.Lua.ORDER_NONE);
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.can.helper.attach(block, 500);
	if (tryCode != "") {
		tryCode += "\r\n";
	}

	tryCode += Blockly.Lua.indent(0, 'can.send(can.' + Blockly.Lua.can.helper.name(block) + ', ' + frame + '.id, ' + frame + '.type, ' + frame + '.len, ' + 
		'string.pack(string.rep(\'b\', ' + frame + '.len), ' + 
		frame + '.d0, ' + 
		frame + '.d1, ' + 
		frame + '.d2, ' + 
		frame + '.d3, ' + 
		frame + '.d4, ' + 
		frame + '.d5, ' + 
		frame + '.d6, ' + 
		frame + '.d7' + 
		'))') + "\n";

	code += Blockly.Lua.tryBlock(0, block, tryCode, 'write to ' + Blockly.Lua.can.helper.name(block));

	return code;
};

Blockly.Lua['cantype'] = function(block) {
	var type = block.getFieldValue('TYPE');

	if (type == "std") {
		return ["can.STD", Blockly.Lua.ORDER_HIGH];		
	} else {
		return ["can.EXT", Blockly.Lua.ORDER_HIGH];		
	}
	
};