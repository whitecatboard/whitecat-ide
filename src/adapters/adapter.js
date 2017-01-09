/*
 * Whitecat Ecosystem Blockly Based Web IDE
 *
 * UART USB adapters functions
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

var Adapters = {};

Adapters.list = [];
Adapters.editArgs = {};

Adapters.check = function(file, adapter) {
	if (!adapter.hasOwnProperty("id")) {
		Code.showError(MSG['error'], MSG['youHaveAnErrorInFile'] + file + ':<br><br>' + MSG["missingAdapterId"]);
		return false;	
	}
	
	var platform;
	for(platform=0;platform < Code.platforms.length;platform++) {
		// Check for adapter info
		if (!adapter.hasOwnProperty(Code.platforms[platform])) {
			Code.showError(MSG['error'], MSG['youHaveAnErrorInFile'] + file + ':<br><br>' + MSG["missingAdapterPlatform"] +
			Code.platforms[platform]);
			return false;
		}
		
		if (!adapter[Code.platforms[platform]].hasOwnProperty("path")) {
			Code.showError(MSG['error'], MSG['youHaveAnErrorInFile'] + file + ':<br><br>' + MSG["missingAdapterPath"]+
			Code.platforms[platform]);
			return false;
		}

		if (!adapter[Code.platforms[platform]].hasOwnProperty("displayName")) {
			Code.showError(MSG['error'], MSG['youHaveAnErrorInFile'] + file + ':<br><br>' + MSG["missingAdapterDisplayName"]+
			Code.platforms[platform]);
			return false;
		}		
					
		// Add adapter, for our platform
		if (window.navigator.platform == Code.platforms[platform]) {	
			Adapters.list.push({
				"path": new RegExp(adapter[Code.platforms[platform]].path),
				"displayName": new RegExp(adapter[Code.platforms[platform]].displayName),
			});
		}
	}	
	
	return true;
}

Adapters.load = function() {
    var fs = require('fs');
    var path = require('path');
	var i;

	var dirPath = path.join(process.cwd(), "/adapters/defs");  
	var dirs = fs.readdirSync(dirPath);
	for(i=0;i<dirs.length;i++) {
		if (dirs[i].match(/^.*\.json$/)) {
			try {
				var data = fs.readFileSync(path.join(dirPath, dirs[i]), "utf8");
			} catch (error) {
				return;
			}
			
			try {
				var adapter = JSON.parse(data);
				
				if (Adapters.check(dirs[i], adapter)) {
					var menuItem = new nw.MenuItem({ 
						label: adapter.id + " (" + dirs[i] + ")",
						click: function() {
							Adapters.editArgs = {"file": this.data.file, "path": this.data.path, "type": this.data.type};
							var gui = require('nw.gui');
						    var win = gui.Window.open ('editSettings.html', {position: 'center', width: 800, height: 600});
						}
					});
				
					menuItem.data = {};
					menuItem.data.file = dirs[i];
					menuItem.data.path = dirPath;
					menuItem.data.type = "adapter";
					
					adaptersMenu.append(menuItem);					
				}
			} catch (error) {
				Code.showError(MSG['error'], MSG['youHaveAnErrorInFile'] + dirs[i] + ':<br><br>' + error);	
			}
		}
	}
}

Adapters.isValidForPort = function(port) {
	var i;
	
	for(i=0;i<Adapters.list.length;i++) {
		if (Adapters.list[i].path.test(port.path)) {
			if (Adapters.list[i].displayName.test(port.displayName)) {
				return true;
			}
		}
	}

	return false;
}