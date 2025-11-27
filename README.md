# InAATaLC-Instagram-Accounts-Automatic-Tag-and-Link-Collector
Chrome Browser extension to collect and store Instagram profiles (name and link) collected from other websites where linked (created with the help of ChatGPT).
According to the manifest it currently only works for the website: https://www.for-future-buendnis.de/
You can simply edit the manifest to include other websites per hand. From testing it doesn´t work consistently without reloading the page or waiting a while.

## Installation
🚀 How to Run Locally
1. Put all these files in a folder (e.g. insta_profile_link_collector/).
2. Open Chrome → chrome://extensions/.
3. Enable Developer mode.
4. Click Load unpacked → select the folder.
5. Go to the website where you want to collect links to Instagram → click the extension icon

## Development with ChatGPT
This project was mainly built using the help of ChatGPT (thanks Chatty!). I used the existing and linked chat from this project: https://github.com/La-Cezanne/InAProDaC-Instagram-Automatic-Profile-Data-Collector 
- https://chatgpt.com/share/68cd1f11-8970-8009-8c1c-b6b8cf6e1781

Additionally I used the following prompt to get the code for the extension here:

> Okay, now can you help me create another Chrome extension with a similar, but distinct job? I am planning on collecting links to Instagram profiles from a third site to later use this to collect the profile information with this extension here. But I want both split into two seperate Extensions. I can provide you my current Manifest and would like you to draft up something for the rest. You can lean on similar functionality as for the current extension here. I would reckon that the best approach is to look-up the whole code-base or whatever is relevant (feel free to ask questions about it) to search for links to Instagram and check whether these are not already in the local storage. Data should be stored quite similar to the current extension. Okay, so here is my manifest in current state: { "manifest_version": 3, "name": "Instagram-Accounts Automatic Tag and Link Collector (InAATaLC)", "version": "1.0", "description": "Collects and stores Instagram profiles (name and link) collected from other websites where linked. (On the For-Future website)", "permissions": ["scripting", "activeTab", "storage"], "host_permissions": ["https://www.for-future-buendnis.de/*"], "background": { "service_worker": "background.js" }, "action": { "default_popup": "popup.html" }, "content_scripts": [ { "matches": ["*://www.for-future-buendnis.de/*"], "js": ["content.js"] } ] }
