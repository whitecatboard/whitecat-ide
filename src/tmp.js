goog.provide('Blockly.Generator');/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Helper functions for generating Lua for blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 * Based on Ellen Spertus's blocky-lua project.
 */
'use strict';

goog.provide('Blockly.Lua');

goog.require('Blockly.Generator');


/**
 * Lua code generator.
 * @type {!Blockly.Generator}
 */
Blockly.Lua = new Blockly.Generator('Lua');

/**
 * List of illegal variable names.
 * This is not intended to be a security feature.  Blockly is 100% client-side,
 * so bypassing this list is trivial.  This is intended to prevent users from
 * accidentally clobbering a built-in object or function.
 * @private
 */
Blockly.Lua.addReservedWords(
	// Special character
	'_,' +
	// From theoriginalbit's script:
	// https://github.com/espertus/blockly-lua/issues/6
	'__inext,assert,bit,colors,colours,coroutine,disk,dofile,error,fs,' +
	'fetfenv,getmetatable,gps,help,io,ipairs,keys,loadfile,loadstring,math,' +
	'native,next,os,paintutils,pairs,parallel,pcall,peripheral,print,' +
	'printError,rawequal,rawget,rawset,read,rednet,redstone,rs,select,' +
	'setfenv,setmetatable,sleep,string,table,term,textutils,tonumber,' +
	'tostring,turtle,type,unpack,vector,write,xpcall,_VERSION,__indext,' +
	// Not included in the script, probably because it wasn't enabled:
	'HTTP,' +
	// Keywords (http://www.lua.org/pil/1.3.html).
	'and,break,do,else,elseif,end,false,for,function,if,in,local,nil,not,or,' +
	'repeat,return,then,true,until,while,' +
	// Metamethods (http://www.lua.org/manual/5.2/manual.html).
	'add,sub,mul,div,mod,pow,unm,concat,len,eq,lt,le,index,newindex,call,' +
	// Basic functions (http://www.lua.org/manual/5.2/manual.html, section 6.1).
	'assert,collectgarbage,dofile,error,_G,getmetatable,inpairs,load,' +
	'loadfile,next,pairs,pcall,print,rawequal,rawget,rawlen,rawset,select,' +
	'setmetatable,tonumber,tostring,type,_VERSION,xpcall,' +
	// Modules (http://www.lua.org/manual/5.2/manual.html, section 6.3).
	'require,package,string,table,math,bit32,io,file,os,debug'
);

/**
 * Order of operation ENUMs.
 * http://www.lua.org/manual/5.3/manual.html#3.4.8
 */
Blockly.Lua.ORDER_ATOMIC = 0; // literals
// The next level was not explicit in documentation and inferred by Ellen.
Blockly.Lua.ORDER_HIGH = 1; // Function calls, tables[]
Blockly.Lua.ORDER_EXPONENTIATION = 2; // ^
Blockly.Lua.ORDER_UNARY = 3; // not # - ~
Blockly.Lua.ORDER_MULTIPLICATIVE = 4; // * / %
Blockly.Lua.ORDER_ADDITIVE = 5; // + -
Blockly.Lua.ORDER_CONCATENATION = 6; // ..
Blockly.Lua.ORDER_RELATIONAL = 7; // < > <=  >= ~= ==
Blockly.Lua.ORDER_AND = 8; // and
Blockly.Lua.ORDER_OR = 9; // or
Blockly.Lua.ORDER_NONE = 99;

/**
 * Note: Lua is not supporting zero-indexing since the language itself is
 * one-indexed, so the generator does not repoct the oneBasedIndex configuration
 * option used for lists and text.
 */

/**
 * Initialise the database of variable names.
 * @param {!Blockly.Workspace} workspace Workspace to generate code from.
 */
Blockly.Lua.init = function(workspace) {
	Blockly.Lua.blockNums = 0;
	Blockly.Lua.blockNum = [];
	Blockly.Lua.blockId = [];
	
	// Create a dictionary of definitions to be printed before the code.
	Blockly.Lua.definitions_ = Object.create(null);
	// Create a dictionary mapping desired function names in definitions_
	// to actual function names (to avoid collisions with user functions).
	Blockly.Lua.functionNames_ = Object.create(null);

	if (!Blockly.Lua.variableDB_) {
		Blockly.Lua.variableDB_ =
			new Blockly.Names(Blockly.Lua.RESERVED_WORDS_);
	} else {
		Blockly.Lua.variableDB_.reset();
	}
};

/**
 * Prepend the generated code with the variable definitions.
 * @param {string} code Generated code.
 * @return {string} Completed code.
 */
Blockly.Lua.finish = function(code) {
	// Convert the definitions dictionary into a list.
	var definitions = [];
	for (var name in Blockly.Lua.definitions_) {
		definitions.push(Blockly.Lua.definitions_[name]);
	}
	// Clean up temporary data.
	delete Blockly.Lua.definitions_;
	delete Blockly.Lua.functionNames_;
	Blockly.Lua.variableDB_.reset();
	return definitions.join('\n\n') + '\n\n\n' + code;
};

/**
 * Naked values are top-level blocks with outputs that aren't plugged into
 * anything. In Lua, an expression is not a legal statement, so we must assign
 * the value to the (conventionally ignored) _.
 * http://lua-users.org/wiki/ExpressionsAsStatements
 * @param {string} line Line of generated code.
 * @return {string} Legal line of code.
 */
Blockly.Lua.scrubNakedValue = function(line) {
	return 'local _ = ' + line + '\n';
};

/**
 * Encode a string as a properly escaped Lua string, complete with
 * quotes.
 * @param {string} string Text to encode.
 * @return {string} Lua string.
 * @private
 */
Blockly.Lua.quote_ = function(string) {
	string = string.replace(/\\/g, '\\\\')
		.replace(/\n/g, '\\\n')
		.replace(/'/g, '\\\'');
	return '\'' + string + '\'';
};

/**
 * Common tasks for generating Lua from blocks.
 * Handles comments for the specified block and any connected value blocks.
 * Calls any statements following this block.
 * @param {!Blockly.Block} block The current block.
 * @param {string} code The Lua code created for this block.
 * @return {string} Lua code with comments and subsequent blocks added.
 * @private
 */
Blockly.Lua.scrub_ = function(block, code) {
	var commentCode = '';
	// Only collect comments for blocks that aren't inline.
	if (!block.outputConnection || !block.outputConnection.targetConnection) {
		// Collect comment for this block.
		var comment = block.getCommentText();
		comment = Blockly.utils.wrap(comment, Blockly.Lua.COMMENT_WRAP - 3);
		if (comment) {
			commentCode += Blockly.Lua.prefixLines(comment, '-- ') + '\n';
		}
		// Collect comments for all value arguments.
		// Don't collect comments for nested statements.
		for (var i = 0; i < block.inputList.length; i++) {
			if (block.inputList[i].type == Blockly.INPUT_VALUE) {
				var childBlock = block.inputList[i].connection.targetBlock();
				if (childBlock) {
					comment = Blockly.Lua.allNestedComments(childBlock);
					if (comment) {
						commentCode += Blockly.Lua.prefixLines(comment, '-- ');
					}
				}
			}
		}
	}
	var nextBlock = block.nextConnection && block.nextConnection.targetBlock();
	var nextCode = Blockly.Lua.blockToCode(nextBlock);
	return commentCode + code + nextCode;
};

Blockly.Lua.inTryBlock = function(block) {
	var previous = block.previousConnection;

	while (previous) {
		previous = previous.targetBlock();
		if (previous) {
			if (previous.type == "exception_try") {
				return true;
			}

			previous = previous.previousConnection;
		}
	}

	return false;
}

Blockly.Lua.blockStart = function(indent, block) {
	if (Blockly.Lua.developerMode) {
		return Blockly.Lua.indent(indent,'wcBlock.blockStart('+Blockly.Lua.blockIdToNum(block.id)+')') + "\n";
	} else {
		return '';
	}
}

Blockly.Lua.blockEnd = function(indent, block) {
	if (Blockly.Lua.developerMode) {
		return Blockly.Lua.indent(indent,'wcBlock.blockEnd('+Blockly.Lua.blockIdToNum(block.id)+')') + "\n";	
	} else {
		return '';
	}
}

Blockly.Lua.blockError = function(indent, block) {
	var code = '';
	
	if (Blockly.Lua.developerMode) {
		code += Blockly.Lua.indent(indent,'wcBlock.blockError('+Blockly.Lua.blockIdToNum(block.id)+', err, message)') + "\n";
		
		return code;	
	} else {
		return '';
	}
}

Blockly.Lua.blockErrorCatched = function(indent, block) {
	var code = '';
	
	if (Blockly.Lua.developerMode) {
		code += Blockly.Lua.indent(indent,'wcBlock.blockErrorCatched('+Blockly.Lua.blockIdToNum(block.id)+')') + "\n";
		
		return code;	
	} else {
		return '';
	}
}

Blockly.Lua.tryBlock = function(indent, block, code, comment) {
	var tryCode = '';
	var blockId = Blockly.Lua.blockIdToNum(block.id);

	if (typeof comment == "undefined") {
		comment = "";
	}

	if (comment != "") {
		tryCode += "-- begin: " + comment + "\n";
	}

	if (!Blockly.Lua.developerMode || Blockly.Lua.inTryBlock(block)) {
		tryCode += Blockly.Lua.indent(indent, code);
	} else {
		tryCode += Blockly.Lua.indent(0, 'try(') + '\n';
		tryCode += Blockly.Lua.indent(1, 'function()') + "\n";

		if (code != "") {
			tryCode += Blockly.Lua.indent(2, code);
		}

		tryCode += Blockly.Lua.indent(1, 'end,') + "\n";
		tryCode += Blockly.Lua.indent(1, 'function(where, line, err, message)') + "\n";
		tryCode += Blockly.Lua.blockError(2, block);
		tryCode += Blockly.Lua.indent(1, 'end') + "\n";
		tryCode += Blockly.Lua.indent(0, ')');

		tryCode = Blockly.Lua.indent(indent, tryCode) + "\n";
	}

	if (comment != "") {
		tryCode += "-- end: " + comment + "\n";
	}

	if (block.nextConnection) {
		if (block.nextConnection.targetBlock()) {
			tryCode += '\n';
		}
	}

	return tryCode;
}

Blockly.Lua.require = function(lib) {
	if (codeSection["require"].indexOf('require("' + lib + '")') == -1) {
		codeSection["require"].push('require("' + lib + '")');
	}
}

Blockly.Lua.indent = function(n, code) {
	for (var i = 0; i < n; i++) {
		code = Blockly.Lua.prefixLines(code, Blockly.Lua.INDENT);
	}

	return code;
}

Blockly.Lua.blockIdToNum = function(id) {
	if (typeof Blockly.Lua.blockNum[id] == "undefined") {
		Blockly.Lua.blockNums = Blockly.Lua.blockNums + 1;
		Blockly.Lua.blockNum[id] = Blockly.Lua.blockNums;	
		Blockly.Lua.blockId[Blockly.Lua.blockNums] = id;	
	}
	
	return Blockly.Lua.blockNum[id];
}

