<?php


if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'This file is a MediaWiki extension, it is not a valid entry point' );
}

$GLOBALS['wgExtensionCredits']['parserhook'][] = array(
	'path' => __FILE__,
	'name' => 'CouchDB_Query',
	'version' => '0.1',
	'url' => 'https://www.mediawiki.org/wiki/User:Toniher',
	'author' => array( 'Toniher' ),
	'descriptionmsg' => 'CouchDB_Query-desc',
);

$GLOBALS['wgAutoloadClasses']['CouchDB_Query'] = __DIR__.'/CouchDB_Query_body.php';
$GLOBALS['wgAutoloadClasses']['CouchDB_Lucene'] = __DIR__.'/includes/CouchDB_Lucene.php';
$GLOBALS['wgAutoloadClasses']['CouchDB_Index'] = __DIR__.'/includes/CouchDB_Index.php';


$GLOBALS['wgMessagesDirs']['CouchDB_Query'] = __DIR__ . '/i18n';
$GLOBALS['wgExtensionMessagesFiles']['CouchDB_Query'] = __DIR__ . '/CouchDB_Query.i18n.php';
$GLOBALS['wgExtensionMessagesFiles']['CouchDB_QueryMagic'] = __DIR__ . '/CouchDB_Query.i18n.magic.php';

$GLOBALS['wgHooks']['ParserFirstCallInit'][] = 'wfRegisterCouchDB_Query';


$GLOBALS['wgResourceModules']['ext.CouchDB_Query'] = array(
		'scripts' => array( 'libs/main.js' ),
		'styles' => array( 'styles/main.less' ),
		'dependencies' => array(
			'jquery.tablesorter'
		),
		'localBasePath' => __DIR__,
		'remoteExtPath' => 'CouchDB_Query'
);


$GLOBALS['wgCouchDB_Query'] = array();
# Server params
$GLOBALS['wgCouchDB_Query']["params"] = array(
	"db" => array()
);
$GLOBALS['wgCouchDB_Query']["params"]["db"]["username"] = "username";
$GLOBALS['wgCouchDB_Query']["params"]["db"]["password"] = "password";
$GLOBALS['wgCouchDB_Query']["params"]["db"]["host"] = "host";
$GLOBALS['wgCouchDB_Query']["params"]["db"]["protocol"] = "http";
$GLOBALS['wgCouchDB_Query']["params"]["db"]["port"] = 80;
$GLOBALS['wgCouchDB_Query']["params"]["db"]["db"] = ""; # Could be another DB

# Server queries (no mater kind)
$GLOBALS['wgCouchDB_Query']["queries"]["db"]["text"] = "/_fti/local/db/_design/luceneindex/by_text";
$GLOBALS['wgCouchDB_Query']["queries"]["db"]["coords"] = "/db/_design/search/_view/coords";

# API Stuff
$wgAutoloadClasses['ApiCouchDB_Query'] = dirname( __FILE__ ). '/CouchDB_Query.api.couchdb.php';
$wgAutoloadClasses['ApiCouchDB_Query_Lucene'] = dirname( __FILE__ ). '/CouchDB_Query.api.couchdb.lucene.php';
// api modules
$wgAPIModules['couchdb-query'] = 'ApiCouchDB_Query';
$wgAPIModules['couchdb-lucene-query'] = 'ApiCouchDB_Query_Lucene';


/**
 * @param $parser Parser
 * @return bool
 */
function wfRegisterCouchDB_Query( $parser ) {
	// We handle input, output
	$parser->setFunctionHook( 'CouchDB_Query_table', 'CouchDB_Query::process_CouchDB_Query_table', SFH_OBJECT_ARGS );
	$parser->setFunctionHook( 'CouchDB_Query_field', 'CouchDB_Query::process_CouchDB_Query_field', SFH_OBJECT_ARGS );
	return true;
}
