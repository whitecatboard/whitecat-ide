'use strict';

Blockly.Block.prototype.updateBoardAtFieldChange = function(field) {
	var thisInstance = this;
	
	if (!thisInstance.isInFlyout) {
		Code.workspace.blocks.addChangeListener(function(e) {
			if ((e.type == Blockly.Events.CHANGE)) {
				if (e.blockId != thisInstance.id) {
					var workspace = Blockly.Workspace.getById(e.workspaceId);

					if (workspace.getBlockById(e.blockId).getParent()) {
						if (workspace.getBlockById(e.blockId).getParent().id != thisInstance.id) {
							return;
						}						
					} else {
						return;
					}
				}

				if (e.name == field) {
					if (thisInstance.fieldTimeout) {
						clearTimeout(thisInstance.fieldTimeout);
					}

					thisInstance.fieldTimeout = setTimeout(function() {
						thisInstance.value = e.newValue;

						var code = Blockly.Lua.blockCode(thisInstance);
						console.log(code);
						thisInstance.removeError();
						thisInstance.removeStart();
						
						Code.agent.send({
							command: "boardRunCommand",
							arguments: {
								code: btoa(code)
							}
						}, function(id, info) {});

						thisInstance.value = -1;
					}, 500);
				}
			}
		});
	}
}

Blockly.Block.prototype.updateBoardAtBlockCreate = function() {
	var thisInstance = this;
	
	if (!thisInstance.isInFlyout) {
		Code.workspace.blocks.addChangeListener(function(e) {
			if ((e.type == Blockly.Events.CREATE)) {
				if (e.blockId != thisInstance.id) {
					var workspace = Blockly.Workspace.getById(e.workspaceId);

					if (workspace.getBlockById(e.blockId).getParent()) {
						if (workspace.getBlockById(e.blockId).getParent().id != thisInstance.id) {
							return;
						}						
					} else {
						return;
					}
				}

//				if (e.name == field) {
					if (thisInstance.createTimeout) {
						clearTimeout(thisInstance.createTimeout);
					}

					thisInstance.createTimeout = setTimeout(function() {
//						thisInstance.value = e.newValue;

						var code = Blockly.Lua.blockCode(thisInstance);

						thisInstance.removeError();
						thisInstance.removeStart();
						
						Code.agent.send({
							command: "boardRunCommand",
							arguments: {
								code: btoa(code)
							}
						}, function(id, info) {});

//						thisInstance.value = -1;
					}, 250);
//				}
			}
		});
	}
}