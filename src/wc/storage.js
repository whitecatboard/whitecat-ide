/*
 * Whitecat Ecosystem Blockly Based Web IDE
 *
 * Storage manamgement functions
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

var StorageType = {
	None: 0,
	Board: 1,
	Computer: 2,
	Cloud: 3
};

function Storage(type) {
	this.type = type;
	this.isInit = false;
	this.fs = null;
}

Storage.prototype.errorHandler = function(e) {
  var msg = '';

/*
  switch (e.code) {
    case FileError.QUOTA_EXCEEDED_ERR:
      msg = 'QUOTA_EXCEEDED_ERR';
      break;
    case FileError.NOT_FOUND_ERR:
      msg = 'NOT_FOUND_ERR';
      break;
    case FileError.SECURITY_ERR:
      msg = 'SECURITY_ERR';
      break;
    case FileError.INVALID_MODIFICATION_ERR:
      msg = 'INVALID_MODIFICATION_ERR';
      break;
    case FileError.INVALID_STATE_ERR:
      msg = 'INVALID_STATE_ERR';
      break;
    default:
      msg = 'Unknown Error';
      break;
  };

  console.log('Error: ' + msg);
  */
};

Storage.prototype.init = function(callback) {
	var thisInstance = this;
		
	if (thisInstance.isInit) {
		callback();
		return;
	}
	
	if (thisInstance.type == StorageType.Board) {
		thisInstance.isInit = true;
		callback();
	}

	if (thisInstance.type == StorageType.Cloud) {
		thisInstance.isInit = true;
		callback();
	}
	
	if (thisInstance.type == StorageType.Computer) {
		window.requestFileSystem  = window.requestFileSystem || window.webkitRequestFileSystem;
	
		navigator.webkitPersistentStorage.requestQuota(5*1024*1024, function(grantedBytes) {
			window.requestFileSystem(window.PERSISTENT, grantedBytes, function(fs) {
				thisInstance.fs = fs;
				thisInstance.isInit = true;
				callback();
			}, thisInstance.errorHandler);
		}, function(e) {
		});
	}	
}

Storage.prototype._localListDirectories = function(path, callback) {
	var thisInstance = this;
    var entries = [];	
    var dirReader;
	
    // Call the reader.readEntries() until no more results are returned.
    var readEntries = function() {
       dirReader.readEntries(function(results) {
        if (!results.length) {
			callback(entries.sort());
        } else {
			for(var i=0; i < results.length;i++) {
				var entry = results[i];
				
				entries.push({date: "", name: entry.name, size: "", type:(entry.isDirectory?"d":"f") });
			}
          readEntries();
        }
      }, thisInstance.errorHandler);
    };

	if (path == "/") {
		dirReader = thisInstance.fs.root.createReader();
		readEntries(); // Start reading dirs.
	} else {
		thisInstance.fs.root.getDirectory(path, {create: false}, function(dirEntry) {
			dirReader = dirEntry.createReader();
		    readEntries(); // Start reading dirs.
		});
	}
}

Storage.prototype._boardListDirectories = function(path, callback) {
	Code.agent.send({
		command: "boardGetDirContent",
		arguments: {
			path: path
		}
	}, function(id, entries) {
		callback(entries)
	});
}

Storage.prototype._cloudListDirectories = function(path, callback) {
	if (path == "/") path = "";

	jQuery.ajax({
		url: Code.server,
		data: {
			listDirectories: "",
			folder: path
		},
		type: "POST",
		success: function(result) {
			var entries = [];
			
			result = JSON.parse(result);
			
			if (!result.success) {
				Code.showError(MSG['error'], MSG['youHaveAnError'] + '<br><br>' + result.result, function() {});
				callback([]);
			}
			
			result = result.result;
			
			for(var i=0;i < result.length;i++) {
				var entry = result[i];
				
				entry.name = atob(entry.name);
				
				entries.push(entry);
			}

			callback(entries);
			return;
		},

		error: function() {
			callback([]);			
		}
	});				
}

Storage.prototype._localLoad = function(file, callback) {
	var thisInstance = this;
	
    thisInstance.fs.root.getFile(file, {}, function(fileEntry) {
      // Get a File object representing the file,
      // then use FileReader to read its contents.
      fileEntry.file(function(file) {
         var reader = new FileReader();

         reader.onloadend = function(e) {
           callback(this.result);
         };

         reader.readAsText(file);
      }, thisInstance.errorHandler);
    }, thisInstance.errorHandler);	
}

Storage.prototype._boardLoad = function(file, callback) {
	Code.agent.send({
		command: "boardReadFile",
		arguments: {
			path: file
		}
	}, function(id, info) {
		var fileContent = atob(info.content)
		
		callback(fileContent);
	});
}

Storage.prototype._cloudLoad = function(file, callback) {
	jQuery.ajax({
		url: Code.server,
		data: {
			loadFile: file
		},
		type: "POST",
		success: function(result) {
			result = JSON.parse(result);
			
			if (!result.success) {
				Code.showError(MSG['error'], MSG['youHaveAnError'] + '<br><br>' + result.result, function() {});
				callback([]);
			}
			
			result = result.result;
			
			callback(atob(result.content));
			return;
		},

		error: function() {
			callback([]);			
		}
	});				
}

Storage.prototype._localRemove = function(file,  callback) {
	var thisInstance = this;
	
    thisInstance.fs.root.getFile(file, {create: true}, function(fileEntry) {
		fileEntry.remove(function() {
			callback(true);			
		}, function() {
			callback(false);
		});
	});
}

Storage.prototype._boardRemove = function(file,  callback) {
	Code.agent.send({
		command: "boardRemoveFile",
		arguments: {
			path: btoa(file)
		}
	}, function(id, info) {
		callback(true);
	});
}

