
class Display {
    constructor() {
        this.running = false;
        this.set_triggers();
    }

    initialize(video) {
        if (this.running) {
            return;
        }
        console.log("[Display.js] Initialize Event");
        this.intervals = [];
        this.video = video;
        this.running = true;
        this.load_data();
    }

    set_triggers() {
        // Prevent duplicates
        if (this.running) {
            return;
        }

        // On load
        window.addEventListener('engageme-video-load', evt => {
            var video = evt.detail;
            display.initialize(video);
        });

        // TODO: Delete old time markers when we unload the extension
        // TODO: Need to find video for this to work
        // This would load the data the moment you enabled the extension, without refresh
        // chrome.storage.onChanged.addListener(function(changes, namespace) {
        //     for(key in changes) {
        //       if(key === 'enabled') {
        //         var s = changes[key];
        //         var enabled = s.newValue;
        //         if (enabled) { // TODO: FIND VIDEO asynchronously?
        //             initialize(video);
        //         } else {
        //             // REMOVE TIME MARKERS
        //         }
        //       }
        //     }
        // });
    }

    // Get everything from the server
    load_data() {
        //TODO get data from backend.
        // structure: [[start,end], [start, end], ...]
        var server_hostname = get_server_hostname();
        var url = server_hostname + "/api/video?url=" + get_video_url(this.video);
        $.ajax({
            url: url,
            type: "GET",
            headers: {
                "Access-Control-Allow-Origin": "*"
            },
            contentType: "application/json",
            dataType: "json",
            success: function(jsonArr) {
                console.log(jsonArr);
                if (!$.isEmptyObject(jsonArr)) {
                    jsonArr.average_intervals.forEach(function(arr) {
                        display.add_interval(arr[0], arr[1]);
                    });
                }
                display.display_intervals();
            }
        });
    }

    // Display all of our intervals
    display_intervals() {
        var video_type = get_video_type();
        this.intervals.forEach(interval => {
            var start = interval.start,
                end   = interval.end;
            var duration = this.video.duration;
            switch (video_type) {
                case VideoType.YOUTUBE:
                    var t_div = document.createElement("div");
                    t_div.id = "yt_pt";
                    t_div.style.zIndex = 33;
                    t_div.style.position = "absolute";
                    t_div.style.height = "100%";
                    t_div.style.bottom = "0%";
                    t_div.style.transformOrigin = "0 0";
                    t_div.style.left = (start / duration) * 100 + "%";
                    t_div.style.width = ((end - start) / duration) * 100 + "%";
                    t_div.style.background = "#00dcff";

                    //locate div that we inject into
                    var p_list = document.getElementsByClassName("ytp-progress-list")[0];

                    //inject div into div
                    p_list.appendChild(t_div);
                    break;
                case VideoType.LECCAP:
                    var t_div = document.createElement("div");
                    t_div.id = "lc_pt";
                    t_div.style.zIndex = 1;
                    t_div.style.position = "absolute";
                    t_div.style.height = "8px";
                    t_div.style.top = "0%";
                    t_div.style.left = (start / duration) * 100 + "%";
                    t_div.style.width = ((end - start) / duration) * 100 + "%";
                    t_div.style.background = "#cc5500";
                
                    //locate div that we inject into
                    var p_list = document.getElementsByClassName(
                        "controls-slider-track controls-seek-bar"
                    )[0];
                
                    //inject div into div
                    p_list.appendChild(t_div);                
                    break;
            }
        });
    }

    add_interval(start, end) {
        console.log("[Display.js] New Interval: (" + start + ", " + end + ")");
        this.intervals.push({
            start: start,
            end: end
        });
    }
  
};

// Initialize
var display = new Display();