goog.require('Blockly.Generator');

Blockly.Generator.prototype.valueToCode = function(block, name, outerOrder) {
  if (isNaN(outerOrder)) {
    goog.asserts.fail('Expecting valid order from block "%s".', block.type);
  }
  var targetBlock = block.getInputTargetBlock(name);
  if (!targetBlock) {
    return '';
  }
  var tuple = this.blockToCode(targetBlock);
  if (tuple === '') {
    // Disabled block.
    return '';
  }

  // Value blocks must return code and order of operations info.
  // Statement blocks must only return code.
  goog.asserts.assertArray(tuple, 'Expecting tuple from value block "%s".',
      targetBlock.type);
  var code = tuple[0];
  var innerOrder = tuple[1];
  if (isNaN(innerOrder)) {
    goog.asserts.fail('Expecting valid order from value block "%s".',
        targetBlock.type);
  }
  if (!code) {
    return '';
  }
  
  // Need cast?
  //if (!block.workspace.isFlyout) {
	//  var input = block.getInput(name);
  //
	//  if (input && input.connection && input.connection.check_ && (input.connection.check_.length == 1)) {
	//	  var castType = input.connection.check_[0];
	//  
	//	  if (castType == "Number") {
	//		  code = 'wcBlock.castN(' + code + ',' + Blockly.Lua.blockIdToNum(targetBlock.id) + ')';
	//	  }
	//  }  	
  //}
    
  if (false && (!block.workspace.isFlyout) && (isNaN(code)) && (!(/^[a-zA-Z_]+[0-9a-zA-Z_]*$/.test(code)))) {
    code = "--[[bs:"+Blockly.Lua.blockIdToNum(targetBlock.id)+":0]]" + code + "--[[be:"+Blockly.Lua.blockIdToNum(targetBlock.id)+":0]]"
  }
  
  // Add parentheses if needed.
  var parensNeeded = false;
  var outerOrderClass = Math.floor(outerOrder);
  var innerOrderClass = Math.floor(innerOrder);
  if (outerOrderClass <= innerOrderClass) {
    if (outerOrderClass == innerOrderClass &&
        (outerOrderClass == 0 || outerOrderClass == 99)) {
      // Don't generate parens around NONE-NONE and ATOMIC-ATOMIC pairs.
      // 0 is the atomic order, 99 is the none order.  No parentheses needed.
      // In all known languages multiple such code blocks are not order
      // sensitive.  In fact in Python ('a' 'b') 'c' would fail.
    } else {
      // The operators outside this code are stronger than the operators
      // inside this code.  To prevent the code from being pulled apart,
      // wrap the code in parentheses.
      parensNeeded = true;
      // Check for special exceptions.
      for (var i = 0; i < this.ORDER_OVERRIDES.length; i++) {
        if (this.ORDER_OVERRIDES[i][0] == outerOrder &&
            this.ORDER_OVERRIDES[i][1] == innerOrder) {
          parensNeeded = false;
          break;
        }
      }
    }
  }
  if (parensNeeded) {
    // Technically, this should be handled on a language-by-language basis.
    // However all known (sane) languages use parentheses for grouping.
    code = '(' + code + ')';
  }
  return code;
};

Blockly.Generator.prototype.blockToCode = function(block) {
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
    var id = block.id.replace(/\$/g, '$$$$');  // Issue 251.
    if (this.STATEMENT_PREFIX) {
      code = this.STATEMENT_PREFIX.replace(/%1/g, '\'' + id + '\'') +
          code;
    }
    
    if (!block.workspace.isFlyout && !block.isHatBlock()) {
      var flags = 0;      
	  var lines = code.split(/\r\n|\r|\n/).length;
	  
      code = "--[[bs:"+Blockly.Lua.blockIdToNum(block.id)+":"+flags+"]]" + ((lines>1)?'\n':'') + 
             ((lines > 1)?code:code.replace(/\n$/,'')) +
		  	 "--[[be:"+Blockly.Lua.blockIdToNum(block.id)+":"+flags+"]]" + '\n';
    }
    
    return this.scrub_(block, code);
  } else if (code === null) {
    // Block has handled code generation itself.
    return '';
  } else {
    goog.asserts.fail('Invalid code generated: %s', code);
  }
};