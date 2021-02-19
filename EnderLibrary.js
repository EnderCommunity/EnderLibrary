(function(global, factory) {
    "use strict";
    if (typeof module === "object" && typeof module.exports === "object") {
        // e.g. var o = require("enderlibrary")(window);
        module.exports = global.document ?
            factory(global, true) :
            function(w) {
                if (!w.document) {
                    console.error("%c[EnderLibrary] Error (Fatal):", 'font-weight: 900;', "EnderLibrary requires a window with a document!");
                    throw new Error("EnderLibrary has been stopped!");
                }
                return factory(w);
            };
    } else {
        factory(global);
    }
})(typeof window !== "undefined" ? window : this, function(window, noGlobal) {
    function SettingsObject() {
        this.settings = {
            message: {
                all: true,
                error: true,
                warn: true,
                normal: true
            },
            ResourceRequest: true
        }
    }
    window.SettingsObject = SettingsObject;
    var locked = false,
        _callback = undefined,
        _EnderSettings = new SettingsObject().settings;
    const envi = {
        message: {
            error: function(message, type) {
                if (_EnderSettings.message.all && _EnderSettings.message.error)
                    console.error(`%c[EnderLibrary] Error (${type}):`, 'font-weight: 900;', message);
            },
            warn: function(message, type) {
                if (_EnderSettings.message.all && _EnderSettings.message.warn)
                    console.warn(`%c[EnderLibrary] Warning (${type}):`, 'font-weight: 900;', message);
            },
            normal: function(message, type) {
                if (_EnderSettings.message.all && _EnderSettings.message.normal)
                    console.log(`%c[EnderLibrary] Message (${type}):`, 'font-weight: 900;', message);
            }
        }
    };

    window.EnderLibrary = {
        lock: function(callback) { //callback(isSet, didFire);
            if (typeof callback === "function")
                try {
                    locked = true;
                    callback(true, false);
                    _callback = callback;
                    envi.message.warn("The environment has been locked!", "Security");
                } catch (e) {
                    envi.message.error("Failed to lock the environment!", "Security - Fatal");
                    callback(false, false, e);
                }
            else
                envi.message.error("Failed to lock the environment!\nThe callback function was not received properly.", "Security - Fatal");
        },
        changeSettings: function(settingsObject) {
            if (!locked) {
                if (SettingsObject.prototype.isPrototypeOf(settingsObject)) {
                    _EnderSettings = settingsObject.settings;
                    envi.message.normal("The environment settings have been changed!", "Confirmation");
                } else {
                    envi.message.error("The changeSettings() function requires a SettingsObject object to be passed!", "Input");
                }
            } else {
                _callback(true, true);
                envi.message.error("The request to change the settings has been rejected, EnderLibrary is in lock-mode!", "Security - Fatal");
            }
        },
        isPageSecure: function(callback) { //callback(result, score);
            //Do a security check!
            //The `result` variable can be set to true/false
            //The `score` variable shows how many tests did the browser/website pass
            if (typeof callback === "function") {
                envi.message.warn("The isPageSecure() function is not ready yet!", "Functionality");
                var _ = 0;
                if (location.protocol === 'https:')
                    _++;
                callback(_ == 1, _);
            } else {
                envi.message.error("The isSecure() function requires a valid callback function to be passed!", "Input");
            }
        },
        cookies: {
            set: function(cname, cvalue, exdays) {
                var d = new Date();
                d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
                document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/`;
            },
            get: function(cname) {
                cname = cname + "=";
                var ca = decodeURIComponent(document.cookie).split(';');
                for (var i = 0; i < ca.length; i++) {
                    var c = ca[i];
                    while (c.charAt(0) == ' ') {
                        c = c.substring(1);
                    }
                    if (c.indexOf(cname) == 0)
                        return c.substring(cname.length, c.length);
                }
                return undefined;
            },
            remove: function(cname) {
                var d = new Date();
                d.setTime(d.getTime() - 31449600000);
                document.cookie = `${cname}=0;expires=${d.toUTCString()};path=/`;
            }
        }
    };

    /*document.contentSecurityPolicy = {
        //block-all-mixed-content
        //upgrade-insecure-requests
        //plugin-types
        //default-src


        //frame-src
        //worker-src
        //connect-src
        //font-src
        //img-src
        //manifest-src
        //media-src
        //object-src
        //script-src
        //style-src
        //base-uri
        //sandbox
        //form-action
        //frame-ancestors



        //<meta http-equiv="Content-Security-Policy" content="script-src 'self' 'unsafe-inline' https://*.youtube.com https://youtube.com;">
    };*/

    //[START] Defined the Objects
    function ResourceRequest(url, settings) {
        if (_EnderSettings.ResourceRequest == true) {
            this.isSet = true;
            this.url = url;
        } else {
            envi.message.error("The ResourceRequest Object is disabled!", "Rules Violation");
            this.isSet = false;
        }
    }

    function GlobalClassList(_this) {
        this.globalSelector = _this;
        this.elements = this.globalSelector.getAllElements();
    }
    //[END] Defined the Objects

    //[START] Make the Objects global as necessary
    window.ResourceRequest = ResourceRequest;
    //[END] Make the Objects global as necessary


    //[START] HTMLElement
    HTMLElement.prototype.destroy = function() {
        if (this != document.documentElement) {
            if (this == document.body || this == document.head) {
                envi.message.warn("It's not recommended to use <element>.destroy() with the <head> and <body> Elements!", "Violation");
                this.innerHTML = "";
            } else
                this.outerHTML = "";
        } else
            envi.message.error("<element>.destroy() can't be used on the Document Element (<html>)!", "Exception");
    };
    HTMLElement.prototype.insertElement = function(element, isFirst = false) {
        if (typeof element.length !== "number") {
            !isFirst ? this.appendChild(element) : this.insertBefore(element, this.firstChild);
        } else {
            element.reverse();
            element.forEach((elm) => {
                !isFirst ? this.appendChild(elm) : this.insertBefore(elm, this.firstChild);
            });
        }
    };
    HTMLElement.prototype.insertCSS = function(code) {
        var temp = document.createElement("style");
        if (typeof code != "string" && typeof code.length === "number") {
            var tem2 = "";
            code.forEach(function(c) {
                tem2 += `${c}\n`
            });
            code = tem2;
            delete tem2;
        }
        temp.innerText = code;
        this.appendChild(temp);
        delete temp;
    };
    HTMLElement.prototype.executeJavaScript = function(code) {
        var temp = document.createElement("script");
        if (typeof code != "string" && typeof code.length === "number") {
            var tem2 = "";
            code.forEach(function(c) {
                tem2 += `${c}\n`
            });
            code = tem2;
            delete tem2;
        }
        temp.innerText = code;
        this.appendChild(temp);
        delete temp;
    };
    HTMLElement.prototype.disableUserInteraction = function() {
        this.style.pointerEvents = "none";
        this.style.userSelect = "none";
        this.setAttribute('draggable', false);
    };
    HTMLElement.prototype.enableUserInteraction = function() {
        this.style.pointerEvents = "auto";
        this.style.userSelect = "auto";
        this.removeAttribute('draggable');
    };
    HTMLElement.prototype.getGlobalClassList = function() {
        return new GlobalClassList(this);
    };
    HTMLElement.prototype.getAllElements = function() {
        return this.querySelectorAll("*").toArray();
    };
    //[END] HTMLElement

    //[START] GlobalClassList
    GlobalClassList.prototype.remove = function(...args) {
        this.elements.forEach(function(elm) {
            elm.classList.remove(...args);
        });
    };
    GlobalClassList.prototype.add = function(...args) {
        this.elements.forEach(function(elm) {
            elm.classList.add(...args);
        });
    };
    GlobalClassList.prototype.replace = function(oldClass, newClass) {
        this.elements.forEach(function(elm) {
            if (elm.classList.contains(oldClass)) {
                elm.classList.remove(oldClass);
                elm.classList.add(newClass);
            }
        });
    };
    //[END] GlobalClassList

    //[START] NodeList
    NodeList.prototype.toArray = function() {
        return Array.prototype.slice.call(this);
    };
    //[END] NodeList

    //[START] HTMLCollection
    HTMLCollection.prototype.toArray = function() {
        return Array.prototype.slice.call(this);
    };
    //[END] HTMLCollection

    //[START] HTMLAllCollection
    HTMLAllCollection.prototype.toArray = function() {
        return Array.prototype.slice.call(this);
    };
    //[END] HTMLAllCollection


    //[START] Array
    Array.prototype.empty = function() {
        var l = this.length;
        for (var i = 0; i < l; i++) {
            this.pop();
        }
        delete l;
    };
    Array.prototype.wildReplace = function(arg1, arg2) {
        for (var i = 0; i < this.length; i++)
            try {
                this[i] = this[i].replace(arg1, arg2);
            } catch {
                this[i] = Number(String(this[i]).replace(arg1, arg2));
            }
    };
    //[END] Array

    //[START] String
    String.prototype.toHTML = function() {
        var doc = (new DOMParser()).parseFromString(this, 'text/html');
        var elements = doc.querySelectorAll('body *');
        if (elements.length == 0) {
            return undefined;
        } else if (elements.length == 1) {
            return elements[0];
        } else {
            return elements;
        }
        //return (new DOMParser()).parseFromString(string, 'text/html');
    };
    //[END] String

    //WebAssembly;
});