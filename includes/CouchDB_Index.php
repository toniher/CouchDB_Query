<?php
class CouchDB_Index {

	public static function processIndex( $params ) {

		$outcome = array();

		if ( array_key_exists( "index", $params ) ) {

			if ( ! empty( $params["index"] ) ) {

				$index = $params["index"];

				if ( array_key_exists( "db", $params ) ) {

					if ( ! empty( $params["db"] ) ) {
	
						$db = $params["db"];

						if ( array_key_exists( $db, $GLOBALS['wgCouchDB_Query']["params"] ) && array_key_exists( $db, $GLOBALS['wgCouchDB_Query']["queries"] ) ) {

							if ( array_key_exists( $index, $GLOBALS['wgCouchDB_Query']["queries"][$db] ) ) {

								$urlquery = $GLOBALS['wgCouchDB_Query']["queries"][$db][ $index ];

								$couchdb_params = $GLOBALS['wgCouchDB_Query']["params"][$db];

								$auth = "";
								if ( array_key_exists( "username", $couchdb_params ) && array_key_exists( "password", $couchdb_params ) ) {

									$auth = $couchdb_params["username"].":".$couchdb_params["password"]."@";
								}

								$protocol = "http";
								$port = "";
								$portstr = "";
								$host = "localhost";

								if ( array_key_exists( "protocol", $couchdb_params ) ) {
									$protocol =  $couchdb_params["protocol"];
								}

								if ( array_key_exists( "port", $couchdb_params ) ) {
									$portstr =  ":".$couchdb_params["port"];
								}

								if ( array_key_exists( "host", $couchdb_params ) ) {
									$host =  $couchdb_params["host"];
								}

								$url = $protocol."://".$auth.$host.$portstr.$urlquery;

								$json = file_get_contents( $url );
								$outcome = json_decode($json);

							}
						}
					}
				}
			}
		}

		return $outcome;

	}

}