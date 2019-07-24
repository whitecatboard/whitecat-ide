/*
 * Whitecat Ecosystem Blockly Based Web IDE
 *
 * Block library framework
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

function blockLibrary() {
	var self = this

	self.libs = []; // Loaded libraries
	self.def = {}; // Current library 

	// Load libraries
	if ((typeof require != "undefined") && (typeof require('nw.gui') != "undefined")) {
		var fs = require("fs");
		var path = require('path');

		var dir = 'library/defs';
		var dirPath = path.join(process.cwd(), dir);

		var files = fs.readdirSync(dirPath);
		files.forEach(function(file, index) {
			if (/^.+\.json$/.test(file)) {
				// Read library
				var libraryPath = path.join(dirPath, file);

				self.libs.push(JSON.parse(fs.readFileSync(libraryPath, "utf8")));
			}
		});
	}
}

blockLibrary.prototype.update = function() {
	var self = this;

	if ((typeof require != "undefined") && (typeof require('nw.gui') != "undefined")) {
		var fs = require('fs');
		var path = require('path');

		var file = 'library/defs/' + self.def.name + '.json';
		var filePath = path.join(process.cwd(), file);

		fs.writeFileSync(filePath, JSON.stringify(self.def, function(k, v) {
			return v;
		}, 2));

		self.libs.forEach(function(lib, idx) {
			if (lib.name == self.def.name) {
				self.libs[idx] = JSON.parse(JSON.stringify(self.def));
			}
		});

		Code.updateToolBox();
	}
}

blockLibrary.prototype.evalTemplate = function(block, pos, op, open, template) {
	var self = this;
	var code = "";
	var id = "";
	var prev = "";

	var begin_ops = ["$", "{", "@"];
	var end_ops = ["$", "}", "@"];
	var ops = ["FIELD", "FUNC", "CODE"];

	var i = 0;

	while (i < template.length) {
		if (begin_ops.indexOf(template.charAt(i)) != -1) {
			var newOp = ops[begin_ops.indexOf(template.charAt(i))];
			if (i + 1 < template.length) {
				if (template.charAt(i + 1) == "(") {
					var newPos = {
						val: 0
					};

					code = code + self.evalTemplate(block, newPos, newOp, 1, template.substring(i + 2));
					i = i + newPos.val;
				} else {
					code = code + template.charAt(i);
					i++
				}
			} else {
				code = code + template.charAt(i);
				i++;
			}
		} else if (template.charAt(i) == ")") {
			if (i + 1 < template.length) {
				if (end_ops.indexOf(template.charAt(i + 1)) != -1) {
					if (open > 0) {
						open--;

						if (open == 0) {
							var val = "";
							var id = template.substring(0, i);
							pos.val = i + 4;

							try {
								if (op == "FUNC") {
									val = eval(self.evalTemplate(block, newPos, "", 0, id));
								} else if (op == "FIELD") {
									val = eval("block.getFieldValue('" + id + "')");

									if (val == null) {
										val = Blockly.Lua.valueToCode(block, id, Blockly.Lua.ORDER_NONE) || '\'\'';
									}
								} else if (op == "CODE") {
									val = eval("Blockly.Lua.statementToCodeNoIndent(block,'" + id + "')");
								}
							} catch (e) {
								val = eval(self.evalTemplate(block, newPos, "", 0, id));
							}

							return val;
						}
					} else {
						code = code + template.charAt(i);
						i++;
					}
				} else {
					code = code + template.charAt(i);
					i++;
				}
			} else {
				code = code + template.charAt(i);
				i++;
			}
		} else {
			code = code + template.charAt(i);
			i++;
		}
	}

	return code;
}

blockLibrary.prototype.createBlocks = function(xml, block) {
	var self = this;

	// Block
	Blockly.Blocks[block.spec.type] = {
		def: {},
		init: function() {
			this.def = JSON.parse(JSON.stringify(block));

			this.jsonInit(block.spec);

			// Enable interactive fields
			for (var field in block.interactiveFields) {
				this.updateBoardAtFieldChange(block.interactiveFields[field]);
			}

			// Set color to same as parent category
			var parentCat = toolBar.find("category[id='cat" + block.parentCategory + "']");
			this.setColour(parentCat.attr("colour"));
		},

		hasWatcher: block.whatcher,

/*
		onchange: function(e) {
			if (!this.workspace.isDragging || this.workspace.isDragging()) {
				return;
			}

			if (typeof block.spec.parentStatement != "undefined") {
				if (block.spec.parentStatement) {
					if ((typeof e.element != "undefined") && (this.warning != null) && (e.element == "disabled")) {
						if (e.blockId == this.id) {
							this.setDisabled(true);
							return;
						}
					}

					if ((typeof e.element != "undefined") && (e.element == "disabled")) {
						if ((e.newValue != e.oldValue) && (e.blockId == this.id)) {
							this.disabledByUser = e.newValue;
						}
					}

					if (!this.isInBlock(block.spec.parentStatement)) {
						var tmp = "";
						var message = "";
						var parentBlock = self.getBlockDef(block.spec.parentStatement);

						if (typeof parentBlock.msg != "undefined") {
							tmp = parentBlock.msg[Code.settings.language].message0;
							message = "";
							var i = 2;

							while (tmp != message) {
								message = tmp;
								tmp = message.replace("%" + i, "%1");
								i++;
							}

							message = tmp;
							
							message = message.replace(/%1\s%1/g, "()")
							message = message.replace(/%1/g, "()")
						}

						if (message != "") {
							this.setWarningText(Blockly.Msg.ONLY_ALLOWED_WITHIN_BLOCK.replace("%1", message));
						}

						if (!this.isInFlyout) {
							this.setDisabled(true);
						}
					} else {
						var wasInWarning = (this.warning != null);

						this.setWarningText(null);
						if (!this.isInFlyout && wasInWarning & (typeof this.disabledByUser == "undefined" ? true : (!this.disabledByUser))) {
							this.setDisabled(false);
						} else {
							if (typeof this.disabledByUser != "undefined") {
								this.setDisabled(this.disabledByUser);
							}
						}
					}
				}
			}
		}
		*/
	};

	// Generator
	Blockly.Lua[block.spec.type] = function(b) {
		var code = "";
		var newCode = "";

		// Add dependencies
		for (var library in block.dependency) {
			Blockly.Lua.addDependency(library, b);
		}

		// Generate function code for block
		if (typeof block.code.functions != "undefined") {
			code = atob(block.code.functions);

			while (true) {
				var pos = {
					val: 0
				};

				newCode = self.evalTemplate(b, pos, "", 0, code);
				if (newCode != code) {
					code = newCode;
				} else {
					break;
				}
			}

			if (code != "") {
				Blockly.Lua.addFragment("functions", block.spec.type, b, code);
			}
		}

		// Generate default code for block
		code = "";
		newCode = "";

		if (typeof block.code['default'] != "undefined") {
			code = atob(block.code['default']);

			while (true) {
				var pos = {
					val: 0
				};

				newCode = self.evalTemplate(b, pos, "", 0, code);
				if (newCode != code) {
					code = newCode;
				} else {
					break;
				}
			}
			
			if (Blockly.Lua.developerMode && !b.isReporterBlock()) {
				var tryCode = "";
	
				tryCode += Blockly.Lua.indent(0,"try(") + "\n";
				tryCode += Blockly.Lua.indent(1,"function()") + "\n";
				tryCode += Blockly.Lua.indent(2,code) + "\n";
				tryCode += Blockly.Lua.indent(1,"end,") + "\n";
				tryCode += Blockly.Lua.indent(1,"function(where, line, err, message)") + "\n";
				tryCode += Blockly.Lua.blockError(2, this);
				tryCode += Blockly.Lua.indent(1,"end") + "\n";
				tryCode += Blockly.Lua.indent(0,")") + "\n";
			
				code = tryCode;
			} 
		}

		// A reporter block must return a tuple
		if (!b.isReporterBlock()) {
			return Blockly.Lua.postFormat(code, b);
		} else {
			return [code, Blockly.Lua.ORDER_HIGH];
		}
	};

	// Insert block into it's categpry
	var newBlock = goog.dom.createDom('block');
	newBlock.setAttribute('type', block.spec.type);

	// Create shadow values, if required
	for (var prop in block.spec) {
		if (/args[0-9]*/.test(prop)) {
			for (var arg in block.spec[prop]) {
				if (block.spec[prop][arg].type == 'input_value') {
					if (block.subtype[block.spec[prop][arg].name] == "output_pins") {
						var shadow = goog.dom.createDom('shadow');
						shadow.setAttribute('type', 'output_digital_pin');

						var value = goog.dom.createDom('value');
						value.setAttribute('name', block.spec[prop][arg].name);
						value.appendChild(shadow);

						newBlock.appendChild(value);
					} else if (block.subtype[block.spec[prop][arg].name] == "uart_units") {
						var shadow = goog.dom.createDom('shadow');
						shadow.setAttribute('type', 'uart_units');

						var value = goog.dom.createDom('value');
						value.setAttribute('name', block.spec[prop][arg].name);
						value.appendChild(shadow);

						newBlock.appendChild(value);						
					} else if (block.subtype[block.spec[prop][arg].name] == "display_color_sel") {
						var shadow = goog.dom.createDom('shadow');
						shadow.setAttribute('type', 'display_color_sel');

						var value = goog.dom.createDom('value');
						value.setAttribute('name', 'COLOR');
						value.appendChild(shadow);

						newBlock.appendChild(value);
					} else if (block.subtype[block.spec[prop][arg].name] == "text") {
						var shadow = goog.dom.createDom('shadow');
						shadow.setAttribute('type', 'text');

						var value = goog.dom.createDom('value');
						value.setAttribute('name', 'TEXT');
						value.appendChild(shadow);

						newBlock.appendChild(value);
					} else if (block.subtype[block.spec[prop][arg].name] == "neopixel_color_sel") {
						var shadow = goog.dom.createDom('shadow');
						shadow.setAttribute('type', 'neopixel_color_sel');

						var value = goog.dom.createDom('value');
						value.setAttribute('name', 'COLOR');
						value.appendChild(shadow);

						newBlock.appendChild(value);
					} else if (typeof block.shadow[block.spec[prop][arg].name] != "undefined") {
						var field = goog.dom.createDom('field', null, block.shadow[block.spec[prop][arg].name].value);
						field.setAttribute('name', block.shadow[block.spec[prop][arg].name].name);

						var shadow = goog.dom.createDom('shadow');
						shadow.setAttribute('type', block.shadow[block.spec[prop][arg].name].type);
						shadow.appendChild(field);

						var value = goog.dom.createDom('value');
						value.setAttribute('name', block.spec[prop][arg].name);
						value.appendChild(shadow);

						newBlock.appendChild(value);
					}
				}
			}
		}
	}

	var toolBar = jQuery('<toolbar>' + xml + '</toolbar>');
	var parentCat = toolBar.find("category[id='cat" + block.parentCategory + "']");
	var cat = toolBar.find("category[id='cat" + block.category + "']");

	if (cat.length == 0) {
		var catName = block.category;

		if (typeof MSG['cat' + block.category] != "undefined") {
			catName = MSG['cat' + block.category];
		}

		// Create the category
		cat = jQuery('<category id="cat' + block.category + '" colour="' + parentCat.attr("colour") + '" name="' + catName + '"></category>');			

		// Append the category in order
		var inserted = false;

		parentCat.children().each(function(index, subCat) {
			subCat = jQuery(subCat);

			var subCatName = subCat.attr("name");

			if (typeof subCatName == "undefined") {
				if (typeof MSG[subCat.attr("id")] != "undefined") {
					subCatName = MSG[subCat.attr("id")];
				} else {
					subCatName = subCat.attr("id");
				}
			}

			if ((catName < subCatName) && !inserted) {
				cat.insertBefore(subCat);
				inserted = true;
			}
		});

		if (!inserted) {
			parentCat.append(cat);
		}
	}

	if (cat.find("block[type='" + block.spec.type + "']").length == 0) {
		// Add block
		cat.append(newBlock);
	}

	return toolBar.html();
}

