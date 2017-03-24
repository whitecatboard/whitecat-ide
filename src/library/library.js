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
}

blockLibrary.prototype.create = function(xml, block) {
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
		var code = atob(block.code);

		// Add dependencies
		for (var module in block.dependency) {
			if (codeSection["require"].indexOf('require("'+block.dependency[module]+'")') == -1) {
				codeSection["require"].push('require("'+block.dependency[module]+'")');
			}
		}
		
		// Replace with block id
		code = code.replace(/%%id%%/g,b.id);
		
		// Replace references to fields
		var regex = /\$\$([a-z_A-Z]*)\$\$/g;
		var result;
		
		while ((result = regex.exec(code))) {
			code = code.replace(new RegExp('\\$\\$' + result[1] + '\\$\\$', "g"),"'"+b.getFieldValue(result[1])+"'");			

			var regex = /\$\$([a-z_A-Z]*)\$\$/g;
			var result;
		}
		
		// Replace references to fields
		var regex = /\@\@([a-z_A-Z]*)\@\@/g;
		var result;
		
		while ((result = regex.exec(code))) {
			code = code.replace(new RegExp('\\@\\@' + result[1] + '\\@\\@', "g"),Blockly.Lua.valueToCode(b, result[1], Blockly.Lua.ORDER_NONE));			

			var regex = /\@\@([a-z_A-Z]*)\@\@/g;
			var result;
		}

		// Evaluate expressions
		var regex = /\{\{([a-zA-Z0-9\(\)\+\-\*\.\[\]\'\"]*)\}\}/g;
		var result;
		
		while ((result = regex.exec(code))) {
			var res = result[1];
			
			res = res.replace(/\[/g,"\\[");
			res = res.replace(/\]/g,"\\]");
			
			code = code.replace(new RegExp('\\{\\{' + res + '\\}\\}', "g"),eval(result[1]));			

			var regex = /\{\{([a-zA-Z0-9\(\)\+\-\*\.\[\]\'\"]*)\}\}/g;
			var result;
		}
		
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

						var value = goog.dom.createDom('value');
						value.setAttribute('name', block.spec[prop][arg].name);
						
						shadow.appendChild(field);
						value.appendChild(shadow);
						newBlock.appendChild(value);
					}
				}
			}
		}
	}
	/*
<block type="actuator_set_buzzer">
	<value name="args0">
	<shadow type="math_number">
	<field class="0" name="undefined"></field></shadow></value></block>
	
					'<value name="FREQUENCY">' +
				'<shadow type="math_number">' +
				'<field name="NUM">1000</field>' +
				'</shadow>' +
				'</value>' +
*/
	var toolBar = jQuery('<toolbar>' + xml + '</toolbar>');
	toolBar.find("category[id='"+block.category+"']").append(jQuery(newBlock)).html()
	
	return toolBar.html();
}

blockLibrary.prototype.get = function(xml, id, callback) {
	var thisInstance = this;
	
	if (typeof require != "undefined") {
		if (typeof require('nw.gui') != "undefined") {
		    var fs = require("fs");
		    var path = require('path');
  
		    var file = 'library/defs/' + id + '.json';
		    var filePath = path.join(process.cwd(), file);  

			try {
				var data = fs.readFileSync(filePath, "utf8");
			} catch (error) {
				return;
			}

			try {
				// Parse library
				var def = JSON.parse(data);
				
				// Parse each block
				var blocks = def.blocks;

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
			} catch (error) {
				callback(JSON.parse("{}"));			
			}
		} else {
			jQuery.ajax({
				url: Code.folder + "/library/defs/" + id + ".json",
				success: function(result) {
					callback(result);
					return;
				},
		
				error: function() {
					callback(JSON.parse("{}"));			
				}
			});		
		}
	} else {
		jQuery.ajax({
			url: Code.folder + "/library/defs/" + id + ".json",
			success: function(result) {
				callback(result);
				return;
			},
	
			error: function() {
				callback(JSON.parse("{}"));			
			}
		});				
	}
}