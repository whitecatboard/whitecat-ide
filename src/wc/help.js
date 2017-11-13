/*
 * Whitecat Ecosystem Blockly Based Web IDE
 *
 * The Whitecat IDE help syste,
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

function Help() {
	this.data = {};
}

// Get the help data
Help.prototype.get = function(callback) {
	var thisInstance = this;
	
	if (typeof require != "undefined") {
		if (typeof require('nw.gui') != "undefined") {
		    var fs = require("fs");
		    var path = require('path');

		    var file = 'boards/defs/help.json';
		    var filePath = path.join(process.cwd(), file);  

			try {
				var data = fs.readFileSync(filePath, "utf8");
			} catch (error) {
				return;
			}

			try {
				thisInstance.data = JSON.parse(data);
				callback();			
			} catch (error) {
				callback();			
			}
		} else {
			jQuery.ajax({
				url: Code.folder + "/boards/defs/help.json",
				success: function(result) {
					thisInstance.data = result;
					callback();
					return;
				},
		
				error: function() {
					callback();			
				}
			});		
		}
	} else {
		jQuery.ajax({
			url: Code.folder + "/boards/defs/help.json",
			success: function(result) {
				thisInstance.data = result;
				callback();
				return;
			},
			error: function() {
				callback();			
			}
		});				
	}
};

Help.prototype._removeHandlers = function() {
	jQuery(".modal-body").find("a").unbind("click");
}

Help.prototype._addHandlers = function() {
	var thisInstance = this;
	
	jQuery(".modal-body").find("a").unbind("click").bind("click", function(e) {
		var target = jQuery(e.target);
		var href = target.attr("href");
		
		if (href.startsWith("https://ide.whitecatboard.org/?file=")) {
			// Open code
			Code.loadExample(href.replace("https://ide.whitecatboard.org/?file=",""));
		} else if (href.startsWith("http:") || href.startsWith("https:")) {
			// href is external open in browser
			window.open(href,"_blank")
		} else {
			// Open in dialog
			href = href.replace("wiki/", "wiki/" + Code.settings.language + "/");
			
			thisInstance._show(href);
		}
		
		return false;
	});	
};

Help.prototype._show = function(url) {
	var thisInstance = this;

	Code.closeDialogs();
	setTimeout(function() {
	  	jQuery.ajax({
	  		url: Code.server + "/" + url,
	  		type: "GET",
			crossDomain:true,
	  		success: function(result) {
				bootbox.dialog({
					title: Blockly.Msg.HELP,
					message: result,
					closable: true,
					onEscape: true,
					size: "large"
				}).on('shown.bs.modal', function (e) {
					thisInstance._addHandlers();
				});
	  		},
	  		error: function() {
	  		}
		});
	}, 500);
};

Help.prototype.getUrl = function(type, id) {
	var thisInstance = this;
	
	if (typeof thisInstance.data[type] == "undefined") return "";
	
	if (typeof thisInstance.data[type][id] != "undefined") {
		url = thisInstance.data[type][id];
	} else {
		url = '';
	}				
	
	url = url.replace("wiki/", "wiki/" + Code.settings.language + "/");

	return url;
};

Help.prototype.show = function(type, id) {
	var thisInstance = this;
	
	if (type == "alerts") {
		thisInstance._show(id);
		return;
	}
	
	var url = thisInstance.getUrl(type, id);
	if (url != "") {
		thisInstance._show(url);
	}
}

Help.prototype.closeAll = function() {
	this._removeHandlers();
}