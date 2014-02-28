var IPython = IPython || {};

IPython.version = "2.0.0-dev";

IPython.namespace = function (ns_string) {
    "use strict";

    var parts = ns_string.split('.'),
        parent = IPython,
        i;

    // String redundant leading global
    if (parts[0] === "IPython") {
        parts = parts.slice(1);
    }

    for (i=0; i<parts.length; i+=1) {
        // Create property if it doesn't exist
        if (typeof parent[parts[i]] === "undefined") {
            parent[parts[i]] = {};
        }
    }
    return parent;
};

//----------------------------------------------------------------------------
//  Copyright (C) 2008-2012  The IPython Development Team
//
//  Distributed under the terms of the BSD License.  The full license is in
//  the file COPYING, distributed as part of this software.
//----------------------------------------------------------------------------

//============================================================================
// Utilities
//============================================================================
IPython.namespace('IPython.utils');

IPython.utils = (function (IPython) {
    "use strict";

    IPython.load_extensions = function () {
        // load one or more IPython notebook extensions with requirejs

        var extensions = [];
        var extension_names = arguments;
        for (var i = 0; i < extension_names.length; i++) {
            extensions.push("nbextensions/" + arguments[i]);
        }

        require(extensions,
            function () {
                for (var i = 0; i < arguments.length; i++) {
                    var ext = arguments[i];
                    var ext_name = extension_names[i];
                    // success callback
                    console.log("Loaded extension: " + ext_name);
                    if (ext && ext.load_ipython_extension !== undefined) {
                        ext.load_ipython_extension();
                    }
                }
            },
            function (err) {
                // failure callback
                console.log("Failed to load extension(s):", err.requireModules, err);
            }
        );
    };

    //============================================================================
    // Cross-browser RegEx Split
    //============================================================================

    // This code has been MODIFIED from the code licensed below to not replace the
    // default browser split.  The license is reproduced here.

    // see http://blog.stevenlevithan.com/archives/cross-browser-split for more info:
    /*!
     * Cross-Browser Split 1.1.1
     * Copyright 2007-2012 Steven Levithan <stevenlevithan.com>
     * Available under the MIT License
     * ECMAScript compliant, uniform cross-browser split method
     */

    /**
     * Splits a string into an array of strings using a regex or string
     * separator. Matches of the separator are not included in the result array.
     * However, if `separator` is a regex that contains capturing groups,
     * backreferences are spliced into the result each time `separator` is
     * matched. Fixes browser bugs compared to the native
     * `String.prototype.split` and can be used reliably cross-browser.
     * @param {String} str String to split.
     * @param {RegExp|String} separator Regex or string to use for separating
     *     the string.
     * @param {Number} [limit] Maximum number of items to include in the result
     *     array.
     * @returns {Array} Array of substrings.
     * @example
     *
     * // Basic use
     * regex_split('a b c d', ' ');
     * // -> ['a', 'b', 'c', 'd']
     *
     * // With limit
     * regex_split('a b c d', ' ', 2);
     * // -> ['a', 'b']
     *
     * // Backreferences in result array
     * regex_split('..word1 word2..', /([a-z]+)(\d+)/i);
     * // -> ['..', 'word', '1', ' ', 'word', '2', '..']
     */
    var regex_split = function (str, separator, limit) {
        // If `separator` is not a regex, use `split`
        if (Object.prototype.toString.call(separator) !== "[object RegExp]") {
            return split.call(str, separator, limit);
        }
        var output = [],
            flags = (separator.ignoreCase ? "i" : "") +
                    (separator.multiline  ? "m" : "") +
                    (separator.extended   ? "x" : "") + // Proposed for ES6
                    (separator.sticky     ? "y" : ""), // Firefox 3+
            lastLastIndex = 0,
            // Make `global` and avoid `lastIndex` issues by working with a copy
            separator = new RegExp(separator.source, flags + "g"),
            separator2, match, lastIndex, lastLength;
        str += ""; // Type-convert

        var compliantExecNpcg = typeof(/()??/.exec("")[1]) === "undefined";
        if (!compliantExecNpcg) {
            // Doesn't need flags gy, but they don't hurt
            separator2 = new RegExp("^" + separator.source + "$(?!\\s)", flags);
        }
        /* Values for `limit`, per the spec:
         * If undefined: 4294967295 // Math.pow(2, 32) - 1
         * If 0, Infinity, or NaN: 0
         * If positive number: limit = Math.floor(limit); if (limit > 4294967295) limit -= 4294967296;
         * If negative number: 4294967296 - Math.floor(Math.abs(limit))
         * If other: Type-convert, then use the above rules
         */
        limit = typeof(limit) === "undefined" ?
            -1 >>> 0 : // Math.pow(2, 32) - 1
            limit >>> 0; // ToUint32(limit)
        while (match = separator.exec(str)) {
            // `separator.lastIndex` is not reliable cross-browser
            lastIndex = match.index + match[0].length;
            if (lastIndex > lastLastIndex) {
                output.push(str.slice(lastLastIndex, match.index));
                // Fix browsers whose `exec` methods don't consistently return `undefined` for
                // nonparticipating capturing groups
                if (!compliantExecNpcg && match.length > 1) {
                    match[0].replace(separator2, function () {
                        for (var i = 1; i < arguments.length - 2; i++) {
                            if (typeof(arguments[i]) === "undefined") {
                                match[i] = undefined;
                            }
                        }
                    });
                }
                if (match.length > 1 && match.index < str.length) {
                    Array.prototype.push.apply(output, match.slice(1));
                }
                lastLength = match[0].length;
                lastLastIndex = lastIndex;
                if (output.length >= limit) {
                    break;
                }
            }
            if (separator.lastIndex === match.index) {
                separator.lastIndex++; // Avoid an infinite loop
            }
        }
        if (lastLastIndex === str.length) {
            if (lastLength || !separator.test("")) {
                output.push("");
            }
        } else {
            output.push(str.slice(lastLastIndex));
        }
        return output.length > limit ? output.slice(0, limit) : output;
    };

    //============================================================================
    // End contributed Cross-browser RegEx Split
    //============================================================================


    var uuid = function () {
        // http://www.ietf.org/rfc/rfc4122.txt
        var s = [];
        var hexDigits = "0123456789ABCDEF";
        for (var i = 0; i < 32; i++) {
            s[i] = hexDigits.substr(Math.floor(Math.random() * 0x10), 1);
        }
        s[12] = "4";  // bits 12-15 of the time_hi_and_version field to 0010
        s[16] = hexDigits.substr((s[16] & 0x3) | 0x8, 1);  // bits 6-7 of the clock_seq_hi_and_reserved to 01

        var uuid = s.join("");
        return uuid;
    };


    //Fix raw text to parse correctly in crazy XML
    function xmlencode(string) {
        return string.replace(/\&/g,'&'+'amp;')
            .replace(/</g,'&'+'lt;')
            .replace(/>/g,'&'+'gt;')
            .replace(/\'/g,'&'+'apos;')
            .replace(/\"/g,'&'+'quot;')
            .replace(/`/g,'&'+'#96;');
    }


    //Map from terminal commands to CSS classes
    var ansi_colormap = {
        "01":"ansibold",

        "30":"ansiblack",
        "31":"ansired",
        "32":"ansigreen",
        "33":"ansiyellow",
        "34":"ansiblue",
        "35":"ansipurple",
        "36":"ansicyan",
        "37":"ansigray",

        "40":"ansibgblack",
        "41":"ansibgred",
        "42":"ansibggreen",
        "43":"ansibgyellow",
        "44":"ansibgblue",
        "45":"ansibgpurple",
        "46":"ansibgcyan",
        "47":"ansibggray"
    };

    function _process_numbers(attrs, numbers) {
        // process ansi escapes
        var n = numbers.shift();
        if (ansi_colormap[n]) {
            if ( ! attrs["class"] ) {
                attrs["class"] = ansi_colormap[n];
            } else {
                attrs["class"] += " " + ansi_colormap[n];
            }
        } else if (n == "38" || n == "48") {
            // VT100 256 color or 24 bit RGB
            if (numbers.length < 2) {
                console.log("Not enough fields for VT100 color", numbers);
                return;
            }

            var index_or_rgb = numbers.shift();
            var r,g,b;
            if (index_or_rgb == "5") {
                // 256 color
                var idx = parseInt(numbers.shift());
                if (idx < 16) {
                    // indexed ANSI
                    // ignore bright / non-bright distinction
                    idx = idx % 8;
                    var ansiclass = ansi_colormap[n[0] + (idx % 8).toString()];
                    if ( ! attrs["class"] ) {
                        attrs["class"] = ansiclass;
                    } else {
                        attrs["class"] += " " + ansiclass;
                    }
                    return;
                } else if (idx < 232) {
                    // 216 color 6x6x6 RGB
                    idx = idx - 16;
                    b = idx % 6;
                    g = Math.floor(idx / 6) % 6;
                    r = Math.floor(idx / 36) % 6;
                    // convert to rgb
                    r = (r * 51);
                    g = (g * 51);
                    b = (b * 51);
                } else {
                    // grayscale
                    idx = idx - 231;
                    // it's 1-24 and should *not* include black or white,
                    // so a 26 point scale
                    r = g = b = Math.floor(idx * 256 / 26);
                }
            } else if (index_or_rgb == "2") {
                // Simple 24 bit RGB
                if (numbers.length > 3) {
                    console.log("Not enough fields for RGB", numbers);
                    return;
                }
                r = numbers.shift();
                g = numbers.shift();
                b = numbers.shift();
            } else {
                console.log("unrecognized control", numbers);
                return;
            }
            if (r !== undefined) {
                // apply the rgb color
                var line;
                if (n == "38") {
                    line = "color: ";
                } else {
                    line = "background-color: ";
                }
                line = line + "rgb(" + r + "," + g + "," + b + ");"
                if ( !attrs["style"] ) {
                    attrs["style"] = line;
                } else {
                    attrs["style"] += " " + line;
                }
            }
        }
    }

    function ansispan(str) {
        // ansispan function adapted from github.com/mmalecki/ansispan (MIT License)
        // regular ansi escapes (using the table above)
        return str.replace(/\033\[(0?[01]|22|39)?([;\d]+)?m/g, function(match, prefix, pattern) {
            if (!pattern) {
                // [(01|22|39|)m close spans
                return "</span>";
            }
            // consume sequence of color escapes
            var numbers = pattern.match(/\d+/g);
            var attrs = {};
            while (numbers.length > 0) {
                _process_numbers(attrs, numbers);
            }

            var span = "<span ";
            for (var attr in attrs) {
                var value = attrs[attr];
                span = span + " " + attr + '="' + attrs[attr] + '"';
            }
            return span + ">";
        });
    };

    // Transform ANSI color escape codes into HTML <span> tags with css
    // classes listed in the above ansi_colormap object. The actual color used
    // are set in the css file.
    function fixConsole(txt) {
        txt = xmlencode(txt);
        var re = /\033\[([\dA-Fa-f;]*?)m/;
        var opened = false;
        var cmds = [];
        var opener = "";
        var closer = "";

        // Strip all ANSI codes that are not color related.  Matches
        // all ANSI codes that do not end with "m".
        var ignored_re = /(?=(\033\[[\d;=]*[a-ln-zA-Z]{1}))\1(?!m)/g;
        txt = txt.replace(ignored_re, "");

        // color ansi codes
        txt = ansispan(txt);
        return txt;
    }

    // Remove chunks that should be overridden by the effect of
    // carriage return characters
    function fixCarriageReturn(txt) {
        var tmp = txt;
        do {
            txt = tmp;
            tmp = txt.replace(/\r+\n/gm, '\n'); // \r followed by \n --> newline
            tmp = tmp.replace(/^.*\r+/gm, '');  // Other \r --> clear line
        } while (tmp.length < txt.length);
        return txt;
    }

    // Locate any URLs and convert them to a anchor tag
    function autoLinkUrls(txt) {
        return txt.replace(/(^|\s)(https?|ftp)(:[^'">\s]+)/gi,
            "$1<a target=\"_blank\" href=\"$2$3\">$2$3</a>");
    }

    // some keycodes that seem to be platform/browser independent
    var keycodes = {
                BACKSPACE:  8,
                TAB      :  9,
                ENTER    : 13,
                SHIFT    : 16,
                CTRL     : 17,
                CONTROL  : 17,
                ALT      : 18,
                CAPS_LOCK: 20,
                ESC      : 27,
                SPACE    : 32,
                PGUP     : 33,
                PGDOWN   : 34,
                END      : 35,
                HOME     : 36,
                LEFT_ARROW: 37,
                LEFTARROW: 37,
                LEFT     : 37,
                UP_ARROW : 38,
                UPARROW  : 38,
                UP       : 38,
                RIGHT_ARROW:39,
                RIGHTARROW:39,
                RIGHT    : 39,
                DOWN_ARROW: 40,
                DOWNARROW: 40,
                DOWN     : 40,
                I        : 73,
                M        : 77,
                // all three of these keys may be COMMAND on OS X:
                LEFT_SUPER : 91,
                RIGHT_SUPER : 92,
                COMMAND  : 93,
    };

    // trigger a key press event
    var press = function (key) {
        var key_press =  $.Event('keydown', {which: key});
        $(document).trigger(key_press);
    }

    var press_up = function() { press(keycodes.UP); };
    var press_down = function() { press(keycodes.DOWN); };

    var press_ctrl_enter = function() {
        $(document).trigger($.Event('keydown', {which: keycodes.ENTER, ctrlKey: true}));
    };

    var press_shift_enter = function() {
        $(document).trigger($.Event('keydown', {which: keycodes.ENTER, shiftKey: true}));
    };

    // trigger the ctrl-m shortcut followed by one of our keys
    var press_ghetto = function(key) {
        $(document).trigger($.Event('keydown', {which: keycodes.M, ctrlKey: true}));
        press(key);
    };


    var points_to_pixels = function (points) {
        // A reasonably good way of converting between points and pixels.
        var test = $('<div style="display: none; width: 10000pt; padding:0; border:0;"></div>');
        $(body).append(test);
        var pixel_per_point = test.width()/10000;
        test.remove();
        return Math.floor(points*pixel_per_point);
    };

    var always_new = function (constructor) {
        // wrapper around contructor to avoid requiring `var a = new constructor()`
        // useful for passing constructors as callbacks,
        // not for programmer laziness.
        // from http://programmers.stackexchange.com/questions/118798
        return function () {
            var obj = Object.create(constructor.prototype);
            constructor.apply(obj, arguments);
            return obj;
        };
    };


    var url_path_join = function () {
        // join a sequence of url components with '/'
        var url = '';
        for (var i = 0; i < arguments.length; i++) {
            if (arguments[i] === '') {
                continue;
            }
            if (url.length > 0 && url[url.length-1] != '/') {
                url = url + '/' + arguments[i];
            } else {
                url = url + arguments[i];
            }
        }
        url = url.replace(/\/\/+/, '/');
        return url;
    };

    var parse_url = function (url) {
        // an `a` element with an href allows attr-access to the parsed segments of a URL
        // a = parse_url("http://localhost:8888/path/name#hash")
        // a.protocol = "http:"
        // a.host     = "localhost:8888"
        // a.hostname = "localhost"
        // a.port     = 8888
        // a.pathname = "/path/name"
        // a.hash     = "#hash"
        var a = document.createElement("a");
        a.href = url;
        return a;
    };

    var encode_uri_components = function (uri) {
        // encode just the components of a multi-segment uri,
        // leaving '/' separators
        return uri.split('/').map(encodeURIComponent).join('/');
    };

    var url_join_encode = function () {
        // join a sequence of url components with '/',
        // encoding each component with encodeURIComponent
        return encode_uri_components(url_path_join.apply(null, arguments));
    };


    var splitext = function (filename) {
        // mimic Python os.path.splitext
        // Returns ['base', '.ext']
        var idx = filename.lastIndexOf('.');
        if (idx > 0) {
            return [filename.slice(0, idx), filename.slice(idx)];
        } else {
            return [filename, ''];
        }
    };


    var escape_html = function (text) {
        // escape text to HTML
        return $("<div/>").text(text).html();
    }


    var get_body_data = function(key) {
        // get a url-encoded item from body.data and decode it
        // we should never have any encoded URLs anywhere else in code
        // until we are building an actual request
        return decodeURIComponent($('body').data(key));
    };


    // http://stackoverflow.com/questions/2400935/browser-detection-in-javascript
    var browser = (function() {
        if (typeof navigator === 'undefined') {
            // navigator undefined in node
            return 'None';
        }
        var N= navigator.appName, ua= navigator.userAgent, tem;
        var M= ua.match(/(opera|chrome|safari|firefox|msie)\/?\s*(\.?\d+(\.\d+)*)/i);
        if (M && (tem= ua.match(/version\/([\.\d]+)/i))!= null) M[2]= tem[1];
        M= M? [M[1], M[2]]: [N, navigator.appVersion,'-?'];
        return M;
    })();

    // http://stackoverflow.com/questions/11219582/how-to-detect-my-browser-version-and-operating-system-using-javascript
    var platform = (function () {
        if (typeof navigator === 'undefined') {
            // navigator undefined in node
            return 'None';
        }
        var OSName="None";
        if (navigator.appVersion.indexOf("Win")!=-1) OSName="Windows";
        if (navigator.appVersion.indexOf("Mac")!=-1) OSName="MacOS";
        if (navigator.appVersion.indexOf("X11")!=-1) OSName="UNIX";
        if (navigator.appVersion.indexOf("Linux")!=-1) OSName="Linux";
        return OSName
    })();

    var is_or_has = function (a, b) {
        // Is b a child of a or a itself?
        return a.has(b).length !==0 || a.is(b);
    }

    var is_focused = function (e) {
        // Is element e, or one of its children focused?
        e = $(e);
        var target = $(document.activeElement);
        if (target.length > 0) {
            if (is_or_has(e, target)) {
                return true;
            } else {
                return false;
            }
        } else {
            return false;
        }
    }


    return {
        regex_split : regex_split,
        uuid : uuid,
        fixConsole : fixConsole,
        keycodes : keycodes,
        press : press,
        press_up : press_up,
        press_down : press_down,
        press_ctrl_enter : press_ctrl_enter,
        press_shift_enter : press_shift_enter,
        press_ghetto : press_ghetto,
        fixCarriageReturn : fixCarriageReturn,
        autoLinkUrls : autoLinkUrls,
        points_to_pixels : points_to_pixels,
        get_body_data : get_body_data,
        parse_url : parse_url,
        url_path_join : url_path_join,
        url_join_encode : url_join_encode,
        encode_uri_components : encode_uri_components,
        splitext : splitext,
        escape_html : escape_html,
        always_new : always_new,
        browser : browser,
        platform: platform,
        is_or_has : is_or_has,
        is_focused : is_focused
    };

}(IPython));


//----------------------------------------------------------------------------
//  Copyright (C) 2013  The IPython Development Team
//
//  Distributed under the terms of the BSD License.  The full license is in
//  the file COPYING, distributed as part of this software.
//----------------------------------------------------------------------------

//============================================================================
// Comm and CommManager bases
//============================================================================
/**
 * Base Comm classes
 * @module IPython
 * @namespace IPython
 * @submodule comm
 */

var IPython = (function (IPython) {
    "use strict";

    //-----------------------------------------------------------------------
    // CommManager class
    //-----------------------------------------------------------------------

    var CommManager = function (kernel) {
        this.comms = {};
        this.targets = {};
        if (kernel !== undefined) {
            this.init_kernel(kernel);
        }
    };

    CommManager.prototype.init_kernel = function (kernel) {
        // connect the kernel, and register message handlers
        this.kernel = kernel;
        var msg_types = ['comm_open', 'comm_msg', 'comm_close'];
        for (var i = 0; i < msg_types.length; i++) {
            var msg_type = msg_types[i];
            kernel.register_iopub_handler(msg_type, $.proxy(this[msg_type], this));
        }
    };

    CommManager.prototype.new_comm = function (target_name, data, callbacks, metadata) {
        // Create a new Comm, register it, and open its Kernel-side counterpart
        // Mimics the auto-registration in `Comm.__init__` in the IPython Comm
        var comm = new Comm(target_name);
        this.register_comm(comm);
        comm.open(data, callbacks, metadata);
        return comm;
    };

    CommManager.prototype.register_target = function (target_name, f) {
        // Register a target function for a given target name
        this.targets[target_name] = f;
    };

    CommManager.prototype.unregister_target = function (target_name, f) {
        // Unregister a target function for a given target name
        delete this.targets[target_name];
    };

    CommManager.prototype.register_comm = function (comm) {
        // Register a comm in the mapping
        this.comms[comm.comm_id] = comm;
        comm.kernel = this.kernel;
        return comm.comm_id;
    };

    CommManager.prototype.unregister_comm = function (comm_id) {
        // Remove a comm from the mapping
        delete this.comms[comm_id];
    };

    // comm message handlers

    CommManager.prototype.comm_open = function (msg) {
        var content = msg.content;
        var f = this.targets[content.target_name];
        if (f === undefined) {
            console.log("No such target registered: ", content.target_name);
            console.log("Available targets are: ", this.targets);
            return;
        }
        var comm = new Comm(content.target_name, content.comm_id);
        this.register_comm(comm);
        try {
            f(comm, msg);
        } catch (e) {
            console.log("Exception opening new comm:", e, e.stack, msg);
            comm.close();
            this.unregister_comm(comm);
        }
    };

    CommManager.prototype.comm_close = function (msg) {
        var content = msg.content;
        var comm = this.comms[content.comm_id];
        if (comm === undefined) {
            return;
        }
        delete this.comms[content.comm_id];
        try {
            comm.handle_close(msg);
        } catch (e) {
            console.log("Exception closing comm: ", e, e.stack, msg);
        }
    };

    CommManager.prototype.comm_msg = function (msg) {
        var content = msg.content;
        var comm = this.comms[content.comm_id];
        if (comm === undefined) {
            return;
        }
        try {
            comm.handle_msg(msg);
        } catch (e) {
            console.log("Exception handling comm msg: ", e, e.stack, msg);
        }
    };

    //-----------------------------------------------------------------------
    // Comm base class
    //-----------------------------------------------------------------------

    var Comm = function (target_name, comm_id) {
        this.target_name = target_name;
        this.comm_id = comm_id || IPython.utils.uuid();
        this._msg_callback = this._close_callback = null;
    };

    // methods for sending messages
    Comm.prototype.open = function (data, callbacks, metadata) {
        var content = {
            comm_id : this.comm_id,
            target_name : this.target_name,
            data : data || {},
        };
        return this.kernel.send_shell_message("comm_open", content, callbacks, metadata);
    };

    Comm.prototype.send = function (data, callbacks, metadata) {
        var content = {
            comm_id : this.comm_id,
            data : data || {},
        };
        return this.kernel.send_shell_message("comm_msg", content, callbacks, metadata);
    };

    Comm.prototype.close = function (data, callbacks, metadata) {
        var content = {
            comm_id : this.comm_id,
            data : data || {},
        };
        return this.kernel.send_shell_message("comm_close", content, callbacks, metadata);
    };

    // methods for registering callbacks for incoming messages
    Comm.prototype._register_callback = function (key, callback) {
        this['_' + key + '_callback'] = callback;
    };

    Comm.prototype.on_msg = function (callback) {
        this._register_callback('msg', callback);
    };

    Comm.prototype.on_close = function (callback) {
        this._register_callback('close', callback);
    };

    // methods for handling incoming messages

    Comm.prototype._maybe_callback = function (key, msg) {
        var callback = this['_' + key + '_callback'];
        if (callback) {
            try {
                callback(msg);
            } catch (e) {
                console.log("Exception in Comm callback", e, e.stack, msg);
            }
        }
    };

    Comm.prototype.handle_msg = function (msg) {
        this._maybe_callback('msg', msg);
    };

    Comm.prototype.handle_close = function (msg) {
        this._maybe_callback('close', msg);
    };

    IPython.CommManager = CommManager;
    IPython.Comm = Comm;

    return IPython;

}(IPython));

//----------------------------------------------------------------------------
//  Copyright (C) 2008-2011  The IPython Development Team
//
//  Distributed under the terms of the BSD License.  The full license is in
//  the file COPYING, distributed as part of this software.
//----------------------------------------------------------------------------

//============================================================================
// Kernel
//============================================================================

/**
 * @module IPython
 * @namespace IPython
 * @submodule Kernel
 */

var IPython = (function (IPython) {
    "use strict";

    var utils = IPython.utils;

    // Initialization and connection.
    /**
     * A Kernel Class to communicate with the Python kernel
     * @Class Kernel
     */
    var Kernel = function (kernel_service_url) {
        this.kernel_id = null;
        this.shell_channel = null;
        this.iopub_channel = null;
        this.stdin_channel = null;
        this.kernel_service_url = kernel_service_url;
        this.running = false;
        this.username = "username";
        this.session_id = utils.uuid();
        this._msg_callbacks = {};

        if (typeof(WebSocket) !== 'undefined') {
            this.WebSocket = WebSocket;
        } else if (typeof(MozWebSocket) !== 'undefined') {
            this.WebSocket = MozWebSocket;
        } else {
            alert('Your browser does not have WebSocket support, please try Chrome, Safari or Firefox ≥ 6. Firefox 4 and 5 are also supported by you have to enable WebSockets in about:config.');
        }

        this.bind_events();
        this.init_iopub_handlers();
        this.comm_manager = new IPython.CommManager(this);
        this.widget_manager = new IPython.WidgetManager(this.comm_manager);
    };


    Kernel.prototype._get_msg = function (msg_type, content, metadata) {
        var msg = {
            header : {
                msg_id : utils.uuid(),
                username : this.username,
                session : this.session_id,
                msg_type : msg_type
            },
            metadata : metadata || {},
            content : content,
            parent_header : {}
        };
        return msg;
    };

    Kernel.prototype.bind_events = function () {
        var that = this;
        $([IPython.events]).on('send_input_reply.Kernel', function(evt, data) {
            that.send_input_reply(data);
        });
    };

    // Initialize the iopub handlers

    Kernel.prototype.init_iopub_handlers = function () {
        var output_types = ['stream', 'display_data', 'pyout', 'pyerr'];
        this._iopub_handlers = {};
        this.register_iopub_handler('status', $.proxy(this._handle_status_message, this));
        this.register_iopub_handler('clear_output', $.proxy(this._handle_clear_output, this));

        for (var i=0; i < output_types.length; i++) {
            this.register_iopub_handler(output_types[i], $.proxy(this._handle_output_message, this));
        }
    };

    /**
     * Start the Python kernel
     * @method start
     */
    Kernel.prototype.start = function (params) {
        params = params || {};
        if (!this.running) {
            var qs = $.param(params);
            $.post(utils.url_join_encode(this.kernel_service_url) + '?' + qs,
                $.proxy(this._kernel_started, this),
                'json'
            );
        }
    };

    /**
     * Restart the python kernel.
     *
     * Emit a 'status_restarting.Kernel' event with
     * the current object as parameter
     *
     * @method restart
     */
    Kernel.prototype.restart = function () {
        $([IPython.events]).trigger('status_restarting.Kernel', {kernel: this});
        if (this.running) {
            this.stop_channels();
            $.post(utils.url_join_encode(this.kernel_url, "restart"),
                $.proxy(this._kernel_started, this),
                'json'
            );
        }
    };


    Kernel.prototype._kernel_started = function (json) {
        console.log("Kernel started: ", json.id);
        this.running = true;
        this.kernel_id = json.id;
        // trailing 's' in https will become wss for secure web sockets
        this.ws_host = location.protocol.replace('http', 'ws') + "//" + location.host;
        this.kernel_url = utils.url_path_join(this.kernel_service_url, this.kernel_id);
        this.start_channels();
    };


    Kernel.prototype._websocket_closed = function(ws_url, early) {
        this.stop_channels();
        $([IPython.events]).trigger('websocket_closed.Kernel',
            {ws_url: ws_url, kernel: this, early: early}
        );
    };

    /**
     * Start the `shell`and `iopub` channels.
     * Will stop and restart them if they already exist.
     *
     * @method start_channels
     */
    Kernel.prototype.start_channels = function () {
        var that = this;
        this.stop_channels();
        var ws_host_url = this.ws_host + this.kernel_url;
        console.log("Starting WebSockets:", ws_host_url);
        this.shell_channel = new this.WebSocket(
            this.ws_host + utils.url_join_encode(this.kernel_url, "shell")
        );
        this.stdin_channel = new this.WebSocket(
            this.ws_host + utils.url_join_encode(this.kernel_url, "stdin")
        );
        this.iopub_channel = new this.WebSocket(
            this.ws_host + utils.url_join_encode(this.kernel_url, "iopub")
        );

        var already_called_onclose = false; // only alert once
        var ws_closed_early = function(evt){
            if (already_called_onclose){
                return;
            }
            already_called_onclose = true;
            if ( ! evt.wasClean ){
                that._websocket_closed(ws_host_url, true);
            }
        };
        var ws_closed_late = function(evt){
            if (already_called_onclose){
                return;
            }
            already_called_onclose = true;
            if ( ! evt.wasClean ){
                that._websocket_closed(ws_host_url, false);
            }
        };
        var channels = [this.shell_channel, this.iopub_channel, this.stdin_channel];
        for (var i=0; i < channels.length; i++) {
            channels[i].onopen = $.proxy(this._ws_opened, this);
            channels[i].onclose = ws_closed_early;
        }
        // switch from early-close to late-close message after 1s
        setTimeout(function() {
            for (var i=0; i < channels.length; i++) {
                if (channels[i] !== null) {
                    channels[i].onclose = ws_closed_late;
                }
            }
        }, 1000);
        this.shell_channel.onmessage = $.proxy(this._handle_shell_reply, this);
        this.iopub_channel.onmessage = $.proxy(this._handle_iopub_message, this);
        this.stdin_channel.onmessage = $.proxy(this._handle_input_request, this);
    };

    /**
     * Handle a websocket entering the open state
     * sends session and cookie authentication info as first message.
     * Once all sockets are open, signal the Kernel.status_started event.
     * @method _ws_opened
     */
    Kernel.prototype._ws_opened = function (evt) {
        // send the session id so the Session object Python-side
        // has the same identity
        evt.target.send(this.session_id + ':' + document.cookie);

        var channels = [this.shell_channel, this.iopub_channel, this.stdin_channel];
        for (var i=0; i < channels.length; i++) {
            // if any channel is not ready, don't trigger event.
            if ( !channels[i].readyState ) return;
        }
        // all events ready, trigger started event.
        $([IPython.events]).trigger('status_started.Kernel', {kernel: this});
    };

    /**
     * Stop the websocket channels.
     * @method stop_channels
     */
    Kernel.prototype.stop_channels = function () {
        var channels = [this.shell_channel, this.iopub_channel, this.stdin_channel];
        for (var i=0; i < channels.length; i++) {
            if ( channels[i] !== null ) {
                channels[i].onclose = null;
                channels[i].close();
            }
        }
        this.shell_channel = this.iopub_channel = this.stdin_channel = null;
    };

    // Main public methods.

    // send a message on the Kernel's shell channel
    Kernel.prototype.send_shell_message = function (msg_type, content, callbacks, metadata) {
        var msg = this._get_msg(msg_type, content, metadata);
        this.shell_channel.send(JSON.stringify(msg));
        this.set_callbacks_for_msg(msg.header.msg_id, callbacks);
        return msg.header.msg_id;
    };

    /**
     * Get kernel info
     *
     * @param callback {function}
     * @method object_info
     *
     * When calling this method, pass a callback function that expects one argument.
     * The callback will be passed the complete `kernel_info_reply` message documented
     * [here](http://ipython.org/ipython-doc/dev/development/messaging.html#kernel-info)
     */
    Kernel.prototype.kernel_info = function (callback) {
        var callbacks;
        if (callback) {
            callbacks = { shell : { reply : callback } };
        }
        return this.send_shell_message("kernel_info_request", {}, callbacks);
    };

    /**
     * Get info on an object
     *
     * @param objname {string}
     * @param callback {function}
     * @method object_info
     *
     * When calling this method, pass a callback function that expects one argument.
     * The callback will be passed the complete `object_info_reply` message documented
     * [here](http://ipython.org/ipython-doc/dev/development/messaging.html#object-information)
     */
    Kernel.prototype.object_info = function (objname, callback) {
        var callbacks;
        if (callback) {
            callbacks = { shell : { reply : callback } };
        }

        if (typeof(objname) !== null && objname !== null) {
            var content = {
                oname : objname.toString(),
                detail_level : 0,
            };
            return this.send_shell_message("object_info_request", content, callbacks);
        }
        return;
    };

    /**
     * Execute given code into kernel, and pass result to callback.
     *
     * @async
     * @method execute
     * @param {string} code
     * @param [callbacks] {Object} With the following keys (all optional)
     *      @param callbacks.shell.reply {function}
     *      @param callbacks.shell.payload.[payload_name] {function}
     *      @param callbacks.iopub.output {function}
     *      @param callbacks.iopub.clear_output {function}
     *      @param callbacks.input {function}
     * @param {object} [options]
     *      @param [options.silent=false] {Boolean}
     *      @param [options.user_expressions=empty_dict] {Dict}
     *      @param [options.user_variables=empty_list] {List od Strings}
     *      @param [options.allow_stdin=false] {Boolean} true|false
     *
     * @example
     *
     * The options object should contain the options for the execute call. Its default
     * values are:
     *
     *      options = {
     *        silent : true,
     *        user_variables : [],
     *        user_expressions : {},
     *        allow_stdin : false
     *      }
     *
     * When calling this method pass a callbacks structure of the form:
     *
     *      callbacks = {
     *       shell : {
     *         reply : execute_reply_callback,
     *         payload : {
     *           set_next_input : set_next_input_callback,
     *         }
     *       },
     *       iopub : {
     *         output : output_callback,
     *         clear_output : clear_output_callback,
     *       },
     *       input : raw_input_callback
     *      }
     *
     * Each callback will be passed the entire message as a single arugment.
     * Payload handlers will be passed the corresponding payload and the execute_reply message.
     */
    Kernel.prototype.execute = function (code, callbacks, options) {

        var content = {
            code : code,
            silent : true,
            store_history : false,
            user_variables : [],
            user_expressions : {},
            allow_stdin : false
        };
        callbacks = callbacks || {};
        if (callbacks.input !== undefined) {
            content.allow_stdin = true;
        }
        $.extend(true, content, options);
        $([IPython.events]).trigger('execution_request.Kernel', {kernel: this, content:content});
        return this.send_shell_message("execute_request", content, callbacks);
    };

    /**
     * When calling this method, pass a function to be called with the `complete_reply` message
     * as its only argument when it arrives.
     *
     * `complete_reply` is documented
     * [here](http://ipython.org/ipython-doc/dev/development/messaging.html#complete)
     *
     * @method complete
     * @param line {integer}
     * @param cursor_pos {integer}
     * @param callback {function}
     *
     */
    Kernel.prototype.complete = function (line, cursor_pos, callback) {
        var callbacks;
        if (callback) {
            callbacks = { shell : { reply : callback } };
        }
        var content = {
            text : '',
            line : line,
            block : null,
            cursor_pos : cursor_pos
        };
        return this.send_shell_message("complete_request", content, callbacks);
    };


    Kernel.prototype.interrupt = function () {
        if (this.running) {
            $([IPython.events]).trigger('status_interrupting.Kernel', {kernel: this});
            $.post(utils.url_join_encode(this.kernel_url, "interrupt"));
        }
    };


    Kernel.prototype.kill = function () {
        if (this.running) {
            this.running = false;
            var settings = {
                cache : false,
                type : "DELETE"
            };
            $.ajax(utils.url_join_encode(this.kernel_url), settings);
        }
    };

    Kernel.prototype.send_input_reply = function (input) {
        var content = {
            value : input,
        };
        $([IPython.events]).trigger('input_reply.Kernel', {kernel: this, content:content});
        var msg = this._get_msg("input_reply", content);
        this.stdin_channel.send(JSON.stringify(msg));
        return msg.header.msg_id;
    };


    // Reply handlers

    Kernel.prototype.register_iopub_handler = function (msg_type, callback) {
        this._iopub_handlers[msg_type] = callback;
    };

    Kernel.prototype.get_iopub_handler = function (msg_type) {
        // get iopub handler for a specific message type
        return this._iopub_handlers[msg_type];
    };


    Kernel.prototype.get_callbacks_for_msg = function (msg_id) {
        // get callbacks for a specific message
        return this._msg_callbacks[msg_id];
    };


    Kernel.prototype.clear_callbacks_for_msg = function (msg_id) {
        if (this._msg_callbacks[msg_id] !== undefined ) {
            delete this._msg_callbacks[msg_id];
        }
    };

    /* Set callbacks for a particular message.
     * Callbacks should be a struct of the following form:
     * shell : {
     *
     * }

     */
    Kernel.prototype.set_callbacks_for_msg = function (msg_id, callbacks) {
        if (callbacks) {
            // shallow-copy mapping, because we will modify it at the top level
            var cbcopy = this._msg_callbacks[msg_id] = {};
            cbcopy.shell = callbacks.shell;
            cbcopy.iopub = callbacks.iopub;
            cbcopy.input = callbacks.input;
            this._msg_callbacks[msg_id] = cbcopy;
        }
    };


    Kernel.prototype._handle_shell_reply = function (e) {
        var reply = $.parseJSON(e.data);
        $([IPython.events]).trigger('shell_reply.Kernel', {kernel: this, reply:reply});
        var content = reply.content;
        var metadata = reply.metadata;
        var parent_id = reply.parent_header.msg_id;
        var callbacks = this.get_callbacks_for_msg(parent_id);
        if (!callbacks || !callbacks.shell) {
            return;
        }
        var shell_callbacks = callbacks.shell;

        // clear callbacks on shell
        delete callbacks.shell;
        delete callbacks.input;
        if (!callbacks.iopub) {
            this.clear_callbacks_for_msg(parent_id);
        }

        if (shell_callbacks.reply !== undefined) {
            shell_callbacks.reply(reply);
        }
        if (content.payload && shell_callbacks.payload) {
            this._handle_payloads(content.payload, shell_callbacks.payload, reply);
        }
    };


    Kernel.prototype._handle_payloads = function (payloads, payload_callbacks, msg) {
        var l = payloads.length;
        // Payloads are handled by triggering events because we don't want the Kernel
        // to depend on the Notebook or Pager classes.
        for (var i=0; i<l; i++) {
            var payload = payloads[i];
            var callback = payload_callbacks[payload.source];
            if (callback) {
                callback(payload, msg);
            }
        }
    };

    Kernel.prototype._handle_status_message = function (msg) {
        var execution_state = msg.content.execution_state;
        var parent_id = msg.parent_header.msg_id;

        // dispatch status msg callbacks, if any
        var callbacks = this.get_callbacks_for_msg(parent_id);
        if (callbacks && callbacks.iopub && callbacks.iopub.status) {
            try {
                callbacks.iopub.status(msg);
            } catch (e) {
                console.log("Exception in status msg handler", e, e.stack);
            }
        }

        if (execution_state === 'busy') {
            $([IPython.events]).trigger('status_busy.Kernel', {kernel: this});
        } else if (execution_state === 'idle') {
            // clear callbacks on idle, there can be no more
            if (callbacks !== undefined) {
                delete callbacks.iopub;
                delete callbacks.input;
                if (!callbacks.shell) {
                    this.clear_callbacks_for_msg(parent_id);
                }
            }
            // trigger status_idle event
            $([IPython.events]).trigger('status_idle.Kernel', {kernel: this});
        } else if (execution_state === 'restarting') {
            // autorestarting is distinct from restarting,
            // in that it means the kernel died and the server is restarting it.
            // status_restarting sets the notification widget,
            // autorestart shows the more prominent dialog.
            $([IPython.events]).trigger('status_autorestarting.Kernel', {kernel: this});
            $([IPython.events]).trigger('status_restarting.Kernel', {kernel: this});
        } else if (execution_state === 'dead') {
            this.stop_channels();
            $([IPython.events]).trigger('status_dead.Kernel', {kernel: this});
        }
    };


    // handle clear_output message
    Kernel.prototype._handle_clear_output = function (msg) {
        var callbacks = this.get_callbacks_for_msg(msg.parent_header.msg_id);
        if (!callbacks || !callbacks.iopub) {
            return;
        }
        var callback = callbacks.iopub.clear_output;
        if (callback) {
            callback(msg);
        }
    };


    // handle an output message (pyout, display_data, etc.)
    Kernel.prototype._handle_output_message = function (msg) {
        var callbacks = this.get_callbacks_for_msg(msg.parent_header.msg_id);
        if (!callbacks || !callbacks.iopub) {
            return;
        }
        var callback = callbacks.iopub.output;
        if (callback) {
            callback(msg);
        }
    };

    // dispatch IOPub messages to respective handlers.
    // each message type should have a handler.
    Kernel.prototype._handle_iopub_message = function (e) {
        var msg = $.parseJSON(e.data);

        var handler = this.get_iopub_handler(msg.header.msg_type);
        if (handler !== undefined) {
            handler(msg);
        }
    };


    Kernel.prototype._handle_input_request = function (e) {
        var request = $.parseJSON(e.data);
        var header = request.header;
        var content = request.content;
        var metadata = request.metadata;
        var msg_type = header.msg_type;
        if (msg_type !== 'input_request') {
            console.log("Invalid input request!", request);
            return;
        }
        var callbacks = this.get_callbacks_for_msg(request.parent_header.msg_id);
        if (callbacks) {
            if (callbacks.input) {
                callbacks.input(request);
            }
        }
    };


    IPython.Kernel = Kernel;

    return IPython;

}(IPython));

exports.IPython = IPython;
