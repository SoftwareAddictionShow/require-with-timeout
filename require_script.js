


(function() {
	function requireScript(url, cb, timeout) {
		httpRequest(url, 'GET', function(response, status) {
			if (status === 200) {
				// script -> Blob -> Object URL
				var blob = new Blob([response], {type: 'text/javascript'});
				var blob_url = URL.createObjectURL(blob);
				var is_in_window = (typeof window === 'object');

				if (is_in_window) {
					// FIXME: Remove the script element when it is done loading
					var script = document.createElement('script');
					document.head.appendChild(script);
					script.onload = function() {
						console.info('Loaded script "' + url + '".');
						URL.revokeObjectURL(blob_url);
						if (cb) cb();
					};
					script.onerror = function() {
						console.error('Loading script "' + url + '" failed.');
						URL.revokeObjectURL(blob_url);
					};
					script.src = blob_url;
				} else {
					try {
						importScripts(blob_url);
						console.info('Loaded script "' + url + '".');
						if (cb) cb();
					} catch (err) {
						console.error('Loading script "' + url + '" failed.');
					}
				}
			} else if (status) {
				console.error('Downloading script "' + url + '" failed with status code: ' + status);
			} else {
				console.error('Downloading script "' + url + '" failed.');
			}
		}, timeout);
	}

	function httpRequest(url, method, cb, timeout) {
		timeout = timeout || 3000;
		var xhr = new XMLHttpRequest();
		xhr.onreadystatechange = function() {
	/*
			console.info(this.response);
			console.info(this.status);
			console.info(this.readyState);
	*/
			if (this.readyState === 4) {
				if (cb) {
					cb(this.response, this.status);
					cb = null;
				}
			} else if (this.readyState === 0) {
				if (cb) {
					cb(null);
					cb = null;
				}
			}
		};
		xhr.onerror = function() {
			if (cb) {
				cb(null);
				cb = null;
			}
		};

		xhr.open(method, url, true);
		xhr.timeout = timeout;
		xhr.send(null);
	}

	// Figure out if we are running in a Window or Web Worker
	var scope = null;
	if (typeof window === 'object') {
		scope = window;
	} else if (typeof importScripts === 'function') {
		scope = self;
	}

	scope.requireScript = requireScript;
})();
