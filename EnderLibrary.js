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

    console.warn("This library is not ready for use yet! Please don't use it in your serious projects.");

    function SettingsObject() {
        this.settings = {
            message: {
                all: true,
                error: true,
                warn: true,
                normal: true
            },
            resources: false, //exp
            resourceRequest: true
        }
    }
    window.SettingsObject = SettingsObject;
    var locked = false,
        _callback = undefined,
        _EnderSettings = new SettingsObject().settings;
    const dynamicVariables = {
        originalURL: window.location.href,
        originalPathname: window.location.pathname,
        originalHash: window.location.hash,
        originalSearch: window.location.search,
        protocol: "not-dynamic"
    };
    const envi = {
        message: {
            error: function(message, type) {
                if (_EnderSettings.message.all && _EnderSettings.message.error)
                    console.error(`%c[EnderLibrary] Error (${type}):`, 'font-weight: 900;', message); //Change this to an Error object
            },
            warn: function(message, type) {
                if (_EnderSettings.message.all && _EnderSettings.message.warn)
                    console.warn(`%c[EnderLibrary] Warning (${type}):`, 'font-weight: 900;', message);
            },
            normal: function(message, type) {
                if (_EnderSettings.message.all && _EnderSettings.message.normal)
                    console.log(`%c[EnderLibrary] Message (${type}):`, 'font-weight: 900;', message);
            }
        },
        events: {
            "loading-start": [],
            "loading-end": [],
            "protocol-change": [],
            "loading-failed": [],
            "content-loaded": [],
            "content-inserted": []
        },
        fireEvent(event, ...args) {
            forEach(envi.events[event], function(callback) {
                callback.apply(null, args);
            });
        },
        _events: {
            dynamicLinks: function(e) {
                if (e.target.tagName == "A" && e.target.getAttribute("target") != "_blank") {
                    e.preventDefault();
                    window.location.dynamic.href = e.target.href;
                }
            }
        },
        parse: function(code) {
            var isInside = false;
            code = code.replace(/\s+|\(+|\)/g, v => (v == "(") ? (inside = true, "(") : ((v == ")") ? (inside = false, ")") : ((inside) ? " " : "")));
            delete isInside;
            if (code.indexOf("@@") != 0)
                throw Error("Invalid Value!");
            code = code.split("@@");
            code.shift();
            for (var i = 0; i < code.length; i++)
                code[i] = code[i].split(/\((.*?)\)/g).filter(v => v != "");
            return code;
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
        isPageSecure: function(callback) { //callback(result, score); NOT READY
            throw Error("Incomplete!");
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

    window.forEach = function(parent, callback) {
        if (parent.constructor === ({}).constructor)
            for (var i in parent)
                callback(i);
        else
            for (var i = 0; i < parent.length; i++)
                callback(parent[i]);
    };

    var loadDynamically = function(url, replace = false) {
            envi.fireEvent("loading-start", {
                url: url,
                isReplacement: replace
            });
            if (url.indexOf(window.location.origin) + url.indexOf("http:") + url.indexOf("https:") <= -2 || (new URL(url)).origin == window.location.origin) {
                changePageContent(url, function() {
                    try {
                        window.history[replace ? "replaceState" : "pushState"]({}, "", (url.indexOf("http") < 0) ? url + ((url.indexOf("?") + url.indexOf("#") == -2 && url[url.length - 1] != "/") ? "/" : "") : url);
                    } catch (e) {
                        envi.fireEvent("loading-failed", -1, e);
                    }
                });
            } else {
                window.location.href = url;
            }
        },
        prevent = {
            do: false,
            doID: 0,
            pDo(id) {
                if (id == this.doID)
                    this.do = true;
            }
        },
        changePageContent = function(url, callback) {
            prevent.filter = false;
            prevent.insert = false;
            prevent.doID++;
            try {
                const te = prevent.doID;
                var xhr = new XMLHttpRequest();
                xhr.onreadystatechange = function() {
                    if (xhr.readyState === XMLHttpRequest.DONE) {
                        var status = xhr.status;
                        if (status === 0 || (status >= 200 && status < 400)) {
                            var content = (new DOMParser()).parseFromString(xhr.responseText, "text/html");
                            envi.fireEvent("content-loaded", {
                                content: content,
                                preventInsert() {
                                    prevent.pDo(te);
                                },
                                url: new URL(xhr.responseURL),
                                status: status,
                                refresh: window.location.dynamic.links.refresh
                            });
                            setTimeout(function() {
                                filterPageContent(content, callback);
                            }, 100)
                            delete xhr;
                        } else {
                            //Failed!
                            envi.fireEvent("loading-failed", 0, xhr.status);
                            delete xhr;
                        }
                    }
                };
                xhr.open('GET', ((url.indexOf("http") < 0) ? (function() {
                    var temp = url + ((url.indexOf("?") + url.indexOf("#") == -2 && url[url.length - 1] != "/") ? "/" : "");
                    return window.location.href + temp;
                })() : url));
                xhr.send();
            } catch (e) {
                envi.fireEvent("loading-failed", 0, e);
            }
            //The callback should be called only if the content loads successfully!
        },
        filterPageContent = function(content, callback) {
            //Filter the content to the default format
            var temp = {
                _title: content.title,
                _attributes: {
                    documentElement: {},
                    body: {},
                    head: {},
                },
                _undefined: []
            };
            try {
                //The `_dynamic` attribute is used in the default filtering process.
                //It can tell the library where each element belongs in the page!
                //It will find currently existing elements in the page with the
                //same dynamic type and replace them with the new ones! Dynamic
                //elements, that do not have a replacment within the new page
                //content, will be removed from the current page! Dynamic elements
                //that have not been assigned a type will be inserted at the bottom
                //of the <body> element!
                //The dynamic attribute can also use selectors to tell the library
                //where to insert this element. In case a selector returns an empty
                //result, it will be inserted in the bottom of the document. (Unless
                //it's a strict one!)

                //_dynamic="@@(selector)(#myElement)" ==> This means that this element
                //will be inserted in the element with the ID "myElement". If no such
                //element is found, it will be inserted at the bottom of the document.

                //_dynamic="@@(!selector)(#myElement)" ==> This means that this element
                //will be inserted in the element with the ID "myElement". However, this
                //is a strict selector, meaning that the element will not be inserted
                //into the page if not match is found for the selector!

                //_dynamic="@@(selector)(.myElement)" ==> This means that this element
                //will be inserted in the element with the class name "myElement". If no such
                //element is found, it will be inserted at the bottom of the document.
                //And if there is more than one matching result, it will be inserted into the
                //bottom of the document. And if an index is specified, it will be inserted
                //in that index (if it was present). (NOTE: if this was a strict selector, and
                //no index was present, the element will not be inserted!)

                //To specify an index, you could do this:
                //_dynamic="@@(selector)(.myElement)[0]"

                //_dynamic="@@(!selector)(.myElement)" ==> This means that this element
                //will be inserted in the element with the class name "myElement". However
                //, this is a strict selector, meaning that the element will not be inserted
                //into the page if not match is found for the selector, or if there are more
                //than matching result!

                //_dynamic="@@(resource)(<type>)" ==> resource will be inserted to the page
                //according to the type!
                //Style resources will be inserted in the <head> element, and Scripts will
                //be inserted at the bottom of <body>. If a dynamic resource loads an already
                //existing resource in the page, it will not be inserted!

                //_dynamic="@@(!resource)(<type>)" ==> if the resource is strict, it will
                //replace the already loaded resource.

                //Meta resources will be inserted at the top of the page! (Remeber, meta data is
                //not important in most of the use cases, so don't just add Meta tags randomly)

                //_dynamic="@@(!resource)(<type>) @@(rule)(unload)" ==> rules are, well, rules
                //that the library will not break -no matter the condition-.
                //The 'unload' rule means that the specified dynamic element will be unloaded/
                //removed once the page content changes.
                //The 'constant' rule means that once this dynamic element is loaded, it will
                //never be removed, even when a strict selector is trying to remove it!

                content.querySelectorAll("[_dynamic]").toArray().forEach(function(elm) { //_dynamic="[type]"
                    var tem = elm.getAttribute("_dynamic");
                    if (tem.replace(/\s/g, "").indexOf("@@") == 0)
                        tem = "_withCommand";
                    else
                        tem = (tem == "") ? "_undefined" : tem;
                    if (temp[tem] == undefined)
                        temp[tem] = [];
                    temp[tem].push(elm.outerHTML);
                    elm.destroy(); //This should prevent duplicating elements!
                    delete tem;
                });
                [
                    [content.documentElement.attributes, "documentElement"],
                    [content.body.attributes, "body"],
                    [content.head.attributes, "head"]
                ].forEach(function(attrs) {
                    forEach(attrs[0], function(te) {
                        temp._attributes[attrs[1]][te.name] = te.textContent;
                    });
                });
            } catch (e) {
                envi.fireEvent("loading-failed", 1, e);
            }
            if (!prevent.do)
                insertPageContent(temp, callback);
            else
                callback();
        },
        insertPageContent = function(content, callback) { //Incomplete
            //Insert the content according to the default format
            /*document.getElementsByName("_dynamic").toArray().forEach(function(elm) {
                try {
                    elm.destroy();
                } catch (error) { //debug
                    console.log(elm);
                    throw error;
                }
            });*/
            try {
                document.title = content._title;
                callback();
                [
                    [document.documentElement, "documentElement"],
                    [document.body, "body"],
                    [document.head, "head"]
                ].forEach(function(elm) {
                    forEach(elm[0].attributes, function(attr) {
                        elm[0].removeAttribute(attr.name);
                    });
                    forEach(content._attributes[elm[1]], function(attr) {
                        elm[0].setAttribute(attr, content._attributes[elm[1]][attr]);
                    });
                });
                for (var name in content) {
                    //console.log(name);
                    //console.log(content[name]);
                    if (name.indexOf("_") != 0) {
                        //console.log(content[name]);
                        document.querySelector(`[_dynamic="${name}"]`).outerHTML = content[name];
                    } else if (name == "_withCommand") {
                        try {
                            content[name].forEach(function(elm) {
                                elm = elm.toHTMLElement();
                                var data = envi.parse(elm.getAttribute("_dynamic"));
                                //You need to start writing the logic of the commands!
                                throw Error("Incomplete!");
                            });
                            delete data;
                        } catch (e) {
                            envi.message.error(e, "Dynamic Syntax Error");
                        }
                        //You need to use the command parser
                    }
                }
                //[END] Temp
            } catch (e) {
                envi.fireEvent("loading-failed", 2, e);
            }
            if (window.location.dynamic.protocol == "fully-dynamic")
                window.location.dynamic.links.refresh();
            envi.fireEvent("loading-end");
        };

    window.onpopstate = function(event) {
        loadDynamically(window.location.href, true);
    };

    window.location.dynamic = { //The dynamic location object is used to control stuff when the
        //dynamic protocol is set to either 'dynamic' or 'fully-dynamic'
        //The goal of this object is to control how the page behaves when loading sutff.
        //It can be used as a way to "Ajax load" the page when changing the Page URL.
        links: {
            get _eventFunction() {
                return envi._events.dynamicLinks;
            },
            refresh() { //Update the links in the page!
                removeEventListener('click', this._eventFunction);
                addEventListener('click', this._eventFunction);
            }
        },
        set protocol(value) { //The protocol of the dynamic object changes how the page works when it comes to dynamic loading
            //The values of protocol can be "fully-dynamic", "dynamic", or "not-dynamic"
            //The default value is "not-dynamic",
            //This variable is interchangeable, meaning that you can change the way this website behaves when loading
            var old = dynamicVariables.protocol;
            value = value.replace(/\s/g, "");
            if (value == "not-dynamic") {
                dynamicVariables.protocol = value;
                dynamicVariables.originalURL = window.location.href;
                dynamicVariables.originalPathname = window.location.pathname;
                dynamicVariables.originalHash = window.location.hash;
                dynamicVariables.originalSearch = window.location.search;
            } else if (value == "dynamic") {
                dynamicVariables.protocol = value;
                //When the value is set to dynamic, the page will always load dynamically except when
                //there is a search change in the URL
            } else if (value == "fully-dynamic") {
                dynamicVariables.protocol = value;
            } else {
                envi.message.error("The allowed dynamic protocols are 'not-dynamic', 'semi-dynamic', and 'fully-dynamic'!", "Input");
            }
            if (value != old)
                envi.fireEvent("protocol-change");
            delete old;

            removeEventListener('click', envi._events.dynamicLinks);
            if (window.location.dynamic.protocol == "fully-dynamic")
                addEventListener('click', envi._events.dynamicLinks);
        },
        get protocol() {
            return dynamicVariables.protocol;
        },
        assign(URL) { //?
            this.href = URL;
        },
        set href(value) {
            if (this.protocol != "not-dynamic") {
                if (this.protocol == "fully-dynamic" || ((value.indexOf("?") < 0 || value.indexOf("#") > value.indexOf("?")) ? true : ((window.location.search == "") ? false : ((window.location.search == value.substring(value.indexOf("?"), (value.indexOf("#") != -1) ? value.indexOf("#") : value.length)) ? true : false))))
                    loadDynamically(value, false);
                else
                    window.location.href = value;
            } else
                window.location.href = value;
        },
        get href() {
            return window.location.href;
        },
        get _href() { //The value of the original href before leaving the `not-dynamic` protocol
            return dynamicVariables.originalURL
        },
        get _pathname() {
            return dynamicVariables.originalPathname
        }, //The value of the original pathname that this page was loaded with
        reload() {
            this.href = this.href;
        },
        replace(value) {
            loadDynamically(value, true);
        },
        set search(value) {
            if (this.protocol == "fully-dynamic") { //You still need to find a way to post to your server dynamiclly
                if (window.location.href.indexOf("?") == -1)
                    loadDynamically(window.location.href + "?" + value);
                else {
                    loadDynamically(window.location.href.substring(0, window.location.href.indexOf("?") + 1) + value);
                }
            } else {
                window.location.search = value;
            }
        },
        get search() {
            return window.location.search;
        },
        get _search() { //The value of the original search before leaving the `not-dynamic` protocol
            return dynamicVariables.originalSearch
        },
        //hash: null, //Still functional in window.location
        get _hash() { //The value of the original hash before leaving the `not-dynamic` protocol
            return dynamicVariables.originalHash
        },
        on(event, callback) {
            if (typeof callback == "function") {
                if (event == "loading-start" || event == "loading-end" || event == "protocol-change" || event == "loading-failed" || event == "content-loaded") {
                    envi.events[event].push(callback);
                } else
                    envi.message.error(`There is no '${event}' event for the dynamic location object!`, "Event Handler");
            } else
                envi.message.error(`You need a valid callback function!`, "Input");
        }
    };

    window.document.cookies = {
        set: function(cname, cvalue = "", exdays = 30) {
            var d = new Date();
            d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
            document.cookie = `${cname}=${cvalue};expires=${d.toUTCString()};path=/`;
        },
        get: function(cname) {
            cname = cname + "=";
            var r = undefined;
            forEach(decodeURIComponent(document.cookie).split(';'), function(c) {
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(cname) == 0)
                    r = c.substring(cname.length, c.length);
            });
            return r;
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
            forEach(query, function(pair) {
                pair = pair.split('=');
                if (name == "*" && pair[0] != "") {
                    params[pair[0]] = decodeURIComponent(pair[1]);
                } else if (pair[0] == name) {
                    params[pair[0]] = decodeURIComponent(pair[1]);
                }
            })
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
            obj.tag = "@@(rule)(ignore-attr)";
            this.temp = obj;
        } else {
            envi.message.error("The ElementTemplate object requires a tag to work!", "Input");
        }
    }

    ElementTemplate.prototype.createElement = function() {
        var temp = document.createElement(this.tag);
        for (var attr in this.temp) {
            if (this.temp[attr] != "@@(rule)(ignore-attr)" && attr != "_content")
                temp.setAttribute(attr, this.temp[attr]);
            else if (attr == "_content")
                temp.innerHTML = this.temp[attr];
        }
        return temp;
    };

    function ResourceRequest(url, settings) {
        if (_EnderSettings.resourceRequest == true) {
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
    window.resourceRequest = ResourceRequest;
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
        this.setAttribute('draggable', true);
    };
    HTMLElement.prototype.getGlobalClassList = function() {
        return new GlobalClassList(this);
    };
    HTMLElement.prototype.getAllElements = function() {
        return this.querySelectorAll("*").toArray();
    };
    HTMLElement.prototype.getTopLevelElements = function() {
        var elms = this.getAllElements(),
            _this = this,
            _elms = [];
        forEach(elms, function(elm) {
            if (elm.parentElement == _this)
                _elms.push(elm);
        });
        delete elms, _this;
        return _elms;
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
    String.prototype.toHTMLElement = function() {
        var doc = (new DOMParser()).parseFromString(this, 'text/html'),
            elements = doc.body.getTopLevelElements();
        if (elements.length == 0) {
            return undefined;
        } else if (elements.length == 1) {
            return elements[0];
        } else {
            return elements;
        }
    };
    //[END] String

    //WebAssembly;
});