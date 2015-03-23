/** Inspect all table instances **/
$(document).ready(function(){
	
	$( ".couchdb-query-table" ).each( function( i ) {
		
		var div = this;

		var total = $(div).data('total');
		var limit = $(div).data('limit');
		var header = $(div).data('header');
		var tableclass = $(div).data('class');
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
				if ( data[type].status === "OK" ) {
					if ( data[type].count ) {
						$(div).data('total', data[type].count);
						if ( data[type].results.length > 0 ) {
							var table = generateResultsTable( data[type].results, tableclass, header, smw );
							$(div).append( table );
							$(div).children.get(0).tablesorter();
						}
					}

				}
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


function generateResultsTable( results, tableclass, header, smw ) {

	var table = "<table class='" + tableclass + "'>";
	table = table + "<thead><tr>";

	var headerstr = generateArrayTable( header, "th", " class=\"headerSort\" title=\"Sort ascending\"" );
	table = table + headerstr;

	table = table + "</tr></thead>";

	table = table + "<tbody>";

	for ( var r = 0; r < results.length; r = r + 1 ) {
		var rowstr = generateRowTable( results[r], smw, "td" );
		table = table + "<tr>" + rowstr + "</tr>";
	}

	table = table + "</tbody>";

	table = table + "</table>";

	return table;

}

function generateArrayTable( arraystr, tag, extra ){
	var str = "";
	var array = arraystr.split(",");
	extra = typeof extra !== 'undefined' ? extra : '';

	for ( var i = 0; i < array.length; i = i + 1 ) {
		str = str + "<" + tag + extra + ">" + array[i] + "</" + tag + ">\n";
	}
	return str;
}

function generateRowTable( result, smw, tag ){
	var str = "";

	var smwe = smw.split(",");
	for ( var i = 0; i < smwe.length; i = i + 1 ) {
		var field = smwe[i].trim();

		var prop = "";

		// Check reference part - OK for now
		if ( field === '*' ) {
			if ( result.hasOwnProperty("pagename") ) {
				fieldTxt = result["pagename"];
			} else {
				fieldTxt = "";
			}
		} else {
			prop = " data-prop='"+field+"' ";
		}

		str = str + "<" + tag + prop + ">" + fieldTxt + "</" + tag + ">\n";
	}
	return str;
}

