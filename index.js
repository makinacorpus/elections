(function () {
	var gdoc2json = require('./spreadsheet2json/spreadsheet2json.js');


	function _log (data) {
		console.log(arguments);
	};

	var spreadsheets_uuids = [
		'11Ovnt3RDzNp9iR8tS99TlyJJoPbPi_rN1u7lFU-rDeU',
	];
	
	spreadsheets_uuids.forEach(function(uuid){
		var data = gdoc2json.get(uuid, _log);
	});

}());