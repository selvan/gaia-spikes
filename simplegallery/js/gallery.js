'use strict';


(function (window) {

    var gDEBUG = true;

    function cLog(message) {
        if (gDEBUG) {
            console.log('[Simple Gallery] ' + message);
        }
    }

    ;

    var thumbnails = null;
    var images = [];
    var photodb;

    window.addEventListener('localized', function showBody() {
        // Set the 'lang' and 'dir' attributes to <html> when the page is translated
        document.documentElement.lang = navigator.mozL10n.language.code;
        document.documentElement.dir = navigator.mozL10n.language.direction;

        // <body> children are hidden until the UI is translated
        document.body.classList.remove('hidden');

        // Now initialize the rest of the app
        init();
    });


    function init() {

        thumbnails = document.getElementById('thumbnails')

        photodb = new MediaDB('pictures', metadataParser, {
            indexes:['date'],
            mimeTypes:['image/jpeg', 'image/png']
        });

        photodb.onunavailable = function (event) {
            var why = event.detail;
            if (why === MediaDB.NOCARD)
                cLog("No SD card");
            else if (why === MediaDB.UNMOUNTED)
                cLog("SD card Unmounted");
        }

        photodb.onready = function () {
            cLog("photodb onready..");
            createThumbnailList();  // Display thumbnails for the images we know about
        };

        // When photodb scans, let the user know
        photodb.onscanstart = function () {
            cLog("photodb onscanstart..");
        };

        // And hide the throbber when scanning is done
        photodb.onscanend = function () {
            cLog("photodb onscanend");
        };

        // One or more files was created (or was just discovered by a scan)
        // XXX If the array is big, we should just rebuild the UI from scratch
        photodb.oncreated = function (event) {
            cLog("photodb oncreated");
        };

        // One or more files were deleted (or were just discovered missing by a scan)
        // XXX If the array is big, we should just rebuild the UI from scratch
        photodb.ondeleted = function (event) {
            cLog("photodb ondeleted");
        };
    }


    function createThumbnailList() {

        // If thumbnails already exist, erase everything and start over
        if (thumbnails.firstChild !== null) {
            thumbnails.textContent = '';
            images = [];
        }


        // Enumerate existing image entries in the database and add thumbnails
        // List them all, and sort them in descending order by date.
        photodb.enumerate('date', null, 'prev', function (imagedata) {
            if (imagedata === null) { // No more images
                return;
            }

            images.push(imagedata);                             // remember the image
            var thumbnail = createThumbnail(images.length - 1); // create its thumbnail
            thumbnails.appendChild(thumbnail); // display the thumbnail
        });
    }

//
// Create a thumbnail <img> element
//
    function createThumbnail(imagenum) {
        var li = document.createElement('li');
        li.dataset.index = imagenum;
        li.classList.add('thumbnail');

        var imagedata = images[imagenum];
        // We revoke this url in imageDeleted
        var url = URL.createObjectURL(imagedata.metadata.thumbnail);
        li.style.backgroundImage = 'url("' + url + '")';

        return li;
    }

})(this);