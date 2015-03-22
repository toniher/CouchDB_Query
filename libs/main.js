/** Inspect all table instances **/
$(document).ready(function(){
    
    $( ".couchdb-query-table" ).each( function( i ) {
        
        var total = $(this).data('total');
        var limit = $(this).data('limit');
        var header = $(this).data('header');
        var smw = $(this).data('smw');
        var query = $(this).data('query');
        var index = $(this).data('index');
        var type = $(this).data('type');
        var skip = $(this).data('skip');
        
        // Stricty necessary
        if ( type !== "" && index !== "" ) {

        
            var params = [];
            if ( limit !== "" ) {
                params.push( "limit=" + limit );
            }
            if ( skip !== "" ) {
                params.push( "skip=" + skip );
            }
            
            if ( query !== "" ) {
                params.push( "key=" + query );
            }
                
            // GET QUERY here
            
            
            
        }
       
        console.log( i );
    });  
    
});


// Next, previous, detecting data-total and data-limit, etc.

$( ".couchdb-query-table" ).on( "click", ".next", function() {
    console.log( "Next" );
});

$( ".couchdb-query-table" ).on( "click", ".prev", function() {
    console.log( "Previous" );
});