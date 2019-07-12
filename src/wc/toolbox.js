 /*
 * Whitecat Blocky Environment, additions in Blockly.Toolbox
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
'use strict';

Blockly.Toolbox.prototype.syncTrees_ = function(treeIn, treeOut, pathToMedia) {
  var openNode = null;
  var lastElement = null;
  for (var i = 0, childIn; childIn = treeIn.childNodes[i]; i++) {
    if (!childIn.tagName) {
      // Skip over text.
      continue;
    }
    switch (childIn.tagName.toUpperCase()) {
      case 'CATEGORY':
        var childOut = this.tree_.createNode(childIn.getAttribute('name'));
		
		// This is required by Whitec¡at IDE to access to the on-line help system for the block category
		childOut.catId = childIn.getAttribute('id');

        childOut.blocks = [];
        treeOut.add(childOut);
        var custom = childIn.getAttribute('custom');
        if (custom) {
          // Variables and procedures are special dynamic categories.
          childOut.blocks = custom;
        } else {
          var newOpenNode = this.syncTrees_(childIn, childOut, pathToMedia);
          if (newOpenNode) {
            openNode = newOpenNode;
          }
        }
        var colour = childIn.getAttribute('colour');
        if (goog.isString(colour)) {
          if (colour.match(/^#[0-9a-fA-F]{6}$/)) {
            childOut.hexColour = colour;
          } else {
            childOut.hexColour = Blockly.hueToRgb(colour);
          }
          this.hasColours_ = true;
        } else {
          childOut.hexColour = '';
        }
        if (childIn.getAttribute('expanded') == 'true') {
          if (childOut.blocks.length) {
            // This is a category that directly contains blocks.
            // After the tree is rendered, open this category and show flyout.
            openNode = childOut;
          }
          childOut.setExpanded(true);
        } else {
          childOut.setExpanded(false);
        }
        lastElement = childIn;
        break;
      case 'SEP':
        if (lastElement) {
          if (lastElement.tagName.toUpperCase() == 'CATEGORY') {
            // Separator between two categories.
            // <sep></sep>
            treeOut.add(new Blockly.Toolbox.TreeSeparator(
                this.treeSeparatorConfig_));
          } else {
            // Change the gap between two blocks.
            // <sep gap="36"></sep>
            // The default gap is 24, can be set larger or smaller.
            // Note that a deprecated method is to add a gap to a block.
            // <block type="math_arithmetic" gap="8"></block>
            var newGap = parseFloat(childIn.getAttribute('gap'));
            if (!isNaN(newGap) && lastElement) {
              lastElement.setAttribute('gap', newGap);
            }
          }
        }
        break;
      case 'BLOCK':
      case 'SHADOW':
      case 'LABEL':
      case 'BUTTON':
        treeOut.blocks.push(childIn);
        lastElement = childIn;
        break;
    }
  }

  return openNode;
};