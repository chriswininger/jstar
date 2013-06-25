/*!
 * jstar JavaScript Library v0.0.01a
 * https://github.com/chriswininger/jstar
 *
 * Copyright 2013 Chris Wininger
 * Released under the MIT license
 * https://github.com/chriswininger/jstar/blob/master/license.md
 *
 * Date: Sat Apr 20 2013
 */

(function (window) {
        /* ---- constructor ---- */
        var _jsTar = function() {

        };

        /* ---- prototype ---- */
        _jsTar.prototype = {
          constructor: _jsTar
        };

        /* ---- static methods ---- */

        /***
         * Takes an array of files and converts them into a single tar file of output
         *
         * @param files Array of objecst with binary strings representing the files to be included in the tar { name (string), data (binary string) }
         * @param options [Optional] Options which specify attributes about how the tar as constructed as well provide callback methods for complete, success, and error
         *  options:
         *      complete function(data)
         *      success function(data)
         *      error function(data)
         *      progress function(data)
         * @returns void (Get return values through call back functions)
         */
         _jsTar.toTar = function (files, options) {
            var tar = '', file_count = 0, f = false, header = '', totalChkSum = 0, out = '';
            var name, mode, uid, gid, size, mtime, chksum, typeflag, linkname, ustar, uname, gname;


            // process a single file
            var processFile = function() {
                try {
                    if (file_count < files.length) {
                        f = files[file_count];

                        // Build the content of the header with a blank chksum
                        name = f.name.padRight('\0', 100); //('p' + (file_count.toString()).padLeft('0', 10) + '.png').padRight('\0', 100);
                        mode = '0000664'.padRight('\0', 8);
                        uid = (1000).toString(8).padLeft('0', 7).padRight('\0',8);
                        gid = (1000).toString(8).padLeft('0', 7).padRight('\0',8);
                        size = (f.data.length).toString(8).padLeft('0', 11).padRight('\0',12);
                        mtime = '12123623701'.padRight('\0', 12); // modification time
                        chksum = '        '; // enter all spaces to calculate chksum
                        typeflag = '0';
                        linkname = ''.padRight('\0',100);
                        ustar = 'ustar  \0';
                        uname = 'chris'.padRight('\0', 32);
                        gname = 'chris'.padRight('\0', 32);
                        header = (name + mode + uid + gid + size + mtime + chksum + typeflag + linkname + ustar + uname + gname).padRight('\0', 512);
                        // Calculate chksum value
                        totalChkSum = 0;
                        for (var i = 0, ch; i < header.length; i++){
                            ch =  header.charCodeAt(i);
                            totalChkSum += ch;
                        }

                        // reconstruct header using the chksum value
                        chksum = (totalChkSum).toString(8).padLeft('0', 6) + '\0 '; // convert base 8 and pad
                        header = (name + mode + uid + gid + size + mtime + chksum + typeflag + linkname + ustar + uname + gname).padRight('\0', 512);

                        // apend the new file to the tar
                        tar += header + f.data.padRight('\0', (512 + Math.floor(f.data.length/512) * 512));

                        // advance the pointer to the next file
                        file_count++;

                        // Update progress
                        if (typeof options.progress !== 'undefined'){
                            options.progress.call(this, {
                                'count': file_count,
                                'total': files.length
                            });
                        }

                        // process the next file after handling events in the queue
                        window.setTimeout(processFile, 0);
                    } else {
                        // add two 512 blocks to terminate the file
                        tar += ''.padRight('\0', 1024);

                        // convert the string to an array of unsigned integers
                        var byteArray = new Uint8Array(tar.length);
                        for (var byte_count = 0; byte_count < tar.length; byte_count++) {
                            byteArray[byte_count] = tar.charCodeAt(byte_count);
                        }

                        // build a binary blob from the array
                        var blobOutput = Blob([byteArray.buffer], {'type': 'application/tar'});

                        // invoke call back functions
                        if (typeof options.success !== 'undefined') {
                            options.success.call(this, {
                                'status': 'success',
                                'message': 'message',
                                'data': blobOutput
                            });
                        }

                        // invoke call back functions
                        if (typeof options.complete !== 'undefined') {
                            options.complete.call(this, {
                                'status': 'success',
                                'message': '',
                                'data': blobOutput
                            });
                        }

                    }
                } catch (ex) {
                    if (typeof options.error !== 'undefined') {
                        options.error.call(this, {
                            'status': 'error',
                            'message': ex.message,
                            'data': null
                        });
                    }

                    // invoke call back functions
                    if (typeof options.complete !== 'undefined') {
                        options.complete.call(this, {
                            'status': 'error',
                            'message': ex.message,
                            'data': null
                        });
                    }
                }
            };

            // Begin processing the files
            window.setTimeout(processFile, 0);
        };

        // extend to global space
        window.jsTar = _jsTar;
})(window);


/* ---- utility lib ---- */
(function (window) {
    String.prototype.setAt = function(index, character) {
        return this.substr(0, index) + character + this.substr(index+character.length);
    }

    String.prototype.padRight = function(c, padWidth) {
        var len = padWidth - this.length, padding = '';
        for (var i = 0; i < len; i++) {
            padding += c;
        }

        return this + padding;
    };

    String.prototype.padLeft = function(c, padWidth) {
        var len = padWidth - this.length, padding = '';
        for (var i = 0; i < len; i++) {
            padding += c;
        }

        return padding + this;
    };

})(window);
