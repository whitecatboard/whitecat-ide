chrome.runtime.onMessage.addListener(
  function(request, sender, sendResponse) {
	  request = request.replace("\r","<br>").replace("\n","");
	  jQuery("#content").append(request + "<br>");
   }
);
