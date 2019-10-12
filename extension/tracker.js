/*
 * TRACKER
 *
 * The Tracker keeps track of the user's engagement and sends that data to a
 * backend server when the user leaves the page
 *
 *
 */

// jquery must be imported (look at manifest.json and README.md)

// Tracks the last time updated
var tracker_last_time = -1;
var tracker_paused = true; // We assume video is not playing

// Tracks the last time we started watching something
var tracker_start_interval = -1;



// Given a video, keep track of a user's engagement.
function tracker_track_engagement(video) {

  // Track the time at every tick
  video.addEventListener("timeupdate", function() {
    if (tracker_last_time == -1) {
      // TODO: Figure out when the video started and set that here
      tracker_last_time = 0;
    }
    var time = this.currentTime;
    var skip_delta = time - tracker_last_time;
    // If we skip over one second, we'll track this as a skip
    // TODO: Arbitrary constant
    if (Math.abs(skip_delta) > 1) {
      if (tracker_start_interval == -1) {
        // TODO: Figure out when the video started and set that here
        tracker_start_interval = 0;
      }
      var watch_start = tracker_start_interval,
          watch_end   = tracker_last_time;
      // If we stutter a little, make sure we don't skip the beginning
      // (duct tape solution: Sometimes, watch_end = watch_time = 0)
      if (watch_end - watch_start > 0.1) {
        console.log("DELTA :" + skip_delta);
        // This is the interval that the user watched
        tracker_send_to_background(watch_start, watch_end);
        //tracker_record_interval(watch_start, watch_end);
        // We found a skip interval!
      }
      tracker_start_interval = time;
    }
    tracker_last_time = time;
  });
}

// Sends our collected thing to the background
function tracker_send_to_background(start, end) {
  var user = "me";
  var url = window.location.href;
  chrome.runtime.sendMessage({type:"interval", user:user, url:url, start:start, end:end}, function(response) {
    console.log("Got something from the background:");
    console.log(response);
  });
}

