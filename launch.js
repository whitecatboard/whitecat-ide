chrome.app.runtime.onLaunched.addListener(function() {
	console.log("launch");
	chrome.storage.sync.get(
	  {
	    language: 'en',
	  }, 
	  function(items) {
		  chrome.app.window.create('index.html?lang='+items.language, {
		    id: "mainwin",
			state: "maximized"
		  });  
	  }
  	);	  
});
