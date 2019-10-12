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

// Thank you leetcode
function merge_intervals(intervals) {

    if (intervals.length == 0) {
        return [];
    }

    // Sort by start time
    intervals.sort(function(left, right) {
        return left["start"] - right["start"]
    });

    result = [];

    var start = intervals[0]["start"];
    var end = intervals[0]["end"];
    for(var i = 1; i < intervals.length; ++i) {
        var interval = intervals[i];
        // If we're beyond the range
        if (interval["start"] > end) {
            result.push([start, end]);
            start = interval["start"];
            end = interval["end"];
        } else {
            // If our end is below, we're ignored.
            if (interval["end"] <= end) {
                // Ignore
                continue;
            } else if (interval["start"] <= end) {
                end = interval["end"];
            }
        }
    }
    // At the end: Push left over
    result.push([start, end]);

    return result;
}

// We've recorded our user's tracking data, now send it.
function tracker_send_data() {
  // TODO: Debugging prints
  console.log("SENDING INTERVALS");
  console.log(tracker_intervals);

  // Merge the tracked intervals
  var intervals = merge_intervals(tracker_intervals);

  var url = "???";
  var data = {
    "user": user_id,
    "intervals": intervals
  };
  $.post(url, data, function(data, status) {
    // TODO: Handle server/internet errors
    console.log("SENT INTERVAL DATA. Received data: " + data + "\nStatus: " + status);
  });
  
}