Blockly.Lua.numToBlockId = function(num) {
	try {
		return Blockly.Lua.blockId[num];		 
	} catch (e){
		return null;
	}
}
/*
 * Whitecat Blocky Environment, bit manipulation code generation
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

goog.provide('Blockly.Lua.bitlogic');

goog.require('Blockly.Lua');

Blockly.Lua['bitlogic_msb'] = function(block) {
	var argument0 = Blockly.Lua.valueToCode(block, 'BOOL',
		Blockly.Lua.ORDER_UNARY) || 'true';
		
	argument0 = 'math.floor(' + argument0 + ')';
		
	var code = '((' + argument0 + ' & 0xff00) >> 8)';
	return [code, Blockly.Lua.ORDER_UNARY];
};

Blockly.Lua['bitlogic_lsb'] = function(block) {
	var argument0 = Blockly.Lua.valueToCode(block, 'BOOL',
		Blockly.Lua.ORDER_UNARY) || 'true';

	argument0 = 'math.floor(' + argument0 + ')';

	var code = '(' + argument0 + ' & 0x00ff)';
	return [code, Blockly.Lua.ORDER_UNARY];
};

Blockly.Lua['bitwise_op'] = function(block) {
	var op1 = Blockly.Lua.valueToCode(block, 'OP1', Blockly.Lua.ORDER_NONE);
	var op2 = Blockly.Lua.valueToCode(block, 'OP2', Blockly.Lua.ORDER_NONE);
	var op = block.getFieldValue('OP');

	if (op == 'and') {
		op1 = 'math.floor(' + op1 + ')';
		op = "&";
		op2 = 'math.floor(' + op2 + ')';
	} else if (op == 'or') {
		op1 = 'math.floor(' + op1 + ')';
		op = "|";
		op2 = 'math.floor(' + op2 + ')';
	} else if (op == 'lshift') {
		op1 = 'math.floor(' + op1 + ')';
		op = "<<";
	} else if (op == 'rshift') {
		op1 = 'math.floor(' + op1 + ')';
		op = ">>";
	} else if (op == 'xor') {
		op1 = 'math.floor(' + op1 + ')';
		op = "~";
		op2 = 'math.floor(' + op2 + ')';
	}

	return ['(' + op1 + ' ' + op + ' ' + op2 + ')', Blockly.Lua.ORDER_UNARY];
}

Blockly.Lua['bitwise_unary_op'] = function(block) {
	var op1 = Blockly.Lua.valueToCode(block, 'OP1', Blockly.Lua.ORDER_NONE);
	var op = block.getFieldValue('OP');

	if (op == 'not') {
		op = '~';
	}

	return ['(' + op + op1 + ')', Blockly.Lua.ORDER_UNARY];
}/*
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
	safeName: function(name) {
	  if (!name) {
	    name = 'unnamed';
	  } else {
	    // Unfortunately names in non-latin characters will look like
	    // _E9_9F_B3_E4_B9_90 which is pretty meaningless.
	    name = encodeURI(name.replace(/ /g, '_')).replace(/[^\w]/g, '_');
	    // Most languages don't allow names with leading numbers.
	    if ('0123456789'.indexOf(name[0]) != -1) {
	      name = 'my_' + name;
	    }
	  }
	  return name;
	},
	
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
			code += Blockly.Lua.indent(0, '-- attach can bus at ' + speed + ' khz') + "\n";
			code += Blockly.Lua.indent(0, 'if (' + Blockly.Lua.can.helper.instance(block) + ' == nil) then') + "\n";
			code += Blockly.Lua.indent(1, Blockly.Lua.can.helper.instance(block) + ' = true') + "\n";
			code += Blockly.Lua.indent(1, 'can.attach(can.' + Blockly.Lua.can.helper.name(block) + ', ' + speed + ' * 1000)') + "\n";
			code += Blockly.Lua.indent(0, 'end') + "\n";			
		}

		return code;
	},

	newFrame: function(block) {
		var module = block.getFieldValue('MODULE');
		var frame = block.getFieldValue('FRAME');
		var code = '';
		
		if (!Blockly.Lua.can.helper.hasFrameAncestors(block)) {
			code += Blockly.Lua.indent(0, '-- init frame ' + frame) + "\n";
			code += Blockly.Lua.indent(0, Blockly.Lua.can.helper.safeName(frame) + ' = {}') + "\n\n";
			code += Blockly.Lua.indent(0, Blockly.Lua.can.helper.safeName(frame) + '.id = 0') + "\n";
			code += Blockly.Lua.indent(0, Blockly.Lua.can.helper.safeName(frame) + '.type = can.STD') + "\n";
			code += Blockly.Lua.indent(0, Blockly.Lua.can.helper.safeName(frame) + '.len = 8') + "\n";
			code += Blockly.Lua.indent(0, Blockly.Lua.can.helper.safeName(frame) + '.d0 = 0') + "\n";
			code += Blockly.Lua.indent(0, Blockly.Lua.can.helper.safeName(frame) + '.d1 = 0') + "\n";
			code += Blockly.Lua.indent(0, Blockly.Lua.can.helper.safeName(frame) + '.d2 = 0') + "\n";
			code += Blockly.Lua.indent(0, Blockly.Lua.can.helper.safeName(frame) + '.d3 = 0') + "\n";
			code += Blockly.Lua.indent(0, Blockly.Lua.can.helper.safeName(frame) + '.d4 = 0') + "\n";
			code += Blockly.Lua.indent(0, Blockly.Lua.can.helper.safeName(frame) + '.d5 = 0') + "\n";
			code += Blockly.Lua.indent(0, Blockly.Lua.can.helper.safeName(frame) + '.d6 = 0') + "\n";
			code += Blockly.Lua.indent(0, Blockly.Lua.can.helper.safeName(frame) + '.d7 = 0') + "\n";
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
	var frame = block.getFieldValue('FRAME');
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
	tryCode += Blockly.Lua.indent(0, 'd0, d1, d2, d3, d4, d5, d6, d7 = string.unpack(string.rep(\'B\', len), data)') + "\n\n";

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
	
	getCode += Blockly.Lua.indent(0, '-- read from CAN bus into frame ' + frame) + "\n";
	getCode += Blockly.Lua.indent(0, "function _read" + Blockly.Lua.can.helper.name(block) + "_" + frame + "()") + "\n";
	getCode += Blockly.Lua.indent(1, "local id, type, len") + "\n";
	getCode += Blockly.Lua.indent(1, "local d0, d1, d2, d3, d4, d5, d6, d7 = 0") + "\n";
	getCode += Blockly.Lua.indent(1, "local frame = {}") + "\n\n";

	getCode += Blockly.Lua.indent(1, Blockly.Lua.tryBlock(0, block, tryCode));

	getCode += Blockly.Lua.indent(1, "return frame") + "\n";
	getCode += Blockly.Lua.indent(0, "end") + "\n";

	codeSection["functions"].push(getCode);

	code += frame + ' = ' + Blockly.Lua.indent(0, "_read" + Blockly.Lua.can.helper.name(block) + "_" + frame + "()") + "\n";

	return code;
};

Blockly.Lua['canframeget'] = function(block) {
	var field = block.getFieldValue('FIELD');
	var frame = block.getFieldValue('FRAME');
	
	return [frame + "." + field, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['canframeset'] = function(block) {
	var field = block.getFieldValue('FIELD');
	var frame = block.getFieldValue('FRAME');
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE);
	var code = '';
	
	code += Blockly.Lua.can.helper.newFrame(block);
	if (code != "") {
		code += "\n";
	}
	
	code += Blockly.Lua.indent(0, '-- set ' + field + ' to frame') + "\n";
	code += Blockly.Lua.indent(0, Blockly.Lua.can.helper.safeName(frame) + "." + field + " = " + value) + "\n";

	return code;
};

Blockly.Lua['canframewrite'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var frame = block.getFieldValue('FRAME');
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.can.helper.attach(block, 500);
	if (tryCode != "") {
		tryCode += "\r\n";
	}

	tryCode += Blockly.Lua.indent(0, 'can.send(can.' + Blockly.Lua.can.helper.name(block) + ', ' + 
	    Blockly.Lua.can.helper.safeName(frame) + '.id, ' +
	    Blockly.Lua.can.helper.safeName(frame) + '.type, ' +
	    Blockly.Lua.can.helper.safeName(frame) + '.len, ' + 
		'string.pack(string.rep(\'B\', ' + Blockly.Lua.can.helper.safeName(frame) + '.len), ' + 
		Blockly.Lua.can.helper.safeName(frame) + '.d0, ' + 
		Blockly.Lua.can.helper.safeName(frame) + '.d1, ' + 
		Blockly.Lua.can.helper.safeName(frame) + '.d2, ' + 
		Blockly.Lua.can.helper.safeName(frame) + '.d3, ' + 
		Blockly.Lua.can.helper.safeName(frame) + '.d4, ' + 
		Blockly.Lua.can.helper.safeName(frame) + '.d5, ' + 
		Blockly.Lua.can.helper.safeName(frame) + '.d6, ' + 
		Blockly.Lua.can.helper.safeName(frame) + '.d7' + 
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
	
};/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Generating Lua for colour blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.colour');

goog.require('Blockly.Lua');


Blockly.Lua['colour_picker'] = function(block) {
  // Colour picker.
  var code = '\'' + block.getFieldValue('COLOUR') + '\'';
  return [code, Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['colour_random'] = function(block) {
  // Generate a random colour.
  var code = 'string.format("#%06x", math.random(0, 2^24 - 1))';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['colour_rgb'] = function(block) {
  // Compose a colour from RGB components expressed as percentages.
  var functionName = Blockly.Lua.provideFunction_(
      'colour_rgb',
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(r, g, b)',
       '  r = math.floor(math.min(100, math.max(0, r)) * 2.55 + .5)',
       '  g = math.floor(math.min(100, math.max(0, g)) * 2.55 + .5)',
       '  b = math.floor(math.min(100, math.max(0, b)) * 2.55 + .5)',
       '  return string.format("#%02x%02x%02x", r, g, b)',
       'end']);
  var r = Blockly.Lua.valueToCode(block, 'RED',
      Blockly.Lua.ORDER_NONE) || 0;
  var g = Blockly.Lua.valueToCode(block, 'GREEN',
      Blockly.Lua.ORDER_NONE) || 0;
  var b = Blockly.Lua.valueToCode(block, 'BLUE',
      Blockly.Lua.ORDER_NONE) || 0;
  var code = functionName + '(' + r + ', ' + g + ', ' + b + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['colour_blend'] = function(block) {
  // Blend two colours together.
  var functionName = Blockly.Lua.provideFunction_(
      'colour_blend',
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
           '(colour1, colour2, ratio)',
       '  local r1 = tonumber(string.sub(colour1, 2, 3), 16)',
       '  local r2 = tonumber(string.sub(colour2, 2, 3), 16)',
       '  local g1 = tonumber(string.sub(colour1, 4, 5), 16)',
       '  local g2 = tonumber(string.sub(colour2, 4, 5), 16)',
       '  local b1 = tonumber(string.sub(colour1, 6, 7), 16)',
       '  local b2 = tonumber(string.sub(colour2, 6, 7), 16)',
       '  local ratio = math.min(1, math.max(0, ratio))',
       '  local r = math.floor(r1 * (1 - ratio) + r2 * ratio + .5)',
       '  local g = math.floor(g1 * (1 - ratio) + g2 * ratio + .5)',
       '  local b = math.floor(b1 * (1 - ratio) + b2 * ratio + .5)',
       '  return string.format("#%02x%02x%02x", r, g, b)',
       'end']);
  var colour1 = Blockly.Lua.valueToCode(block, 'COLOUR1',
      Blockly.Lua.ORDER_NONE) || '\'#000000\'';
  var colour2 = Blockly.Lua.valueToCode(block, 'COLOUR2',
      Blockly.Lua.ORDER_NONE) || '\'#000000\'';
  var ratio = Blockly.Lua.valueToCode(block, 'RATIO',
      Blockly.Lua.ORDER_NONE) || 0;
  var code = functionName + '(' + colour1 + ', ' + colour2 + ', ' + ratio + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};
/*
 * Whitecat Blocky Environment, control block code generation
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

goog.provide('Blockly.Lua.control');

goog.require('Blockly.Lua');

Blockly.Lua['wait_for'] = function(block) {
	var time = Blockly.Lua.valueToCode(block, 'TIME', Blockly.Lua.ORDER_NONE);
	var units = block.getFieldValue('units');
	
	var code = '';
	
	code += Blockly.Lua.indent(0, '-- wait some time') + "\n";

	switch (units) {
		case 'microseconds':
			code += "tmr.delayus(math.floor(" + time + "))\r\n";break;
		case 'milliseconds':
			code += "tmr.delayms(math.floor(" + time + "))\r\n";break;
		case 'seconds':	
			code += "tmr.delay(math.floor(" + time  + "))\r\n";break;
	}
	
	return Blockly.Lua.postFormat(code, block);
};

Blockly.Lua['cpu_sleep'] = function(block) {
	var time = Blockly.Lua.valueToCode(block, 'SECONDS', Blockly.Lua.ORDER_NONE);
	
	var code = '';

	code += Blockly.Lua.blockStart(0, block);

	code += Blockly.Lua.indent(0, '-- sleep cpu some time') + "\n";

	code += 'os.sleep(math.floor(' + time + '))';	
	
	return Blockly.Lua.postFormat(code, block);
};
/*
 * Whitecat Blocky Environment, events block code generation
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

goog.provide('Blockly.Lua.events');

goog.require('Blockly.Lua');

Blockly.Lua['when_board_starts'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var code = '';
	var initCode = '';

	if (statement != '') {
		Blockly.Lua.addDependency("block", block);

		code += Blockly.Lua.indent(0, '-- when board starts') + "\n";
		code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";

		code += Blockly.Lua.blockStart(1, block);
		code += Blockly.Lua.tryBlock(1, block, statement);
		code += Blockly.Lua.blockEnd(1, block) + "\n";

		code += Blockly.Lua.indent(1,'-- board is started, broadcast to threads that are waiting') + "\n";
		code += Blockly.Lua.indent(1,'_eventBoardStarted:broadcast(false)') + "\n";

		code += Blockly.Lua.indent(0, 'end)');
	}

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['thread'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var code = '';

	Blockly.Lua.addDependency("block", block);

	code += Blockly.Lua.indent(0, '-- thread') + "\n";
	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";
	code += Blockly.Lua.indent(1, '_eventBoardStarted:wait()') + "\n\n";
	code += Blockly.Lua.blockStart(1, block);
	code += Blockly.Lua.indent(1, 'while true do') + "\n";
	code += Blockly.Lua.tryBlock(2, block, statement);

	code += Blockly.Lua.indent(1, 'end') + "\n";
	code += Blockly.Lua.blockEnd(1, block);

	code += Blockly.Lua.indent(0, 'end)');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['when_i_receive'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);
	var code = '';
	var initCode = '';
	var tryCode = '';

	Blockly.Lua.addDependency("block", block);

	initCode += Blockly.Lua.indent(0, '-- event "' + when + '" declaration') + "\n";
	initCode += Blockly.Lua.indent(0, '_event' + eventId + ' = event.create()') + "\n";
	
	Blockly.Lua.addCodeToSection("events", initCode, block);

	tryCode += Blockly.Lua.indent(0,'-- we need to wait for the completion of the board start') + "\n";
	tryCode += Blockly.Lua.indent(0,'_eventBoardStarted:wait()') + "\n\n";
	tryCode += Blockly.Lua.indent(0, 'while true do') + "\n";
	tryCode += Blockly.Lua.indent(1, '-- wait for event "' + when + '"') + "\n";
	tryCode += Blockly.Lua.indent(1, '_event' + eventId + ':wait()') + "\n\n";

	tryCode += Blockly.Lua.blockStart(1, block);

	if (statement != "") {
		tryCode += Blockly.Lua.indent(1, statement);
	}

	tryCode += Blockly.Lua.indent(1, '_event' + eventId + ':done()') + "\n";

	tryCode += Blockly.Lua.blockEnd(1, block);

	tryCode += Blockly.Lua.indent(0, 'end') + "\n";

	code += Blockly.Lua.indent(0, '-- when I receive ' + when) + "\n";

	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";	
	code += Blockly.Lua.tryBlock(1, block,tryCode);	
	code += Blockly.Lua.indent(0, 'end)');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['execute_every'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var every = Blockly.Lua.statementToCodeNoIndent(block, 'TIME');
	var units = block.getFieldValue('units');
	var code = '';
	var initCode = '';
	var tryCode = '';
	var timerId = 0;
	var blockId = Blockly.Lua.blockIdToNum(block.id);

	Blockly.Lua.addDependency("block", block);

	// Convert time to milliseconds if needed
	if (units == "seconds") {
		every[0] = every[0] * 1000;
	}

	// Attach timer
	code += Blockly.Lua.indent(0, '-- attach timer every ' + every[0] + ' milliseconds') + "\n";
	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";
	code += Blockly.Lua.indent(1, '_eventBoardStarted:wait()') + "\n\n";
	code += Blockly.Lua.indent(1, 'while true do') + "\n";

	code += Blockly.Lua.blockStart(2, block);

	if (statement != "") {
		tryCode += Blockly.Lua.indent(0, statement);
		code += Blockly.Lua.tryBlock(2, block, tryCode);
	}

	code += Blockly.Lua.blockEnd(2, block);
	code += Blockly.Lua.indent(2, 'tmr.delayms(' + every[0] + ')') + "\n";
	code += Blockly.Lua.indent(1, 'end') + "\n";

	code += Blockly.Lua.indent(0, 'end)');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['broadcast'] = function(block) {
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);
	var code = '';

	Blockly.Lua.addDependency("block", block);

	code += Blockly.Lua.indent(0, '_event' + eventId + ':broadcast(false)' + '  -- boardcast "' + when + '"');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['broadcast_and_wait'] = function(block) {
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);
	var code = '';

	Blockly.Lua.addDependency("block", block);

	code += Blockly.Lua.indent(0, '_event' + eventId + ':broadcast(true)' + '  -- boardcast and wait "' + when + '"');

	return Blockly.Lua.postFormat(code, block);
}

Blockly.Lua['event_is_being_processed'] = function(block) {
	var when = block.getFieldValue('WHEN');
	var eventId = this.workspace.eventIndexOf(when);

	Blockly.Lua.addDependency("block", block);

	return ['_event' + eventId + ':pending()', Blockly.Lua.ORDER_HIGH];
}
/*
 * Whitecat Blocky Environment, i2c block code generation
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

goog.provide('Blockly.Lua.i2c');
goog.provide('Blockly.Lua.i2c.helper');

goog.require('Blockly.Lua');

Blockly.Lua.i2c.helper = {
	isI2c: function(block, test) {
		return ((
			(test.type == 'i2csetspeed') ||
			(test.type == 'i2cstartcondition') ||
			(test.type == 'i2cstopcondition') ||
			(test.type == 'i2caddress') ||
			(test.type == 'i2cread') ||
			(test.type == 'i2cwrite')
		) && (block.getFieldValue('MODULE') == test.getFieldValue('MODULE')));
	},
	
	hasAncestors: function(block) {
		var previous = block.previousConnection;

		while (previous) {
			previous = previous.targetBlock();
			if (previous) {
				if (Blockly.Lua.i2c.helper.isI2c(block, previous)) {
					return true;
				}
			
				previous = previous.previousConnection;				
			}
		}
		
		return false;
	},
	
	name: function(block) {
		var module = block.getFieldValue('MODULE');
		
		return  Code.status.maps.i2cUnits[module][1];
	},
	
	instance: function(block) {
		var module = block.getFieldValue('MODULE');

		return "_i2c" + Blockly.Lua.i2c.helper.name(block);
	},

	attach: function(block) {
		var module = block.getFieldValue('MODULE');
		var code = '';

		if (!Blockly.Lua.i2c.helper.hasAncestors(block)) {
			code += Blockly.Lua.indent(0, 'if (' + Blockly.Lua.i2c.helper.instance(block) + ' == nil) then') + "\n";
			code += Blockly.Lua.indent(1, '' + Blockly.Lua.i2c.helper.instance(block) + ' = i2c.attach(i2c.' + Blockly.Lua.i2c.helper.name(block) + ', i2c.MASTER)') + "\n";
			code += Blockly.Lua.indent(0, 'end') + "\n\n";			
		}

		return code;
	}
};

Blockly.Lua['i2csetspeed'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var speed = Blockly.Lua.valueToCode(block, 'SPEED', Blockly.Lua.ORDER_NONE);
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.i2c.helper.attach(block);
	tryCode += Blockly.Lua.indent(0, Blockly.Lua.i2c.helper.instance(block) + ':setspeed('+speed+')' + "\n");

	code += Blockly.Lua.tryBlock(0, block, tryCode, 'set speed for ' + Blockly.Lua.i2c.helper.name(block) + ' speed '+speed+' hz');

	return code;
};

Blockly.Lua['i2cstartcondition'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var tryCode = '', code = '';

	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.i2c.helper.attach(block);
	tryCode += Blockly.Lua.indent(0, Blockly.Lua.i2c.helper.instance(block) + ':start()' + "\n");

	code += Blockly.Lua.tryBlock(0, block, tryCode, 'start condition for ' + Blockly.Lua.i2c.helper.name(block));

	return code;
};

Blockly.Lua['i2cstopcondition'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var tryCode = '', code = '';

	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.i2c.helper.attach(block);
	tryCode += Blockly.Lua.indent(0, Blockly.Lua.i2c.helper.instance(block) + ':stop()') + "\n";

	code += Blockly.Lua.tryBlock(0, block, tryCode, 'stop condition for ' + Blockly.Lua.i2c.helper.name(block));

	return code;
};

Blockly.Lua['i2caddress'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var address = Blockly.Lua.valueToCode(block, 'ADDRESS', Blockly.Lua.ORDER_NONE);
	var direction = block.getFieldValue('DIRECTION');
	var tryCode = '', code = '';

	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.i2c.helper.attach(block);
	tryCode += Blockly.Lua.indent(0, Blockly.Lua.i2c.helper.instance(block) + ':address(' + address + ', ' + (direction == "read" ? "true" : "false") + ')') + "\n";


	code += Blockly.Lua.tryBlock(0, block, tryCode, 'set address ' + address + ' for ' + Blockly.Lua.i2c.helper.name(block) + ' for ' + direction);

	return code;
};

Blockly.Lua['i2cread'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var tryCode = '', getCode = '', code = '';

	Blockly.Lua.require("block");

	var tryCode = '';
	tryCode += Blockly.Lua.i2c.helper.attach(block);
	tryCode += Blockly.Lua.indent(0, '-- read from ' + Blockly.Lua.i2c.helper.name(block)) + "\n";
	tryCode += Blockly.Lua.indent(0, 'val = ' + Blockly.Lua.i2c.helper.instance(block) + ':read()') + "\n";

	getCode += Blockly.Lua.indent(0, "function _read" + Blockly.Lua.i2c.helper.name(block) + "()") + "\n";
	getCode += Blockly.Lua.indent(1, "local val") + "\n\n";

	getCode += Blockly.Lua.indent(1, Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";

	getCode += Blockly.Lua.indent(1, "return val") + "\n";
	getCode += Blockly.Lua.indent(0, "end") + "\n";

	codeSection["functions"].push(getCode);

	code += Blockly.Lua.indent(0, "_read" + Blockly.Lua.i2c.helper.name(block) + "()") + "\n";

	if (block.nextConnection) {
		code += '\n';
	}

	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['i2cwrite'] = function(block) {
	var module = block.getFieldValue('MODULE');
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE);
	var tryCode = '', code = '';

	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.i2c.helper.attach(block);
	tryCode += Blockly.Lua.indent(0, Blockly.Lua.i2c.helper.instance(block) + ':write(' + value + ')') + "\n";

	code += Blockly.Lua.tryBlock(0, block, tryCode,'write ' + value + ' to ' + Blockly.Lua.i2c.helper.name(block));

	return code;
};
/*
 * Whitecat Blocky Environment, io block code generation
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

goog.provide('Blockly.Lua.io');
goog.provide('Blockly.Lua.io.helper');

goog.require('Blockly.Lua');

Blockly.Lua.io.helper = {
	isDigital: function(block, test, output) {
		if (output) {
			return (
				((test.type == 'setdigitalpin') && (block.getFieldValue('PIN') == test.getFieldValue('PIN')))
			);			
		} else {
			return (
				((test.type == 'getdigitalpin') && (block.getFieldValue('PIN') == test.getFieldValue('PIN')))
			);						
		}
	},
	
//	hasAncestorsDigital: function(block, output) {
//		var previous = block.previousConnection;
//
//		while (previous) {
//			previous = previous.targetBlock();
//			if (previous) {
//				if (Blockly.Lua.io.helper.isDigital(block, previous, output)) {
//					return true;
//				}
//			
//				previous = previous.previousConnection;				
//			}
//		}
//		
//		return false;
//	},
	
	nameDigital: function(block, name) {
		if (typeof name == "undefined") {
			name = "PIN";
		}
		
		var pin = Blockly.Lua.statementToCodeNoIndent(block,name)[0];
		if (typeof pin == "undefined") {
			pin = block.getFieldValue(name);
		}
		
		return pin;
	},
	
	instanceDigital: function(block, name) {
		if (typeof name == "undefined") {
			name = "PIN";
		}

		var pin = Blockly.Lua.statementToCodeNoIndent(block,name)[0];
		if (typeof pin == "undefined") {
			pin = block.getFieldValue(name);
		}
		
		if (pin.indexOf("pio.") === 0) {
			pin = pin.replace("pio.","");
		}
		
		return "_pio_" + pin;
	},
	
	hasPullUp: function(block, name) {
		if (typeof name == "undefined") {
			name = "PIN";
		}

		var pin = Blockly.Lua.statementToCodeNoIndent(block,name)[0];
		if (typeof pin == "undefined") {
			pin = block.getFieldValue(name);
		}
		
		if (pin.indexOf("pio.") === 0) {
			pin = pin.replace("pio.","");
		}
		
		return Blockly.Blocks.io.helper.pinHasPullUp(pin);
	},

	hasPullDown: function(block, name) {
		if (typeof name == "undefined") {
			name = "PIN";
		}

		var pin = Blockly.Lua.statementToCodeNoIndent(block,name)[0];
		if (typeof pin == "undefined") {
			pin = block.getFieldValue(name);
		}
		
		if (pin.indexOf("pio.") === 0) {
			pin = pin.replace("pio.","");
		}
		
		return Blockly.Blocks.io.helper.pinHasPullDown(pin);
	},

	attachDigital: function(block, output) {
		var code = '';

		//if (!Blockly.Lua.io.helper.hasAncestorsDigital(block, output)) {
		code += Blockly.Lua.indent(0,'if (('+Blockly.Lua.io.helper.instanceDigital(block)+' == nil) or ('+Blockly.Lua.io.helper.instanceDigital(block)+' == ' + (output?"pio.INPUT":"pio.OUTPUT")+')) then') + "\n";
		code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instanceDigital(block) + " = ") + (output?"pio.OUTPUT":"pio.INPUT") + "\n";
		
		if (output) {
			code += Blockly.Lua.indent(1,'pio.pin.setdir(pio.OUTPUT, ' + Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";
			
			if (Blockly.Lua.io.helper.hasPullUp(block) | Blockly.Lua.io.helper.hasPullDown(block)) {
				code += Blockly.Lua.indent(1,'pio.pin.setpull(pio.NOPULL, '+ Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";				
			}
			
			code += Blockly.Lua.indent(0,'end') + "\n\n";
		} else {
			code += Blockly.Lua.indent(1,'pio.pin.setdir(pio.INPUT, ' + Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";
			
			if (Blockly.Lua.io.helper.hasPullUp(block)) {
				code += Blockly.Lua.indent(1,'pio.pin.setpull(pio.PULLUP, '+ Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";
			}
			
			code += Blockly.Lua.indent(0,'end') + "\n\n";				
		}
		//}

		return code;
	},
	
	isAnalog: function(block, test) {
		return (
			((test.type == 'getanalogpin') && (block.getFieldValue('PIN') == test.getFieldValue('PIN')))
		);			
	},

	isExternalAnalog: function(block, test) {
		return (
			((test.type == 'getexternalanalogchannel') && (block.getFieldValue('UNIT') == test.getFieldValue('UNIT')) && (block.getFieldValue('CHANNEL') == test.getFieldValue('CHANNEL')))
		);			
	},
	
	hasAncestorsAnalog: function(block) {
		var previous = block.previousConnection;

		while (previous) {
			previous = previous.targetBlock();
			if (previous) {
				if (Blockly.Lua.io.helper.isAnalog(block, previous)) {
					return true;
				}
			
				previous = previous.previousConnection;				
			}
		}
		
		return false;
	},

	hasAncestorsExternalAnalog: function(block) {
		var previous = block.previousConnection;

		while (previous) {
			previous = previous.targetBlock();
			if (previous) {
				if (Blockly.Lua.io.helper.isExternalAnalog(block, previous)) {
					return true;
				}
			
				previous = previous.previousConnection;				
			}
		}
		
		return false;
	},

	nameAnalog: function(block) {
		var pin = Blockly.Lua.statementToCodeNoIndent(block,'PIN')[0];

		if (pin.indexOf("pio.") === 0) {
			pin = pin.replace("pio.","");
		}
		
		return pin;
	},

	nameExternalAnalog: function(block) {
		var unit = Blockly.Lua.statementToCodeNoIndent(block,'UNIT')[0];
		var channel = Blockly.Lua.statementToCodeNoIndent(block,'CHANNEL')[0];

		return unit.replace("adc.","") + "_" + channel;
	},
	
	instanceAnalog: function(block) {
		return "_adc_" + Blockly.Lua.io.helper.nameAnalog(block);
	},

	instanceExternalAnalog: function(block) {
		return "_adc_" + Blockly.Lua.io.helper.nameExternalAnalog(block);
	},
	
	attachAnalog: function(block) {
		var code = '';

		if (!Blockly.Lua.io.helper.hasAncestorsAnalog(block)) {
			code += Blockly.Lua.indent(0,'if ('+Blockly.Lua.io.helper.instanceAnalog(block)+' == nil) then') + "\n";
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instanceAnalog(block) + ' = adc.attach(adc.ADC1, '+ Blockly.Lua.io.helper.nameDigital(block)+', 12)') + "\n";			
			code += Blockly.Lua.indent(0,'end') + "\n";				
		}

		return code;
	},

	attachExternalAnalog: function(block) {
		var code = '';
		var unit = Blockly.Lua.statementToCodeNoIndent(block,'UNIT')[0];
		var channel = Blockly.Lua.statementToCodeNoIndent(block,'CHANNEL')[0];
		var bits = 12;
		
		for (var key in Code.status.maps.externalAdcUnits) {
			if (Code.status.maps.externalAdcUnits[key][0] == unit.replace("adc.","")) {
				bits = Code.status.maps.externalAdcUnits[key][2];
			}
		}
		
		if (!Blockly.Lua.io.helper.hasAncestorsExternalAnalog(block)) {
			code += Blockly.Lua.indent(0,'if ('+Blockly.Lua.io.helper.instanceExternalAnalog(block)+' == nil) then') + "\n";
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instanceExternalAnalog(block) + ' = adc.attach(' + unit + ',' + channel + ',' + bits + ')') + "\n";			
			code += Blockly.Lua.indent(0,'end') + "\n";				
		}

		return code;
	},

	isPwm: function(block, test) {
		return (
			((test.type == 'setpwmpin') && (block.getFieldValue('PIN') == test.getFieldValue('PIN')))
		);			
	},
	
	hasAncestorsPwm: function(block) {
		var previous = block.previousConnection;

		while (previous) {
			previous = previous.targetBlock();
			if (previous) {
				if (Blockly.Lua.io.helper.isPwm(block, previous)) {
					return true;
				}
			
				previous = previous.previousConnection;				
			}
		}
		
		return false;
	},

	namePwm: function(block) {
		var pin = Blockly.Lua.statementToCodeNoIndent(block,'PIN')[0];

		if (pin.indexOf("pio.") === 0) {
			pin = pin.replace("pio.","");
		}
		
		return pin;
	},
	
	instancePwm: function(block) {
		return "_pwm" + Blockly.Lua.io.helper.namePwm(block);
	},
	
	
	attachPwm: function(block) {
	    var freq = Blockly.Lua.valueToCode(block, 'FREQUENCY', Blockly.Lua.ORDER_NONE) || '\'\'';
	    var duty = Blockly.Lua.valueToCode(block, 'DUTY', Blockly.Lua.ORDER_NONE) || '\'\'';	
		var code = '';

		if (!Blockly.Lua.io.helper.hasAncestorsPwm(block)) {
			code += Blockly.Lua.indent(0,'if ('+Blockly.Lua.io.helper.instancePwm(block)+' == nil) then') + "\n";
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ' = pwm.attach('+ Blockly.Lua.io.helper.nameDigital(block)+', '+freq+', (' + duty + ') * 0.01)') + "\n";	
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ':start()') + "\n";	
			code += Blockly.Lua.indent(0,'else') + "\n";				
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ':setfreq('+freq+')') + "\n";	
			code += Blockly.Lua.indent(1,Blockly.Lua.io.helper.instancePwm(block) + ':setduty('+duty+' * 0.01)') + "\n";	
			code += Blockly.Lua.indent(0,'end') + "\n";				
		} else {
			code += Blockly.Lua.indent(0,Blockly.Lua.io.helper.instancePwm(block) + ':setfreq('+freq+')') + "\n";	
			code += Blockly.Lua.indent(0,Blockly.Lua.io.helper.instancePwm(block) + ':setduty('+duty+' * 0.01)') + "\n";	
		}

		return code;
	},
};

Blockly.Lua['setdigitalpin'] = function(block) {
	var value = block.getFieldValue('VALUE');
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.io.helper.attachDigital(block, true);
	tryCode += Blockly.Lua.indent(0,'pio.pin.setval('+value+', ' + Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";


	code += Blockly.Lua.tryBlock(0, block, tryCode, 'set digital pin ' + Blockly.Lua.io.helper.nameDigital(block) + ' to ' + value);
	
	return code;
};

Blockly.Lua['invertdigitalpin'] = function(block) {
	var value = block.getFieldValue('VALUE');
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.io.helper.attachDigital(block, true);
	tryCode += Blockly.Lua.indent(0,'pio.pin.inv(' + Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";


	code += Blockly.Lua.tryBlock(0, block, tryCode, 'invert digital pin value ' + Blockly.Lua.io.helper.nameDigital(block));
	
	return code;
};

Blockly.Lua['getdigitalpin'] = function(block) {
	var tryCode = '', getCode = '', code = '';

	Blockly.Lua.require("block");

	var tryCode = '';
	tryCode += Blockly.Lua.io.helper.attachDigital(block, false);
	tryCode += Blockly.Lua.indent(0, 'val = pio.pin.getval(' + Blockly.Lua.io.helper.nameDigital(block)+')') + "\n";

	getCode += Blockly.Lua.indent(0, "function _getDigitalPin" + Blockly.Lua.io.helper.instanceDigital(block) + "()") + "\n";
	getCode += Blockly.Lua.indent(1, "local val") + "\n\n";

	getCode += Blockly.Lua.indent(1, Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";

	getCode += Blockly.Lua.indent(1, "return val") + "\n";
	getCode += Blockly.Lua.indent(0, "end") + "\n";

	codeSection["functions"].push(getCode);

	code += Blockly.Lua.indent(0, "_getDigitalPin" + Blockly.Lua.io.helper.instanceDigital(block) + "()");

	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['getanalogpin'] = function(block) {
	var format = block.getFieldValue('FORMAT');
	var tryCode = '', getCode = '', code = '';

	Blockly.Lua.require("block");

	var tryCode = '';
	tryCode += Blockly.Lua.io.helper.attachAnalog(block, false);
	
	getCode += Blockly.Lua.indent(0, "-- get analog pin value " + Blockly.Lua.io.helper.nameAnalog(block)) + " \n";
	getCode += Blockly.Lua.indent(0, "function _getAnalogPin_" + Blockly.Lua.io.helper.nameAnalog(block) + "_" + format +  "()") + "\n";
	getCode += Blockly.Lua.indent(1, "local raw = nil") + "\n";
	getCode += Blockly.Lua.indent(1, "local mvolts = nil") + "\n\n";

	getCode += Blockly.Lua.indent(1, Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";

	getCode += Blockly.Lua.indent(1, 'raw, mvolts = '+Blockly.Lua.io.helper.instanceAnalog(block)+':read()') + "\n";
	if (format == 'mvolts') {
		getCode += Blockly.Lua.indent(1, 'val = mvolts') + "\n\n";
	} else {
		getCode += Blockly.Lua.indent(1, 'val = raw') + "\n\n";		
	}
	getCode += Blockly.Lua.indent(1, "return val") + "\n";
	getCode += Blockly.Lua.indent(0, "end") + "\n";

	codeSection["functions"].push(getCode);

	code += Blockly.Lua.indent(0, "_getAnalogPin_" + Blockly.Lua.io.helper.nameAnalog(block) + "_" + format + "()");

	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['getexternalanalogchannel'] = function(block) {
	var format = block.getFieldValue('FORMAT');
	var tryCode = '', getCode = '', code = '';

	Blockly.Lua.require("block");

	var tryCode = '';
	tryCode += Blockly.Lua.io.helper.attachExternalAnalog(block, false);
	
	getCode += Blockly.Lua.indent(0, "function _getAnalogPin_" + Blockly.Lua.io.helper.nameExternalAnalog(block) + "_" + format +  "()") + "\n";
	getCode += Blockly.Lua.indent(1, "local raw = nil") + "\n";
	getCode += Blockly.Lua.indent(1, "local mvolts = nil") + "\n\n";

	getCode += Blockly.Lua.indent(1, Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";

	getCode += Blockly.Lua.indent(1, 'raw, mvolts = '+Blockly.Lua.io.helper.instanceExternalAnalog(block)+':read()') + "\n";
	if (format == 'mvolts') {
		getCode += Blockly.Lua.indent(1, 'val = mvolts') + "\n\n";
	} else {
		getCode += Blockly.Lua.indent(1, 'val = raw') + "\n\n";		
	}
	getCode += Blockly.Lua.indent(1, "return val") + "\n";
	getCode += Blockly.Lua.indent(0, "end") + "\n";

	codeSection["functions"].push(getCode);

	code += Blockly.Lua.indent(0, "_getAnalogPin_" + Blockly.Lua.io.helper.nameExternalAnalog(block) + "_" + format + "()");

	return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['output_digital_pin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['output_digital_pin_sel'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['input_digital_pin'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['input_digital_pin_sel'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['pwm_pins'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['pwm_pins_sel'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['analog_pins'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['analog_pins_sel'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pinName = Code.status.maps.digitalPins[pin][0];
	
	return ['pio.' + pinName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['uart_units'] = function(block) {
	var unit = block.getFieldValue('UNIT');
	var unitName = Code.status.maps.uartUnits[unit][1];
	
	return ['uart.' + unitName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['external_analog_units'] = function(block) {
	var unit = block.getFieldValue('UNIT');
	var unitName = Code.status.maps.externalAdcUnits[unit][0];
	
	return ['adc.' + unitName, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['external_analog_channels'] = function(block) {
	var channel = block.getFieldValue('CHANNEL');
	
	return [channel, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['setpwmpin'] = function(block) {
    var freq = Blockly.Lua.valueToCode(block, 'FREQUENCY', Blockly.Lua.ORDER_NONE) || '\'\'';
    var duty = Blockly.Lua.valueToCode(block, 'DUTY', Blockly.Lua.ORDER_NONE) || '\'\'';	
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.io.helper.attachPwm(block);

	code += Blockly.Lua.tryBlock(0, block, tryCode, 'set pwm pin ' + Blockly.Lua.io.helper.namePwm(block) + ' to freq ' + freq + ' hz, duty (' + duty + ')%');
	
	return code;
};

Blockly.Lua['when_digital_pin'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var when = block.getFieldValue('WHEN');
	var tryCode = '', code = '';
	
	Blockly.Lua.require("block");

	tryCode += Blockly.Lua.indent(0,'-- we need to wait for the completion of the board start') + "\n";
	tryCode += Blockly.Lua.indent(0,'_eventBoardStarted:wait()') + "\n\n";

	tryCode += Blockly.Lua.io.helper.attachDigital(block, false);
	tryCode += Blockly.Lua.indent(0,'pio.pin.interrupt(' + Blockly.Lua.io.helper.nameDigital(block)+', function()') + "\n";

	tryCode += Blockly.Lua.blockStart(1, block);

	if (statement != "") {
		tryCode += Blockly.Lua.indent(1, statement);
	}

	tryCode += Blockly.Lua.blockEnd(1, block);

	tryCode += Blockly.Lua.indent(0,'end, pio.pin.'+when+')') + "\n";


	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";	
	code += Blockly.Lua.tryBlock(1, block,tryCode);	
	code += Blockly.Lua.indent(0, 'end)') + "\n";	

	return code;
};/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Generating Lua for list blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.lists');

goog.require('Blockly.Lua');


Blockly.Lua['lists_create_empty'] = function(block) {
  // Create an empty list.
  return ['{}', Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['lists_create_with'] = function(block) {
  // Create a list with any number of elements of any type.
  var elements = new Array(block.itemCount_);
  for (var i = 0; i < block.itemCount_; i++) {
    elements[i] = Blockly.Lua.valueToCode(block, 'ADD' + i,
        Blockly.Lua.ORDER_NONE) || 'None';
  }
  var code = '{' + elements.join(', ') + '}';
  return [code, Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['lists_repeat'] = function(block) {
  // Create a list with one element repeated.
  var functionName = Blockly.Lua.provideFunction_(
      'create_list_repeated',
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(item, count)',
       '  local t = {}',
       '  for i = 1, count do',
       '    table.insert(t, item)',
       '  end',
       '  return t',
       'end']);
  var element = Blockly.Lua.valueToCode(block, 'ITEM',
      Blockly.Lua.ORDER_NONE) || 'None';
  var repeatCount = Blockly.Lua.valueToCode(block, 'NUM',
      Blockly.Lua.ORDER_NONE) || '0';
  var code = functionName + '(' + element + ', ' + repeatCount + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['lists_length'] = function(block) {
  // String or array length.
  var list = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_UNARY) || '{}';
  return ['#' + list, Blockly.Lua.ORDER_UNARY];
};

Blockly.Lua['lists_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var list = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_UNARY) || '{}';
  var code = '#' + list + ' == 0';
  return [code, Blockly.Lua.ORDER_RELATIONAL];
};

Blockly.Lua['lists_indexOf'] = function(block) {
  // Find an item in the list.
  var item = Blockly.Lua.valueToCode(block, 'FIND',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  var list = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_NONE) || '{}';
  if (block.getFieldValue('END') == 'FIRST') {
    var functionName = Blockly.Lua.provideFunction_(
        'first_index',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t, elem)',
         '  for k, v in ipairs(t) do',
         '    if v == elem then',
         '      return k',
         '    end',
         '  end',
         '  return 0',
         'end']);
  } else {
    var functionName = Blockly.Lua.provideFunction_(
        'last_index',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t, elem)',
         '  for i = #t, 1, -1 do',
         '    if t[i] == elem then',
         '      return i',
         '    end',
         '  end',
         '  return 0',
         'end']);
  }
  var code = functionName + '(' + list + ', ' + item + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

/**
 * Returns an expression calculating the index into a list.
 * @private
 * @param {string} listName Name of the list, used to calculate length.
 * @param {string} where The method of indexing, selected by dropdown in Blockly
 * @param {string=} opt_at The optional offset when indexing from start/end.
 * @return {string} Index expression.
 */
