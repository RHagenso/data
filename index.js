"use strict"; // This line chooses a JavaScript dialect, one that helps both jsLint (used in OrionHub) and browsers catch errors.
/*jslint browser: true*/ // This line tells jsLint that the code will run in a browser.

function escape_for_out_of_tag_html(string) {
    return string.replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/&/g, '&amp;');
}

function data_has_loaded(url, table_contents) {
    console.log(table_contents);
    var table = document.getElementById('presentation');
    for (var i = 0; i < table_contents.length; ++i) {
        var row_contents = table_contents[i];
        var table_row = document.createElement('tr');
        for (var j = 0; j < row_contents.length; ++j) {
            var cell_contents = row_contents[j];
            var cell = document.createElement('td');
            cell.innerHTML = escape_for_out_of_tag_html(cell_contents);
            table_row.appendChild(cell);
        }
        table.appendChild(table_row);
    }
}

function data_failed_to_load(url) {
    var table = document.getElementById('presentation');
    var table_row = document.createElement('tr');
    var warning_cell = document.createElement('th');
    warning_cell.innerHTML = 'Failed to load ' + escape_for_out_of_tag_html(url) + '.';
    table_row.appendChild(warning_cell);
    table.appendChild(table_row);
}

request_csv_load('spreadsheet.csv', data_has_loaded, data_failed_to_load);
