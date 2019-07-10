'use strict';

/**
 * Return a sorted list of variable names for variable dropdown menus.
 * Include a special option at the end for creating a new variable name.
 * @return {!Array.<string>} Array of variable names.
 * @this {Blockly.FieldVariable}
 */
/*
Blockly.FieldVariable.dropdownCreate = function() {
  if (this.sourceBlock_ && this.sourceBlock_.workspace) {
    // Get a copy of the list, so that adding rename and new variable options
    // doesn't modify the workspace's list.
    var variableList = this.sourceBlock_.workspace.variableList.slice(0);
	
	var allLocals = Blockly.Variables.allUsedLocalVariables(this.sourceBlock_.workspace);
	var myLocals = Blockly.Variables.allUsedLocalVariables(this.sourceBlock_.getTop());

	console.log("variableList");
	console.log(variableList);

	console.log("allLocals");
	console.log(allLocals);

	console.log("myLocals");
	console.log(myLocals);
	
	// Remove my locals from all locals
	allLocals = allLocals.filter( function( el ) {
	  return myLocals.indexOf( el ) < 0;
	});

	// Remove all locals from variable list
	variableList = variableList.filter( function( el ) {
	  return allLocals.indexOf( el ) < 0;
	});
  } else {
    var variableList = [];
  }
  // Ensure that the currently selected variable is an option.
  var name = this.getText();
  if (name && variableList.indexOf(name) == -1) {
    variableList.push(name);
  }
  variableList.sort(goog.string.caseInsensitiveCompare);

  this.renameVarItemIndex_ = variableList.length;
  variableList.push(Blockly.Msg.RENAME_VARIABLE);

  this.deleteVarItemIndex_ = variableList.length;
  variableList.push(Blockly.Msg.DELETE_VARIABLE.replace('%1', name));
  // Variables are not language-specific, use the name as both the user-facing
  // text and the internal representation.
  var options = [];
  for (var i = 0; i < variableList.length; i++) {
    options[i] = [variableList[i], variableList[i]];
  }
  return options;
};
*/