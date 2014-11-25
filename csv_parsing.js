"use strict"; // This line chooses a JavaScript dialect, one that helps both jsLint (used in OrionHub) and browsers catch errors.
/*jslint browser: true*/ // This line tells jsLint that the code will run in a browser.

function trim_csv_row(csv_row) {
    while (csv_row.length > 0 && /^\s*$/.test(csv_row[csv_row.length - 1])) {
        csv_row.pop();
    }
    return csv_row;
}

var csv_parser_states = Object.freeze({
    UNQUOTED: 0,
    QUOTED: 1,
    AFTER_ONE_QUOTED_QUOTE: 2,
});

function parse_csv(string) {
    var result = [];
    var next_row = [];
    var accumulator = '';
    var state = csv_parser_states.UNQUOTED;
    for (var i = 0, length = string.length; i < length; ++i) {
        var character = string[i];
        switch (state) {
        case csv_parser_states.UNQUOTED:
            switch (character) {
            case '\n':
                next_row.push(accumulator.trim());
                accumulator = '';
                result.push(trim_csv_row(next_row));
                next_row = [];
                break;
            case ',':
                next_row.push(accumulator.trim());
                accumulator = '';
                break;
            case '"':
                state = csv_parser_states.QUOTED;
                break;
            default:
                accumulator += character;
            }
            break;
        case csv_parser_states.QUOTED:
            switch (character) {
            case '"':
                state = csv_parser_states.AFTER_ONE_QUOTED_QUOTE;
                break;
            default:
                accumulator += character;
            }
            break;
        case csv_parser_states.AFTER_ONE_QUOTED_QUOTE:
            switch (character) {
            case '\n':
                next_row.push(accumulator.trim());
                accumulator = '';
                result.push(trim_csv_row(next_row));
                next_row = [];
                state = csv_parser_states.UNQUOTED;
                break;
            case ',':
                next_row.push(accumulator.trim());
                accumulator = '';
                csv_parser_states.UNQUOTED;
                break;
            case '"':
                accumulator += character;
                state = csv_parser_states.QUOTED;
                break;
            default: // Best-guess recovery from bad formatting
                accumulator += '"';
                accumulator += character;
            }
            break;
        }
    }
    switch (state) {
    case csv_parser_states.UNQUOTED:
        if (string.length > 0 && string[string.length - 1] !== '\n') {
            next_row.push(accumulator.trim());
            result.push(trim_csv_row(next_row));
        }
        break;
    case csv_parser_states.QUOTED: // Best-guess recovery from bad formatting
    case csv_parser_states.AFTER_ONE_QUOTED_QUOTE: // Valid but sloppy formatting
        next_row.push(accumulator.trim());
        result.push(trim_csv_row(next_row));
        break;
    }
    return result;
}

function request_csv_load(url, success_handler, failure_handler) {
    $.get(url, function (data) {
        success_handler(url, parse_csv(data));
    }, 'text').fail(function() {
        failure_handler(url);
    });
}
