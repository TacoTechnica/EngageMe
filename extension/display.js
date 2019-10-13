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
  display_intervals.push({
    "start": start,
    "end": end
  });
}

// Setter and getter for interval data
function interval_count() {
  return display_intervals.length
}

function get_interval(index) {
  return display_intervals[index]
}

// Load data from the server, use "add_interval" to add all of our intervals
function get_json_data(url) {
  //TODO link with backend
  return null;
}

function display_json_data(obj) {
  //TODO parse list of lists from backend
  // structure: [[start,end], [start, end], ...]
  var parsed = json.parse(obj)
}

// Given a "video" element, display the intervals we received from the server
function display_interval(start, end, duration, src) {
  if (src.indexOf("youtube.com") !== -1) { // search for youtube
    var t_div = document.createElement("div");
    t_div.id = 'yt_pt';
    t_div.style.zIndex = 33;
    t_div.style.position = 'absolute';
    t_div.style.height = '100%';
    t_div.style.bottom = '0%';
    t_div.style.transformOrigin = '0 0';
    t_div.style.left = (start / duration) * 100 + '%';
    t_div.style.width = ((end - start) / duration) * 100 + '%';
    t_div.style.background = '#00dcff';

    //locate div that we inject into
    var p_list = document.getElementsByClassName('ytp-progress-list')[0];

    //inject div into div
    p_list.appendChild(t_div);
  } else if (src.indexOf("leccap.engin.umich.edu") !== -1) { // search for leccap
    var t_div = document.createElement("div");
    t_div.id = 'lc_pt';
    t_div.style.zIndex = 1;
    t_div.style.position = 'absolute';
    t_div.style.height = '8px';
    t_div.style.top = '0%';
    t_div.style.left = (start / duration) * 100 + '%';
    t_div.style.width = ((end - start) / duration) * 100 + '%';
    t_div.style.background = '#cc5500';

    //locate div that we inject into
    var p_list = document.getElementsByClassName('controls-slider-track controls-seek-bar')[0];

    //inject div into div
    p_list.appendChild(t_div);
  } else {
    console.log("host " + window.location.host + " is unsupported at this time.");
  }
}

// callback executed when video was found
function handleVideo(video) {
  console.log("Video duration: " + video.duration);
  console.log("Video source: " + video.src);
  var json_data = get_json_data(window.location.href);
  if (json_data) {
    console.log(json_data);
  }
}

// Get the video element. Depends on the site
function display_all_intervals() {
  // set up the mutation observer
  var observer = new MutationObserver(function (mutations, me) {
    var video = document.getElementsByTagName('video');
    if (video && video[0] && !Number.isNaN(video[0].duration)) {
      handleVideo(video[0]);
      me.disconnect();
      return;
    }
  });

  // start observing
  observer.observe(document, {
    childList: true,
    subtree: true
  });

}