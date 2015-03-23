/** Inspect all table instances **/
$(document).ready(function(){
	
	$( ".couchdb-query-table" ).each( function( i ) {
		
		var div = this;

		var total = $(div).data('total');
		var limit = $(div).data('limit');
		var header = $(div).data('header');
		var smw = $(div).data('smw');
		var query = $(div).data('query');
		var index = $(div).data('index');
		var type = $(div).data('type');
		var skip = $(div).data('skip');
		var db = $(div).data('db');

		// Stricty necessary
		if ( type !== "" && index !== "" && db !== "" ) {
	
			var params = {};
			params["index"] = index;
			params["db"] = db;

			if ( limit !== "" ) {
				params["limit"] = limit;
			}
			if ( skip !== "" ) {
				params["skip"] = skip;
			}
			
			if ( query !== "" ) {
				if ( type.indexOf("lucene") > -1 ) {
					params["q"] = query;
				} else {
					if ( query.indexOf("[") > -1 ){
						params["keys"] = query;
					} else {
						params["key"] = query;
					}
				}
			}

			if ( $(div).data('start') ) {
				params["start"] = $(div).data('start');
			}

			if ( $(div).data('end') ) {
				params["end"] = $(div).data('end');
			}

			// GET QUERY here
			params.action = type;
			params.format = "json";
			
			var posting = $.get( wgScriptPath + "/api.php", params );
			posting.done(function( data ) {
				console.log( data );
			})
			.fail( function( data ) {
				console.log("Error!");
			});

			
		}
		
	});

});


// Next, previous, detecting data-total and data-limit, etc.

$( ".couchdb-query-table" ).on( "click", ".next", function() {
	console.log( "Next" );
});

$( ".couchdb-query-table" ).on( "click", ".prev", function() {
	console.log( "Previous" );
});