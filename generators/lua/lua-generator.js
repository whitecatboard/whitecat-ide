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
  var codeSection = [];
  
  codeSection["init"] = [];
  codeSection["default"] = [];
  
  // Bwegin
  this.init(workspace);
  var blocks = workspace.getTopBlocks(true);
  for (var x = 0, block; block = blocks[x]; x++) {
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
	  
	  // Put code in it's section
      codeSection[section].push(line);
    }
  }
  
  // Generate code from code sections
  var code = "";
  var tmpCode = "";
  
  for (section in codeSection) {
	  tmpCode = codeSection[section].join('\n');  // Blank line between each section.	  	  
	  code += tmpCode + '\n';
  }

  code = this.finish(code) + '\n';

  // Final scrubbing of whitespace.
  code = code.replace(/^\s+\n/, '');
  code = code.replace(/\n\s+$/, '\n');
  code = code.replace(/[ \t]+\n/g, '\n');
  
  return code;
};
