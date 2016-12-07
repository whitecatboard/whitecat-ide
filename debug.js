function debug(msg) {
	if (Whitecat.debug) {
		chrome.runtime.sendMessage(msg);
	}
}