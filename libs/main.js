/** Inspect all table instances **/
( function( $, mw ) {

	var inputsave = "";

	$(document).ready(function(){
		iterateTable();
	});
	

	// Look for changes in the value
	$( ".couchdb-query-table" ).on( "propertychange change click keyup input paste", "input", function(event){
		// If value has changed...
		if ( inputsave !== $(this).val()) {
			// Updated stored value
			inputsave = $(this).val();
			var div = $( this ).parents(".couchdb-query-table").first();

			$(div).data('text', inputsave );
			if ( inputsave.length > 2 ) {
				iterateTable();
			}
		}
	});
	
	// Next, previous, detecting data-total and data-limit, etc.
	$( ".couchdb-query-table" ).on( "click", ".bar > .next", function() {

		var div = $( this ).parents(".couchdb-query-table").first();
		var limit = parseInt( $(div).data('limit') );
		var skip = parseInt( $(div).data('skip') );

		$(div).data('skip', skip + limit );

		iterateTable();
	});
	
	$( ".couchdb-query-table" ).on( "click", ".prev", function() {

		var div = $( this ).parents(".couchdb-query-table").first();
		var limit = parseInt( $(div).data('limit') );
		var skip = parseInt( $(div).data('skip') );

		var newskip = skip - limit;
		if ( newskip < 0 ) {
			newskip = 0;
		}

		$(div).data('skip', newskip );

		iterateTable();
	});

	
	function iterateTable() {

		$( ".couchdb-query-table" ).each( function( i ) {
			var div = this;

			var limit = $(div).data('limit');
			var header = $(div).data('header');
			var tableclass = $(div).data('class');
			var smw = $(div).data('smw');
			var query = $(div).data('query');
			var index = $(div).data('index');
			var type = $(div).data('type');
			var skip = $(div).data('skip');
			var db = $(div).data('db');
			var text = $(div).data('text');

			// Stricty necessary
			if ( type !== "" && index !== "" && db !== "" ) {
		
				var params = {};
				params["index"] = index;
				params["db"] = db;
				params["q"] = "";
	
				if ( limit !== "" ) {
					params["limit"] = limit;
				}
				if ( skip !== "" ) {
					params["skip"] = skip;
				}
				
				if ( type.indexOf("lucene") > -1 ) {
					params["q"] = subsTextQuery( query, text );
				} else {
					if ( query.indexOf("[") > -1 ){
						params["keys"] = subsTextQuery( query, text );
					} else {
						params["key"] = subsTextQuery( query, text );
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
				
							
				var smwe = smw.split(",");
				var fields = [];
				for ( var s = 0; s < smwe.length; s = s + 1 ) {
					fields.push( smwe[s].trim() );
				}
				
				// Let's put bar
				var bar = $(div).find(".bar").length;
				if ( bar === 0 ) {
					var input = "<input name='query' type='text' size=10>";
					$(div).append("<p class='bar'>"+input+"</p>");
				}

				if ( params['query'].search(/\$\d/gi) < 1 ) {

					var posting = $.get( wgScriptPath + "/api.php", params );
					posting.done(function( data ) {
						if ( data[type].status === "OK" ) {
							if ( data[type].count ) {
								$(div).data('total', data[type].count);
	
								var prev = ""; var next = ""; var count = "";
								$(div).find("table").remove();
								$(div).find(".bar > span").remove();
	
								if ( data[type].count > 0 ) {
									count = "<span class='count'>" + data[type].count + "</span>";
								}
	
								if ( ( ( data[type].count ) - parseInt( skip, 10 ) ) > parseInt( limit, 10 ) ) {
									next = "<span class='next'>Next</span>";
								}
								if ( parseInt( skip, 10 ) > 0 ) {
									prev = "<span class='prev'>Previous</span>";
								}
	
								$(div).find(".bar").first().append(count+prev+next);
	
								if ( data[type].results.length > 0 ) {
									var table = generateResultsTable( data[type].results, tableclass, header, fields );
									$(div).append( table );
									generateSMWTable( $(div).children("table"), fields );
									$(div).children("table").tablesorter(); //Let's make table sortable
	
								} 
							} else {
								$(div).find("table").remove();
								$(div).find(".bar > span").remove();
							}
		
						} else {
							$(div).find("table").remove();
							$(div).find(".bar > span").remove();
						}
					})
					.fail( function( data ) {
						console.log("Error!");
					});
				}
			}
		});
	}

	function subsTextQuery( query, text ) {

		if ( text ) {
			query = query.replace( /\$1/g, text );
		}

		return query;
	}
	
	function generateResultsTable( results, tableclass, header, fields ) {
	
		var table = "<table class='" + tableclass + "'>";
		table = table + "<thead><tr>";
		
		var headerstr = generateArrayTable( header, "th", " class=\"headerSort\" title=\"Sort ascending\"" );
		table = table + headerstr;
		
		table = table + "</tr></thead>";
		table = table + "<tbody>";
		
		for ( var r = 0; r < results.length; r = r + 1 ) {
			var rowstr = generateRowTable( results[r], fields, "td" );
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
	
	function generateRowTable( result, fields, tag ){
		var str = "";
		
		for ( var i = 0; i < fields.length; i = i + 1 ) {
			var field = fields[i];
		
			var prop = "";
			var pagename = null;
			var fieldTxt = "";

			// Check reference part - OK for now
			if ( field === '*' ) {
				if ( result.hasOwnProperty("pagename") ) {
					fieldTxt = result["pagename"];
					pagename = fieldTxt;
				}
			} else if ( field === '*link' ) {
				if ( result.hasOwnProperty("pagename") ) {
					pagename = result["pagename"];
					var url = wgArticlePath.replace('$1', pagename )
					fieldTxt = "<a href='" + url +"'>" + pagename + "</a>";
				}
			} else if ( field === '*score' ) {
				if ( result.hasOwnProperty("score") ) {
					fieldTxt = result["score"];
				}
			} else {
				fieldTxt = "";
			}
			prop = " data-prop='"+field+"' ";
			str = str + "<" + tag + prop + ">" + fieldTxt + "</" + tag + ">\n";
		}
		return str;
	}
	
	
	function generateSMWTable( tables, fields ){
		
		var fieldsSMW = [];
		
		for ( var i = 0; i < fields.length; i = i + 1 ) {
			if ( ! fields[i].startsWith("*") ) {
				fieldsSMW.push( fields[i] );
			}
		}
		
		$(tables).each( function( i ) {
		
			$(this).find("tbody > tr").each( function( r ) {
		
				//console.log( this );
				var row = this;
				var pagename = $(row).children("td").filter("[data-prop='*']").first().text();
				if ( ! pagename ) {
					pagename = $(row).children("td").filter("[data-prop='*link']").first().text();
				}
				// Generate ask query from this
				if ( pagename ) {
		
					var params = {};
					params.action = "askargs";
					params.conditions = pagename;
					params.printouts = fieldsSMW.join("|");
					params.format = "json"; // Let's put JSON
					
					var posting = $.get( wgScriptPath + "/api.php", params );
					posting.done(function( out ) {
						if ( out && out.hasOwnProperty("query") ) {
							if ( out["query"].hasOwnProperty("results") ) {
								if ( out["query"]["results"].hasOwnProperty( pagename ) ) {
									if ( out["query"]["results"][pagename].hasOwnProperty("printouts") ) {
										var printouts = out["query"]["results"][pagename]["printouts"];
										for ( var prop in printouts ){
											if ( printouts.hasOwnProperty( prop ) ) {
												if ( prop ) {
													var tdvalue = $(row).children("td").filter("[data-prop='"+prop+"']").first();
													$(tdvalue).text( printouts[prop][0] );
												}
											}
										}
									}
								}
							}
						}
					})
					.fail( function( out ) {
						console.log("Error!");
					});
				}
			});
		
		});
	}

	if (typeof String.prototype.startsWith != 'function') {
		// see below for better implementation!
		String.prototype.startsWith = function (str){
		  return this.indexOf(str) === 0;
		};
	}

} )( jQuery, mediaWiki );

