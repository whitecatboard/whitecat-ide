/**
 *
 * The Whitecat IDE - Dialog management functions
 *
 * Copyright (C) 2015 - 2016
 * IBEROXARXA SERVICIOS INTEGRALES, S.L.
 * 
 * Author: Jaume Olivé (jolive@iberoxarxa.com / jolive@whitecatboard.org)
 *
 * -----------------------------------------------------------------------
 * 
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

'use strict';

var Dialog = {};

Dialog.closeAll = function() {
    BootstrapDialog.closeAll();
    bootbox.hideAll();
    Code.Help.closeAll();
}

Dialog.show = function(content) {
    var dialog = bootbox.dialog(content);
    
    dialog.whenClosed = function(f) {
        if (typeof dialog._whenClosed == "undefined") {
            dialog._whenClosed = [];            
        }
        
        dialog._whenClosed.push(f);
    }
    
    dialog.on('hidden.bs.modal', function () {
        if (typeof dialog._whenClosed != "undefined") {
            for (var cb in dialog._whenClosed) {
                dialog._whenClosed[cb]();
            }            
        }
    });    
}

/*
 * The following dialog boxes are displayed when an invalidFirmware event is received in the IDE, and they
 * are used to ask the user if he wants to install a valid firmware on the board.
 *
 */
Dialog.invalidFirmware = function() {
    Dialog.closeAll();
    
    Dialog.show({
        message: MSG['invalidFirmware'],
        buttons: {
            danger: {
                label: MSG['notNow'],
                className: "btn-default"
            },
            success: {
                label: MSG['installNow'],
                className: "btn-primary",
                callback: function() {
                    this.whenClosed(function() {
                        Dialog.invalidFirmwareSelectOne();
                    });
                }
            },
        },
        onEscape: true
    });
    
    Code.agent.addListenerOne("boardDetached", function(id, info) {
        Dialog.closeAll();
    });
}

Dialog.invalidFirmwareSelectOne = function() {
    Dialog.closeAll();
  
    var html = '<div class="form-group">' + 
               '<label for="selBoard">'+MSG['selFirmware']+'</label>' +
               '<select class="form-control" id="selBoard">';
    
    Code.board.list.forEach(function(board) {
        html += '<option value="'+board.id+'">'+ board.desc +'</option>';
    });
  
    html += '</select></div>';

    Dialog.show({
        message: html,
        buttons: {
            danger: {
                label: MSG['cancel'],
                className: "btn-default",
            },
            success: {
                label: MSG['installThisFirmware'],
                className: "btn-primary",
                callback: function() {
                    var firmware = jQuery("#selBoard").val();
                    
                    this.whenClosed(function() {
                        Dialog.invalidFirmwareConfirm(firmware);              
                    });                    
                }
            },
        },
        onEscape: true
    });    

    Code.agent.addListenerOne("boardDetached", function(id, info) {
        Dialog.closeAll();
    });
}

Dialog.invalidFirmwareConfirm = function(firmware) {
    Dialog.closeAll();

    Dialog.show({
        message: MSG['invalidFirmwareInstructions'],
        title: MSG['alert'],
        buttons: {
            success: {
                label: MSG['installNow'],
                className: "btn-primary",
                callback: function() {
                    this.whenClosed(function() {
                        Code.agent.send({
                            command: "boardInstall",
                            arguments: {
                              firmware: firmware
                            }
                        });
                    });                    
                }
            },
        },
        onEscape: true
    });

    Code.agent.addListenerOne("boardDetached", function(id, info) {
        Dialog.closeAll();
    });
}
