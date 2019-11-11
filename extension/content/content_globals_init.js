// This is global stuff that has to be run at the END

function is_enabled(ontrue) {
    chrome.storage.sync.get('enabled', function(data) {
        if (data.enabled) {
            ontrue();
        }
    });
}

// Add event dispatchers / signals
function initialize_global_events() {
    var video_type = get_video_type();

    var unload_event = new CustomEvent('engageme-video-unload');
    var load_event_name = 'engageme-video-load';

    window.addEventListener(load_event_name, vid => {
        console.log("[Global] ON_LOAD");
    });
    window.addEventListener(unload_event.type, vid => {
        console.log("[Global] ON_UNLOAD");
    });


    switch (video_type) {
        case VideoType.YOUTUBE:
            vid = document.getElementsByTagName("video")[0];
            if (vid == undefined) {
                return;
            }
            var load_event = new CustomEvent(load_event_name, {detail: vid});
            // Load right now, and also when the video navigation finishes
            is_enabled(() => {
                window.dispatchEvent(load_event);
            });
            window.addEventListener('yt-navigate-finish', () => {
                is_enabled(() => {
                    this.dispatchEvent(unload_event);
                    this.dispatchEvent(load_event);
                });
            });
            break;
    }

    // Unload when page unloads, always
    window.addEventListener("beforeunload", evt => {
        evt.preventDefault();
        is_enabled(() => {
            this.dispatchEvent(unload_event);
        });
        return false;
    });
}

initialize_global_events();