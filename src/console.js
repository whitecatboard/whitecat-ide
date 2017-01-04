function insert(msg) {
	msg = msg.replace("\r","<br>").replace("\n","");
	jQuery("#content").append(msg);
}