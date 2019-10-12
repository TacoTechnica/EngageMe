
var video = display_intervals_get_video();

if (video != null) {
  console.log("TEST: EXTENSION LOADED");
  // Load and show the engagement intervals from the backend
  display_intervals_load();
  display_intervals_show(video);

  // Start tracking our user's engagement
  tracker_track_engagement(video);
  // Saving data before we unload the page is handled in background.js
}
