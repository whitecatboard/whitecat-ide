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
  if (!block.workspace.isFlyout) {
	  var input = block.getInput(name);

	  if (input && input.connection && input.connection.check_ && (input.connection.check_.length == 1)) {
		  var castType = input.connection.check_[0];
	  
		  if (castType == "Number") {
			  code = 'wcBlock.castN(' + code + ',' + Blockly.Lua.blockIdToNum(targetBlock.id) + ')';
		  }
	  }  	
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