# EngageMe
Made with care at MHacks 12

## What it does:
Tracks viewer engagement and emphasizes the most interesting parts of the video to the user in the progress bar.

## How it works:
The Chrome extension uses the HTML5 <video> tag, looking at when the user takes action to change the part of the video they are at. After the user is done watching this video, we push this information to the backend, which aggregates all user-tracked time data and determines what the most watched segments were. We then display this with a unique color onto the progress bar.

