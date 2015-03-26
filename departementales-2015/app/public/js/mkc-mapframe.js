(function () {
	'use strict';
	var moduleName = 'mkcMapFrame';

	var myModule = function () {

		/**
		 * Adjust height of a pseudo element
		 * @param  {number} h The height to set
		 * @return {null}
		 */
		function _changeHeight (h) {
			var height    = parseInt(h, 10);
			var lastStyle = document.styleSheets[document.styleSheets.length -1];
			if (isFinite(height)) {
				lastStyle.addRule('#main:before', 'padding-top: ' + height + '%');
			}
		}

		function _init (dataset, pymChild) {
			// If no dataset, don't do anything
			if (typeof dataset === 'undefined') return;

			// If there is a height in dataset : adjust height of frame
			dataset.height && _changeHeight(dataset.height);

			// Tell parent frame to adjust to the new frame height
			pymChild.sendHeight();
		}

		/**
		 * Convert current query string to object
		 * @return {object} Object representation of the query string
		 */
		function _getQueryString () {
			var qs = {}, qsa = [];
			if (location.search.length) {
				qsa = location.search.substr(1).split('&');
				qsa.forEach(function(element, index) {
					var array = element.split('=');
					qs[array[0]] = array[1];
				});
			}
			return qs;
		}

		function _dptFromQueryString () {
			return _getQueryString().dep || false;
		}

		function _partiFromQueryString () {
			return _getQueryString().parti || false;
		}

		/**
		 * Generate query string from object
		 * @param  {object} obj Object to be converted to query string
		 * @return {string}     Query string
		 */
		function _buildQueryString(obj) {
			var items = [];
			for(var key in obj) {
				items.push(key + '=' + obj[key]);
			}
			return '?' + items.join('&');
		}

		return {
			init: _init,
			dptFromQS: _dptFromQueryString,
			partiFromQS: _partiFromQueryString,
			buildQueryString: _buildQueryString,
			getQueryString: _getQueryString
		}
	}();

	if (typeof module !== 'undefined') {
		module.exports = myModule;
	} else {
		window[moduleName] = myModule;
	}
})();
