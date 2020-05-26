<?php
class ApiCouchDB_Document extends ApiBase {

	public function execute() {

		$params = $this->extractRequestParams();

		$outcome = CouchDB_Document::processDocument( $params );
		// Below would be JSON

		$count = 0;
		$rows = [];

		if ( array_key_exists( "_id", $outcome ) ) {

			$count = 1;

			array_push( $rows, $outcome );
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
			'db' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true
			),
			'key' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => false
			)
		);
	}

	public function getDescription() {
		return array(
			'API for querying CouchDB documents'
		);
	}
	public function getParamDescription() {
		return array(
			'db' => 'CouchDB database',
			'key' => 'key ID to be retrieved'
		);
	}

	public function getVersion() {
		return __CLASS__ . ': 1.1';
	}

}
