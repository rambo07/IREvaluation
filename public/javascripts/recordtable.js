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
            //todo: add some sort of sorting (here or when extracting from db)
            var newdate = new Date(this.date);
            var tidy = newdate.toString().substring(0, 21);
            tableContent += '<tr>';
            tableContent += '<td>' + tidy + '</td>';
            tableContent += '<td>' + this.task + '</td>';
            tableContent += '<td>' + this.run +'</td>'; //" " + '<form><input type="button" method="post" action="/records" value="delete"></form> delete btn?
            tableContent += '<td>' + '<form name="getresults" method="post" ><input type="hidden" value='+this.run+' name="run"><input type="submit" value="Display"></form>'+ '</td>';
            tableContent += '<td>' + this.comments + '</td>'; //temp: will contain comments
            tableContent += '</tr>';
        });

        // Inject the whole content string into our existing HTML table
        $('#runList table tbody').html(tableContent);
    });
}

