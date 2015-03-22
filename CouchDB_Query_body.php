<?php

class CouchDB_Query {

	/**
	* @param $parser Parser
	* @param $frame PPFrame
	* @param $args array
	* @return string
	*/

	public static function process_CouchDB_Query_table( $parser, $frame, $args ) {

		// Get data from parser args and to data
                // Defaults
                
                $limit =  "25";
                $header = "Page name";
                $smw = "*";
                $type = "";
                $index = "";
                $query = "";
                $class = "wikitable sortable";
                
                // TODO: Pending parsing args?
                
                if ( key_exists( "limit", $args ) ) {
                    $limit = $args["limit"];
                }
                if ( key_exists( "header", $args ) ) {
                    $header = $args["header"];
                }
                if ( key_exists( "smw", $args ) ) {
                    $smw = $args["smw"];
                }
                if ( key_exists( "type", $args ) ) {
                    $type = $args["type"];
                }
                if ( key_exists( "index", $args ) ) {
                    $index = $args["index"];
                }
                if ( key_exists( "query", $args ) ) {
                    $query = $args["query"];
                }
                if ( key_exists( "class", $args ) ) {
                    $class = $args["class"];
                }
                
		$out = $parser->getOutput();
		$out->addModules( 'ext.CouchDB_Query' );

		$returnhtml = "<div class='couchdb-query-table' data-class='$class' data-limit='$limit' data-header='$header' data-smw='$smw' data-query='$query' data-index='$index' data-type='$type' data-skip=0 ></div>";

		return array( $returnhtml, 'noparse' => true, 'isHTML' => true );

	}

}

