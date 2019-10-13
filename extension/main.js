// 
get_video(function(video) {
  console.log("TEST: EXTENSION LOADED");
  // Load and show the engagement intervals from the backend
  handleVideo(video);

  // Start tracking our user's engagement
  tracker_track_engagement(video);
  // Saving data before we unload the page is handled in background.js
});
