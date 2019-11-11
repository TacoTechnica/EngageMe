
const VideoType = {
    YOUTUBE : 'youtube',
    LECCAP : 'leccap'
}

// TODO: This stuff doesn't have any namespace or anything
// ex. Global.get_video_type() or EngageMe.get_video_type() would be nice

// Given the url of our page, return the video type
function get_video_type() {
    // Not href, because we want JUST the root host
    var url = window.location.host;
    if (url.indexOf("youtube.com") != -1)
        return VideoType.YOUTUBE;
    if (url.indexOf("leccap.engin.umich.edu") != -1)
        return VideoType.LECCAP;
    return undefined;
}

// Gets the url of a video. Universal, so it might change later.
function get_video_url(video) {
    switch (get_video_type()) {
        case VideoType.YOUTUBE:
            // Extract the url and return a "pure" link to the video
            var video_id = window.location.search.split('v=')[1];
            var ampersandPosition = video_id.indexOf('&');
            if(ampersandPosition != -1) {
                video_id = video_id.substring(0, ampersandPosition);
            }
            return "https://www.youtube.com/watch?v=" + video_id;
        case VideoType.LECCAP:
            // TODO: How to parse a unique ID? Is using the href safe?
            return window.location.href;
    }
}
