'use strict';

Blockly.Variables.allUsedLocalVariables = function(root) {
  var blocks;
  if (root instanceof Blockly.Block) {
    // Root is Block.
    blocks = root.getDescendants();
  } else if (root.getAllBlocks) {
    // Root is Workspace.
    blocks = root.getAllBlocks();
  } else {
    throw 'Not Block or Workspace: ' + root;
  }
  var variableHash = Object.create(null);
  // Iterate through every block and add each variable to the hash.
  for (var x = 0; x < blocks.length; x++) {
    var blockVariables = blocks[x].getLocalVars();
    if (blockVariables) {
      for (var y = 0; y < blockVariables.length; y++) {
        var varName = blockVariables[y];
        // Variable name may be null if the block is only half-built.
        if (varName) {
          variableHash[varName.toLowerCase()] = varName;
        }
      }
    }
  }
  // Flatten the hash into a list.
  var variableList = [];
  for (var name in variableHash) {
    variableList.push(variableHash[name]);
  }
  return variableList;
};


Blockly.Variables.flyoutCategory = function(workspace) {
  var variableList = workspace.variableList;
  variableList.sort(goog.string.caseInsensitiveCompare);

  var xmlList = [];
  var button = goog.dom.createDom('button');
  button.setAttribute('text', Blockly.Msg.NEW_VARIABLE);
  button.setAttribute('callbackKey', 'CREATE_VARIABLE');

  workspace.registerButtonCallback('CREATE_VARIABLE', function(button) {
    Blockly.Variables.createVariable(button.getTargetWorkspace());
  });

  xmlList.push(button);

  if (variableList.length > 0) {
      if (Blockly.Blocks['variables_local']) {
	      var gap = Blockly.Blocks['math_change'] ? 8 : 24;
	      var blockText = '<xml>' +
	            '<block type="variables_local" gap="' + gap + '">' +
	            '<field name="VAR">' + variableList[0] + '</field>' +
	            '</block>' +
	            '</xml>';
	      var block = Blockly.Xml.textToDom(blockText).firstChild;
	      xmlList.push(block);
      }
    if (Blockly.Blocks['variables_set']) {
      var gap = Blockly.Blocks['math_change'] ? 8 : 24;
      var blockText = '<xml>' +
            '<block type="variables_set" gap="' + gap + '">' +
            '<field name="VAR">' + variableList[0] + '</field>' +
            '</block>' +
            '</xml>';
      var block = Blockly.Xml.textToDom(blockText).firstChild;
      xmlList.push(block);
    }
    if (Blockly.Blocks['math_change']) {
      var gap = Blockly.Blocks['variables_get'] ? 20 : 8;
      var blockText = '<xml>' +
          '<block type="math_change" gap="' + gap + '">' +
          '<field name="VAR">' + variableList[0] + '</field>' +
          '<value name="DELTA">' +
          '<shadow type="math_number">' +
          '<field name="NUM">1</field>' +
          '</shadow>' +
          '</value>' +
          '</block>' +
          '</xml>';
      var block = Blockly.Xml.textToDom(blockText).firstChild;
      xmlList.push(block);
    }

    for (var i = 0; i < variableList.length; i++) {
      if (Blockly.Blocks['variables_get']) {
        var blockText = '<xml>' +
            '<block type="variables_get" gap="8">' +
            '<field name="VAR">' + variableList[i] + '</field>' +
            '</block>' +
            '</xml>';
        var block = Blockly.Xml.textToDom(blockText).firstChild;
        xmlList.push(block);
      }
    }
  }
  return xmlList;
};