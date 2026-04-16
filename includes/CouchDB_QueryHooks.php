<?php

class CouchDB_QueryHooks {

	/**
	 * @param Parser $parser
	 */
	public static function onParserFirstCallInit( Parser $parser ) {
		$parser->setFunctionHook(
			'CouchDB_Query_table',
			[ CouchDB_Query::class, 'process_CouchDB_Query_table' ],
			SFH_OBJECT_ARGS
		);
		$parser->setFunctionHook(
			'CouchDB_Query_field',
			[ CouchDB_Query::class, 'process_CouchDB_Query_field' ],
			SFH_OBJECT_ARGS
		);
	}
}
