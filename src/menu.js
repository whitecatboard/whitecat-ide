/*
 * Whitecat Ecosystem Blockly Based Web IDE
 *
 * IDE menu structure
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

var mainMenu = new nw.Menu({type:"menubar"});

if (window.navigator.platform == "MacIntel") {
	mainMenu.createMacBuiltin("Whitecat");
}

var settingsMenu = new nw.Menu();
var adaptersMenu = new nw.Menu();
//var boardsMenu = new nw.Menu();

var menuItem = new nw.MenuItem({ 
	label: "List serial port adapters ...",
	click: function() {
		var gui = require('nw.gui');
	    var win = gui.Window.open ('serialPortList.html', {position: 'center', width: 800, height: 600});
	}
});

adaptersMenu.append(menuItem);	

menuItem = new nw.MenuItem({ type: 'separator' });

adaptersMenu.append(menuItem);	

mainMenu.append(new nw.MenuItem({
  label: 'Settings',
  submenu: settingsMenu
}));

settingsMenu.append(new nw.MenuItem({
  label: 'Adapters',
  submenu: adaptersMenu
}));

//settingsMenu.append(new nw.MenuItem({
//  label: 'Boards',
//  submenu: boardsMenu
//}));

nw.Window.get().menu = mainMenu;