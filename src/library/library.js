/*
 * Whitecat Ecosystem Blockly Based Web IDE
 *
 * Block library framework
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L. & CSS IBÉRICA, S.L.
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
	this.id = "";
	this.def = {};
	this.workDef = {};
}

blockLibrary.prototype.load = function(id, callback) {
	var thisInstance = this;
	
	if (thisInstance.id == id) return;
	
	if ((typeof require != "undefined") && (typeof require('nw.gui') != "undefined")) {
	    var fs = require("fs");
	    var path = require('path');

	    var file = 'library/defs/' + id + '.json';
	    var filePath = path.join(process.cwd(), file);  

		try {
			thisInstance.def = JSON.parse(fs.readFileSync(filePath, "utf8"));			
			thisInstance.workDef = JSON.parse(fs.readFileSync(filePath, "utf8"));	
			thisInstance.id = id;		
			callback();
		} catch (error) {
			callback();			
			return;
		}
	} else {
		jQuery.ajax({
			url: Code.folder + "/library/defs/" + id + ".json",
			success: function(result) {
				thisInstance.def = result;
				thisInstance.workDef = result;
				thisInstance.id = id;
				callback();
				return;
			},
	
			error: function() {
				callback();			
			}
		});				
	}
}

blockLibrary.prototype.update = function() {
	var thisInstance = this;

	if ((typeof require != "undefined") && (typeof require('nw.gui') != "undefined")) {
	    var fs = require('fs');
	    var path = require('path');

		var file = 'library/defs/' + thisInstance.id + '.json';
	    var filePath = path.join(process.cwd(), file);  

	    fs.writeFileSync(filePath, JSON.stringify(thisInstance.def, function(k, v){
	    	return v;
	    },2));
		
		thisInstance.id = "";
	}	
}

blockLibrary.prototype.replace = function(template, char1, char2, block) {
	var code = "";	
	var previous = "";
	var marker = "";
	var token = "";
	var id = "";
	
	for(var i=0;i < template.length;i++) {
		if ((marker == char1) || (marker == char2)) {
			if ((template.charAt(i) == char1) || (template.charAt(i) == char2)) {
				if ((token == char1 + char1) || (token == char2 + char2)) {
					if (token == "%%") {
						code = code + block[id];
					} else if (token == "$$") {
						code = code + "'" + eval("block.getFieldValue('"+id+"')") + "'";
					} else if (token == "@@") {
						code = code + eval("Blockly.Lua.valueToCode(block, id, Blockly.Lua.ORDER_NONE)");
					} else if (token == "{{") {
						code = code + eval(id);
					}
					
					token = "";
					id = "";
				} else {
					token = template.charAt(i) + template.charAt(i);
				}
				
				marker = "";
			} else {
				if (token != "") {
					id = id + previous;
				} else {
					code = code + previous;						
				}
				marker = "";
			}
		} else {
			if ((template.charAt(i) == char1) || (template.charAt(i) == char2))  {
				marker = char2;
			} else {
				if (token == "") {
					code = code + template.charAt(i);
				} else {
					id = id + template.charAt(i);
				}
			}				
		}
		
		previous = template.charAt(i);
	}	
	
	return code;
}

blockLibrary.prototype.create = function(xml, block) {
	var thisInstance = this;
	
	// Block def
	Blockly.Blocks[block.spec.type] = {
		init: function() {
			this.jsonInit(block.spec);
						
			// Enable interactive fields
			for (var field in block.interactiveFields) {
				this.updateBoardAtFieldChange(block.interactiveFields[field]);
			}
		}
	};
	
	// Generator
	Blockly.Lua[block.spec.type] = function(b) {
		var template = atob(block.code);
		var code = "";

		// Add dependencies
		for (var module in block.dependency) {
			if (codeSection["require"].indexOf('require("'+block.dependency[module]+'")') == -1) {
				codeSection["require"].push('require("'+block.dependency[module]+'")');
			}
		}
		
		code = thisInstance.replace(template, "$", "$", b);
		code = thisInstance.replace(code, "%", "%", b);
		code = thisInstance.replace(code, "@", "@", b);
		code = thisInstance.replace(code, "{", "}", b);

		return code + "\n";	
	};
	
	// Insert block into it's categpry
	var newBlock = goog.dom.createDom('block');
	newBlock.setAttribute('type', block.spec.type);	
	
	// Create shadow values, if needed
	// Parse each block
	for (var prop in block.spec) {
		if (/args[0-9]*/.test(prop)) {
			for (var arg in block.spec[prop]) {
				if (block.spec[prop][arg].type == 'input_value') {
					if (typeof block.shadow[block.spec[prop][arg].name] != "undefined") {
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
	toolBar.find("category[id='"+block.category+"']").append(jQuery(newBlock)).html()
	
	return toolBar.html();
}

blockLibrary.prototype.get = function(xml, id, callback) {
	var thisInstance = this;
	
	this.load(id, function() {
		// Parse each block
		var blocks = thisInstance.workDef.blocks;

		for(var i=0;i < blocks.length;i++) {
			var block = blocks[i];
			
			// Get the json spec for block
			var spec = block.spec;
			
			// Translate messages
			for (var prop in spec) {
				if (/message[0-9]*/.test(prop)) {
					block.spec[prop] = block.msg[Code.settings.language][prop];
				}
			}
			
			// Search into arguments
			//
			// If argument is field_dropdown and value is not an array evaluate firts
			for (var prop in spec) {
				if (/args[0-9]*/.test(prop)) {
					for (var arg in spec[prop]) {
						if ((spec[prop][arg].type == 'field_dropdown') && (!jQuery.isArray(spec[prop][arg].options))) {
							spec[prop][arg].options = eval(spec[prop][arg].options);
						}
					}
				}
			}
			
			// If colour in spec is not an integer, evaluate
			if (isNaN(parseInt(spec.colour))) {
				spec.colour = eval(spec.colour);
			}
						
			// Create block
			xml = thisInstance.create(xml, block);
		}

		callback(xml);		
	});
}