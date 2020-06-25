<?php
class CouchDB_Document {

	public static function processDocument( $params ) {

		$outcome = array();

		if ( array_key_exists( "key", $params ) ) {

			if ( ! empty( $params["key"] ) ) {

				$key = $params["key"];

				if ( array_key_exists( "db", $params ) ) {

					if ( ! empty( $params["db"] ) ) {

						$db = $params["db"];

						// Let's force empty. If not explicitly put, retrieved from queries
						$auth = "";
						$protocol = "";
						$portstr = "";
						$host = "";

						if ( array_key_exists( $db, $GLOBALS['wgCouchDB_Query']["document"] ) ) {

							$couchdb_params = $GLOBALS['wgCouchDB_Query']["document"][$db];

							if ( array_key_exists( "username", $couchdb_params ) && array_key_exists( "password", $couchdb_params ) ) {

								$auth = $couchdb_params["username"].":".$couchdb_params["password"]."@";
							}

							if ( array_key_exists( "protocol", $couchdb_params ) ) {
								$protocol =  $couchdb_params["protocol"];
							}

							if ( array_key_exists( "port", $couchdb_params ) ) {
								$portstr =  ":".$couchdb_params["port"];
							}

							if ( array_key_exists( "host", $couchdb_params ) ) {
								$host =  $couchdb_params["host"];
							}

						}

						$url = $auth.$host.$portstr."/".$db."/".$key;

						if ( ! empty( $protocol ) ) {

							$url = $protocol."://". $url;
						}

						$url = str_replace( " ", "%20", $url );
						$url = str_replace( "#", "%23", $url );

						$json = file_get_contents( $url );

						$outcome = json_decode($json, true);

					}
				}
			}
		}

		return $outcome;

	}

}
