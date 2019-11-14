var l_off = document.getElementById("label-off"),
    l_on = document.getElementById("label-on"),
    switcher = document.getElementById("switcher");

console.log("OPENED");


switcher.addEventListener("click", function(){
    if (switcher.checked) {
        console.log("On");
        background_enable(true);
    } else {
        console.log("Off");
        background_enable(false);
    }
    l_on.classList.toggle("toggler--is-active");
    l_off.classList.toggle("toggler--is-active");
});


var port = chrome.extension.connect({
    name: "Simple Communication Port"
});

function background_enable(toggle) {
   port.postMessage({type: "extension_toggle", toggle: toggle});
   port.onMessage.addListener(function(msg) {
        console.log("message recieved" + msg);
   });
}



// Enable visually, based on our storage
chrome.storage.sync.get('enabled', function(data) {
    var enabled = data.enabled;
    if (!enabled) {
        switcher.click();
    }
});