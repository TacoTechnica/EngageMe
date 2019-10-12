/*
 * DISPLAY
 *
 * The display receives information from the server and displays it in a
 * meaningful way.
 *
 *
 */

// List of intervals. Each interval is formatted as a dictionary with values:
// {
//  "start" : number (seconds),
//  "end"   : number (seconds)
// }
var display_intervals = []

// Adds an interval
function add_interval(start, end) {
  display_intervals.push(
    {
      "start" : start,
      "end" : end
    }
  );
}

// Setter and getter for interval data
function interval_count() {
  return display_intervals.length
}
function get_interval(index) {
  return display_intervals[index]
}

// Load data from the server, use "add_interval" to add all of our intervals
function display_intervals_load() {
  // TODO: Fill me!
}

// Given a "video" element, display the intervals we received from the server
function display_intervals_show(video) {
  // TODO: Fill me!
}

// Get the video element. Depends on the site
function display_intervals_get_video() {
  // TODO: At the moment these are the same, so this switch case might be useless.
  switch (window.location.host) {
    case "www.youtube.com":
    case "leccap.engin.umich.edu":
      return document.getElementsByTagName("video")[0];
  }
  // At this point, we have a problem
  console.error("Aw fucc, unknown window location host: " + window.location.host);
  return null;
}

