Extension for performing CouchDB queries within a MediaWiki instance.

## Requirements

- MediaWiki 1.35 or later
- CouchDB instance (optionally with CouchDB-Lucene for full-text search)

## Installation

1. Clone or download this extension into your MediaWiki `extensions/` directory:

   ```
   git clone <repo-url> extensions/CouchDB_Query
   ```

2. Add the following to the **bottom** of your `LocalSettings.php`:

   ```php
   wfLoadExtension( 'CouchDB_Query' );
   ```

3. Configure the CouchDB connection in `LocalSettings.php` after the `wfLoadExtension` line:

   ```php
   $wgCouchDB_Query['params']['db']['host']     = 'localhost';
   $wgCouchDB_Query['params']['db']['port']     = 5984;
   $wgCouchDB_Query['params']['db']['protocol'] = 'http';
   $wgCouchDB_Query['params']['db']['username'] = 'myuser';
   $wgCouchDB_Query['params']['db']['password'] = 'mypassword';
   $wgCouchDB_Query['params']['db']['db']       = 'mydb';
   ```

4. Define the CouchDB view/Lucene query paths your wiki will use:

   ```php
   $wgCouchDB_Query['queries']['mydb']['myview'] = '/mydb/_design/mydesign/_view/myview';
   ```

## Usage

Once installed, two parser functions are available in wiki pages:

### `{{#CouchDB_Query_table:}}`

Renders a dynamic table populated from a CouchDB view.

```
{{#CouchDB_Query_table: index=myview | db=mydb | limit=25 | fields=title,date }}
```

| Parameter | Description |
|---|---|
| `index` | CouchDB view/index name |
| `db` | CouchDB database identifier |
| `limit` | Maximum rows to return (default: 25) |
| `fields` | Comma-separated list of fields to display |
| `query` | Query string filter |
| `type` | Query type (`index` or `text` for Lucene) |
| `header` | Column header label (default: `Page name`) |
| `class` | CSS class for the table (default: `wikitable sortable jquery-tablesorter`) |
| `prefix` | Page name prefix filter |
| `full` | Set to `1` to include full document data |

### `{{#CouchDB_Query_field:}}`

Renders an input field wired to a CouchDB query table.

```
{{#CouchDB_Query_field: tag=input | type=text | query=myview | id=myfield }}
```

| Parameter | Description |
|---|---|
| `tag` | HTML tag to render (`input`, `select`, etc.) |
| `type` | Input type attribute |
| `query` | Query name this field targets |
| `values` | Predefined values (for select fields) |
| `id` | Element ID |
| `class` | CSS class |
| `default` | Default value |

## API Modules

The extension exposes three API modules:

| Module | Action | Description |
|---|---|---|
| `couchdb-query` | `api.php?action=couchdb-query` | Query a CouchDB view/index |
| `couchdb-lucene-query` | `api.php?action=couchdb-lucene-query` | Full-text search via CouchDB-Lucene |
| `couchdb-document` | `api.php?action=couchdb-document` | Retrieve a single CouchDB document |

### TODO

* Refactor common functions
* Simplify parameters
* Document how this works
* Migrate Javascript function to use PouchDB
