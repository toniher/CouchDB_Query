<?php
class ApiCouchDB_Query_Lucene extends ApiBase {

	public function execute() {

		$params = $this->extractRequestParams();

		$outcome = CouchDB_Lucene::processIndex( $params );
		// Below would be JSON
		// $this->getResult()->addValue( null, $this->getModuleName(), array ( 'status' => "OK", 'msg' => trim( $outtext ) ) );

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