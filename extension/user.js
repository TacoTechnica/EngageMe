
var user_id = -1;

function getRandomToken() {
    // E.g. 8 * 32 = 256 bits token
    var randomPool = new Uint8Array(32);
    crypto.getRandomValues(randomPool);
    var hex = '';
    for (var i = 0; i < randomPool.length; ++i) {
        hex += randomPool[i].toString(16);
    }
    // E.g. db18458e2782b2b77e36769c569e263a53885a9944dd0a861e5064eac16f1a
    return hex;
}

// Generate user id
chrome.storage.sync.get('userid', function(items) {
    var userid = items.userid;
    if (userid) {
        useToken(userid);
    } else {
        userid = getRandomToken();
        chrome.storage.sync.set({userid: userid}, function() {
            user_id = userid;
        });
    }
});

// Communication with the background script
chrome.runtime.onMessage.addListener(function (msg, sender, sendResponse) {
    if (msg.text === 'are_you_there_content_script?') {
      sendResponse({status: "yes"});
    }
});


// function done(video) {stuff}
function get_video(done) {
  var observer = new MutationObserver(function (mutations, me) {
    var video = document.getElementsByTagName('video');
    if (video && video[0] && !Number.isNaN(video[0].duration)) {
      done(video[0]);
      me.disconnect();
      return;
    }
  });

  // start observing
  observer.observe(document, {
    childList: true,
    subtree: true
  });
}
