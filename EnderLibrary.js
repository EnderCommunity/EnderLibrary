/* EnderLibrary v0.0.1 */
(function(global, factory) {
    "use strict";
    if (typeof module === "object" && typeof module.exports === "object") {
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
            resources: false, //exp
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
        }
    };

    window.document.cookies = {
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
    };

    window.document.parameters = {
        get: function(name = "*", link = window.location.href) {
            var params = {},
                query = (new URL(link)).search.substring(1).split('&');
            for (var i = 0; i < query.length; i++) {
                var pair = query[i].split('=');
                if (name == "*" && pair[0] != "") {
                    params[pair[0]] = decodeURIComponent(pair[1]);
                } else if (pair[0] == name) {
                    params[pair[0]] = decodeURIComponent(pair[1]);
                }
                delete pair;
            }

            return (name == "*") ? params : params[name];

            //https://gomakethings.com/getting-all-query-string-values-from-a-url-with-vanilla-js/
        }
    };

    window.document.createElementTemplate = function(obj) {
        return new ElementTemplate(obj);
    };

    //_EnderSettings
    //<resource>
    class ResourceElement extends HTMLElement {
        set src(link) {
            this.setAttribute("src", link);
        }
        get src() {
            return this.getAttribute("src");
        }
        constructor() {
            super();
            console.log("test");
        }
    }

    customElements.define('document-resource', ResourceElement);

    document.resources = {
        //
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
    function ElementTemplate(obj) {
        if (obj.tag != undefined && obj.tag.replace(/\s/g, "") != "") {
            this.tag = obj.tag.replace(/\s/g, "");
            obj.tag = "@@(rule)(--ignore-attr)";
            this.temp = obj;
        } else {
            envi.message.error("The ElementTemplate object requires a tag to work!", "Input");
        }
    }

    ElementTemplate.prototype.createElement = function() {
        var temp = document.createElement(this.tag);
        for (var attr in this.temp) {
            if (this.temp[attr] != "@@(rule)(--ignore-attr)" && attr != "_content")
                temp.setAttribute(attr, this.temp[attr]);
            else if (attr == "_content")
                temp.innerHTML = this.temp[attr];
        }
        return temp;
    };

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
        if (element == undefined) {
            envi.message.error("The element argument is missing!", "Input");
        } else if (typeof element.length !== "number") {
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