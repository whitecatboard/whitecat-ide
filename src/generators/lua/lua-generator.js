// Code sections
var codeSection = [];
codeSection["require"] = [];
codeSection["events"] = [];
codeSection["functions"] = [];
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

	var initCode = '';
	
	initCode = Blockly.Lua.indent(0,'-- this event is for sync the end of the board start with threads') + "\n";
	initCode += Blockly.Lua.indent(0,'-- that must wait for this situation') + "\n";
	initCode += Blockly.Lua.indent(0,'_eventBoardStarted = event.create()') + "\n";
	codeSection["events"].push(initCode);

	// Begin
	var hasBoardStart = false;
	
	this.init(workspace);
	var blocks = workspace.getTopBlocks(true);
	for (var x = 0, block; block = blocks[x]; x++) {
		if ((block.type == 'when_board_starts') && (!block.disabled)) {
			hasBoardStart = true;
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

			if (!block.isHatBlock()) {
				initCode = Blockly.Lua.indent(0,'thread.start(function()') + "\n";
				initCode += Blockly.Lua.indent(1,'-- Wait until board is started') + "\n";
				initCode += Blockly.Lua.indent(1,'_eventBoardStarted:wait()') + "\n\n";
				initCode += Blockly.Lua.indent(1,line);
				initCode += Blockly.Lua.indent(0,'end)') + "\n";
				
				line = initCode;
			}

			// Put code in it's section
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
