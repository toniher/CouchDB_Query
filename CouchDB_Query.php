<?php
// This extension now uses extension.json for registration.
// In LocalSettings.php, load it with:
//   wfLoadExtension( 'CouchDB_Query' );
//
// The old require_once style is no longer supported.

if ( !defined( 'MEDIAWIKI' ) ) {
	die( 'This file is a MediaWiki extension, it is not a valid entry point' );
}

die( 'CouchDB_Query must be loaded using wfLoadExtension( \'CouchDB_Query\' ) in LocalSettings.php.' );
