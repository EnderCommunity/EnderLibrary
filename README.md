# EnderLibrary

A JavaScript library that is meant to simplify things a bit.

Here is the documentation of EnderLibrary:

## The `SettingsObject()` Object

You can use the `SettingsObject()` Object to change the current framework settings safely. You are only allowed to change the settings using this object so you can lock them whenever you want!

```js
var defaultSettings = new SettingsObject(); //The SettingsObject always returns a fresh object with the default settings of the library.
defaultSettings.settings.message.all = false; //This means that the library will not show any messages in the console
```

You, of course, need to pass the new object to the library to change the settings.

The output object is the following:

```js
{
    settings: {
        message: {
            all: true,
            error: true,
            warn: true,
            normal: true,
        },
        resources: false,
        resourceRequest: true
    }
}
```

### The Global `EnderLibrary` Object

You can use this object to communicate with the library when you need to make changes to the way it works.

```js
{
    lock: function(callback) { ... }, //callback(isSet, didFire), `isSet` is a boolean that tells you if the environment settings were locked properly or not. and `didFire` is a boolean that tells you if there was an attempt to change the environment settings while it's locked!
    changeSettings: function(settingsObject) { ... }, //You can pass the SettingsObject with the changes you did to the environment using this function 
    isPageSecure: function(callback) { ... } //callback(result, score), this function is not ready yet, it'll be used to measure how secure the page is
}
```

## `forEach()`

in addition to the normal forEach, you can use this function for all types of objects:

```js
forEach(Object, function(item){
    //Do stuff
});
```

## Cookies

You can get, set, and remove cookies using these functions without the need to parse the cookies string:

```js
document.cookies.set(cookieName); // This will set a cookie with the value of an empty string (""), and it will expire in 30 days
document.cookies.set(cookieName, cookieValue); //This cookie will expire in 30 days too
document.cookies.set(cookieName, cookieValue, expirationInDays);//You can, of course, change the time before this cookie expires
document.cookies.get(cookieName); //This will return the value of this cookie
document.cookies.remove(cookieName); //This will remove the specified cookie
```

## URL Parameters

You can get the values of the URL parameters without the need to parse the search string:

```js
document.parameters.get(parameterName); //This will return the value of the parameter
document.parameters.get("*"); //This will return a JSON object with all the values of all URL parameters
```

## Element Templates

You can create element templates for repetitive elements:

```js
var myTemplate = document.createElementTemplate({ //This function will return an ElementTemplate object
    tag: "div"
    class: "myClass1 myClass2",
    name: "rep",
    _content: "Some Random Bullshit"
});
var element1 = myTemplate.createElement(), //You can use the `createElement()` function on the ElementTemplate object to generate the element itself
    element2 = myTemplate.createElement(); //You are not limited in numbers at all
```

## The `<document-resource>` element **(Not functional yet!)**

This is still an experimental feature, it's not coded yet, and it might be canceled!

```js
document.resources;  //Not functional yet! This is a JSON object that will contain all the resources loaded using the <document-resource> element

```

## The doucment `contentSecurityPolicy` object **(Not functional yet!)**

This object is not coded yet, as it might actually be a really bad idea to enourge the user to use this feature!

```js
document.contentSecurityPolicy; //Not functional yet!
```

## The `ResourceRequest` object **(Not functional yet!)**

This object is not coded yet, it will be used to make requests for resources in the page. The reason to introduce this object is so the user can easily block requests using the environment settings.

```js
var resourceRequest = new ResourceRequest(url, settings); //Not functional yet!
```

## The `GlobalClassList` object

You can use this object to make classList changes on a global scale to an element:

```js
var posts = document.getElementById("posts-container").getGlobalClassList(); //You can use the `getGlobalClassList()` function on an element to select all elements inside it!
posts.remove(class1, class2, ...);
posts.add(class1, class2, ...);
posts.replace(oldClass, newClass);
```

## `<element>.destroy()`

This is simply the same as doing `<element>.outerHTML = ""`!

## `<element>.insertElement()`

You can use this function to insert elements inside the selected parent element:

```js
var myNewElement1 = document.createElement("div"), myNewElement2 = document.createElement("div");
document.body.insertElement(myNewElement1); //This element will be inserted at the bottom of the parent element (In this case, it's the <body> element)
document.body.insertElement(myNewElement2, true); //This element will also be inserted to the parent element, but at the top of it! The second argument is used to tell the insert function where to insert the element (false ==> bottom, true ==> top). The default value is false.
```

## `<element>.insertCSS()`

This will insert your CSS code in a style tag inside the specified element!

## `<element>.executeJavaScript()`

This will insert your JS code in a script tag inside the specified element!

## `<element>.disableUserInteraction()`

