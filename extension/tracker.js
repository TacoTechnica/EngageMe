/*
 * TRACKER
 *
 * The Tracker keeps track of the user's engagement and sends that data to a
 * backend server when the user leaves the page
 *
 *
 */

// Tracks the last time updated
var tracker_last_time = -1;
var tracker_paused = true; // We assume video is not playing

// Tracks the last time we started watching something
var tracker_start_interval = -1;

// List of tracker intervals
//    Format is the same as in display.js
var tracker_intervals = []

// Record a watch interval.
//    start: Time where the user started watching
//    end  : Time where the user ended watching
function tracker_record_interval(start, end) {
  // If our start value is close enough to the last
  // end value, merge the two intervals together and
  // ignore the small blip of watch that the user probably
  // skipped anyway.
  var len = tracker_intervals.length; 
  if (len != 0) {
    var prev = tracker_intervals[ len - 1 ];
    var delta = Math.abs(start - prev["end"]);
    // TODO: Arbitrary constant
    if (delta < 0.9) {
      // Too close, merge and quit.
      tracker_intervals[ len - 1 ]["end"] = end;
      return;
    }
  }

  // Otherwise, just add the interval.
  tracker_intervals.push( {"start": start, "end": end} );

  // TODO TODO: pls pls delete lmao
  // TODO: DEBUG. Delete me pls
  tracker_send_data();
}

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
        tracker_record_interval(watch_start, watch_end);
        // We found a skip interval!
      }
      tracker_start_interval = time;
    }
    tracker_last_time = time;
  });
}

// We've recorded our user's tracking data, now send it.
function tracker_send_data() {
  // TODO: Debugging prints
  console.log("TEST: INTERVALS");
  console.log(tracker_intervals);
  // TODO: Fill me
}
