Blockly.Generator.section = [
	{"id": "require", "fragment": []},
	{"id": "events", "fragment": []},
	{"id": "functions", "fragment": []},
	{"id": "declaration", "fragment": []},
	{"id": "chunks", "fragment": []},
	{"id": "default", "fragment": []},
	{"id": "start", "fragment": []},
	{"id": "afterStart", "fragment": []}
];

Blockly.Generator.chunk = 0;

// We indent using a tab
Blockly.Generator.prototype.INDENT = '\t';

Blockly.Generator.prototype.initialise = function(workspace, chunk) {
	if (typeof chunk == "undefined") {
		chunk = false;
	}
	
	if (!chunk) {
		Blockly.Generator.section.forEach(function(section) {
			section.fragment = [];
		});
	
		var maxChunk = -1;
		
		for (id in workspace.blockDB_) {
			if (typeof workspace.blockDB_[id].chunkId != "undefined") {
				if (workspace.blockDB_[id].chunkId > maxChunk) {
					maxChunk = workspace.blockDB_[id].chunkId;
				}
			}			
		}

		Blockly.Generator.chunk = maxChunk + 1;		
	}
	
	this.init(workspace, chunk);
};

Blockly.Generator.prototype.getChunkId = function(block) {
	if (typeof block.chunkId == "undefined") {
		Blockly.Generator.chunk = Blockly.Generator.chunk + 1;
		block.chunkId = Blockly.Generator.chunk;
	}

	return block.chunkId;
}

// Add a fragment of code to a section
Blockly.Generator.prototype.addFragment = function(section_id, fragment_id, block, code) {
	Blockly.Generator.section.forEach(function(section) {
		if (section.id == section_id) {
			var insert = true;
			
			section.fragment.forEach(function(fragment) {
				if (fragment.id == fragment_id) {
					fragment.code = code;
					insert = false;
					return;
				}
			});
			
			if (insert) {
				section.fragment.push({"id": fragment_id, "code": code});
			}			
			
			return;
		}
	});
};

