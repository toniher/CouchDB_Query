<?php

class CouchDB_Query {

	/**
	* @param $parser Parser
	* @param $frame PPFrame
	* @param $args array
	* @return string
	*/

	public static function process_CouchDB_Query_table( $parser, $frame, $args ) {

		// Load JS with instructions

		// Get data from parser args and to data

		$out = $parser->getOutput();
		$out->addModules( 'ext.CouchDB_Query' );

		$returnhtml = "<div class='couchdb-query-table' data-limit='' data-header='' data-smw='' data-query='' data-type=''></div>";

		return array( $returnhtml, 'noparse' => true, 'isHTML' => true );

	}

}

