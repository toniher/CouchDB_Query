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

			var prefix = processPrefix( $(div).data('prefix') );
			var prefixurl = processPrefix( $(div).data('prefixurl') );
			var prefixcondurl = $(div).data('prefixcondurl');


			var full = false;

			if ( $(div).data('full') ) {
				full = true;
			}

			// Stricty necessary
			if ( type !== "" && index !== "" && db !== "" ) {

				var params = {};

				// Let's put bar
				var bar = $(div).find(".bar").length;
				if ( bar === 0 ) {
					var inputval="";
					if ( text ) {
						inputval = " value='" + text + "'";
					}
					var input = "<input name='query' type='text' size=25"+inputval+">";
					var extraFields = "<div class='extra'></div>";
					$(div).append("<div class='bar'>"+input+extraFields+"</div>");
					processExtraFields( div, extra );
				}

				params["index"] = index;
				params["db"] = db;
				params["q"] = "";

				if ( full ) {
					params["full"] = true;
				}

				if ( limit !== "" && ! full ) {
					params["limit"] = limit;
				} else {
					params["limit"] = 200; // TO HANDLE bookmark for avoid this limit
        }

				if ( skip !== "" && ! full ) {
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

					var posting = $.get( mw.config.get( "wgScriptPath" ) + "/api.php", params );
					posting.done(function( data ) {
						localStorage.clear();

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

									if ( full ) {
										if ( ! localStorage.results ) {
											localStorage.results = JSON.stringify( data[type].results );
										}
									}

									let stuffResults = getResultsStuff( data[type].results, full, skip, limit );

									if ( stuffResults && stuffResults.length > 0 ) {
										var table = generateResultsTable( stuffResults, tableclass, header, fields, prefix, prefixurl, prefixcondurl );
										$(div).append( table );
										// generateSMWTable( $(div).children("table"), fields );
										$(div).children("table").tablesorter(); //Let's make table sortable
									}
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

	function getResultsStuff( results, full, skip, limit ) {

		let outcome = [];

		if ( full ) {

			if ( localStorage.results ) {
				let jsonObj = JSON.parse( localStorage.results );

				if ( skip == "" ) {
					skip = 0;
				}

				if ( limit == "" ) {
					limit = 25;
				}

				let i = 0;
				let c = 0;
				for ( let j of jsonObj ) {

					if ( c >= limit ) {
						break;
					}

					if ( i >= skip ){
						outcome.push( j );
						c++;
					}

					i++;
				}


			} else {
				outcome = null;
			}
		} else {
			outcome = results;
		}

		return outcome;

	}

	function subsTextQuery( query, text ) {

		if ( text ) {
			if ( query.startsWith('javascript:') ) {
				// code for processing javascript
				var jsfunc = query;
				jsfunc = jsfunc.replace("javascript:", "");
				query = window["couchjsfunc"][jsfunc](text);
			} else {
				// First escape :
				text = text.replace( /:/g, "\\:" );
				// Then actual replacement
				query = query.replace( /\$1/g, text );
			}
		}

		return query;
	}

	function processPrefix( prefixstr ) {

		var prefix = {};

		if ( prefixstr ) {

			var prefixels = prefixstr.split(",");

			for ( var p=0; p < prefixels.length; p = p + 1 ) {

					var parts = prefixels[p].split(":");

					if ( parts.length === 2 ) {
						prefix[parts[0]] = parts[1];
					}
			}

		}

		return prefix;

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

			var selected = "";
			if ( $(field).data('default') ) {
				selected = $(field).data('default');
			}

			if ( $(field).data('values') ) {
				var values = $(field).data('values').split(",");
				for ( var v = 0; v < values.length; v = v + 1 ) {
					var selectedstr = "";
					if ( selected == values[v] ) {
						selectedstr = " selected=selected";
					}
					out = out + "<option"+selectedstr+">"+values[v]+"</option>";
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

	function generateResultsTable( results, tableclass, header, fields, prefix, prefixurl, prefixcondurl ) {

		var table = "<table class='" + tableclass + "'>";
		table = table + "<thead><tr>";

		var headerstr = generateArrayTable( header, "th", " class=\"headerSort\" title=\"Sort ascending\"" );
		table = table + headerstr;

		table = table + "</tr></thead>";
		table = table + "<tbody>";

		for ( var r = 0; r < results.length; r = r + 1 ) {

			var rowstr = generateRowTable( results[r], fields, "td", prefix, prefixurl, prefixcondurl );
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

	function getPrefixCondUrl( prefixcondurl ) {

		let prefixHash = {};

		let parts = prefixcondurl.split( "," );

		for( part of parts ) {

			let assigns = part.split( ":" );

			if ( assigns.length === 2 ) {

				let target = assigns[0];
				if ( ! prefixHash.hasOwnProperty( target ) ) {
					prefixHash[ target ] = {};
				}

				let values = assigns[1].split( "=" );

				if ( values.length === 2 ) {

					let prefix = values[1];

					let conds = values[0].split( "@" );

					if ( conds.length === 2 ) {

						let cond = conds[0];
						let val = conds[1];

						if ( ! prefixHash[target].hasOwnProperty( cond ) ) {
							 prefixHash[target][cond] = {};
						}

						prefixHash[target][cond][val] = prefix;

					}

				}

			}

		}


		return prefixHash;

	}

	function assignUrlPrefix( assign, fields ){
		let prefix = "";

		let match;
		for ( let c in assign ) {

			if ( assign.hasOwnProperty( c ) ) {

				match = c;
			}
		}

		for( let f in fields ) {

			if ( f == match ) {

				let occur = fields[f];
				if ( assign[match].hasOwnProperty( occur ) ) {
					prefix = assign[match][occur];
				}
			}
		}

		return prefix;

	}

	function generateRowTable( result, fields, tag, prefix, prefixurl, prefixcondurl ){
		var str = "";

		var prefixHash = getPrefixCondUrl( prefixcondurl );

		for ( var i = 0; i < fields.length; i = i + 1 ) {
			var field = fields[i];

			var prop = "";
			var pagename = null;
			var fieldTxt = "";
			var url = "#";

			// Check reference part - OK for now
			if ( field === '*' ) {
				if ( result.hasOwnProperty("pagename") ) {
					fieldTxt = result["pagename"];
					pagename = fieldTxt;
				}
			} else if ( field === '*link' ) {
				if ( result.hasOwnProperty("pagename") ) {
					pagename = result["pagename"];
					url = mw.config.get( "wgArticlePath" ).replace('$1', pagename );
					fieldTxt = "<a href='" + url +"'>" + pagename + "</a>";
				}
			} else if ( field === '#link' ) {
				if ( result.hasOwnProperty("pagename") ) {
					pagename = result["pagename"];
					var url = mw.config.get( "wgArticlePath" ).replace('$1', pagename );

					pagename_html = pagename.replace(/\@\S+/, "");
					pagename_html = pagename_html.replace(/^\S+\:/, "");

					fieldTxt = "<a href='" + url +"'>" + pagename_html + "</a>";
				}
			}
			else if ( field === '*score' ) {
				if ( result.hasOwnProperty("score") ) {
					fieldTxt = result["score"];
				}
			} else {
				var pagelink = false;
				var cleanpagelink = false;
				if ( field.startsWith("~") ) {
					field = field.replace( /^~/, "");
					pagelink = true;
				}
				if ( field.startsWith("#") ) {
					field = field.replace( /^#/, "");
					cleanpagelink = true;
				}
				if ( result.hasOwnProperty("fields") && result["fields"].hasOwnProperty(field) ) {
					fieldTxt = result["fields"][field];

					// Detect here if in prefix. If so, append
					if ( prefix.hasOwnProperty( field ) ) {
						fieldTxt = prefix[field]+":"+fieldTxt;
					}

					if ( pagelink ) {
						fieldTxt = fieldTxt.replace("#", "/");

						if ( prefixurl.hasOwnProperty( field ) ) {
							url = prefixurl[field]+fieldTxt;
						}  else {

							if ( prefixHash.hasOwnProperty( field ) ) {
								url = assignUrlPrefix( prefixHash[field], result["fields"] )+fieldTxt;
							} else {

								url = mw.config.get( "wgArticlePath" ).replace('$1', fieldTxt );
							}
						}



						fieldTxt = "<a href='" + url +"'>" + fieldTxt + "</a>";
					}
					if ( cleanpagelink ) {

						fieldTxt = fieldTxt.replace("#", "/");

						if ( prefixurl.hasOwnProperty( field ) ) {
							url = prefixurl[field]+fieldTxt;
						} else {
							if ( prefixHash.hasOwnProperty( field ) ) {
								url = assignUrlPrefix( prefixHash[field], result["fields"] )+fieldTxt;
							} else {

								url = mw.config.get( "wgArticlePath" ).replace('$1', fieldTxt );
							}
						}

						fieldTxt = fieldTxt.replace(/\@\S+/, "");
						fieldTxt = fieldTxt.replace(/^\S+\:/, "");

						fieldTxt = "<a href='" + url +"'>" + fieldTxt + "</a>";
					}
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

					var posting = $.get( mw.config.get( "wgScriptPath" ) + "/api.php", params );
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
														var url = mw.config.get( "wgArticlePath" ).replace('$1', finvalue );
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



(function( couchjsfunc, $, undefined ) {


    couchjsfunc.test = function( text ) {
		return "test";
    };

}( window.couchjsfunc = window.couchjsfunc || {}, jQuery ));
