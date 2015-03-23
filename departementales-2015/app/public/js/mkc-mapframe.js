(function () {
	'use strict';
	var moduleName = 'mkcMapFrame';

	var myModule = function () {

		function _changeHeight (h) {
			var height = parseInt(h, 10);
			var lastStyle = document.styleSheets[document.styleSheets.length -1];
			if (isFinite(height)) {
				lastStyle.addRule('#main:before', 'padding-top: ' + height + '%');
			}
		}

		function _init (dataset, pymChild) {
			if (typeof dataset === 'undefined') return;

			dataset.height && _changeHeight(dataset.height);

			pymChild.sendHeight();
		}

		function _dptFromQueryString () {
			var qs = {}, qsa = [];
			if (location.search.length) {
				qsa = location.search.substr(1).split('&');
				qsa.forEach(function(element, index) {
					var array = element.split('=');
					qs[array[0]] = array[1];
				});
			}
			return qs.dep || false;
		}

		return {
			init: _init,
			dptFromQS: _dptFromQueryString
		}
	}();

	if (typeof module !== 'undefined') {
		module.exports = myModule;
	} else {
		window[moduleName] = myModule;
	}
})();