Blockly.Lua.lists.getIndex_ = function(listName, where, opt_at) {
  if (where == 'FIRST') {
    return '1';
  } else if (where == 'FROM_END') {
    return '#' + listName + ' + 1 - ' + opt_at;
  } else if (where == 'LAST') {
    return '#' + listName;
  } else if (where == 'RANDOM') {
    return 'math.random(#' + listName + ')';
  } else {
    return opt_at;
  }
};

Blockly.Lua['lists_getIndex'] = function(block) {
  // Get element at index.
  // Note: Until January 2013 this block did not have MODE or WHERE inputs.
  var mode = block.getFieldValue('MODE') || 'GET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var list = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_HIGH) ||
      '{}';
  var getIndex_ = Blockly.Lua.lists.getIndex_;

  // If `list` would be evaluated more than once (which is the case for LAST,
  // FROM_END, and RANDOM) and is non-trivial, make sure to access it only once.
  if ((where == 'LAST' || where == 'FROM_END' || where == 'RANDOM') &&
      !list.match(/^\w+$/)) {
    // `list` is an expression, so we may not evaluate it more than once.
    if (mode == 'REMOVE') {
      // We can use multiple statements.
      var atOrder = (where == 'FROM_END') ? Blockly.Lua.ORDER_ADDITIVE :
          Blockly.Lua.ORDER_NONE;
      var at = Blockly.Lua.valueToCode(block, 'AT', atOrder) || '1';
      var listVar = Blockly.Lua.variableDB_.getDistinctName(
          'tmp_list', Blockly.Variables.NAME_TYPE);
      at = getIndex_(listVar, where, at);
      var code = listVar + ' = ' + list + '\n' +
          'table.remove(' + listVar + ', ' + at + ')\n';
      return code;
    } else {
      // We need to create a procedure to avoid reevaluating values.
      var at = Blockly.Lua.valueToCode(block, 'AT', Blockly.Lua.ORDER_NONE) ||
          '1';
      if (mode == 'GET') {
        var functionName = Blockly.Lua.provideFunction_(
            'list_get_' + where.toLowerCase(),
            ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t' +
                // The value for 'FROM_END' and'FROM_START' depends on `at` so
                // we add it as a parameter.
                ((where == 'FROM_END' || where == 'FROM_START') ?
                    ', at)' : ')'),
             '  return t[' + getIndex_('t', where, 'at') + ']',
             'end']);
      } else {  //  mode == 'GET_REMOVE'
        var functionName = Blockly.Lua.provideFunction_(
            'list_remove_' + where.toLowerCase(),
            ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t' +
                // The value for 'FROM_END' and'FROM_START' depends on `at` so
                // we add it as a parameter.
                ((where == 'FROM_END' || where == 'FROM_START') ?
                    ', at)' : ')'),
             '  return table.remove(t, ' + getIndex_('t', where, 'at') + ')',
             'end']);
      }
      var code = functionName + '(' + list +
          // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
          // pass it.
          ((where == 'FROM_END' || where == 'FROM_START') ? ', ' + at : '') +
          ')';
      return [code, Blockly.Lua.ORDER_HIGH];
    }
  } else {
    // Either `list` is a simple variable, or we only need to refer to `list`
    // once.
    var atOrder = (mode == 'GET' && where == 'FROM_END') ?
        Blockly.Lua.ORDER_ADDITIVE : Blockly.Lua.ORDER_NONE;
    var at = Blockly.Lua.valueToCode(block, 'AT', atOrder) || '1';
    at = getIndex_(list, where, at);
    if (mode == 'GET') {
      var code = list + '[' + at + ']';
      return [code, Blockly.Lua.ORDER_HIGH];
    } else {
      var code = 'table.remove(' + list + ', ' + at + ')';
      if (mode == 'GET_REMOVE') {
        return [code, Blockly.Lua.ORDER_HIGH];
      } else {  // `mode` == 'REMOVE'
        return code + '\n';
      }
    }
  }
};

