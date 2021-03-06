<?php
class ApiCouchDB_Query extends ApiBase {

	public function execute() {

		$params = $this->extractRequestParams();

		$outcome = CouchDB_Index::processIndex( $params );
		// Below would be JSON

		$count = $outcome->total_rows;

		if ( array_key_exists( "key", $params ) ) {
			if ( $outcome->reduce ) {
				if ( $outcome->reduce->rows ) {
					if ( sizeof( $outcome->reduce->rows ) > 0 ) {
						foreach ( $outcome->reduce->rows as $group ) {
							// Trimming because string
							if ( trim( $params["key"], '"' ) == $group->key ) {
								if ( $group->value ) {
									$count = $group->value;
								}
							}
						}
					}
				}
			}
		}

		$rows = array();
		foreach ( $outcome->rows as $row ) {
			//var_dump( $row );
			$rowid = $row->id;
			
			// We assume here that ID is linked

			$newrow = array();
			$newrow["id"] = $rowid;
			if ( $row->value->pagename ) {
				$newrow["pagename"] = $row->value->pagename;
			} else {
				$page = WikiPage::newFromId( $rowid );
				if ( $page ) {
					$title = $page->getTitle();
					$fullpagename = $title->getFullText();
					$newrow["pagename"] = $fullpagename;
				}
			}

			// Handle fields
			if ( array_key_exists( "fields", $params ) ) {
				$newrow["fields"] = array();
				$fieldarr = explode( ",", $params["fields"] );
				foreach ( $fieldarr as $field ) {
					if ( property_exists( $row->value , $field ) ) {
						$newrow["fields"][$field] = $row->value->$field;
					} else {
						// Check in document
						if ( property_exists( $row , "doc" ) ) {
							if ( property_exists( $row->doc , $field ) ) {
								$newrow["fields"][$field] = $row->doc->$field;
							}
						}
					}
				}
			}

			array_push( $rows, $newrow );

		}


		$result = $this->getResult();
		$result->addValue( null, $this->getModuleName(), array ( 'status' => "OK", 'count' => $count ) );

		$results = array();
		foreach ( $rows as $row ) {
			
			$result->setIndexedTagName( $row, 'result' );
			$results[] = $row;
		}

		$result->setIndexedTagName( $results, 'result' );
		$result->addValue( $this->getModuleName(), "results", $results );
	
		return true;

	}

	public function getAllowedParams() {
		return array(
			'index' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true
			),
			'db' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true
			),
			'key' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => false
			),
			'keys' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => false
			),
			'startkey' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => false
			),
			'endkey' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => false
			),
			'fields' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => false
			),
			'limit' => array(
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_REQUIRED => false
			),
			'skip' => array(
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_REQUIRED => false
			),
			'include_docs' => array(
				ApiBase::PARAM_TYPE => 'boolean',
				ApiBase::PARAM_REQUIRED => false
			),
		);
	}

	public function getDescription() {
		return array(
			'API for querying CouchDB Indexes predefined system'
		);
	}
	public function getParamDescription() {
		return array(
			'index' => 'Index used for the query',
			'db' => 'CouchDB database',
			'key' => 'key to be searched',
			'keys' => 'list of keys to be searched',
			'startkey' => 'Starting key',
			'endkey' => 'Ending key',
			'fields' => 'Fields to show',
			'limit' => 'Limit of number of entries',
			'skip' => 'Entries skipped',
			'include_docs' => 'Result docs included'
		);
	}

	public function getVersion() {
		return __CLASS__ . ': 1.1';
	}

}