blockLibrary.prototype.get = function(xml, callback) {
	var self = this;

	function insert(libContent) {
		if (libContent) {
			libContent = JSON.parse(libContent);

			libContent.forEach(function(lib) {
				self.libs.push(lib);
			});
		}

		// Parse each lirary block
		self.libs.forEach(function(lib, idx) {
			// Has order?
			if (typeof lib.order != "undefined") {
				var includedBlocks = [];
				var includeSep = false;
				
				lib.order.forEach(function(order, idx) {
					lib.blocks.forEach(function(block, idx) {
						if (block.spec.type == order) {
							// Get the json spec for block
							var spec = block.spec;

							// Translate messages
							for (var prop in spec) {
								if (/message[0-9]*/.test(prop)) {
									if (block.msg[Code.settings.language][prop] != "") {
										block.spec[prop] = block.msg[Code.settings.language][prop];
									}
								}
							}

							// If colour in spec is not an integer, evaluate
							if (isNaN(parseInt(spec.colour))) {
								spec.colour = eval(spec.colour);
							}

							// Create block
							xml = self.createBlocks(xml, block);	
						
							includedBlocks.push(block.spec.type);	
							includeSep = false;					
						}
					});							
				});	
				
				lib.blocks.forEach(function(block, idx) {
					if (!includedBlocks.includes(block.spec.type)) {
						// Get the json spec for block
						var spec = block.spec;

						// Translate messages
						for (var prop in spec) {
							if (/message[0-9]*/.test(prop)) {
								if (block.msg[Code.settings.language][prop] != "") {
									block.spec[prop] = block.msg[Code.settings.language][prop];
								}
							}
						}

						// If colour in spec is not an integer, evaluate
						if (isNaN(parseInt(spec.colour))) {
							spec.colour = eval(spec.colour);
						}

						// Create block
						xml = self.createBlocks(xml, block);	
						
						includedBlocks.push(block.spec.type);						
					}
				});	
			} else {
				lib.blocks.forEach(function(block, idx) {
					// Get the json spec for block
					var spec = block.spec;

					// Translate messages
					for (var prop in spec) {
						if (/message[0-9]*/.test(prop)) {
							if (block.msg[Code.settings.language][prop] != "") {
								block.spec[prop] = block.msg[Code.settings.language][prop];
							}
						}
					}

					// If colour in spec is not an integer, evaluate
					if (isNaN(parseInt(spec.colour))) {
						spec.colour = eval(spec.colour);
					}

					// Create block
					xml = self.createBlocks(xml, block);
				});				
			}
			
			// Add translations
			if (typeof lib.messages != "undefined") {
				lib.messages.forEach(function(message) {
					if (typeof message[Code.settings.language] != "undefined") {
						MSG[message.msgid] = message[Code.settings.language];
					}
				});
			}
		});

		callback(xml);
	}

	if ((typeof require != "undefined") && (typeof require('nw.gui') != "undefined")) {
		insert(null);
	} else {
		jQuery.ajax({
			url: Code.folder + "/?libraries",
			success: function(result) {
				insert(result);
				return;
			},

			error: function() {
				callback();
			}
		});
	}
}

/**
 * Create a new empty library.
 */
blockLibrary.prototype.create = function(name) {
	if ((typeof require != "undefined") && (typeof require('nw.gui') != "undefined")) {
		var fs = require("fs");
		var path = require('path');

		// Get library path file
		var file = 'library/defs/' + name + '.json';
		var filePath = path.join(process.cwd(), file);

		// Create the library only if doesn't exists
		if (!fs.existsSync(filePath)) {
			fs.writeFileSync(filePath, '{"name": "' + name + '","blocks": []}');

			// Add library to workspace
			try {
				self.libs.push(JSON.parse(fs.readFileSync(filePath, "utf8")));
			} catch (error) {
				return;
			}
		}
	}
}

blockLibrary.prototype.getBlockDef = function(type) {
	var findedBlock = null;

	this.libs.forEach(function(lib, idx) {
		if (!findedBlock) {
			lib.blocks.forEach(function(block, idx) {
				if ((block.spec.type == type) && (!findedBlock)) {
					findedBlock = block;
				}
			});					
		}
	});

	return findedBlock;
}