// Add a lua library dependency needed for the generated code
Blockly.Generator.prototype.addDependency = function(library, block) {
	library = goog.string.trim(library);

	if ((library == "") || (library == "0")) return;
	
	if (library == "block") {
		if (Blockly.Lua.developerMode || !Blockly.Lua.legacyGenCode) {    		
			if (Blockly.Lua.legacyGenCode) {
				this.addFragment("require", library, block, 'require("'+library+'")');
			}
		}			
	} else {
		this.addFragment("require", library, block, 'require("'+library+'")');
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
		workspace = Blockly.getMainWorkspace();
	}

	/*
	 * Some blocks must be allocate it's generated code in specific code regions. For example,
	 * "when a lora frame is received" block must be allocated prior to execute anything.
	 *
	 * This part define sections of code
	 */
	var section;
	
	this.initialise(workspace);
	
	// Check if code use some type of blocks
	var hasBoardStart = false;
	var hasMQTT = false;
	var hasNetwork = false;
	
	var blocks = workspace.getAllBlocks();
	for (var x = 0, block; block = blocks[x]; x++) {
		if (block.disabled || block.getInheritedDisabled()) {
			continue;
		}
		if (block.type == 'when_board_starts') {
			hasBoardStart = true;
		}

		if (((block.type == 'mqtt_publish') && block.isInHatBlock()) || (block.type == 'mqtt_subscribe')) {
			hasMQTT = true;
		}

		if ((((block.type == 'wifi_start') || (block.type == 'wifi_stop')) && block.isInHatBlock()) || (block.type == 'when_wifi_is_conneted') || (block.type == 'when_wifi_is_disconneted')) {
			hasNetwork = true;
		}
	}
	
	// Initialization code	
	var initCode = '';
	
	if (Code.status.modules.vm) {
		initCode += Blockly.Lua.indent(0,'-- enable blocks support in vm') + "\n";
		initCode += Blockly.Lua.indent(0,'vm.blocks(true)') + "\n\n";
	}
	
	initCode += Blockly.Lua.indent(0,'-- this event is used to sync the termination of the "when board start" block with other hat blocks') + "\n";
	initCode += Blockly.Lua.indent(0,'_eventBoardStarted = event.create()') + "\n";
	
	if (hasMQTT) {
		initCode += '\n';
		initCode += Blockly.Lua.indent(0,'-- this lock is used to protect the mqtt client connection') + "\n";
		initCode += Blockly.Lua.indent(0,'_mqtt_lock = thread.createmutex()') + "\n";		
	}

	if (hasNetwork) {		
		initCode += '\n';
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
	
	Blockly.Lua.addFragment("events", "_init_code", null, initCode);
	
	// Begin
	blocks = workspace.getTopBlocks(true);
	
	for (var x = 0, block; block = blocks[x]; x++) {
	    if (!block.isHatBlock()) {
	      // Don't include code for blocks that are outside a hat block.
	      continue;
	    }	
    
		// By default, put code in the default section
		section = "default";

			
		// Check if block has the section() function, which tell us in which section
		// we must put the block's code 
		if (typeof block.section !== "undefined") {
			section = block.section();
		}

		// Get block code
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
			Blockly.Lua.addFragment(section, "_block_code" + block.id, block, line);
		}
	}

	// If the program hasn't a "when board start" block, simulate that it has and empty one. This
	// is required to activate hat blocks.
	if (!hasBoardStart) {
		initCode = Blockly.Lua.indent(0,'thread.start(function()') + "\n";
		initCode += Blockly.Lua.indent(1,'-- board is started') + "\n";
		initCode += Blockly.Lua.indent(1,'_eventBoardStarted:broadcast(false)') + "\n";
		initCode += Blockly.Lua.indent(0,'end)') + "\n";
		
		Blockly.Lua.addFragment("start", "activate_hat_blocks", null, initCode);
	}

	// Put definitions into declaration section
	for (var name in Blockly.Lua.definitions_) {
		Blockly.Lua.addFragment("declaration", name, null, Blockly.Lua.definitions_[name]);
	}

	// Generate code from code sections
	var code = "";
	Blockly.Generator.section.forEach(function(section) {
		var hasFragment = false;
		var first = false;
		
		section.fragment.forEach(function(fragment) {
			if (!first) {
				code += '\n';
			}
			
			code += fragment.code;
			
			hasFragment = true;
			first = false;
		});
		
		if (hasFragment) {
			code += '\n';
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

Blockly.Generator.prototype.updateChunk = function(block) {
	if (!block || block.disabled) {
		return;
	}

	this.initialise(Blockly.getMainWorkspace(), true);
	
	// Generate code for block
	var func = this[block.type];
	var code = func.call(block, block);
	
	// In this case we are not interested into hole block's code, so
	// we only need to update it's chunks.
	var code = '';
	
	Blockly.Generator.section.forEach(function(section) {
		if (section.id == "chunks") {
			section.fragment.forEach(function(fragment) {
				code += fragment.code;
			});
		}
	});
	
	console.log(code);
	
	Code.agent.send({
		command: "boardRunCommand",
		arguments: {
			code: btoa("function _code()" + code + "end")
		}
	}, function(id, info) {});
}

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
	
	if (!Code.status.modules.vm) {
		codeSection["require"].push('require("block")');
	}

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
	
	if (!Code.status.modules.vm) {
		code += "local previous = wcBlock.developerMode\n";
		code += "wcBlock.developerMode = false\n";
	}
		
	if (goog.isArray(line)) {
		code += "print(" + line[0] + ")\n";
	} else {
		code += "print(" + line + ")\n";
	}
	
	if (!Code.status.modules.vm) {
		code += "wcBlock.developerMode = previous\n";
	}
	
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

	if (!Code.status.modules.vm) {
		codeSection["require"].push('require("block")');
	}

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
	
	if (!Code.status.modules.vm) {	
		code += "local previous = wcBlock.developerMode\n";
		code += "wcBlock.developerMode = false\n";
	}
	
	if (goog.isArray(line)) {
		code += line[0] + "\n";
	} else {
		code += line + "\n";
	}
	
	if (!Code.status.modules.vm) {
		code += "wcBlock.developerMode = previous\n";
	}
	
	code += "end)\n";
	code += "end";

	return code;
};
