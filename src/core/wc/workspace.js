'use strict';

goog.require('Blockly.Workspace');

goog.require('goog.array');
goog.require('goog.math');

Blockly.Workspace.prototype.wcInit = function() {
    if (typeof this.sensors == "undefined") {
    	this.sensors = {
    	    "names":    [], // Array of sensor names in workspace
    	    "provides": [], // Array of provides structure for each sensor {id: xxxx, type: xxx}
    	    "settings": [], // Array of settings structure for each sensor {id: xxxx, type: xxx}
    	    "setup":    [], // Array of setup structure for each sensor {id: TMP36|DHT11|.., name: ..., interface: xxx, pin: xxx}		
    	};		
    }
}

Blockly.Workspace.prototype.sensorIndexOf = function(name) {  
  for (var i = 0, sensorName; sensorName = this.sensors.names[i]; i++) {
    if (Blockly.Names.equals(sensorName, name)) {
      return i;
    }
  }
  
  return -1;
};

Blockly.Workspace.prototype.createSensor = function(setup) {
  var thisInstance = this;

  // Get sensor name in workspace
  var sname = setup.name;

  // Get sensor index
  var index = this.sensorIndexOf(sname);

  // If sensor is not created, create it
  if (index == -1) {
	  // Push sensor name
	  this.sensors.names.push(sname);
	  
	  // Get sensor index
	  index = this.sensorIndexOf(sname);

	  // Find sensor in board structures and copy setup, provides and settings
	  Board.sensors.forEach(function(item, idx) {
		  if (item.id == setup.id) {
			  thisInstance.sensors.setup[index]    = setup;
			  thisInstance.sensors.provides[index] = item.provides;
			  thisInstance.sensors.settings[index] = item.settings;				  
		  }
	  });
  }
};