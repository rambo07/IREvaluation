// Userlist data array for filling in info box
var runListData = [];

/*/ DOM Ready =============================================================//not working?
$(document).ready(function() {

    // Populate the user table on initial page load
    populateTable();


});*/

// Functions =============================================================

// Fill table with data
function populateTable() {
    
    // Empty content string
    var tableContent = '';

    // jQuery AJAX call for JSON
    $.getJSON( '/records/runlist', function( data ) {
        runListData = data; //bad way of doing this, fix later
        // For each item in our JSON, add a table row and cells to the content string
        
        $.each(data, function(){
            var newdate = new Date(this.date);

            tableContent += '<tr>';
            tableContent += '<td>' + newdate + '</td>';
            tableContent += '<td>' + this.task + '</td>';
            tableContent += '<td>' + this.run + '</td>';
            tableContent += '<td><a href="/graph" class="linkshowresults" rel="' + this.run + '" title="Show Details">' + "X" + '</a></td>';
            tableContent += '<td>' + "none" + '</td>'; //temp: will contain comments
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#runList table tbody').html(tableContent);
    });
}

function test() {
    alert("testing!");
}