Storage.prototype._cloudRemove = function(file,  callback) {
	jQuery.ajax({
		url: Code.server,
		data: {
			removeFile: file,
		},
		type: "POST",
		success: function(result) {
			result = JSON.parse(result);

			if (!result.success) {
				Code.showError(MSG['error'], MSG['youHaveAnError'] + '<br><br>' + result.result, function() {});
				callback(false);
				return;
			}
			
			result = result.result;

			callback(true);
			return;
		},

		error: function() {
			callback(false);
			return;			
		}
	});				
}

Storage.prototype._localSave = function(file, content, callback) {
	var thisInstance = this;
	
    thisInstance.fs.root.getFile(file, {create: true}, function(fileEntry) {
      // Create a FileWriter object for our FileEntry (log.txt).
      fileEntry.createWriter(function(fileWriter) {
        fileWriter.onwriteend = function(e) {
			callback();
        };

        fileWriter.onerror = function(e) {
        };

        // Create a new Blob and write it to log.txt.
        var bb = new Blob([content], {type: 'plain/text'});
        fileWriter.write(bb);

      }, thisInstance.errorHandler);
    }, thisInstance.errorHandler);
}

Storage.prototype._boardSave = function(file, content, callback) {
	Code.agent.send({
		command: "boardWriteFile",
		arguments: {
			path: file,
			content: btoa(content)
		}
	}, function(id, info) {
		callback();
	});
}

Storage.prototype._cloudSave = function(file, id, content, callback) {
	file = Code.getBasename(file);
	
	jQuery.ajax({
		url: Code.server,
		data: {
			saveFile: btoa(file),
			id: id,
			content: btoa(content)
		},
		type: "POST",
		success: function(result) {
			result = JSON.parse(result);

			if (!result.success) {
				Code.showError(MSG['error'], MSG['youHaveAnError'] + '<br><br>' + result.result, function() {});
				callback([]);
			}
			
			result = result.result;

			callback();
			return;
		},

		error: function() {
			callback([]);			
		}
	});				
	
	callback();
}

Storage.prototype.listDirectories = function(path, callback) {
	var thisInstance = this;
	
	thisInstance.init(function() {
		if (thisInstance.type == StorageType.Board) {
			return thisInstance._boardListDirectories(path, callback);
		} else if (thisInstance.type == StorageType.Computer) {
			return thisInstance._localListDirectories(path, callback);
		} else if (thisInstance.type == StorageType.Cloud) {
			return thisInstance._cloudListDirectories(path, callback);
		}
	});
}

Storage.prototype.load = function(file, callback) {
	var thisInstance = this;
	
	thisInstance.init(function() {
		if (thisInstance.type == StorageType.Board) {
			return thisInstance._boardLoad(file, callback);
		} else if (thisInstance.type == StorageType.Computer) {
			return thisInstance._localLoad(file, callback);
		} else if (thisInstance.type == StorageType.Cloud) {
			return thisInstance._cloudLoad(file, callback);
		}
	});
}

Storage.prototype.save = function(file, id, content, callback) {
	var thisInstance = this;
	
	thisInstance.init(function() {
		if (thisInstance.type == StorageType.Board) {
			return thisInstance._boardSave(file, content, callback);
		} else if (thisInstance.type == StorageType.Computer) {
			return thisInstance._localSave(file, content, callback);
		} else if (thisInstance.type == StorageType.Cloud) {
			return thisInstance._cloudSave(file, id, content, callback);
		}
	});
}

Storage.prototype.remove = function(file, callback) {
	var thisInstance = this;
	
	thisInstance.init(function() {
		if (thisInstance.type == StorageType.Board) {
			return thisInstance._boardRemove(file,callback);
		} else if (thisInstance.type == StorageType.Computer) {
			return thisInstance._localRemove(file, callback);
		} else if (thisInstance.type == StorageType.Cloud) {
			return thisInstance._cloudRemove(file, callback);
		}
	});
}


/*

Storage._createDirectory = function(rootDirEntry, folders, callback) {
  // Throw out './' or '/' and move on to prevent something like '/foo/.//bar'.
  if (folders[0] == '.' || folders[0] == '') {
    folders = folders.slice(1);
  }

  rootDirEntry.getDirectory(folders[0], {create: true}, function(dirEntry) {
    // Recursively add the new subfolder (if we still have another to create).
    if (folders.length) {
      Storage._createDirectory(dirEntry, folders.slice(1), callback);
    } else {
    	callback();
    }
  }, Storage.errorHandler);
};

Storage.createDirectory = function(path, callback) {
	 Storage._createDirectory(window.fs.root, path.split("/"), function() {
		 callback();
	 });
};

Storage.save = function(path, file, content, callback) {
	Storage.createDirectory(path, function() {
	    window.fs.root.getFile(path + "/" + file, {create: true}, function(fileEntry) {
	      // Create a FileWriter object for our FileEntry (log.txt).
	      fileEntry.createWriter(function(fileWriter) {
	        fileWriter.onwriteend = function(e) {
				callback();
	        };

	        fileWriter.onerror = function(e) {
	        };

	        // Create a new Blob and write it to log.txt.
	        var bb = new Blob([content], {type: 'plain/text'});
	        fileWriter.write(bb);

	      }, Storage.errorHandler);
	    }, Storage.errorHandler);
	})
};

Storage.load = function(path, file, callback) {
    window.fs.root.getFile(path + "/" + file, {}, function(fileEntry) {
      // Get a File object representing the file,
      // then use FileReader to read its contents.
      fileEntry.file(function(file) {
         var reader = new FileReader();

         reader.onloadend = function(e) {
           alert(this.result);
         };

         reader.readAsText(file);
      }, Storage.errorHandler);
    }, Storage.errorHandler);	
};

*/