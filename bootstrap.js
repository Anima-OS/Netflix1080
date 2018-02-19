/* Copyright (c) 2018, Mark "Happy-Ferret" Bauermeister
 *
 * This software may be modified and distributed under the terms
 * of the BSD license.  See the LICENSE file for details.
 */

"use strict";

const { utils: Cu } = Components;
Cu.import("resource://gre/modules/XPCOMUtils.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Preferences",
  "resource://gre/modules/Preferences.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "Services",
  "resource://gre/modules/Services.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "AddonManager",
  "resource://gre/modules/AddonManager.jsm");
XPCOMUtils.defineLazyModuleGetter(this, "LegacyExtensionsUtils",
  "resource://gre/modules/LegacyExtensionsUtils.jsm");

// Global access to the embedded WebExtension, outside of startup() and its children.
var webExt;

const PREF_WHITELIST = [
  "extensions.netflix1080.enabled"
];

const PREF_BRANCH = "extensions.netflix1080.";
const PREFS = {
  enabled: false
};


function setDefaultPrefs() {
  let branch = Services.prefs.getDefaultBranch(PREF_BRANCH);
  for (let [key, val] in Iterator(PREFS)) {
    switch (typeof val) {
      case "boolean":
        branch.setBoolPref(key, val);
        break;
      case "number":
        branch.setIntPref(key, val);
        break;
      case "string":
        branch.setCharPref(key, val);
        break;
    }
  }
}

function setPrefs(prefs) {
  prefs.forEach(pref => {
    if (PREF_WHITELIST.includes(pref.name)) {
      Preferences.set(pref.name, pref.value);
    }
  });
}

function prefObserver(aSubject, aTopic, aData) {
  let enabled = Services.prefs.getBoolPref("extensions.netflix1080.enabled");
  if (!enabled) {
    disable(aData, ADDON_DISABLE)
  }
  else {
    enable(aData, ADDON_ENABLE)
  }
}

function startup(aData, aReason) {
  setDefaultPrefs();

  // Instantiate WebExtension manually, so we have access to both startup() and shutdown().
  const webExtension = LegacyExtensionsUtils.getEmbeddedExtensionFor({
    id: "netflix1080@anima-os.com",
  })

  // Yield WebExtension access to global.
  webExt = webExtension;

  Services.prefs.addObserver("extensions.netflix1080.enabled", prefObserver);

  if (!Services.prefs.getBoolPref("extensions.netflix1080.enabled")) {
    webExtension.started = false;
    disable(webExtension, ADDON_DISABLE)
  }
  else {
    webExtension.started = false;
    enable(webExtension, ADDON_DISABLE)
  }
}

function disable(aData, aReason) {
  AddonManager.getAddonByID("netflix1080@anima-os.com", function (addon) {
    if (!addon) {
      console.log("Not found!");
      return;
    }
    webExt.shutdown();
  });
}

function enable(aData, aReason) {
  AddonManager.getAddonByID("netflix1080@anima-os.com", function (addon) {
    if (!addon) {
      console.log("Not found!");
      return;
    }
    webExt.shutdown();
    webExt.started = false;
    webExt.startup();
  });
}

function shutdown(aData, aReason) {
  Services.prefs.removeObserver("extensions.netflix1080.enabled", prefObserver);
}

function install(aData, aReason) {
}

function uninstall(aData, aReason) {
}
