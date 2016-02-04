

importScripts('require_script.js');


self.addEventListener('message', function(e) {
	if (e.data.action === 'start') {
		requireScript('example.js', function() {
			example();
			var message = {
				action: 'end'
			};
			self.postMessage(message);
		});
	}
}, false);
