<?php
class ApiCouchDB_Query_Nouveau extends ApiBase {

	public function execute() {

		$params = $this->extractRequestParams();

		$outcome = CouchDB_Nouveau::processIndex( $params );
		// Below would be JSON

		$count = 0;

		if ( is_object( $outcome ) && property_exists( $outcome, "total_hits" ) ) {
			$count = $outcome->total_hits;
		}

		$rows = array();

		$result = $this->getResult();
		$result->addValue( null, $this->getModuleName(), array ( 'status' => "OK", 'count' => $count ) );

		if ( is_object( $outcome ) && property_exists( $outcome, "hits" ) && is_array( $outcome->hits ) ) {

			foreach ( $outcome->hits as $hit ) {

				$rowid = property_exists( $hit, "id" ) ? $hit->id : null;

				// Nouveau exposes ordering values via $hit->order; first element is typically the score
				$score = null;
				if ( property_exists( $hit, "order" ) && is_array( $hit->order ) && count( $hit->order ) > 0 ) {
					$score = $hit->order[0];
				}

				$fields = property_exists( $hit, "fields" ) ? $hit->fields : new stdClass();

				// We assume here that ID is linked
				$page = $rowid ? \MediaWiki\MediaWikiServices::getInstance()->getWikiPageFactory()->newFromID( $rowid ) : null;

				$newrow = array();

				if ( $page ) {
					$title = $page->getTitle();
					$fullpagename = $title->getFullText();
					$newrow["id"] = $rowid;
					$newrow["score"] = $score;
					$newrow["pagename"] = $fullpagename;
					$newrow["fields"] = $fields;

					array_push( $rows, $newrow );
				} else {

					// Hack for strange cases :'(
					$db = $params['db'];
					$index = $params['index'];
					$wgCouchDB_Query = $GLOBALS['wgCouchDB_Query'] ?? [];

					if ( ! empty( $wgCouchDB_Query["map"][$db][$index]["pagename"] ) ) {
						$pagename = $GLOBALS['wgCouchDB_Query']["map"][$params["db"]][$params["index"]]["pagename"];

						if ( is_object( $fields ) && property_exists( $fields, $pagename ) ) {
							$newrow["pagename"] = $fields->$pagename;
						}
					}

					$newrow["id"] = $rowid;
					$newrow["score"] = $score;
					$newrow["fields"] = $fields;

					array_push( $rows, $newrow );
				}
			}
		}

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
			'q' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => true
			),
			'limit' => array(
				ApiBase::PARAM_TYPE => 'integer',
				ApiBase::PARAM_REQUIRED => false
			),
			'sort' => array(
				ApiBase::PARAM_TYPE => 'string',
				ApiBase::PARAM_REQUIRED => false
			),
			'include_docs' => array(
				ApiBase::PARAM_TYPE => 'boolean',
				ApiBase::PARAM_REQUIRED => false
			),
			'full' => array(
				ApiBase::PARAM_TYPE => 'boolean',
				ApiBase::PARAM_REQUIRED => false
			)
		);
	}

}