Blockly.Lua['lists_setIndex'] = function(block) {
  // Set element at index.
  // Note: Until February 2013 this block did not have MODE or WHERE inputs.
  var list = Blockly.Lua.valueToCode(block, 'LIST',
      Blockly.Lua.ORDER_HIGH) || '{}';
  var mode = block.getFieldValue('MODE') || 'SET';
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var at = Blockly.Lua.valueToCode(block, 'AT',
      Blockly.Lua.ORDER_ADDITIVE) || '1';
  var value = Blockly.Lua.valueToCode(block, 'TO',
      Blockly.Lua.ORDER_NONE) || 'None';
  var getIndex_ = Blockly.Lua.lists.getIndex_;

  var code = '';
  // If `list` would be evaluated more than once (which is the case for LAST,
  // FROM_END, and RANDOM) and is non-trivial, make sure to access it only once.
  if ((where == 'LAST' || where == 'FROM_END' || where == 'RANDOM') &&
      !list.match(/^\w+$/)) {
    // `list` is an expression, so we may not evaluate it more than once.
    // We can use multiple statements.
    var listVar = Blockly.Lua.variableDB_.getDistinctName(
        'tmp_list', Blockly.Variables.NAME_TYPE);
    code = listVar + ' = ' + list + '\n';
    list = listVar;
  }
  if (mode == 'SET') {
    code += list + '[' + getIndex_(list, where, at) + '] = ' + value;
  } else {  // `mode` == 'INSERT'
    // LAST is a special case, because we want to insert
    // *after* not *before*, the existing last element.
    code += 'table.insert(' + list + ', ' +
        (getIndex_(list, where, at) + (where == 'LAST' ? ' + 1' : '')) +
        ', ' + value + ')';
  }
  return code + '\n';
};

Blockly.Lua['lists_getSublist'] = function(block) {
  // Get sublist.
  var list = Blockly.Lua.valueToCode(block, 'LIST',
      Blockly.Lua.ORDER_NONE) || '{}';
  var where1 = block.getFieldValue('WHERE1');
  var where2 = block.getFieldValue('WHERE2');
  var at1 = Blockly.Lua.valueToCode(block, 'AT1',
      Blockly.Lua.ORDER_NONE) || '1';
  var at2 = Blockly.Lua.valueToCode(block, 'AT2',
      Blockly.Lua.ORDER_NONE) || '1';
  var getIndex_ = Blockly.Lua.lists.getIndex_;

  var functionName = Blockly.Lua.provideFunction_(
      'list_sublist_' + where1.toLowerCase() + '_' + where2.toLowerCase(),
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(source' +
          // The value for 'FROM_END' and'FROM_START' depends on `at` so
          // we add it as a parameter.
          ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', at1' : '') +
          ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', at2' : '') +
          ')',
       '  local t = {}',
       '  local start = ' + getIndex_('source', where1, 'at1'),
       '  local finish = ' + getIndex_('source', where2, 'at2'),
       '  for i = start, finish do',
       '    table.insert(t, source[i])',
       '  end',
       '  return t',
       'end']);
  var code = functionName + '(' + list +
      // The value for 'FROM_END' and 'FROM_START' depends on `at` so we
      // pass it.
      ((where1 == 'FROM_END' || where1 == 'FROM_START') ? ', ' + at1 : '') +
      ((where2 == 'FROM_END' || where2 == 'FROM_START') ? ', ' + at2 : '') +
      ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['lists_sort'] = function(block) {
  // Block for sorting a list.
  var list = Blockly.Lua.valueToCode(
      block, 'LIST', Blockly.Lua.ORDER_NONE) || '{}';
  var direction = block.getFieldValue('DIRECTION') === '1' ? 1 : -1;
  var type = block.getFieldValue('TYPE');

  var functionName = Blockly.Lua.provideFunction_(
      'list_sort',
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
          '(list, typev, direction)',
       '  local t = {}',
       '  for n,v in pairs(list) do table.insert(t, v) end', // Shallow-copy.
       '  local compareFuncs = {',
       '    NUMERIC = function(a, b)',
       '      return (tonumber(tostring(a)) or 0)',
       '          < (tonumber(tostring(b)) or 0) end,',
       '    TEXT = function(a, b)',
       '      return tostring(a) < tostring(b) end,',
       '    IGNORE_CASE = function(a, b)',
       '      return string.lower(tostring(a)) < string.lower(tostring(b)) end',
       '  }',
       '  local compareTemp = compareFuncs[typev]',
       '  local compare = compareTemp',
       '  if direction == -1',
       '  then compare = function(a, b) return compareTemp(b, a) end',
       '  end',
       '  table.sort(t, compare)',
       '  return t',
       'end']);

  var code = functionName +
      '(' + list + ',"' + type + '", ' + direction + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['lists_split'] = function(block) {
  // Block for splitting text into a list, or joining a list into text.
  var input = Blockly.Lua.valueToCode(block, 'INPUT',
      Blockly.Lua.ORDER_NONE);
  var delimiter = Blockly.Lua.valueToCode(block, 'DELIM',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  var mode = block.getFieldValue('MODE');
  var functionName;
  if (mode == 'SPLIT') {
    if (!input) {
      input = '\'\'';
    }
    functionName = Blockly.Lua.provideFunction_(
        'list_string_split',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
            '(input, delim)',
         '  local t = {}',
         '  local pos = 1',
         '  while true do',
         '    next_delim = string.find(input, delim, pos)',
         '    if next_delim == nil then',
         '      table.insert(t, string.sub(input, pos))',
         '      break',
         '    else',
         '      table.insert(t, string.sub(input, pos, next_delim-1))',
         '      pos = next_delim + #delim',
         '    end',
         '  end',
         '  return t',
         'end']);
  } else if (mode == 'JOIN') {
    if (!input) {
      input = '{}';
    }
    functionName = 'table.concat';
  } else {
    throw 'Unknown mode: ' + mode;
  }
  var code = functionName + '(' + input + ', ' + delimiter + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};
/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Generating Lua for logic blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.logic');

goog.require('Blockly.Lua');


Blockly.Lua['controls_if'] = function(block) {
  // If/elseif/else condition.
  var n = 0;
  var code = '', branchCode, conditionCode;
  do {
    conditionCode = Blockly.Lua.valueToCode(block, 'IF' + n,
      Blockly.Lua.ORDER_NONE) || 'false';
    branchCode = Blockly.Lua.statementToCode(block, 'DO' + n);
    code += (n > 0 ? 'else' : '') +
        'if ' + conditionCode + ' then\n' + branchCode;

    ++n;
  } while (block.getInput('IF' + n));

  if (block.getInput('ELSE')) {
    branchCode = Blockly.Lua.statementToCode(block, 'ELSE');
    code += 'else\n' + branchCode;
  }
  return code + 'end\n';
};

Blockly.Lua['controls_ifelse'] = Blockly.Lua['controls_if'];

Blockly.Lua['logic_compare'] = function(block) {
  // Comparison operator.
  var OPERATORS = {
    'EQ': '==',
    'NEQ': '~=',
    'LT': '<',
    'LTE': '<=',
    'GT': '>',
    'GTE': '>='
  };
  var operator = OPERATORS[block.getFieldValue('OP')];
  var argument0 = Blockly.Lua.valueToCode(block, 'A',
      Blockly.Lua.ORDER_RELATIONAL) || '0';
  var argument1 = Blockly.Lua.valueToCode(block, 'B',
      Blockly.Lua.ORDER_RELATIONAL) || '0';
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, Blockly.Lua.ORDER_RELATIONAL];
};

Blockly.Lua['logic_operation'] = function(block) {
  // Operations 'and', 'or'.
  var operator = (block.getFieldValue('OP') == 'AND') ? 'and' : 'or';
  var order = (operator == 'and') ? Blockly.Lua.ORDER_AND :
      Blockly.Lua.ORDER_OR;
  var argument0 = Blockly.Lua.valueToCode(block, 'A', order);
  var argument1 = Blockly.Lua.valueToCode(block, 'B', order);
  if (!argument0 && !argument1) {
    // If there are no arguments, then the return value is false.
    argument0 = 'false';
    argument1 = 'false';
  } else {
    // Single missing arguments have no effect on the return value.
    var defaultArgument = (operator == 'and') ? 'true' : 'false';
    if (!argument0) {
      argument0 = defaultArgument;
    }
    if (!argument1) {
      argument1 = defaultArgument;
    }
  }
  var code = argument0 + ' ' + operator + ' ' + argument1;
  return [code, order];
};

Blockly.Lua['logic_negate'] = function(block) {
  // Negation.
  var argument0 = Blockly.Lua.valueToCode(block, 'BOOL',
      Blockly.Lua.ORDER_UNARY) || 'true';
  var code = 'not ' + argument0;
  return [code, Blockly.Lua.ORDER_UNARY];
};

