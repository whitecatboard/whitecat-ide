function watcher() {
	var thisInstance = this;
	
	// Declare language blocks that have watchers
	Blockly.Blocks['logic_compare'].hasWatcher = true;
	Blockly.Blocks['logic_operation'].hasWatcher = true;
	Blockly.Blocks['logic_negate'].hasWatcher = true;
	Blockly.Blocks['logic_boolean'].hasWatcher = true;
	Blockly.Blocks['logic_null'].hasWatcher = true;
	Blockly.Blocks['logic_ternary'].hasWatcher = true;
	Blockly.Blocks['math_number'].hasWatcher = true;
	Blockly.Blocks['math_arithmetic'].hasWatcher = true;
	Blockly.Blocks['math_single'].hasWatcher = true;
	Blockly.Blocks['math_trig'].hasWatcher = true;
	Blockly.Blocks['logic_ternary'].hasWatcher = true;
	Blockly.Blocks['math_constant'].hasWatcher = true;
	Blockly.Blocks['math_number_property'].hasWatcher = true;
	Blockly.Blocks['math_change'].hasWatcher = true;
	Blockly.Blocks['math_round'].hasWatcher = true;
	Blockly.Blocks['math_on_list'].hasWatcher = true;
	Blockly.Blocks['math_modulo'].hasWatcher = true;
	Blockly.Blocks['math_constrain'].hasWatcher = true;
	Blockly.Blocks['math_random_int'].hasWatcher = true;
	Blockly.Blocks['math_random_float'].hasWatcher = true;
	Blockly.Blocks['variables_get'].hasWatcher = true;
	
	thisInstance.watcher = jQuery('<div title="" style="position:absolute;"></div>').hide().appendTo('body');

	Blockly.bindEventWithChecks_(document, 'mousemove', this, function(e) {
		thisInstance.hide();
	});

	Blockly.bindEventWithChecks_(document, 'dblclick', this, function(e) {
		thisInstance.hide();
		thisInstance.show();
	});

	Code.workspace.blocks.addChangeListener(function(event) {
		if ((event.type == Blockly.Events.UI) && (event.element == 'selected')) {
			thisInstance.hide();
		}

		if ((event.type == Blockly.Events.CHANGE)) {
			thisInstance.hide();
		}

		if ((event.type == Blockly.Events.DELETE)) {
			thisInstance.hide();
		}
	});
};

watcher.prototype.show = function() {
	var thisInstance = this;

	if (Blockly.selected) {
		if (Blockly.selected.hasOwnProperty("hasWatcher") && Blockly.selected.hasWatcher) {
			// Get absolute position into the workspace's viewport for the selected block
			var position = Blockly.selected.workspace.getSvgXY(Blockly.selected.svgPath_);

			// Calculate coordinates for drawing area
			var originX = jQuery("#content_blocks").position().left;
			var originY = jQuery("#content_blocks").position().top;

			// Set position for div
			thisInstance.watcher.css({
				left: originX + position.x + Blockly.selected.width * Blockly.selected.workspace.scale,
				top: originY + position.y - 2,
				width: 2,
				height: Blockly.selected.height * Blockly.selected.workspace.scale
			});
		
			var code = Blockly.Lua.blockWatcherCode(Blockly.selected);
		
			Code.agent.send({
				command: "boardRunCommand",
				arguments: {
					code: btoa(code)
				}
			}, function(id, info) {			
				var response = atob(info.response);
			
				thisInstance.watcher.show();
				thisInstance.watcher.showBalloon({contents: response});	
			});	
		}
	}
};

watcher.prototype.hide = function() {
	var thisInstance = this;

	thisInstance.watcher.hide();
	thisInstance.watcher.hideBalloon();
};

// This changes the Blockly.WorkspaceSvg.setScale, because we need to hide
// watchers when a net scale is set
Blockly.WorkspaceSvg.prototype.setScale = function(newScale) {
	Code.watcher.hide();

	if (this.options.zoomOptions.maxScale &&
		newScale > this.options.zoomOptions.maxScale) {
		newScale = this.options.zoomOptions.maxScale;
	} else if (this.options.zoomOptions.minScale &&
		newScale < this.options.zoomOptions.minScale) {
		newScale = this.options.zoomOptions.minScale;
	}
	this.scale = newScale;
	this.updateGridPattern_();
	if (this.scrollbar) {
		this.scrollbar.resize();
	} else {
		this.translate(this.scrollX, this.scrollY);
	}
	Blockly.hideChaff(false);
	if (this.flyout_) {
		// No toolbox, resize flyout.
		this.flyout_.reflow();
	}
};
