(function () {
	var gdoc2json = require('./spreadsheet2json/spreadsheet2json.js');


	function _log (data) {
		console.log(arguments);
	};

	var spreadsheets_uuids = [
		'1G8ArsOjOeJsvKoaHxPVoWS5mTbSMaoVGqgURWzLrZNA',
	];
	
	spreadsheets_uuids.forEach(function(uuid){
		var data = gdoc2json.get(uuid, _log);
	});

}());