This will set the `pointer-events` and `user-select` values to "none", and will set the draggable attribute to "false". This means that the user can't interact with this element at all!

## `<element>.enableUserInteraction()`

This will set the `pointer-events` and `user-select` values to "auto", and will set the draggable attribute to "true".

## `<element>.getAllElements()`

This will return an array of all elements inside the specified parent element!

## `<Object>.toArray()`

It has been generalised to include more types of objects!

## `<Array>.empty()`

This will empty the specified array!

## `<Array>.wildReplace()`

This will replace strings on a global space in the Array! (It works like the normal replace function, but it applys to all the members of the array)

## `<String>.toDOMElement()`

This will convert the specified string to a normal HTML element and return it.

## The `dynamic` location object **(Not Ready Yet!)**

You can use this object to change the loading behaviour of the page and the website! Dynamic loading is basically making it so the website never has to load the same resources all over again whenever you change the page. (You might know this kind of loading as Ajax loading)

There are three protocols for the dynamic loading object:
`"not-dynamic"`, `"dynamic"`, and `"fully-dynamic"`!

The `"not-dynamic"` protocol is the default protocol used whenever you load the library! It means that dynamic loading is disabled by default.

In the `"dynamic"` protocol, the page will load dynamically whenever the pathname changes - unless it contains search arguments in the URL, e.g. <https://example.com/?name=c> -. By default, it will follow the filtering process. You can prevent that by listening to the 'content-loaded' event and prevent the next step (It's not recommended that you do that, as EnderLibrary has a good enough automatic filtering system for most use cases):

```js
window.location.dynamic.on('content-loaded', function(e){ //This event is fired when the content of the targeted page is loaded (with no modifications)
    e.preventInsert(); //This will prevent the library from inserting the content to the page
    e.content; //You can do what you see more fitting with the content of the page!
})
```

The `"fully-dynamic"` protocol doesn't care about the search arguments, it will always load dynamically! And links in the page itself will be automatically loaded dynamiclly when pressed, so you don't have to deal with them manually.

However, you should always use the refresh function whenever you modify the DOM content of the page:

```js
window.location.dynamic.links.refresh(); //This function is applied automatically when the page content is inserted by the default loading process. But if you change the DOM content by yourself, new elements aren't effected by the current protocol unless you run this command.
removeEventListener('click', window.location.dynamic.links._eventFunction); //If you wish to modify an element, you can use the _eventFunction variable to remove the eventListner that was set my the library!
```

You can change the protocol whenever you wish to do so, you can just change the value of the protocol variable:

```js
window.location.dynamic.protocol = "not-dynamic"; //Disable dynamic loading
window.location.dynamic.protocol = "dynamic"; //Enable dynamic loading
window.location.dynamic.protocol = "fully-dynamic"; //Enable full dynamic loading
```

You can change the page URL when the dynamic protocol is enabled just like this:

```js
window.location.dynamic.assign(url);
/*or*/
window.location.dynamic.href = url;

window.location.dynamic.reload(); //You could also reload the page using this
```

If you wish to retrieve the value of the last url before switching to the dynamic protocol, you can use the `_href` variable:

```js
window.location.dynamic._href;
window.location.dynamic._pathname;
window.location.dynamic._search;
window.location.dynamic._hash;
```

The search function only works with the `"fully-dynamic"` protocol:

```js
window.location.dynamic.search = "?name=value";
window.location.hash = "hmm"; //There is no hash variable for the dynamic object, as the normal hash object is still 100% functional!
```

There are many events for the dynamic object:

```js
window.location.dynamic.on('protocol-change', function(){ //Fired when the dynamic protocol changes
    //Your Code
});
window.location.dynamic.on('loading-start', function(e){ //Fired when a loading attempt is made
    e.url; //The target URL
    e.isReplacement; //Is this URL a replacement for the current URL history
});
window.location.dynamic.on('loading-end', function(){ //Fired when a loading process is finished successfully
    //Your Code
});
window.location.dynamic.on('loading-failed', function(stageCode, error){ //Fired when a loading process fails
    if(stageCode == -1){
        //Failed at the targeting stage, probably because of a cross-domain or a security policy!
    }else if(stageCode == 0){
        //Failed when trying to load the page content, could be a problem with the connection!
    }else if(stageCode == 1){
        //Failed while trying to filter the page content!
    }else if(stageCode == 2){
        //Failed while trying to insert the page content!
    }
});
window.location.dynamic.on('content-loaded', function(e){ //Fired when the content of the targeted page is loaded, but not yet filtered or inserted into the page!
    e.content; //The content of hte page
    e.preventInsert(); //A function to prevent the content from being inserted into the page
    e.status; //The request status code
    e.refresh(); //The links refresh function (window.location.dynamic.links.refresh)
});
```
