chrome.app.runtime.onLaunched.addListener(function() {
	chrome.storage.sync.get(
	  {
	    language: 'en',
	  }, 
	  function(items) {
		  chrome.app.window.create('index.html?lang='+items.language, {
		    id: "mainwin",
		    innerBounds: {
		      width: 320,
		      height: 240
		    }
		  });  
	  }
  	);	  
});
