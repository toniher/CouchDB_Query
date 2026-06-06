<?php
class CouchDB_Nouveau {

	public static function processIndex( $params ) {

		$outcome = array();

		if ( ! array_key_exists( "index", $params ) || empty( $params["index"] ) ) {
			return $outcome;
		}

		$index = $params["index"];

		if ( ! array_key_exists( "db", $params ) || empty( $params["db"] ) ) {
			return $outcome;
		}

		$db = $params["db"];

		if ( ! array_key_exists( $db, $GLOBALS['wgCouchDB_Query']["queries"] ) ) {
			return $outcome;
		}

		if ( ! array_key_exists( $index, $GLOBALS['wgCouchDB_Query']["queries"][$db] ) ) {
			return $outcome;
		}

		$auth = "";
		$protocol = "";
		$portstr = "";
		$host = "";

		$urlquery = $GLOBALS['wgCouchDB_Query']["queries"][$db][ $index ];

		if ( array_key_exists( $db, $GLOBALS['wgCouchDB_Query']["params"] ) ) {

			$couchdb_params = $GLOBALS['wgCouchDB_Query']["params"][$db];

			if ( array_key_exists( "username", $couchdb_params ) && array_key_exists( "password", $couchdb_params ) ) {

				$auth = $couchdb_params["username"].":".$couchdb_params["password"]."@";
			}

			if ( array_key_exists( "protocol", $couchdb_params ) ) {
				$protocol = $couchdb_params["protocol"];
			}

			if ( array_key_exists( "port", $couchdb_params ) ) {
				$portstr = ":".$couchdb_params["port"];
			}

			if ( array_key_exists( "host", $couchdb_params ) ) {
				$host = $couchdb_params["host"];
			}
		}

		$full = false;

		if ( array_key_exists( "full", $params ) ) {
			$full = $params["full"];
		}

		// Nouveau does not support skip; pagination is bookmark-based only.
		$nouveau_params = array( "q", "limit", "sort", "include_docs", "counts", "ranges", "update" );

		$add_params = array();

		foreach ( $nouveau_params as $lp ) {
			if ( array_key_exists( $lp, $params ) ) {
				if ( ! empty( $params[$lp] ) ) {
					array_push( $add_params, $lp."=".$params[$lp] );
				}
			}
		}

		$url = $auth.$host.$portstr.$urlquery."?".implode( "&", $add_params );

		if ( ! empty( $protocol ) ) {
			$url = $protocol."://".$url;
		}

		$url = str_replace( " ", "%20", $url );

		if ( $full ) {
			$iter = 0;
			$outcome = self::retrieveRecursiveData( $outcome, $url, $iter );
		} else {
			$json = file_get_contents( $url );
			$outcome = json_decode( $json );
		}

		return $outcome;
	}

	private static function retrieveRecursiveData( $outcome, $url, $iter ) {

		# Max iterations
		if ( $iter > 25 ) {
			return $outcome;
		}

		$json = file_get_contents( $url );
		$obj = json_decode( $json );

		if ( ! is_object( $obj ) ) {
			return $outcome;
		}

		// Merge obj with outcome
		if ( empty( $outcome ) ) {
			$outcome = $obj;
		} else {
			if ( property_exists( $obj, "hits" ) && property_exists( $outcome, "hits" ) ) {
				$outhits = $outcome->hits;
				$objhits = $obj->hits;
				$outcome->hits = array_merge( $outhits, $objhits );
			}
		}

		if ( property_exists( $obj, "bookmark" ) ) {
			$bookmark = $obj->bookmark;

			// Stop when bookmark missing or current page returned no hits
			$has_hits = property_exists( $obj, "hits" ) && is_array( $obj->hits ) && count( $obj->hits ) > 0;

			if ( ! empty( $bookmark ) && $has_hits ) {
				$iter++;
				$url = self::adaptURLBookmark( $url, $bookmark );
				$outcome = self::retrieveRecursiveData( $outcome, $url, $iter );
			}
		}

		return $outcome;
	}

	private static function adaptURLBookmark( $url, $bookmark ) {

		$parts = explode( "&bookmark=", $url );

		$newurl = $parts[0]."&bookmark=".$bookmark;

		return $newurl;
	}
}
