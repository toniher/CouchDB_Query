<?php
class CouchDB_Lucene {

	public static function processIndex( $params ) {

		$outcome = array();

		if ( array_key_exists( "index", $params ) ) {

			if ( ! empty( $params["index"] ) ) {

				$index = $params["index"];

				if ( array_key_exists( "db", $params ) ) {

					if ( ! empty( $params["db"] ) ) {

						$db = $params["db"];

						if ( array_key_exists( $db, $GLOBALS['wgCouchDB_Query']["queries"] ) ) {

							if ( array_key_exists( $index, $GLOBALS['wgCouchDB_Query']["queries"][$db] ) ) {

								// Let's force empty. If not explicitly put, retrieved from queries
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
										$protocol =  $couchdb_params["protocol"];
									}

									if ( array_key_exists( "port", $couchdb_params ) ) {
										$portstr =  ":".$couchdb_params["port"];
									}

									if ( array_key_exists( "host", $couchdb_params ) ) {
										$host =  $couchdb_params["host"];
									}

								}

								$lucene_params = array( "q", "limit", "skip", "bookmark" );

								$add_params = array();

								foreach ( $lucene_params as $lp ) {
									if ( array_key_exists( $lp, $params ) ) {
										if ( ! empty( $params[$lp]) ) {
											array_push( $add_params, $lp."=".$params[$lp] );
										}
									}
								}

								$url = $auth.$host.$portstr.$urlquery."?".join( $add_params, "&" );

								if ( ! empty( $protocol ) ) {

									$url = $protocol."://". $url;
								}

								$url = str_replace( " ", "%20", $url );
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
