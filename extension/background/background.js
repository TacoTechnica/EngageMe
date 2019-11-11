// Core.js
/*
 *  The main background script that always runs and interfaces with the server
 *
 *
 */

class Core {
    constructor(offline=false) {
        // If offline is true, it will not send any data to the server (for testing)
        this.offline = offline;
        this.accumulators = {}
    }

    // Get data from the content server
    receive_content_data(data) {
        // TODO: Might want to unpack data
        switch (data.type) {
            case "interval":
                this.add_watch_interval(data);
                break;
            case "interval_end":
                this.update_end_interval(data);
                break;
            case "done":
                this.send_data(data);
                break;
            case "unload":
                this.unload_video(data);
                break;
        }
    }

    get_accumulator(url, duration) {
        if (this.accumulators[url] == undefined) {
            console.log("NEW ACCUMULATOR: " + url);
            this.accumulators[url] = new Accumulator(duration);
        }
        return this.accumulators[url];
    }

    // Add a watch interval, recorded from the content script
    add_watch_interval(data) {
        var url = data["url"];
        var start = data["start"];
        var end = data["end"];
        var duration = data["duration"];

        console.log("[" + url + "] WATCH INTERVAL: (" + start + ", " + end + ")");

        this.get_accumulator(url, duration).add_watch_interval(start, end);
    }

    // This is sent continuously from the content script
    update_end_interval(data) {
        var url = data["url"];
        var start = data["start"];
        var end = data["time"];
        var duration = data["duration"];

        this.get_accumulator(url, duration).update_end_interval(start, end);
    }

    // Unloads a video
    unload_video(data) {
        var url = data["url"];
        console.log("UNLOADED: " + url);
        this.send_data(url);
    }

    // Sends relevant compiled data to the server
    send_data(url) {
        if (!this.offline) {
            console.log("SENDING DATA");
            var accum = this.accumulators[url];
            if (accum === undefined) {
                return;
            }

            var real_intervals = accum.get_watch_intervals();

            var url = get_server_hostname() + "/api/interval";
            var data = {
                uuid: get_username(),
                url: url,
                name: url,
                length: accum.get_video_duration(),
                intervals: real_intervals
            };
            $.ajax({
                type: "POST",
                url: url,
                data: JSON.stringify(data),
                headers: {
                    "Access-Control-Allow-Origin": "*" //,
                    //'Access-Control-Allow-Credentials': 'true'
                },
                contentType: "application/json",
                dataType: "json",
                success: function() {
                    console.log("Data Sent");
                },
                error: function() {
                    // If you're here to remove this, I don't blame you.
                    console.error(
                        '"My ass is in at least - I\'d say conservatively - conservatively, about 10 of my tracks." \n - Deadmau5'
                    );
                    console.error("Failed to send data to " + url);
                }
            });          
        }

        delete accum[url];
    }

    enable() {
        chrome.storage.sync.set({enabled: true}, function() {
            console.log("ENABLED");
        });
        this.offline = false;
    }
    disable() {
        chrome.storage.sync.set({enabled: false}, function() {
            console.log("DISABLED");
        });
        this.offline = true;
    }
}

// Accumulates watch time intervals and can combine them later
class Accumulator {
    constructor(duration) {
        this.watch_intervals = [];
        this.duration = duration;
        this.last_start = -1;
        this.last_end = -1;
    }

    // Add a watch interval
    add_watch_interval(start, end) {
        // First, check the gap from the last interval
        var len = this.watch_intervals.length;
        if (len != 0) {
            var prev_interval = this.watch_intervals[len - 1];
            var delta_prev = Math.abs(start - prev_interval[1]);
            // TODO: Magic number
            if (delta_prev < 0.9) {
                // In this case, merge the last two intervals together
                this.watch_intervals[len - 1][1] = end;
                return;
            }
        }
        this.watch_intervals.push([start, end]);
    }

    // Update our end interval
    update_end_interval(start, end) {
        this.last_start = start;
        this.last_end = end;
    }

    // Merges all watch intervals
    // Thanks, leetcode
    get_watch_intervals() {
        // Handle our last end interval
        if (this.last_start != -1 && this.last_end != -1) {
            //alert("Aw yeah: " + last_begin + " -> " + last_finish);
            this.add_watch_interval(this.last_start, this.last_end);
        }

        if (this.watch_intervals.length == 0) {
            return [];
        }

        // Sort by start time.
        // We don't really need to make copies here, in fact this makes it more organized
        this.watch_intervals.sort(function(left, right) {
            return left[0] - right[0];
        });

        var result = [];

        var start = this.watch_intervals[0][0];
        var end = this.watch_intervals[0][1];
        for (var i = 1; i < this.watch_intervals.length; ++i) {
            var interval = this.watch_intervals[i];
            // If we're beyond the range
            if (interval[0] > end) {
                result.push([start, end]);
                start = interval[0];
                end = interval[1];
            } else {
                // If our end is below, we're ignored.
                if (interval[1] <= end) {
                // Ignore
                continue;
                } else if (interval[0] <= end) {
                    end = interval[1];
                }
            }
        }
        // At the end: Push left over
        result.push([start, end]);

        return result;
    }

    get_video_duration() {
        return this.duration;
    }
};

// Initialize
var core = new Core(true);

// Communicate with content scripts, let us receive data from them
chrome.runtime.onMessage.addListener( async message => {
        // console.log("RECEIVED DATA: ");
        // console.log(request);
        core.receive_content_data(message);
        return Promise.resolve("Dummy response to keep the console quiet");
    }
);
// Communicate with popup
chrome.extension.onConnect.addListener(function(port) {
    console.log("Connected .....");
    port.onMessage.addListener(function(msg) {
        switch (msg.type) {
            case "extension_toggle":
                var val = msg.toggle;
                if (val) {
                    core.enable();
                } else {
                    core.disable();
                }
                break;
        }

        //  console.log("message recieved" + msg);
         port.postMessage("Hi Popup.js");
    });
})

// TODO: Generate/Find this, figure out what this should be
function get_username() {
    return "Loafus Cramwell";
}