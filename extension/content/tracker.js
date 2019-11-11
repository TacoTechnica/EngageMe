

// The main tracker.
// This tracks the watch intervals of one video,
// and sends watch data to the background.
// When the video is changed or removed, the tracker
// lets the background know (see "send_unload_signal")
class Tracker {
    constructor() {
        this.running = false;
        this.video_last_time = undefined;
        this.video_start_interval = undefined;
        this.video_paused = false;
        this.set_triggers();

    }

    // Initialize to a new page/new video.
    // Call this whenever the page refreshes, should automatically work itself out
    initialize(video) {
        if (this.running) {
            return;
        }
        console.log("[Tracker.js] Initialize Event");
        // TODO: Grab video URL, cancel the last thread, reset accumulator, ect.
        this.video = video;
        this.video_url = get_video_url(video);
        this.video_duration = video.duration;

        this.start_tracking();

        this.running = true;
    }

    // Sets event listeners that tell the background
    // that the video has been changed or removed
    // ALSO set triggers to re-initialize the script, if need be.
    set_triggers() {
        // Prevent duplicates
        if (this.running) {
            return;
        }

        // On load
        window.addEventListener('engageme-video-load', evt => {
            var video = evt.detail;
            tracker.initialize(video);
        });

        // On unload
        window.addEventListener('engageme-video-unload', () => {
            tracker.send_unload_signal();
        });
    }

    // Start tracking the video
    start_tracking() {
        console.log("[Tracker.js] Start Tracking Event");
        // NOTE: Tracker is global here
        this.video.addEventListener("timeupdate", () => {
            if (tracker.video_last_time == undefined) {
                // TODO: Figure out when the video started and set that here
                tracker.video_last_time = 0;
            }
            if (tracker.video_start_interval == undefined) {
                // TODO: Figure out when the video started and set that here
                tracker.video_start_interval = 0;
            }
            var time = tracker.video.currentTime;
            tracker.send_end_interval(time);
            // Let our background know where our ending points are
            // If we skip over one second, we'll track this as a skip
            var skip_delta = time - tracker.video_last_time;
            // TODO: Arbitrary constant
            if (Math.abs(skip_delta) > 1) {
                var watch_start = tracker.video_start_interval,
                    watch_end = tracker.video_last_time;
                // If we stutter a little, make sure we don't skip the beginning
                // (duct tape solution: Sometimes, watch_end = watch_time = 0)
                if (watch_end - watch_start > 0.1) {
                    // We found a skip interval!
                    console.log("[Tracker.js] (" + watch_start + ", " + watch_end
                              + ") DELTA :" + skip_delta);
                    // This is the interval that the user watched
                    tracker.send_watch_interval(watch_start, watch_end);
                }
                tracker.video_start_interval = time;
            }
            tracker.video_last_time = time;
        });
    }

    // Tells the background that we've unloaded the video
    send_unload_signal() {
        console.log("[Tracker.js] UNLOADED");
        tracker.send_data_to_background("unload", {});
    }

    // Send a watch interval to the background
    send_watch_interval(start, end) {
        this.send_data_to_background("interval", {
            "start": start,
            "end": end,
            "duration": this.video_duration
        });
    }

    // Send an end interval to the background
    // This is sent on a regular basis, so if the tracker gets cut off
    // we don't lose the last interval
    send_end_interval(time) {
        this.send_data_to_background("interval_end", {
            "start": this.video_start_interval,
            "time": end,
            "duration": this.video_duration
        });
    }

    // Sends arbitrary data to background
    send_data_to_background(type, data, response = function(resp){}) {
        data["type"] = type;
        data["url"] = this.video_url;
        chrome.runtime.sendMessage(data);
    }
};


// Initialize
var tracker = new Tracker();
