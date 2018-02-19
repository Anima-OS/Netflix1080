/* Copyright (c) 2018, Mark "Happy-Ferret" Bauermeister
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */

browser.webRequest.onBeforeRequest.addListener(
    function(details) {
      console.log("Injecting modified Netflix Player to enable 1080p.");
      return {
        redirectUrl: browser.extension.getURL("cadmium-playercore-1080p.js")
      };
    }, {
      urls: [
        "*://assets.nflxext.com/en_us/ffe/player/html/*",
        "*://www.assets.nflxext.com/en_us/ffe/player/html/*",
      ]
    }, ["blocking"]
  );
  