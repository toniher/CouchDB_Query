<?php
class ApiCouchDB_Query extends ApiBase {

	public function execute() {

		$params = $this->extractRequestParams();

		$outcome = CouchDB_Index::processIndex( $params );
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
			'limit' => 'Limit of number of entries',
			'skip' => 'Entries skipped'
		);
	}

	public function getVersion() {
		return __CLASS__ . ': 1.1';
	}

}