function debug(msg) {
	if (Board.debug) {
		chrome.runtime.sendMessage(msg.replace(/\n/g, "<br>"));
	}
}