Blockly.Lua['logic_boolean'] = function(block) {
  // Boolean values true and false.
  var code = (block.getFieldValue('BOOL') == 'TRUE') ? 'true' : 'false';
  return [code, Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['logic_null'] = function(block) {
  // Null data type.
  return ['nil', Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['logic_ternary'] = function(block) {
  // Ternary operator.
  var value_if = Blockly.Lua.valueToCode(block, 'IF',
      Blockly.Lua.ORDER_AND) || 'false';
  var value_then = Blockly.Lua.valueToCode(block, 'THEN',
      Blockly.Lua.ORDER_AND) || 'nil';
  var value_else = Blockly.Lua.valueToCode(block, 'ELSE',
      Blockly.Lua.ORDER_OR) || 'nil';
  var code = value_if + ' and ' + value_then + ' or ' + value_else;
  return [code, Blockly.Lua.ORDER_OR];
};
/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Generating Lua for loop blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.loops');

goog.require('Blockly.Lua');


/**
 * This is the text used to implement a <pre>continue</pre>.
 * It is also used to recognise <pre>continue</pre>s in generated code so that
 * the appropriate label can be put at the end of the loop body.
 * @const {string}
 */
Blockly.Lua.CONTINUE_STATEMENT = 'goto continue\n';

/**
 * If the loop body contains a "goto continue" statement, add a continue label
 * to the loop body. Slightly inefficient, as continue labels will be generated
 * in all outer loops, but this is safer than duplicating the logic of
 * blockToCode.
 *
 * @param {string} branch Generated code of the loop body
 * @return {string} Generated label or '' if unnecessary
 */
Blockly.Lua.addContinueLabel = function(branch) {
  if (branch.indexOf(Blockly.Lua.CONTINUE_STATEMENT) > -1) {
    return branch + Blockly.Lua.INDENT + '::continue::\n';
  } else {
    return branch;
  }
};

Blockly.Lua['controls_repeat'] = function(block) {
  // Repeat n times (internal number).
  var repeats = parseInt(block.getFieldValue('TIMES'), 10);
  var branch = Blockly.Lua.statementToCode(block, 'DO') || '';
  branch = Blockly.Lua.addContinueLabel(branch);
  var loopVar = Blockly.Lua.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = 'for ' + loopVar + ' = 1, ' + repeats + ' do\n' + branch + 'end\n';
  return code;
};

Blockly.Lua['controls_repeat_ext'] = function(block) {
  // Repeat n times (external number).
  var repeats = Blockly.Lua.valueToCode(block, 'TIMES',
      Blockly.Lua.ORDER_NONE) || '0';
  if (Blockly.isNumber(repeats)) {
    repeats = parseInt(repeats, 10);
  } else {
    repeats = 'math.floor(' + repeats + ')';
  }
  var branch = Blockly.Lua.statementToCode(block, 'DO') || '\n';
  branch = Blockly.Lua.addContinueLabel(branch);
  var loopVar = Blockly.Lua.variableDB_.getDistinctName(
      'count', Blockly.Variables.NAME_TYPE);
  var code = 'for ' + loopVar + ' = 1, ' + repeats + ' do\n' +
      branch + 'end\n';
  return code;
};

Blockly.Lua['controls_whileUntil'] = function(block) {
  // Do while/until loop.
  var until = block.getFieldValue('MODE') == 'UNTIL';
  var argument0 = Blockly.Lua.valueToCode(block, 'BOOL',
      until ? Blockly.Lua.ORDER_UNARY :
      Blockly.Lua.ORDER_NONE) || 'false';
  var branch = Blockly.Lua.statementToCode(block, 'DO') || '\n';
  branch = Blockly.Lua.addLoopTrap(branch, block.id);
  branch = Blockly.Lua.addContinueLabel(branch);
  if (until) {
    argument0 = 'not ' + argument0;
  }
  return 'while ' + argument0 + ' do\n' + branch + 'end\n';
};

Blockly.Lua['controls_for'] = function(block) {
  // For loop.
  var variable0 = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var startVar = Blockly.Lua.valueToCode(block, 'FROM',
      Blockly.Lua.ORDER_NONE) || '0';
  var endVar = Blockly.Lua.valueToCode(block, 'TO',
      Blockly.Lua.ORDER_NONE) || '0';
  var increment = Blockly.Lua.valueToCode(block, 'BY',
      Blockly.Lua.ORDER_NONE) || '1';
  var branch = Blockly.Lua.statementToCode(block, 'DO') || '\n';
  branch = Blockly.Lua.addLoopTrap(branch, block.id);
  branch = Blockly.Lua.addContinueLabel(branch);
  var code = '';
  var incValue;
  if (Blockly.isNumber(startVar) && Blockly.isNumber(endVar) &&
      Blockly.isNumber(increment)) {
    // All arguments are simple numbers.
    var up = parseFloat(startVar) <= parseFloat(endVar);
    var step = Math.abs(parseFloat(increment));
    incValue = (up ? '' : '-') + step;
  } else {
    code = '';
    // Determine loop direction at start, in case one of the bounds
    // changes during loop execution.
    incValue = Blockly.Lua.variableDB_.getDistinctName(
        variable0 + '_inc', Blockly.Variables.NAME_TYPE);
    code += incValue + ' = ';
    if (Blockly.isNumber(increment)) {
      code += Math.abs(increment) + '\n';
    } else {
      code += 'math.abs(' + increment + ')\n';
    }
    code += 'if (' + startVar + ') > (' + endVar + ') then\n';
    code += Blockly.Lua.INDENT + incValue + ' = -' + incValue + '\n';
    code += 'end\n';
  }
  code += 'for ' + variable0 + ' = ' + startVar + ', ' + endVar +
      ', ' + incValue;
  code += ' do\n' + branch + 'end\n';
  return code;
};

Blockly.Lua['controls_forEach'] = function(block) {
  // For each loop.
  var variable0 = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var argument0 = Blockly.Lua.valueToCode(block, 'LIST',
      Blockly.Lua.ORDER_NONE) || '{}';
  var branch = Blockly.Lua.statementToCode(block, 'DO') || '\n';
  branch = Blockly.Lua.addContinueLabel(branch);
  var code = 'for _, ' + variable0 + ' in ipairs(' + argument0 + ') do \n' +
      branch + 'end\n';
  return code;
};

Blockly.Lua['controls_flow_statements'] = function(block) {
  // Flow statements: continue, break.
  switch (block.getFieldValue('FLOW')) {
    case 'BREAK':
      return 'break\n';
    case 'CONTINUE':
      return Blockly.Lua.CONTINUE_STATEMENT;
  }
  throw 'Unknown flow statement.';
};/*
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

  return 'lora.attach(' + band + ')\n';
};

Blockly.Lua['lora_set_devaddr'] = function(block) {
  var devAddr = Blockly.Lua.valueToCode(block, 'DEVADDR', Blockly.Lua.ORDER_NONE) || '\'\'';	

  return 'lora.setDevAddr(' + devAddr + ')\n';
};

Blockly.Lua['lora_set_nwkskey'] = function(block) {
  var nwkSKey = Blockly.Lua.valueToCode(block, 'NWKSKEY', Blockly.Lua.ORDER_NONE) || '\'\'';	

  return 'lora.setNwksKey(' + nwkSKey + ')\n';
};

Blockly.Lua['lora_set_appskey'] = function(block) {
  var appSKey = Blockly.Lua.valueToCode(block, 'APPSKEY', Blockly.Lua.ORDER_NONE) || '\'\'';	

  return 'lora.setAppsKey(' + appSKey + ')\n';
};

Blockly.Lua['lora_set_deveui'] = function(block) {
  var devEui = Blockly.Lua.valueToCode(block, 'DEVEUI', Blockly.Lua.ORDER_NONE) || '\'\'';	

  return 'lora.setDevEui(' + devEui + ')\n';
};

Blockly.Lua['lora_set_appeui'] = function(block) {
  var appEui = Blockly.Lua.valueToCode(block, 'APPEUI', Blockly.Lua.ORDER_NONE) || '\'\'';	

  return 'lora.setAppEui(' + appEui + ')\n';
};

Blockly.Lua['lora_set_appkey'] = function(block) {
  var appKey = Blockly.Lua.valueToCode(block, 'APPKEY', Blockly.Lua.ORDER_NONE) || '\'\'';	

  return 'lora.setAppKey(' + appKey + ')\n';
};

Blockly.Lua['lora_set_adr'] = function(block) {
  var on_off = block.getFieldValue('ON_OFF');
  var value = "true";
  
  if (on_off == "0") {
  	value = "false";
  }
  
  return 'lora.setAdr(' + value + ')\n';
};

Blockly.Lua['lora_set_dr'] = function(block) {
  var value = block.getFieldValue('DR');

  return 'lora.setDr(' + value + ')\n';
};

Blockly.Lua['lora_set_retx'] = function(block) {
  var value = block.getFieldValue('RETX');

  return 'lora.setReTx(' + value + ')\n';
};

Blockly.Lua['when_i_receive_a_lora_frame'] = function(block) {
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var tryCode = '';
	var code = '';
	
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	tryCode += Blockly.Lua.indent(0,'-- we need to wait for the completion of the board start') + "\n";
	tryCode += Blockly.Lua.indent(0,'_eventBoardStarted:wait()') + "\n\n";

	tryCode += Blockly.Lua.indent(0,'lora.whenReceived(function(port, payload)') + "\n";
	
	tryCode += Blockly.Lua.blockStart(1, block);
	if (statement != '') {
		tryCode += Blockly.Lua.tryBlock(1,block, statement);
	}
	tryCode += Blockly.Lua.blockEnd(1, block);
	
	tryCode += Blockly.Lua.indent(0,'end)') + "\n";
	
	code += Blockly.Lua.indent(0,'-- when I receive a LoRa frame') + "\n";
	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";	
	code += Blockly.Lua.tryBlock(1, block,tryCode);	
	code += Blockly.Lua.indent(0, 'end)') + "\n";	
	
	return code;
}

Blockly.Lua['lora_join'] = function(block) {
	var code = '';

	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	var tryCode = '';	
	tryCode += Blockly.Lua.indent(0,'if (_lora == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(1,'_lora = true') + "\n";
	tryCode += Blockly.Lua.indent(1,'lora.attach(lora.BAND'+block.band+')') + "\n";
	tryCode += Blockly.Lua.indent(1,'lora.setAppEui("'+block.appeui+'")') + "\n";
	tryCode += Blockly.Lua.indent(1,'lora.setAppKey("'+block.appkey+'")') + "\n";		
	tryCode += Blockly.Lua.indent(1,'lora.setDr('+block.dr+')') + "\n";
	//tryCode += Blockly.Lua.indent(2,'lora.setAdr('+block.adr+')') + "\n";
	tryCode += Blockly.Lua.indent(1,'lora.setReTx('+block.retx+')') + "\n";
	tryCode += Blockly.Lua.indent(1,'\nif (os.flashEUI() == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(2,'lora.setDevEui("'+block.deveui+'")') + "\n";
	tryCode += Blockly.Lua.indent(1,'end') + "\n\n";

	tryCode += Blockly.Lua.indent(0,'end') + "\n\n";
	
	tryCode += Blockly.Lua.blockStart(0, block);
	tryCode += Blockly.Lua.indent(0,'lora.join()') + "\n";
	tryCode += Blockly.Lua.blockEnd(0, block);

	code += Blockly.Lua.indent(0,'-- lora join') + "\n";
	code += Blockly.Lua.tryBlock(0, block, tryCode) + "\n";
	
	return code;
};

Blockly.Lua['lora_tx'] = function(block) {
    var payload = Blockly.Lua.valueToCode(block, 'PAYLOAD', Blockly.Lua.ORDER_NONE) || '\'\'';
    var port = Blockly.Lua.valueToCode(block, 'PORT', Blockly.Lua.ORDER_NONE);
    var confirmed = block.getFieldValue('CONF');
	var code = '';

	if (confirmed == "0") {
		confirmed = "false";
	} else {
		confirmed = "true";
	}

	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	var tryCode = '';	

	tryCode += Blockly.Lua.blockStart(0, block);

	tryCode += Blockly.Lua.indent(0,'-- setup LoRa WAN stack, if needed') + "\n";
	tryCode += Blockly.Lua.indent(0,'if (_lora == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(1,'_lora = true') + "\n";
	tryCode += Blockly.Lua.indent(1,'lora.attach(lora.BAND'+block.band+')') + "\n";

	if (block.activation == 'OTAA') {
		tryCode += Blockly.Lua.indent(1,'\nif (os.flashEUI() == nil) then') + "\n";
		tryCode += Blockly.Lua.indent(2,'lora.setDevEui("'+block.deveui+'")') + "\n";
		tryCode += Blockly.Lua.indent(1,'end') + "\n\n";

		tryCode += Blockly.Lua.indent(1,'lora.setAppEui("'+block.appeui+'")') + "\n";
		tryCode += Blockly.Lua.indent(1,'lora.setAppKey("'+block.appkey+'")') + "\n";		
	} else {
		tryCode += Blockly.Lua.indent(1,'lora.setDevAddr("'+block.devaddr+'")') + "\n";
		tryCode += Blockly.Lua.indent(1,'lora.setNwksKey("'+block.nwkskey+'")') + "\n";				
		tryCode += Blockly.Lua.indent(1,'lora.setAppsKey("'+block.appskey+'")') + "\n";				
	}
	
	tryCode += Blockly.Lua.indent(1,'lora.setDr('+block.dr+')') + "\n";
	tryCode += Blockly.Lua.indent(1,'lora.setAdr('+block.adr+')') + "\n";
	tryCode += Blockly.Lua.indent(1,'lora.setReTx('+block.retx+')') + "\n";

	tryCode += Blockly.Lua.indent(0,'end') + "\n\n";

	tryCode += Blockly.Lua.indent(0,'-- transmit') + "\n";
	tryCode += Blockly.Lua.indent(0,'lora.tx('+confirmed+', '+port+', '+payload+')') + "\n";
	
	tryCode += Blockly.Lua.blockEnd(0, block);

	code += Blockly.Lua.indent(0,'-- lora tx') + "\n";
	code += Blockly.Lua.tryBlock(0, block, tryCode) + "\n";
	
	return code;
};// Code sections
var codeSection = [];
var codeSectionBlock = [];

codeSection["require"] = [];
codeSection["events"] = [];
codeSection["functions"] = [];
codeSectionBlock["functions"] = [];
codeSection["declaration"] = [];
codeSection["start"] = [];
codeSection["afterStart"] = [];
codeSection["default"] = [];

// Order of code sections
var codeSectionOrder = [];
codeSectionOrder.push("require");
codeSectionOrder.push("events");
codeSectionOrder.push("functions");
codeSectionOrder.push("declaration");
codeSectionOrder.push("default");
codeSectionOrder.push("start");
codeSectionOrder.push("afterStart");

// Whe indent using a tab
Blockly.Generator.prototype.INDENT = '\t';

// Add a fragment of code to a section
Blockly.Generator.prototype.addCodeToSection = function(section, code, block) {
	var include = true;

	section = goog.string.trim(section);
	code = goog.string.trim(code);
	
	if (section == "functions") {
		include = (codeSectionBlock["functions"].indexOf(block.type) == -1);
		codeSectionBlock["functions"].push(block.type);
	}

	if (include) {
		codeSection[section].push(code + "\n");
	}
};

// Add a lua library dependency needed for the generated code
Blockly.Generator.prototype.addDependency = function(library, block) {
	library = goog.string.trim(library);

	if ((library == "") || (library == "0")) return;
	
	if (codeSection["require"].indexOf('require("'+library+'")') == -1) {
		codeSection["require"].push('require("'+library+'")');
	}
};

Blockly.Generator.prototype.postFormat = function(code, block) {
	// Trim code
	// This clean spaces and new lines at the begin and at the end
	code = goog.string.trim(code);
	
	// Add new line
	code = code + "\n";
	
	// If block is connected to other block, add a new line
	if (block.nextConnection && block.nextConnection.isConnected()) {
		code = code + "\n";
	}
	
	return code;
};

Blockly.Generator.prototype.statementToCodeNoIndent = function(block, name) {
	var targetBlock = block.getInputTargetBlock(name);
	var code = this.blockToCode(targetBlock);
	// Value blocks must return code and order of operations info.
	// Statement blocks must only return code.
	goog.asserts.assertString(code, 'Expecting code from statement block "%s".',
		targetBlock && targetBlock.type);
	return code;
};

Blockly.Generator.prototype.workspaceToCode = function(workspace) {
	if (!workspace) {
		// Backwards compatability from before there could be multiple workspaces.
		console.warn('No workspace specified in workspaceToCode call.  Guessing.');
		workspace = Blockly.getMainWorkspace();
	}

	/*
	 * Some blocks must be allocate it's generated code in specific code regions. For example,
	 * "when a lora frame is received" block must be allocated prior to execute anything.
	 *
	 * This part define sections of code
	 */
	var section = "default";
	var key;

	// Clean sections
	for (key in codeSection) {
		codeSection[key] = [];
	}

	for (key in codeSectionBlock) {
		codeSectionBlock[key] = [];
	}
	
	// Check if code use some type of blocks
	var hasBoardStart = false;
	var hasMQTT = false;
	var hasNetwork = false;
	
	this.init(workspace);
	var blocks = workspace.getAllBlocks();
	for (var x = 0, block; block = blocks[x]; x++) {
		if (block.disabled || block.getInheritedDisabled()) {
			continue;
		}
		if (block.type == 'when_board_starts') {
			hasBoardStart = true;
		}

		if ((block.type == 'mqtt_publish') || ((block.type == 'mqtt_subscribe') && block.isInHatBlock())) {
			hasMQTT = true;
		}

		if ((block.type == 'wifi_start') || ((block.type == 'wifi_stop') && block.isInHatBlock())) {
			hasNetwork = true;
		}
	}
	
	// Initialization code
	blocks = workspace.getTopBlocks(true);
	
	var initCode = '';
	
	initCode += Blockly.Lua.indent(0,'-- this event is for sync the end of the board start with threads') + "\n";
	initCode += Blockly.Lua.indent(0,'-- that must wait for this situation') + "\n";
	initCode += Blockly.Lua.indent(0,'_eventBoardStarted = event.create()') + "\n\n";
	
	if (hasMQTT) {
		initCode += Blockly.Lua.indent(0,'-- this lock is for protect the mqtt client connection') + "\n";
		initCode += Blockly.Lua.indent(0,'_mqtt_lock = thread.createmutex()') + "\n\n";		
	}

	if (hasNetwork) {		
		initCode += Blockly.Lua.indent(0,'-- network callback') + "\n";
		initCode += Blockly.Lua.indent(0, 'net.callback(function(event)') +  "\n";
		initCode += Blockly.Lua.indent(1, 'if ((event.interface == "wf") and (event.type == "up")) then') + "\n";
		initCode += Blockly.Lua.indent(2, '-- call user callbacks') + "\n";
		initCode += Blockly.Lua.indent(2, 'if (not (_network_callback_wifi_connected == nil)) then') + "\n";
		initCode += Blockly.Lua.indent(3, '_network_callback_wifi_connected()') +  "\n";
		initCode += Blockly.Lua.indent(2, 'end') +  "\n";
		initCode += Blockly.Lua.indent(1, 'elseif ((event.interface == "wf") and (event.type == "down")) then') + "\n";
		initCode += Blockly.Lua.indent(2, '-- call user callbacks') + "\n";
		initCode += Blockly.Lua.indent(2, 'if (not (_network_callback_wifi_disconnected == nil)) then') + "\n";
		initCode += Blockly.Lua.indent(3, '_network_callback_wifi_disconnected()') +  "\n";
		initCode += Blockly.Lua.indent(2, 'end') +  "\n";
		initCode += Blockly.Lua.indent(1, 'end') +  "\n";
		initCode += Blockly.Lua.indent(0, 'end)') +  "\n";
	}
	
	codeSection["events"].push(initCode);
	
	// Begin
	for (var x = 0, block; block = blocks[x]; x++) {
	    if (!block.isHatBlock()) {
	      // Don't include code for blocks that are outside a hat block
	      continue;
	    }	
    
		// Put code in default section
		section = "default";

		// If this block has the section function get section that block's code will be
		// allocated
		if (typeof block.section !== "undefined") {
			section = block.section();
		}

		var line = this.blockToCode(block);
		if (goog.isArray(line)) {
			// Value blocks return tuples of code and operator order.
			// Top-level blocks don't care about operator order.
			line = line[0];
		}
		if (line) {
			if (block.outputConnection && this.scrubNakedValue) {
				// This block is a naked value.  Ask the language's code generator if
				// it wants to append a semicolon, or something.
				line = this.scrubNakedValue(line);
			}

			// Put code in its section
		  codeSection[section].push(line);	
		}
	}

	// If when board start has not defined simulate and empty when board start block
	if (!hasBoardStart) {
		initCode = Blockly.Lua.indent(0,'thread.start(function()') + "\n";
		initCode += Blockly.Lua.indent(1,'-- board is started') + "\n";
		initCode += Blockly.Lua.indent(1,'_eventBoardStarted:broadcast(false)') + "\n";
		initCode += Blockly.Lua.indent(0,'end)') + "\n";
		codeSection["start"].push(initCode);		
	}

	// Put definitions into declaration section
	for (var name in Blockly.Lua.definitions_) {
		codeSection["declaration"].push(Blockly.Lua.definitions_[name]);
	}

	// Clean up temporary data
	delete Blockly.Lua.definitions_;
	delete Blockly.Lua.functionNames_;
	
	Blockly.Lua.variableDB_.reset();

	// Generate code from code sections
	var code = "";
	var tmpCode = "";

	codeSectionOrder.forEach(function(section, index) {
		if (codeSection[section] != ""){
			tmpCode = codeSection[section].join('\n'); // Blank line between each section.	
			code += tmpCode + '\n';

			if (section == "require") {
				code += "\n";
			}			
		}		
	});

	// Final scrubbing of whitespace.
	code = code.replace(/^\s+\n/, '');
	code = code.replace(/\n\s+$/, '\n');
	code = code.replace(/[ \t]+\n/g, '\n');

	return code;
};

Blockly.Generator.prototype.usesMQTT = function(workspace) {
	if (!workspace) {
		// Backwards compatability from before there could be multiple workspaces.
		console.warn('No workspace specified in workspaceToCode call.  Guessing.');
		workspace = Blockly.getMainWorkspace();
	}


	var blocks = workspace.getAllBlocks();
	for (var x = 0, block; block = blocks[x]; x++) {
		if ((block.type == "mqtt_publish") || (block.type == "mqtt_subscribe")) {
			return true;
		}
	}

	return false;
};

Blockly.Generator.prototype.oneBlockToCode = function(block) {
	if (!block) {
		return '';
	}
	if (block.disabled) {
		// Skip past this block if it is disabled.
		return this.blockToCode(block.getNextBlock());
	}

	var func = this[block.type];
	goog.asserts.assertFunction(func,
		'Language "%s" does not know how to generate code for block type "%s".',
		this.name_, block.type);
	// First argument to func.call is the value of 'this' in the generator.
	// Prior to 24 September 2013 'this' was the only way to access the block.
	// The current prefered method of accessing the block is through the second
	// argument to func.call, which becomes the first parameter to the generator.
	var code = func.call(block, block);
	if (goog.isArray(code)) {
		// Value blocks return tuples of code and operator order.
		goog.asserts.assert(block.outputConnection,
			'Expecting string from statement block "%s".', block.type);
		return [this.scrub_(block, code[0]), code[1]];
	} else if (goog.isString(code)) {
		var id = block.id.replace(/\$/g, '$$$$'); // Issue 251.
		if (this.STATEMENT_PREFIX) {
			code = this.STATEMENT_PREFIX.replace(/%1/g, '\'' + id + '\'') +
				code;
		}
		return code;
	} else if (code === null) {
		// Block has handled code generation itself.
		return '';
	} else {
		goog.asserts.fail('Invalid code generated: %s', code);
	}
};

// Generate code for a watcher over a block
Blockly.Generator.prototype.blockWatcherCode = function(block) {
	var workspace = block.workspace;
	var code = [];
	var key;
	
	this.init(workspace);

	// Clean code sections
	for (key in codeSection) {
		codeSection[key] = [];
	}
	
	codeSection["require"].push('require("block")');

	// Get code
	var line = this.oneBlockToCode(block);

	codeSectionOrder.forEach(function(section, index) {
		if (section != "default") {
			if (codeSection[section] != "") {
				code += codeSection[section].join('\n') + "\n";				
			}
		}
	});

	code += "function _code()\n";
	code += "local previous = wcBlock.developerMode\n";
	code += "wcBlock.developerMode = false\n";
	if (goog.isArray(line)) {
		code += "print(" + line[0] + ")\n";
	} else {
		code += "print(" + line + ")\n";
	}
	code += "wcBlock.developerMode = previous\n";
	code += "end";

	return code;
};

// Generate code for one block
Blockly.Generator.prototype.blockCode = function(block) {
	var workspace = block.workspace;
	var code = [];
	var key;
	
	this.init(workspace);

	// Clean code sections
	for(key in codeSection) {
		codeSection[key] = [];
	}

	codeSection["require"].push('require("block")');

	// Get code
	var line = this.oneBlockToCode(block);

	codeSectionOrder.forEach(function(section, index) {
		if (section != "default") {
			if (codeSection[section] != "") {
				code += codeSection[section].join('\n') + "\n";				
			}
		}
	});

	code += "function _code()\n";
	code += "thread.start(function()\n";
	code += "local previous = wcBlock.developerMode\n";
	code += "wcBlock.developerMode = false\n";
	if (goog.isArray(line)) {
		code += line[0] + "\n";
	} else {
		code += line + "\n";
	}
	code += "wcBlock.developerMode = previous\n";
	code += "end)\n";
	code += "end";

	return code;
};
/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Generating Lua for math blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.math');

goog.require('Blockly.Lua');


Blockly.Lua['math_number'] = function(block) {
  // Numeric value.
  var code = parseFloat(block.getFieldValue('NUM'));
  var order = code < 0 ? Blockly.Lua.ORDER_UNARY :
              Blockly.Lua.ORDER_ATOMIC;
  return [code, order];
};

Blockly.Lua['math_arithmetic'] = function(block) {
  // Basic arithmetic operators, and power.
  var OPERATORS = {
    ADD: [' + ', Blockly.Lua.ORDER_ADDITIVE],
    MINUS: [' - ', Blockly.Lua.ORDER_ADDITIVE],
    MULTIPLY: [' * ', Blockly.Lua.ORDER_MULTIPLICATIVE],
    DIVIDE: [' / ', Blockly.Lua.ORDER_MULTIPLICATIVE],
    POWER: [' ^ ', Blockly.Lua.ORDER_EXPONENTIATION]
  };
  var tuple = OPERATORS[block.getFieldValue('OP')];
  var operator = tuple[0];
  var order = tuple[1];
  var argument0 = Blockly.Lua.valueToCode(block, 'A', order) || '0';
  var argument1 = Blockly.Lua.valueToCode(block, 'B', order) || '0';
  var code = argument0 + operator + argument1;
  return [code, order];
};

Blockly.Lua['math_single'] = function(block) {
  // Math operators with single operand.
  var operator = block.getFieldValue('OP');
  var code;
  var arg;
  if (operator == 'NEG') {
    // Negation is a special case given its different operator precedence.
    arg = Blockly.Lua.valueToCode(block, 'NUM',
        Blockly.Lua.ORDER_UNARY) || '0';
    return ['-' + arg, Blockly.Lua.ORDER_UNARY];
  }
  if (operator == 'SIN' || operator == 'COS' || operator == 'TAN') {
    arg = Blockly.Lua.valueToCode(block, 'NUM',
        Blockly.Lua.ORDER_MULTIPLICATIVE) || '0';
  } else {
    arg = Blockly.Lua.valueToCode(block, 'NUM',
        Blockly.Lua.ORDER_NONE) || '0';
  }
  switch (operator) {
    case 'ABS':
      code = 'math.abs(' + arg + ')';
      break;
    case 'ROOT':
      code = 'math.sqrt(' + arg + ')';
      break;
    case 'LN':
      code = 'math.log(' + arg + ')';
      break;
    case 'LOG10':
      code = 'math.log(' + arg + ', 10)';
      break;
    case 'EXP':
      code = 'math.exp(' + arg + ')';
      break;
    case 'POW10':
      code = '10 ^ ' + arg;
      break;
    case 'ROUND':
      // This rounds up.  Blockly does not specify rounding direction.
      code = 'math.floor(' + arg + ' + .5)';
      break;
    case 'ROUNDUP':
      code = 'math.ceil(' + arg + ')';
      break;
    case 'ROUNDDOWN':
      code = 'math.floor(' + arg + ')';
      break;
    case 'SIN':
      code = 'math.sin(math.rad(' + arg + '))';
      break;
    case 'COS':
      code = 'math.cos(math.rad(' + arg + '))';
      break;
    case 'TAN':
      code = 'math.tan(math.rad(' + arg + '))';
      break;
    case 'ASIN':
      code = 'math.deg(math.asin(' + arg + '))';
      break;
    case 'ACOS':
      code = 'math.deg(math.acos(' + arg + '))';
      break;
    case 'ATAN':
      code = 'math.deg(math.atan(' + arg + '))';
      break;
    default:
      throw 'Unknown math operator: ' + operator;
  }
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['math_constant'] = function(block) {
  // Constants: PI, E, the Golden Ratio, sqrt(2), 1/sqrt(2), INFINITY.
  var CONSTANTS = {
    PI: ['math.pi', Blockly.Lua.ORDER_HIGH],
    E: ['math.exp(1)', Blockly.Lua.ORDER_HIGH],
    GOLDEN_RATIO: ['(1 + math.sqrt(5)) / 2', Blockly.Lua.ORDER_MULTIPLICATIVE],
    SQRT2: ['math.sqrt(2)', Blockly.Lua.ORDER_HIGH],
    SQRT1_2: ['math.sqrt(1 / 2)', Blockly.Lua.ORDER_HIGH],
    INFINITY: ['math.huge', Blockly.Lua.ORDER_HIGH]
  };
  return CONSTANTS[block.getFieldValue('CONSTANT')];
};

Blockly.Lua['math_number_property'] = function(block) {
  // Check if a number is even, odd, prime, whole, positive, or negative
  // or if it is divisible by certain number. Returns true or false.
  var number_to_check = Blockly.Lua.valueToCode(block, 'NUMBER_TO_CHECK',
      Blockly.Lua.ORDER_MULTIPLICATIVE) || '0';
  var dropdown_property = block.getFieldValue('PROPERTY');
  var code;
  if (dropdown_property == 'PRIME') {
    // Prime is a special case as it is not a one-liner test.
    var functionName = Blockly.Lua.provideFunction_(
        'math_isPrime',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(n)',
         '  -- https://en.wikipedia.org/wiki/Primality_test#Naive_methods',
         '  if n == 2 or n == 3 then',
         '    return true',
         '  end',
         '  -- False if n is NaN, negative, is 1, or not whole.',
         '  -- And false if n is divisible by 2 or 3.',
         '  if not(n > 1) or n % 1 ~= 0 or n % 2 == 0 or n % 3 == 0 then',
         '    return false',
         '  end',
         '  -- Check all the numbers of form 6k +/- 1, up to sqrt(n).',
         '  for x = 6, math.sqrt(n) + 1.5, 6 do',
         '    if n % (x - 1) == 0 or n % (x + 1) == 0 then',
         '      return false',
         '    end',
         '  end',
         '  return true',
         'end']);
    code = functionName + '(' + number_to_check + ')';
    return [code, Blockly.Lua.ORDER_HIGH];
  }
  switch (dropdown_property) {
    case 'EVEN':
      code = number_to_check + ' % 2 == 0';
      break;
    case 'ODD':
      code = number_to_check + ' % 2 == 1';
      break;
    case 'WHOLE':
      code = number_to_check + ' % 1 == 0';
      break;
    case 'POSITIVE':
      code = number_to_check + ' > 0';
      break;
    case 'NEGATIVE':
      code = number_to_check + ' < 0';
      break;
    case 'DIVISIBLE_BY':
      var divisor = Blockly.Lua.valueToCode(block, 'DIVISOR',
          Blockly.Lua.ORDER_MULTIPLICATIVE);
      // If 'divisor' is some code that evals to 0, Lua will produce a nan.
      // Let's produce nil if we can determine this at compile-time.
      if (!divisor || divisor == '0') {
        return ['nil', Blockly.Lua.ORDER_ATOMIC];
      }
      // The normal trick to implement ?: with and/or doesn't work here:
      //   divisor == 0 and nil or number_to_check % divisor == 0
      // because nil is false, so allow a runtime failure. :-(
      code = number_to_check + ' % ' + divisor + ' == 0';
      break;
  }
  return [code, Blockly.Lua.ORDER_RELATIONAL];
};

Blockly.Lua['math_change'] = function(block) {
  // Add to a variable in place.
  var argument0 = Blockly.Lua.valueToCode(block, 'DELTA',
      Blockly.Lua.ORDER_ADDITIVE) || '0';
  var varName = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  return varName + ' = ' + varName + ' + ' + argument0 + '\n';
};

// Rounding functions have a single operand.
Blockly.Lua['math_round'] = Blockly.Lua['math_single'];
// Trigonometry functions have a single operand.
Blockly.Lua['math_trig'] = Blockly.Lua['math_single'];

Blockly.Lua['math_on_list'] = function(block) {
  // Math functions for lists.
  var func = block.getFieldValue('OP');
  var list = Blockly.Lua.valueToCode(block, 'LIST',
      Blockly.Lua.ORDER_NONE) || '{}';
  var functionName;

  // Functions needed in more than one case.
  function provideSum() {
    return Blockly.Lua.provideFunction_(
        'math_sum',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
         '  local result = 0',
         '  for _, v in ipairs(t) do',
         '    result = result + v',
         '  end',
         '  return result',
         'end']);
  }

  switch (func) {
    case 'SUM':
      functionName = provideSum();
      break;

    case 'MIN':
      // Returns 0 for the empty list.
      functionName = Blockly.Lua.provideFunction_(
          'math_min',
          ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  if #t == 0 then',
           '    return 0',
           '  end',
           '  local result = math.huge',
           '  for _, v in ipairs(t) do',
           '    if v < result then',
           '      result = v',
           '    end',
           '  end',
           '  return result',
           'end']);
      break;

    case 'AVERAGE':
      // Returns 0 for the empty list.
      functionName = Blockly.Lua.provideFunction_(
          'math_average',
          ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  if #t == 0 then',
           '    return 0',
           '  end',
           '  return ' + provideSum() + '(t) / #t',
           'end']);
      break;

    case 'MAX':
      // Returns 0 for the empty list.
      functionName = Blockly.Lua.provideFunction_(
          'math_max',
          ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  if #t == 0 then',
           '    return 0',
           '  end',
           '  local result = -math.huge',
           '  for _, v in ipairs(t) do',
           '    if v > result then',
           '      result = v',
           '    end',
           '  end',
           '  return result',
           'end']);
      break;

    case 'MEDIAN':
      functionName = Blockly.Lua.provideFunction_(
          'math_median',
          // This operation excludes non-numbers.
          ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  -- Source: http://lua-users.org/wiki/SimpleStats',
           '  if #t == 0 then',
           '    return 0',
           '  end',
           '  local temp={}',
           '  for _, v in ipairs(t) do',
           '    if type(v) == "number" then',
           '      table.insert(temp, v)',
           '    end',
           '  end',
           '  table.sort(temp)',
           '  if #temp % 2 == 0 then',
           '    return (temp[#temp/2] + temp[(#temp/2)+1]) / 2',
           '  else',
           '    return temp[math.ceil(#temp/2)]',
           '  end',
           'end']);
      break;

    case 'MODE':
      functionName = Blockly.Lua.provideFunction_(
          'math_modes',
          // As a list of numbers can contain more than one mode,
          // the returned result is provided as an array.
          // The Lua version includes non-numbers.
          ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  -- Source: http://lua-users.org/wiki/SimpleStats',
           '  local counts={}',
           '  for _, v in ipairs(t) do',
           '    if counts[v] == nil then',
           '      counts[v] = 1',
           '    else',
           '      counts[v] = counts[v] + 1',
           '    end',
           '  end',
           '  local biggestCount = 0',
           '  for _, v  in pairs(counts) do',
           '    if v > biggestCount then',
           '      biggestCount = v',
           '    end',
           '  end',
           '  local temp={}',
           '  for k, v in pairs(counts) do',
           '    if v == biggestCount then',
           '      table.insert(temp, k)',
           '    end',
           '  end',
           '  return temp',
           'end']);
      break;

    case 'STD_DEV':
      functionName = Blockly.Lua.provideFunction_(
          'math_standard_deviation',
          ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  local m',
           '  local vm',
           '  local total = 0',
           '  local count = 0',
           '  local result',
           '  m = #t == 0 and 0 or ' + provideSum() + '(t) / #t',
           '  for _, v in ipairs(t) do',
           "    if type(v) == 'number' then",
           '      vm = v - m',
           '      total = total + (vm * vm)',
           '      count = count + 1',
           '    end',
           '  end',
           '  result = math.sqrt(total / (count-1))',
           '  return result',
           'end']);
      break;

    case 'RANDOM':
      functionName = Blockly.Lua.provideFunction_(
          'math_random_list',
          ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(t)',
           '  if #t == 0 then',
           '    return nil',
           '  end',
           '  return t[math.random(#t)]',
           'end']);
      break;

    default:
      throw 'Unknown operator: ' + func;
  }
  return [functionName + '(' + list + ')', Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['math_modulo'] = function(block) {
  // Remainder computation.
  var argument0 = Blockly.Lua.valueToCode(block, 'DIVIDEND',
      Blockly.Lua.ORDER_MULTIPLICATIVE) || '0';
  var argument1 = Blockly.Lua.valueToCode(block, 'DIVISOR',
      Blockly.Lua.ORDER_MULTIPLICATIVE) || '0';
  var code = argument0 + ' % ' + argument1;
  return [code, Blockly.Lua.ORDER_MULTIPLICATIVE];
};

Blockly.Lua['math_constrain'] = function(block) {
  // Constrain a number between two limits.
  var argument0 = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_NONE) || '0';
  var argument1 = Blockly.Lua.valueToCode(block, 'LOW',
      Blockly.Lua.ORDER_NONE) || '-math.huge';
  var argument2 = Blockly.Lua.valueToCode(block, 'HIGH',
      Blockly.Lua.ORDER_NONE) || 'math.huge';
  var code = 'math.min(math.max(' + argument0 + ', ' + argument1 + '), ' +
      argument2 + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['math_random_int'] = function(block) {
  // Random integer between [X] and [Y].
  var argument0 = Blockly.Lua.valueToCode(block, 'FROM',
      Blockly.Lua.ORDER_NONE) || '0';
  var argument1 = Blockly.Lua.valueToCode(block, 'TO',
      Blockly.Lua.ORDER_NONE) || '0';
  var code = 'math.random(' + argument0 + ', ' + argument1 + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['math_random_float'] = function(block) {
  // Random fraction between 0 and 1.
  return ['math.random()', Blockly.Lua.ORDER_HIGH];
};
/*
 * Whitecat Blocky Environment, MQTT code generation
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

goog.provide('Blockly.Lua.MQTT');
goog.provide('Blockly.Lua.MQTT.helper');

goog.require('Blockly.Lua');

Blockly.Lua['mqtt_publish'] = function(block) {
    var topic = Blockly.Lua.valueToCode(block, 'TOPIC', Blockly.Lua.ORDER_NONE) || '\'\'';	
    var payload = Blockly.Lua.valueToCode(block, 'PAYLOAD', Blockly.Lua.ORDER_NONE) || '\'\'';	
    var qos = block.getFieldValue('QOS');
	var code = '';

	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	var tryCode = "";
	
	tryCode += Blockly.Lua.indent(0,'-- create the MQTT client and connect, if needed') + "\n";
	tryCode += Blockly.Lua.indent(0,'_mqtt_lock:lock()') + "\n";
	tryCode += Blockly.Lua.indent(0,'if (_mqtt == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(1,'_mqtt = mqtt.client("'+block.clientid+'", "'+block.host+'", '+block.port+', false, nil, ' + ((qos > 0)?"true":"false") + ')') + "\n";
	tryCode += Blockly.Lua.indent(1,'_mqtt:connect("'+block.username+'","'+block.password+'")') + "\n";
	tryCode += Blockly.Lua.indent(0,'end') + "\n";
	tryCode += Blockly.Lua.indent(0,'_mqtt_lock:unlock()') + "\n\n";
	
	tryCode += Blockly.Lua.indent(0,'-- publish to topic') + "\n";
	tryCode += Blockly.Lua.indent(0,'_mqtt:publish('+topic+', '+payload+', mqtt.QOS'+qos+')') + "\n";;

	tryCode += Blockly.Lua.blockEnd(0, block);

	code += Blockly.Lua.indent(0,'-- publish to MQTT topic ' + topic) + "\n";
	code += Blockly.Lua.tryBlock(0,block,tryCode) + "\n";
	
	return code;
};

Blockly.Lua['mqtt_subscribe'] = function(block) {
    var topic = Blockly.Lua.valueToCode(block, 'TOPIC', Blockly.Lua.ORDER_NONE) || '\'\'';	
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
    var qos = block.getFieldValue('QOS');
	var code = '';

	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	var tryCode = '';	

	tryCode += Blockly.Lua.indent(0,'-- create the MQTT client and connect, if needed') + "\n";
	tryCode += Blockly.Lua.indent(0,'_mqtt_lock:lock()') + "\n";
	tryCode += Blockly.Lua.indent(0,'if (_mqtt == nil) then') + "\n";
	tryCode += Blockly.Lua.indent(1,'_mqtt = mqtt.client("'+block.clientid+'", "'+block.host+'", '+block.port+', false, nil, ' + ((qos > 0)?"true":"false") + ')') + "\n";
	tryCode += Blockly.Lua.indent(1,'_mqtt:connect("'+block.username+'","'+block.password+'")') + "\n";
	tryCode += Blockly.Lua.indent(0,'end') + "\n";
	tryCode += Blockly.Lua.indent(0,'_mqtt_lock:unlock()') + "\n\n";
	
	tryCode += Blockly.Lua.indent(0,'-- subscribe to topic') + "\n";
	tryCode += Blockly.Lua.indent(0,'_mqtt:subscribe('+topic+', mqtt.QOS'+qos+', function(length, payload)') + "\n";
	tryCode += Blockly.Lua.indent(1,'-- a new message is available in length / payload arguments') + "\n";

	tryCode += Blockly.Lua.blockStart(1, block);
	if (statement != '') {
		tryCode += Blockly.Lua.tryBlock(1,block, statement);
	}
	tryCode += Blockly.Lua.blockEnd(1, block);

	tryCode += Blockly.Lua.indent(0,'end)') + "\n";
	
	code += Blockly.Lua.indent(0,'-- subscribe to MQTT topic ' + topic) + "\n";
	
	code += Blockly.Lua.indent(0,'thread.start(function()') + "\n";
	code += Blockly.Lua.indent(1, '_eventBoardStarted:wait()') + "\n\n";
	code += Blockly.Lua.tryBlock(1, block, tryCode);
	code += Blockly.Lua.indent(0,'end)') + "\n";
		
	return code;
};/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Generating Lua for procedure blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.procedures');

goog.require('Blockly.Lua');


Blockly.Lua['procedures_defreturn'] = function(block) {
  // Define a procedure with a return value.
  var funcName = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var branch = Blockly.Lua.statementToCode(block, 'STACK');
  if (Blockly.Lua.STATEMENT_PREFIX) {
    branch = Blockly.Lua.prefixLines(
        Blockly.Lua.STATEMENT_PREFIX.replace(/%1/g,
        '\'' + block.id + '\''), Blockly.Lua.INDENT) + branch;
  }
  if (Blockly.Lua.INFINITE_LOOP_TRAP) {
    branch = Blockly.Lua.INFINITE_LOOP_TRAP.replace(/%1/g,
        '\'' + block.id + '\'') + branch;
  }
  var returnValue = Blockly.Lua.valueToCode(block, 'RETURN',
      Blockly.Lua.ORDER_NONE) || '';
  if (returnValue) {
    returnValue = '  return ' + returnValue + '\n';
  } else if (!branch) {
    branch = '';
  }
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Lua.variableDB_.getName(block.arguments_[i],
        Blockly.Variables.NAME_TYPE);
  }
  var code = 'function ' + funcName + '(' + args.join(', ') + ')\n' +
      branch + returnValue + 'end\n';
  code = Blockly.Lua.scrub_(block, code);
  // Add % so as not to collide with helper functions in definitions list.
  Blockly.Lua.definitions_['%' + funcName] = code;
  return null;
};

// Defining a procedure without a return value uses the same generator as
// a procedure with a return value.
Blockly.Lua['procedures_defnoreturn'] =
    Blockly.Lua['procedures_defreturn'];

Blockly.Lua['procedures_callreturn'] = function(block) {
  // Call a procedure with a return value.
  var funcName = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Lua.valueToCode(block, 'ARG' + i,
        Blockly.Lua.ORDER_NONE) || 'nil';
  }
  var code = funcName + '(' + args.join(', ') + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['procedures_callnoreturn'] = function(block) {
  // Call a procedure with no return value.
  var funcName = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('NAME'), Blockly.Procedures.NAME_TYPE);
  var args = [];
  for (var i = 0; i < block.arguments_.length; i++) {
    args[i] = Blockly.Lua.valueToCode(block, 'ARG' + i,
        Blockly.Lua.ORDER_NONE) || 'nil';
  }
  var code = funcName + '(' + args.join(', ') + ')\n';
  return code;
};

Blockly.Lua['procedures_ifreturn'] = function(block) {
  // Conditionally return value from a procedure.
  var condition = Blockly.Lua.valueToCode(block, 'CONDITION',
      Blockly.Lua.ORDER_NONE) || 'false';
  var code = 'if ' + condition + ' then\n';
  if (block.hasReturnValue_) {
    var value = Blockly.Lua.valueToCode(block, 'VALUE',
        Blockly.Lua.ORDER_NONE) || 'nil';
    code += '  return ' + value + '\n';
  } else {
    code += '  return\n';
  }
  code += 'end\n';
  return code;
};
/*
 * Whitecat Blocky Environment, sensors block code generation
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

goog.provide('Blockly.Lua.sensors');
goog.provide('Blockly.Lua.sensors.helper');

goog.require('Blockly.Lua');

Blockly.Lua.sensors.helper = {
	getInterface: function(block) {
		var int = '';	
		var interfaces = block.interface.split(",");
		
		for(var i=0;i < interfaces.length;i++) {
			if (interfaces[i] == 'GPIO') {
				if (int != "") int = int + ", ";
				int += 'pio.' + Code.status.maps.digitalPins[block['interface'+i+'_unit']][0];
			} else if (interfaces[i] == 'ADC') {
				if (block['interface'+i+'_unit'] == 1) {
					if (int != "") int = int + ", ";
					int += 'adc.ADC1, pio.' + Code.status.maps.analogPins[block['interface'+i+'_subunit']][0];
				} else {
					if (int != "") int = int + ", ";
					int += 'adc.' + Code.status.maps.externalAdcUnits[block['interface'+i+'_unit']][0] + ', ' + block['interface'+i+'_subunit'];
				}
			} else if (interfaces[i] == 'I2C') {
				if (int != "") int = int + ", ";
				int += 'i2c.' + Code.status.maps.i2cUnits[block['interface'+i+'_unit']][1] + ', 0';
			} else if (interfaces[i] == 'UART') {
				if (int != "") int = int + ", ";
				int += 'uart.' + Code.status.maps.uartUnits[block['interface'+i+'_unit']][1];
			} else if (interfaces[i] == '1-WIRE') {
				if (int != "") int = int + ", ";
				int += 'pio.' + Code.status.maps.digitalPins[block['interface'+i+'_unit']][0] + ', ' + block['interface'+i+'_device'];
			}			
		}
		
		return int;
	},
	
	nameSensor: function(block) {
		return block.sid.replace(/\s|-/g, '_');
	},
	
	attach: function(block) {
		var code = '';
		
		var int = Blockly.Lua.sensors.helper.getInterface(block);	
		
		code += Blockly.Lua.indent(0,'if (_'+block.name+'_'+Blockly.Lua.sensors.helper.nameSensor(block)+' == nil) then') + "\n";
		code += Blockly.Lua.indent(1,'_'+block.name+'_'+Blockly.Lua.sensors.helper.nameSensor(block)+' = sensor.attach("'+block.sid+'"'+(int!=""?", ":"")+int+')') + "\n";
		code += Blockly.Lua.indent(0,'end') + "\n\n";
		
		return code;
	}
}

Blockly.Lua['sensor_read'] = function(block) {
	var magnitude = block.getFieldValue('PROVIDES');
	var code = '';
	
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	// Generate code for get sensor value
	// This code goes to the declaration section
	var getCode = '';
	getCode += Blockly.Lua.indent(0, 'function _get'+block.name+'_' + magnitude.replace(/\s|-/g, '_') + '()') + "\n";

	var tryCode = '';	
	tryCode += Blockly.Lua.sensors.helper.attach(block);
	tryCode += Blockly.Lua.indent(0,'value = _'+block.name+'_'+Blockly.Lua.sensors.helper.nameSensor(block)+':read("'+magnitude+'")') + "\n";

	getCode += Blockly.Lua.indent(1, 'local value\n') + "\n";
	getCode += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(1, block, tryCode)) + "\n";
	getCode += Blockly.Lua.indent(1, 'return value\n');
	getCode += Blockly.Lua.indent(0, 'end\n');
		
	codeSection["declaration"].push(getCode);

	return ['_get'+block.name+'_' + magnitude.replace(/\s|-/g, '_') + '()', Blockly.Lua.ORDER_HIGH];	
};

Blockly.Lua['sensor_set'] = function(block) {
	var property = block.getFieldValue('PROPERTIES');
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE);
	var code = '';
	
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	var tryCode = '';	
	tryCode += Blockly.Lua.indent(1,'local instance = "_'+block.name+'_'+Blockly.Lua.sensors.helper.nameSensor(block)+'"') + "\n\n";
	tryCode += Blockly.Lua.sensors.helper.attach(block);
	tryCode += Blockly.Lua.indent(1,'_'+block.name+'_'+Blockly.Lua.sensors.helper.nameSensor(block)+':set("'+property+'", '+value+')') + "\n";

	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(0, block,tryCode)) + "\n";
	
	return code;	
};

Blockly.Lua['sensor_when'] = function(block) {
	var magnitude = block.getFieldValue('PROVIDES');
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	var code = '';
	
	if (codeSection["require"].indexOf('require("block")') == -1) {
		codeSection["require"].push('require("block")');
	}
	
	var tryCode = '';
	
	tryCode += Blockly.Lua.indent(0,'-- we need to wait for the completion of the board start') + "\n";
	tryCode += Blockly.Lua.indent(0,'_eventBoardStarted:wait()') + "\n\n";

	tryCode += Blockly.Lua.indent(0,Blockly.Lua.sensors.helper.attach(block));
	
	tryCode += Blockly.Lua.indent(0, '_' + block.name+'_'+Blockly.Lua.sensors.helper.nameSensor(block)+':callback(function(magnitude)') + "\n";
	tryCode += Blockly.Lua.indent(1, 'local value = magnitude.' + magnitude) + "\n\n";	
	tryCode += Blockly.Lua.indent(1, 'if value == nil then return end') + "\n\n";

	tryCode += Blockly.Lua.blockStart(2, block);

	if (statement != "") {
		tryCode += Blockly.Lua.indent(2, statement);
	}
	
	tryCode += Blockly.Lua.blockEnd(2, block);

	tryCode += Blockly.Lua.indent(1, 'end)') + "\n";	
	

	code += Blockly.Lua.indent(0, 'thread.start(function()') + "\n";	
	code += Blockly.Lua.tryBlock(1, block,tryCode);	
	code += Blockly.Lua.indent(0, 'end)') + "\n";	

	
	return code;
};/*
 * Whitecat Blocky Environment, servo block code generation
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

goog.provide('Blockly.Lua.servo');
goog.provide('Blockly.Lua.servo.helper');

goog.require('Blockly.Lua');

Blockly.Lua.servo.helper = {
	isServo: function(block, test) {
		return (
			((test.type == 'servo_move') && (block.getFieldValue('PIN') == test.getFieldValue('PIN')))
		);						
	},
	
	hasAncestors: function(block) {
		var previous = block.previousConnection;

		while (previous) {
			previous = previous.targetBlock();
			if (previous) {
				if (Blockly.Lua.servo.helper.isServo(block, previous)) {
					return true;
				}
			
				previous = previous.previousConnection;				
			}
		}
		
		return false;
	},
	
	instance: function(block) {
		return "_servo_" + Blockly.Lua.io.helper.nameDigital(block);
	},

	attach: function(block) {
		var code = '';
		
		if (!Blockly.Lua.servo.helper.hasAncestors(block)) {
			code += Blockly.Lua.indent(0,'if ('+Blockly.Lua.servo.helper.instance(block)+' == nil) then') + "\n";
			code += Blockly.Lua.indent(1,Blockly.Lua.servo.helper.instance(block) + " = servo.attach("+Blockly.Lua.io.helper.nameDigital(block)+")") + "\n";
			code += Blockly.Lua.indent(0,'end') + "\n\n";				
		}
		
		return code;
	},
};

Blockly.Lua['servo_move'] = function(block) {
	var pin = block.getFieldValue('PIN');
	var pioName = Code.status.maps.pwmPins[pin];
	var value = Blockly.Lua.valueToCode(block, 'VALUE', Blockly.Lua.ORDER_NONE) || '\'\'';
	var code='', tryCode = '', initCode = '';	
	
	initCode += Blockly.Lua.indent(0, '-- servos') + "\n";
	initCode += Blockly.Lua.indent(0, '_servo_pio = {}') + "\n";
	
	Blockly.Lua.addCodeToSection("declaration", initCode, block);
	
	Blockly.Lua.require("block");
	
	tryCode += Blockly.Lua.servo.helper.attach(block);	
	tryCode += Blockly.Lua.indent(0, Blockly.Lua.servo.helper.instance(block) + ':write('+value+')') + "\n";
		
	code += Blockly.Lua.tryBlock(0, block, tryCode, 'move servo at pin ' + Blockly.Lua.io.helper.nameDigital(block) + ' by ' + value);
		
	return code;
}/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Generating Lua for text blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.texts');

goog.require('Blockly.Lua');


Blockly.Lua['text'] = function(block) {
  // Text value.
  var code = Blockly.Lua.quote_(block.getFieldValue('TEXT'));
  return [code, Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['text_join'] = function(block) {
  // Create a string made up of any number of elements of any type.
  if (block.itemCount_ == 0) {
    return ['\'\'', Blockly.Lua.ORDER_ATOMIC];
  } else if (block.itemCount_ == 1) {
    var element = Blockly.Lua.valueToCode(block, 'ADD0',
        Blockly.Lua.ORDER_NONE) || '\'\'';
    var code = 'tostring(' + element + ')';
    return [code, Blockly.Lua.ORDER_HIGH];
  } else if (block.itemCount_ == 2) {
    var element0 = Blockly.Lua.valueToCode(block, 'ADD0',
        Blockly.Lua.ORDER_CONCATENATION) || '\'\'';
    var element1 = Blockly.Lua.valueToCode(block, 'ADD1',
        Blockly.Lua.ORDER_CONCATENATION) || '\'\'';
    var code = element0 + ' .. ' + element1;
    return [code, Blockly.Lua.ORDER_CONCATENATION];
  } else {
    var elements = [];
    for (var i = 0; i < block.itemCount_; i++) {
      elements[i] = Blockly.Lua.valueToCode(block, 'ADD' + i,
          Blockly.Lua.ORDER_NONE) || '\'\'';
    }
    var code = 'table.concat({' + elements.join(', ') + '})';
    return [code, Blockly.Lua.ORDER_HIGH];
  }
};

Blockly.Lua['text_append'] = function(block) {
  // Append to a variable in place.
  var varName = Blockly.Lua.variableDB_.getName(
      block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
  var value = Blockly.Lua.valueToCode(block, 'TEXT',
      Blockly.Lua.ORDER_CONCATENATION) || '\'\'';
  return varName + ' = ' + varName + ' .. ' + value + '\n';
};

Blockly.Lua['text_length'] = function(block) {
  // String or array length.
  var text = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_UNARY) || '\'\'';
  return ['#' + text, Blockly.Lua.ORDER_UNARY];
};

Blockly.Lua['text_isEmpty'] = function(block) {
  // Is the string null or array empty?
  var text = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_UNARY) || '\'\'';
  return ['#' + text + ' == 0', Blockly.Lua.ORDER_RELATIONAL];
};

Blockly.Lua['text_indexOf'] = function(block) {
  // Search the text for a substring.
  var substring = Blockly.Lua.valueToCode(block, 'FIND',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  var text = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  if (block.getFieldValue('END') == 'FIRST') {
    var functionName = Blockly.Lua.provideFunction_(
        'firstIndexOf',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
             '(str, substr) ',
         '  local i = string.find(str, substr, 1, true)',
         '  if i == nil then',
         '    return 0',
         '  else',
         '    return i',
         '  end',
         'end']);
  } else {
    var functionName = Blockly.Lua.provideFunction_(
        'lastIndexOf',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
             '(str, substr)',
         '  local i = string.find(string.reverse(str), ' +
             'string.reverse(substr), 1, true)',
         '  if i then',
         '    return #str + 2 - i - #substr',
         '  end',
         '  return 0',
         'end']);
  }
  var code = functionName + '(' + text + ', ' + substring + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['text_charAt'] = function(block) {
  // Get letter at index.
  // Note: Until January 2013 this block did not have the WHERE input.
  var where = block.getFieldValue('WHERE') || 'FROM_START';
  var atOrder = (where == 'FROM_END') ? Blockly.Lua.ORDER_UNARY :
      Blockly.Lua.ORDER_NONE;
  var at = Blockly.Lua.valueToCode(block, 'AT', atOrder) || '1';
  var text = Blockly.Lua.valueToCode(block, 'VALUE',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  var code;
  if (where == 'RANDOM') {
    var functionName = Blockly.Lua.provideFunction_(
        'text_random_letter',
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(str)',
         '  local index = math.random(string.len(str))',
         '  return string.sub(str, index, index)',
         'end']);
    code = functionName + '(' + text + ')';
  } else {
    if (where == 'FIRST') {
      var start = '1';
    } else if (where == 'LAST') {
      var start = '-1';
    } else {
      if (where == 'FROM_START') {
        var start = at;
      } else if (where == 'FROM_END') {
        var start = '-' + at;
      } else {
        throw 'Unhandled option (text_charAt).';
      }
    }
    if (start.match(/^-?\w*$/)) {
      code = 'string.sub(' + text + ', ' + start + ', ' + start + ')';
    } else {
      // use function to avoid reevaluation
      var functionName = Blockly.Lua.provideFunction_(
          'text_char_at',
          ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ +
               '(str, index)',
           '  return string.sub(str, index, index)',
           'end']);
      code = functionName + '(' + text + ', ' + start + ')';
    }
  }
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['text_getSubstring'] = function(block) {
  // Get substring.
  var text = Blockly.Lua.valueToCode(block, 'STRING',
      Blockly.Lua.ORDER_NONE) || '\'\'';

  // Get start index.
  var where1 = block.getFieldValue('WHERE1');
  var at1Order = (where1 == 'FROM_END') ? Blockly.Lua.ORDER_UNARY :
      Blockly.Lua.ORDER_NONE;
  var at1 = Blockly.Lua.valueToCode(block, 'AT1', at1Order) || '1';
  if (where1 == 'FIRST') {
    var start = 1;
  } else if (where1 == 'FROM_START') {
    var start = at1;
  } else if (where1 == 'FROM_END') {
    var start = '-' + at1;
  } else {
    throw 'Unhandled option (text_getSubstring)';
  }

  // Get end index.
  var where2 = block.getFieldValue('WHERE2');
  var at2Order = (where2 == 'FROM_END') ? Blockly.Lua.ORDER_UNARY :
      Blockly.Lua.ORDER_NONE;
  var at2 = Blockly.Lua.valueToCode(block, 'AT2', at2Order) || '1';
  if (where2 == 'LAST') {
    var end = -1;
  } else if (where2 == 'FROM_START') {
    var end = at2;
  } else if (where2 == 'FROM_END') {
    var end = '-' + at2;
  } else {
    throw 'Unhandled option (text_getSubstring)';
  }
  var code = 'string.sub(' + text + ', ' + start + ', ' + end + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['text_changeCase'] = function(block) {
  // Change capitalization.
  var operator = block.getFieldValue('CASE');
  var text = Blockly.Lua.valueToCode(block, 'TEXT',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  if (operator == 'UPPERCASE') {
    var functionName = 'string.upper';
  } else if (operator == 'LOWERCASE') {
    var functionName = 'string.lower';
  } else if (operator == 'TITLECASE') {
    var functionName = Blockly.Lua.provideFunction_(
        'text_titlecase',
        // There are shorter versions at
        // http://lua-users.org/wiki/SciteTitleCase
        // that do not preserve whitespace.
        ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(str)',
         '  local buf = {}',
         '  local inWord = false',
         '  for i = 1, #str do',
         '    local c = string.sub(str, i, i)',
         '    if inWord then',
         '      table.insert(buf, string.lower(c))',
         '      if string.find(c, "%s") then',
         '        inWord = false',
         '      end',
         '    else',
         '      table.insert(buf, string.upper(c))',
         '      inWord = true',
         '    end',
         '  end',
         '  return table.concat(buf)',
         'end']);
  }
  var code = functionName + '(' + text + ')';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['text_trim'] = function(block) {
  // Trim spaces.
  var OPERATORS = {
    LEFT: '^%s*(,-)',
    RIGHT: '(.-)%s*$',
    BOTH: '^%s*(.-)%s*$'
  };
  var operator = OPERATORS[block.getFieldValue('MODE')];
  var text = Blockly.Lua.valueToCode(block, 'TEXT',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  var code = 'string.gsub(' + text + ', "' + operator + '", "%1")';
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['text_print'] = function(block) {
  // Print statement.
  var msg = Blockly.Lua.valueToCode(block, 'TEXT',
      Blockly.Lua.ORDER_NONE) || '\'\'';
  return 'print(' + msg + ')\n';
};

Blockly.Lua['text_prompt_ext'] = function(block) {
  // Prompt function.
  if (block.getField('TEXT')) {
    // Internal message.
    var msg = Blockly.Lua.quote_(block.getFieldValue('TEXT'));
  } else {
    // External message.
    var msg = Blockly.Lua.valueToCode(block, 'TEXT',
        Blockly.Lua.ORDER_NONE) || '\'\'';
  }

  var functionName = Blockly.Lua.provideFunction_(
      'text_prompt',
      ['function ' + Blockly.Lua.FUNCTION_NAME_PLACEHOLDER_ + '(msg)',
       '  io.write(msg)',
       '  io.flush()',
       '  return io.read()',
       'end']);
  var code = functionName + '(' + msg + ')';

  var toNumber = block.getFieldValue('TYPE') == 'NUMBER';
  if (toNumber) {
    code = 'tonumber(' + code + ', 10)';
  }
  return [code, Blockly.Lua.ORDER_HIGH];
};

Blockly.Lua['text_prompt'] = Blockly.Lua['text_prompt_ext'];
/*
 * Whitecat Blocky Environment, text additions code generation
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

goog.provide('Blockly.Lua.textadds');

goog.require('Blockly.Lua');


Blockly.Lua['text_pack'] = function(block) {
	var to = Blockly.Lua.valueToCode(block, 'TO0', Blockly.Lua.ORDER_NONE);
    var code = [];
    for (var n = 0; n < block.withCount_; n++) {
      code[n] = Blockly.Lua.valueToCode(block, 'WITH' + n,
          Blockly.Lua.ORDER_NONE) || '\'\'';
    }
	
	return ['pack.pack(' + code.join(', ') + ')', Blockly.Lua.ORDER_HIGH];	
};

Blockly.Lua['text_unpack'] = function(block) {
	var packed = Blockly.Lua.valueToCode(block, 'FROM0', Blockly.Lua.ORDER_NONE);
    var code = '';
    
	for (var n = 0; n < block.toCount_; n++) {
		code += Blockly.Lua.valueToCode(block, 'TO' + n, Blockly.Lua.ORDER_NONE) + ', ' + packed + ' = pack.unpack(' + packed + ', true)\n';
    }
	
    return code;
};/*
 * Whitecat Blocky Environment, thread block code generation
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

goog.provide('Blockly.Lua.threads');

goog.require('Blockly.Lua');

Blockly.Lua['thread_start'] = function(block) {
	var thid = Blockly.Lua.valueToCode(block, 'THID', Blockly.Lua.ORDER_NONE);	
	var thread_code = Blockly.Lua.statementToCode(block, 'DO');
	
	if (thid != '') {
		thid = thid + ' = ';
	}
	var code = thid + 'thread.start(function()\r\n' +
			   thread_code + 
			   'end)\r\n';
	
	return code;
};

Blockly.Lua['thread_create'] = function(block) {
	var thid = Blockly.Lua.valueToCode(block, 'THID', Blockly.Lua.ORDER_NONE);	
	var thread_code = Blockly.Lua.statementToCode(block, 'DO');
	
	if (thid != '') {
		thid = thid + ' = ';
	}
	var code = thid + 'thread.create(function()\r\n' +
			   thread_code + 
			   'end)\r\n';
	
	return code;
};

Blockly.Lua['thread_stop'] = function(block) {
	var thid = block.getFieldValue('THID');
	
	if (thid == 'all') {
		thid = "";
	}

	var code = 'thread.stop(' + thid + ')\r\n';
	
	return code;
};

Blockly.Lua['thread_resume'] = function(block) {
	var thid = block.getFieldValue('THID');
	
	if (thid == 'all') {
		thid = "";
	}

	var code = 'thread.resume(' + thid + ')\r\n';
	
	return code;
};

Blockly.Lua['thread_suspend'] = function(block) {
	var thid = block.getFieldValue('THID');
	
	if (thid == 'all') {
		thid = "";
	}

	var code = 'thread.suspend(' + thid + ')\r\n';
	
	return code;
};

Blockly.Lua['thread_sleep'] = function(block) {
	var time = block.getFieldValue('TIME');
	var units = block.getFieldValue('UNITS');
	
	var code = '';
	
	switch (units) {
		case 'microseconds':
			code += "thread.sleepus(" + time + ")\r\n";break;
		case 'milliseconds':
			code += "thread.sleepms(" + time + ")\r\n";break;
		case 'seconds':	
			code += "thread.sleep(" + time + ")\r\n";break;
	}
	
	return code;
};/*
 * Whitecat Blocky Environment, exception control blocks code generation
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

goog.provide('Blockly.Lua.try');

goog.require('Blockly.Lua');

Blockly.Lua['exception_try'] = function(block) {
  var tryStatement = Blockly.Lua.statementToCode(block, 'TRY0');
  var catchStatement = Blockly.Lua.statementToCode(block, 'CATCH0');
  var finallyStatement = Blockly.Lua.statementToCode(block, 'FINALLY0');  
  var code = '';
  
   code += Blockly.Lua.indent(0, 'try(') + "\n";
   code += Blockly.Lua.indent(1, 'function()') + "\n";
   code += Blockly.Lua.indent(1, tryStatement);
   code += Blockly.Lua.indent(1, 'end, ') + "\n";
   code += Blockly.Lua.indent(1, 'function(where, line, errCode, msg)') + "\n";
   
   if (catchStatement != '') {
	   code += Blockly.Lua.indent(1, catchStatement);   	
   }
   code += Blockly.Lua.blockErrorCatched(2, block);

   if (finallyStatement != '') {
	   code += Blockly.Lua.indent(1, 'end, ') + "\n";
	   code += Blockly.Lua.indent(1, 'function()') + "\n";
	   code += Blockly.Lua.indent(1, finallyStatement);
	   code += Blockly.Lua.indent(1, 'end') + "\n";
   } else {
	   code += Blockly.Lua.indent(1, 'end') + "\n";
   }

   code += Blockly.Lua.indent(0, ')') + "\n";
  
  return code;
};

Blockly.Lua['exception_catch_error'] = function(block) {
    var doStatement = Blockly.Lua.statementToCode(block, 'DO');
	var error = block.getFieldValue('ERROR');
	var code = '';
	
	if (error == "any") {
		code += Blockly.Lua.indent(0, 'if (errCode ~= nil) then') + "\n";
		code += Blockly.Lua.indent(0, doStatement);
		code += Blockly.Lua.blockErrorCatched(1, block);
		code += Blockly.Lua.indent(1, 'return') + "\n";
		code += Blockly.Lua.indent(0, 'end') + "\n";		
	} else {
		code += Blockly.Lua.indent(0, 'if ((errCode ~= nil) and (errCode == '+error+')) then') + "\n";
		code += Blockly.Lua.indent(0, doStatement);
		code += Blockly.Lua.blockErrorCatched(1, block);
		code += Blockly.Lua.indent(1, 'return') + "\n";
		code += Blockly.Lua.indent(0, 'end') + "\n";		
	}
	
	return code;
}

Blockly.Lua['exception_raise_again'] = function(block) {
	return Blockly.Lua.indent(0, 'error(errCode..":"..msg)') + "\n";
}/**
 * @license
 * Visual Blocks Language
 *
 * Copyright 2016 Google Inc.
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
 * @fileoverview Generating Lua for variable blocks.
 * @author rodrigoq@google.com (Rodrigo Queiro)
 */
'use strict';

goog.provide('Blockly.Lua.variables');

goog.require('Blockly.Lua');


Blockly.Lua['variables_get'] = function(block) {
	// Variable getter.
	if (typeof Blockly.Lua.variableDB_ == "undefined") {
		return ['', Blockly.Lua.ORDER_ATOMIC];
	}
	var code = Blockly.Lua.variableDB_.getName(block.getFieldValue('VAR'),
		Blockly.Variables.NAME_TYPE);
	return [code, Blockly.Lua.ORDER_ATOMIC];
};

Blockly.Lua['variables_set'] = function(block) {
	// Variable setter.
	var argument0 = Blockly.Lua.valueToCode(block, 'VALUE',
		Blockly.Lua.ORDER_NONE) || '0';

	if (typeof Blockly.Lua.variableDB_ == "undefined") {
		return ['', Blockly.Lua.ORDER_ATOMIC];
	}

	var varName = Blockly.Lua.variableDB_.getName(
		block.getFieldValue('VAR'), Blockly.Variables.NAME_TYPE);
	return varName + ' = ' + argument0 + '\n';
};
/*
 * Whitecat Blocky Environment, Wi-Fi code generation
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

goog.provide('Blockly.Lua.Wifi');
goog.provide('Blockly.Lua.Wifi.helper');

goog.require('Blockly.Lua');

Blockly.Lua['wifi_start'] = function(block) {
	var code = '';
	var tryCode = '';
	
	tryCode += Blockly.Lua.blockStart(0, block);
	tryCode += Blockly.Lua.indent(0, 'net.wf.setup(net.wf.mode.'+block.wtype+', "'+block.ssid+'","'+block.password+'")') + "\n";
	tryCode += Blockly.Lua.indent(0, 'net.wf.start(false)') + "\n";
	tryCode += Blockly.Lua.blockEnd(0, block);
		
	code += Blockly.Lua.indent(0,'-- configure wifi and start wifi') + "\n";
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(0, block,tryCode)) + "\n";

	return code;
};

Blockly.Lua['wifi_stop'] = function(block) {
	var code = '';
	var tryCode = '';
	
	tryCode += Blockly.Lua.indent(0, 'net.wf.setup(net.wf.mode.'+block.wtype+', "'+block.ssid+'","'+block.password+'")') + "\n";
	tryCode += Blockly.Lua.indent(0, 'net.wf.stop()') + "\n";
		
	code += Blockly.Lua.indent(0,'-- configure wifi and stop wifi') + "\n";
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(0, block,tryCode)) + "\n";

	return code;
};

Blockly.Lua['when_wifi_is_conneted'] = function(block) {
	var code = '';
	var tryCode = '';
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	
	tryCode += Blockly.Lua.blockStart(0, block);
	if (statement != "") {
		tryCode += Blockly.Lua.indent(0,statement);
	}
	tryCode += Blockly.Lua.blockEnd(0, block);
	
	code += Blockly.Lua.indent(0,'-- when Wi-Fi is connected') + "\n";
	code += Blockly.Lua.indent(0,'_network_callback_wifi_connected = function()') + "\n";
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";
	code += Blockly.Lua.indent(0,'end') + "\n";

	codeSection["declaration"].push(code);

	return "";
};

Blockly.Lua['when_wifi_is_disconneted'] = function(block) {
	var code = '';
	var tryCode = '';
	var statement = Blockly.Lua.statementToCodeNoIndent(block, 'DO');
	
	tryCode += Blockly.Lua.blockStart(0, block);
	if (statement != "") {
		tryCode += Blockly.Lua.indent(0,statement);
	}
	tryCode += Blockly.Lua.blockEnd(0, block);
	
	code += Blockly.Lua.indent(0,'-- when Wi-Fi is disconnected') + "\n";
	code += Blockly.Lua.indent(0,'_network_callback_wifi_disconnected = function()') + "\n";
	code += Blockly.Lua.indent(0,Blockly.Lua.tryBlock(0, block, tryCode)) + "\n";
	code += Blockly.Lua.indent(0,'end') + "\n";

	codeSection["declaration"].push(code);

	return "";
};