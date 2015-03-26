<?php
class ApiCouchDB_Query_Lucene extends ApiBase {

	public function execute() {

		$params = $this->extractRequestParams();

		$outcome = CouchDB_Lucene::processIndex( $params );
		// Below would be JSON
	
		$count = $outcome->total_rows;
		$rows = array();

		$result = $this->getResult();
		$result->addValue( null, $this->getModuleName(), array ( 'status' => "OK", 'count' => $count ) );

		foreach ( $outcome->rows as $row ) {
			//var_dump( $row );
			$rowid = $row->id;
			// We assume here that ID is linked
			$page = WikiPage::newFromId( $rowid );

			$newrow = array();

			if ( $page ) {
				$title = $page->getTitle();
				$fullpagename = $title->getFullText();
				$newrow["id"] = $rowid;
				$newrow["score"] = $row->score;
				$newrow["pagename"] = $fullpagename;
				$newrow["fields"] = $row->fields;

				array_push( $rows, $newrow );
			}

		}

		$results = array();
		foreach ( $rows as $row ) {

			$fields = array();
			foreach ( $row["fields"] as $field ) {
				$field->setIndexedTagName( $row, 'field' );
				$fields[] = $field;
			}

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
			'q' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true
			),
			'limit' => array(
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_REQUIRED => false
			),
			'skip' => array(
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_REQUIRED => false
			)
		);
	}

	public function getDescription() {
		return array(
			'API for querying CouchDB Lucene predefined system'
		);
	}
	public function getParamDescription() {
		return array(
			'index' => 'Index used for the query',
			'db' => 'CouchDB database',
			'q' => 'Actual text query',
			'limit' => 'Limit of number of entries',
			'skip' => 'Entries skipped'
		);
	}

	public function getVersion() {
		return __CLASS__ . ': 1.1';
	}

}
