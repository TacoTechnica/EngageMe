console.log("TEST: EXTENSION LOADED");

var video = display_intervals_get_video();

if (video == null) {
  // We couldn't find a video
  return;
}

// Load and show the engagement intervals from the backend
display_intervals_load();
display_intervals_show(video);

// Start tracking our user's engagement
tracker_track_engagement(video);
