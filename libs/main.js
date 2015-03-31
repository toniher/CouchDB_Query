/* jshint strict:true, browser:true */
/** Inspect all table instances **/
( function( $, mw ) {

	var inputsave = "";
	var timer, delay = 700;

	$(document).ready(function(){
		iterateTable();
	});
	

	// Look for changes in the value
	$( ".couchdb-query-table" ).on( "propertychange change click keyup input paste", "input", function(event){

		var _this = $(this);
		clearTimeout(timer);

		timer = setTimeout(function() {
			// If value has changed...
	
			if ( inputsave !== $(_this).val()) {
				// Updated stored value
				inputsave = $(_this).val();
				var div = $( _this ).parents(".couchdb-query-table").first();
	
				$(div).data('text', inputsave );
				if ( inputsave.length > 2 ) {
					$(div).data('total', 0 );
					$(div).data('skip', 0 );
					iterateTable();
				}
			}
		}, 300, function() {});
	});
	
	// Next, previous, detecting data-total and data-limit, etc.
	$( ".couchdb-query-table" ).on( "click", ".bar > .next", function() {

		var div = $( this ).parents(".couchdb-query-table").first();
		var limit = parseInt( $(div).data('limit'), 10 );
		var skip = parseInt( $(div).data('skip'), 10 );

		$(div).data('skip', skip + limit );

		iterateTable();
	});
	
	$( ".couchdb-query-table" ).on( "click", ".prev", function() {

		var div = $( this ).parents(".couchdb-query-table").first();
		var limit = parseInt( $(div).data('limit'), 10 );
		var skip = parseInt( $(div).data('skip'), 10 );

		var newskip = skip - limit;
		if ( newskip < 0 ) {
			newskip = 0;
		}

		$(div).data('skip', newskip );

		iterateTable();
	});

	$( ".couchdb-query-table" ).on( "change click keyup input paste", ".couchdb-query-input", function() {
		/** Trigger change **/
		iterateTable();
	});


	function iterateTable() {

		$( ".couchdb-query-table" ).each( function( i ) {
			var div = this;

			var limit = $(div).data('limit');
			var header = $(div).data('header');
			var tableclass = $(div).data('class');
			var fieldsp = $(div).data('fields');
			var query = $(div).data('query');
			var index = $(div).data('index');
			var type = $(div).data('type');
			var skip = $(div).data('skip');
			var db = $(div).data('db');
			var text = $(div).data('text');
			var extra = $(div).data('extra');

			// Stricty necessary
			if ( type !== "" && index !== "" && db !== "" ) {
		
				var params = {};

				// Let's put bar
				var bar = $(div).find(".bar").length;
				if ( bar === 0 ) {
					var input = "<input name='query' type='text' size=25>";
					var extraFields = "<div class='extra'></div>";
					$(div).append("<div class='bar'>"+input+extraFields+"</div>");
					processExtraFields( div, extra );
				}

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

					if ( extra ) {
						var extraq = "";
						extraq = retrieveExtraFields( div );
						params["q"] = params["q"] + extraq;
					}

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
				
				var fieldse = fieldsp.split(",");
				var fields = [];
				for ( var s = 0; s < fieldse.length; s = s + 1 ) {
					fields.push( fieldse[s].trim() );
				}

				if ( params['q'].search(/\$\d/gi) < 1 ) {

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
									// generateSMWTable( $(div).children("table"), fields );
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
			// First escape :
			text = text.replace( /:/g, "\\:" );
			// Then actual replacement
			query = query.replace( /\$1/g, text );
		}

		return query;
	}

	function processExtraFields( div, extra ) {

		if ( extra ) {
			if ( div ) {
				var extras = extra.split(",");
				
				for ( var x = 0; x < extras.length; x = x + 1 ) {

					var fieldDef = $( extras[x].trim() ).first(); // Let's assume only one
					if ( fieldDef ) {
						$(div).find(".extra").append( processExtraField( fieldDef ) );
					}
				}
				
			}
		}
	}

	function processExtraField ( field ) {

		var out = "";
		if ( $(field).data('tag') ) {

			var tag = $(field).data('tag');

			var typestr = ""; var querystr = "";
			if ( $(field).data('type') ) {
				typestr = " type=\""+$(field).data('type')+"\"";
			}
			if ( $(field).data('query') ) {
				querystr = " data-query=\""+$(field).data('query')+"\"";
			}

			out = "<"+tag+typestr+querystr+" class='couchdb-query-input'>";

			if ( $(field).data('values') ) {
				var values = $(field).data('values').split(",");
				for ( var v = 0; v < values.length; v = v + 1 ) {
					out = out + "<option>"+values[v]+"</option>";
				}

				if ( values.length > 0 ) {
					out = out + "</"+tag+">";
				}
				
			}

		}

		return out;
	}

	function retrieveExtraFields( div ) {

		var extraq = "";
		$(div).find(".couchdb-query-input").each( function(i) {
			if ( $(this).data('query') ) {
				var val = $(this).val();
				if ( val && val !== '' ) {
					var subst = subsTextQuery( $(this).data('query'), val );
					extraq = extraq + " " + subst;
				}
				
			}
		});

		return extraq;
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
					var url = wgArticlePath.replace('$1', pagename );
					fieldTxt = "<a href='" + url +"'>" + pagename + "</a>";
				}
			} else if ( field === '*score' ) {
				if ( result.hasOwnProperty("score") ) {
					fieldTxt = result["score"];
				}
			} else {
				if ( result.hasOwnProperty("fields") && result["fields"].hasOwnProperty(field) ) {
					fieldTxt = result["fields"][field];
				}
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
													var finvalue = printouts[prop][0];
													if ( typeof finvalue === 'object' ) {
														finvalue = finvalue.fulltext;
														var url = wgArticlePath.replace('$1', finvalue );
														$(tdvalue).append( "<a href='" + url +"'>" + finvalue + "</a>" );
													} else {
														$(tdvalue).text( finvalue );
													}
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

