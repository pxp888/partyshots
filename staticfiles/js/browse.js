const bigArea = $('#bigArea');


function getThumb(photoid) {
    // Get the thumbnail for a photo object
    let data = {
        'action': 'getThumb',
        'photoid': photoid,
    };
    ajaxPost(data, function(response) {
        let thumb = $('.shot.demo').clone().removeClass('demo');
        thumb.find('.shimage').attr('src', response.link);
        thumb.find('.shuser').text(response.user);
        thumb.find('.shdate').text(response.created);
        thumb.find('.shid').text(data.photoid);
        thumb.find('.shdesc').text(response.description);
        
        thumb.find('.shotinfo').click(viewBig);
        thumb.find('.shremove').click(removeShot);

        let thumbs = $('.shot').not('.demo');
        for (let i = 0; i < thumbs.length; i++) {
            let a = +$(thumbs[i]).find('.shid').text();
            let b = +thumb.find('.shid').text();
            if (a > b) {
                $(thumbs[i]).before(thumb);
                return;
            }
        }
        $('#shotList').append(thumb);
    });
}


function viewAlbum(code) {
    // View the contents of an album object
    let data = {
        'action': 'getAlbum',
        'code': code,
    };
    ajaxPost(data, function(response) {
        const abinfo = $('#abinfo');
        abinfo.find('.abcode').text(response.code);
        abinfo.find('.abname').text(response.name);
        abinfo.find('.abuser').text(response.user);
        abinfo.find('.abdate').text(response.created_at);

        let data = {
            'action': 'getThumbs',
            'code': code,
        };
        ajaxPost(data, function(response) {
            if (response.ecode !== 0) {
                let msg = response.Error;
                alert(msg);
                return;
            }
            $('.shot').not('.demo').remove();
            let thumbs = response['thumbs'];
            for (let i = 0; i < thumbs.length; i++) {
                getThumb(thumbs[i]);
            }
        });
    });
}


function viewBig(event) {
    // Handle thumbnail click event
    if (event.target.className.includes('shremove')) {return;}
    event.preventDefault();
    let code = $(this).closest('.shot').find('.shid').text();
    showBig(code);
}


function showBig(code) {
    // View the full size image of a photo object
    let data = {
        'action': 'getPhoto',
        'photoid': code,
    };
    ajaxPost(data, function(response) {
        if (response.ecode !== 0) {
            let msg = response.Error;
            alert(msg);
            return;
        }
        $('#bigImage').attr('src', response.link);
        $('#bigid').text(code);
        bigArea.show();
    });
}


function hideBig() {
    // Hide the full size image
    bigArea.hide();
}


function removeShot(event) {
    // Remove a photo object
    event.preventDefault();
    if (!confirm('Are you sure you want to delete this photo?')) {return;}
    
    let shotElement = $(this).closest('.shot');
    let code = shotElement.find('.shid').text();
    let data = {
        'action': 'removePhoto',
        'photoid': code,
    };
    ajaxPost(data, function(response) {
        if (response.ecode !== 0) {
            let msg = response.Error;
            alert(msg);
            return;
        };
        shotElement.remove();
    });
}


function uploadFile(file) {
    // Upload a single file to the server
    const chunkSize = 1024 * 1024;
    const filename = file.name;

    let reader = new FileReader();
    reader.onload = function(e) {
        let blob = e.target.result;
        let hash = md5(blob);

        let size = blob.length;
        let chunks = Math.ceil(size / chunkSize);
        for (let i = 0; i < chunks; i++) {
            let start = i * chunkSize;
            let end = Math.min(size, start + chunkSize);
            let data = blob.slice(start, end);
            let msg = {
                'action': 'addPhoto',
                'code': $('#abinfo').find('.abcode').text(),
                'chunk': i,
                'chunks': chunks,
                'data': data,
                'filename': filename,
                'hash': hash,
            };
            ajaxPost(msg, function(response) {
                if (response.ecode === 1) {
                    code = response.photoid;
                    getThumb(code);

                    let description = $('#imdesc').val();
                    let data = {
                        'action': 'addDescription',
                        'code': code,
                        'description': description,
                    };
                    ajaxPost(data, function(response) {
                        if (response.ecode !== 0) {
                            let msg = response.Error;
                            alert(msg);
                            return;
                        }
                    });
                }
            });
        }
    };
    reader.readAsDataURL(file);
}


function filesPicked(event) {
    // Handle the file selection event
    const imdesc = $('#imdesc');
    if (imdesc.val() === '') {
        alert('Please enter a description or label');
        $('#imfile').val('');
        return;
    }

    let abcode = $('#abinfo').find('.abcode').text();
    if (abcode.length < 10) {
        alert('Please select an album');
        $('#imfile').val('');
        return;
    }

    let files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        uploadFile(files[i]);
    }
}


function albumCodeEntered(event) {
    // View the album with the given code
    let code = $('#searchLine').val();
    if (code === '') {
        alert('Please enter an album code');
        return;
    }
    viewAlbum(code);
}


function subscribe(event) {
    // Subscribe to an album owned by another user
    event.preventDefault();
    let code = $('#abinfo').find('.abcode').text();
    let data = {
        'action': 'subscribe',
        'code': code,
    };
    ajaxPost(data, function(response) {
        if (response.ecode !== 0) {
            let msg = response.Error;
            alert(msg);
            return;
        }
        viewAlbum(code);
        checkAlbums();
    });
}


function nextPic(event) {
    // show the next image in the list
    event.preventDefault();

    let code = $('#bigid').text();
    let codes = $('.shot').not('.demo').find('.shid');
    let codelist = [];
    for (let i = 0; i < codes.length; i++) {
        codelist.push(codes[i].innerText);
    }
    let index = codelist.indexOf(code);
    if (index === codelist.length - 1) {
        return;
    }
    let next = codelist[index + 1];
    showBig(next);
}


function prevPic(event) {
    // show the previous image in the list
    event.preventDefault();

    let code = $('#bigid').text();
    let codes = $('.shot').not('.demo').find('.shid');
    let codelist = [];
    for (let i = 0; i < codes.length; i++) {
        codelist.push(codes[i].innerText);
    }
    let index = codelist.indexOf(code);
    if (index === 0) {
        return;
    }
    let prev = codelist[index - 1];
    showBig(prev);
}


function checkAlbums() {
    // check ownership of the album, and show the appropriate buttons
    let data = {
        'action': 'getAlbums',
    };
    ajaxPost(data, function(response) {
        let bums = response['albums'];
        let code = getSlug();
        if (bums.includes(code)) {
            $('#absubButton').hide();
            $('#abremButton').show();
        }
        else {
            $('#absubButton').show();
            $('#abremButton').hide();
        }
    });
}


function removeAlbum(event) {
    // Remove the album or subscription from a user's list
    event.preventDefault();
    if (!confirm('Are you sure you want to remove this album?')) {return;}
    let code = $('#abinfo').find('.abcode').text();
    let data = {
        'action': 'removeAlbum',
        'code': code,
    };
    ajaxPost(data, function(response) {
        if (response.ecode !== 0) {
            let msg = response.Error;
            alert(msg);
            return;
        };
        window.location.href = '/';
    });
}


async function downloadFilesAndZip(links, names, abname) {
    // Helper function to download files and zip them
    const zip = new JSZip();
    const zipFileName = abname + '.zip';

    async function addFileToZip(url, filename) {
        try {
            const response = await fetch(url);
            const blob = await response.blob();
            zip.file(filename, blob);
            say('Added file to ZIP:', filename);
        } catch (error) {
            console.error('Error downloading or adding file to ZIP:', error);
        }
    }

    for (let i=0; i < links.length; i++) {
        await addFileToZip(links[i], names[i]);
    }

    zip.generateAsync({type: 'blob'}).then(function(content) {
        const url = URL.createObjectURL(content);
        const anchor = document.createElement('a');
        anchor.href = url;
        anchor.download = zipFileName;
        document.body.appendChild(anchor);
        anchor.click();
        document.body.removeChild(anchor);
        URL.revokeObjectURL(url); // Clean up
    });
}


function downloadAlbum(event) {
    // Download all the files in the album
    event.preventDefault();
    let ok = confirm('Do you want to download all the files in this album?');
    if (!ok) {return;}

    let code = $('#abinfo').find('.abcode').text();
    let abname = $('#abinfo').find('.abname').text();
    let data = {
        'action': 'getAlbumLinks',
        'code': code,
    };
    ajaxPost(data, function(response) {
        if (response.ecode !== 0) {
            let msg = response.Error;
            alert(msg);
            return;
        }
        let links = response['links'];
        let names = response['names'];
        downloadFilesAndZip(links, names, abname);
    });
}


// Event listeners

document.addEventListener('keydown', function(event) {
    // handle keyboard events
    if (bigArea.is(':hidden')) {
        if (event.key === 'Escape') {
            window.location.href = '/';
        }
    }
    else {
        if (event.key === 'ArrowRight') {
            nextPic(event);
        }
        if (event.key === 'ArrowLeft') {
            prevPic(event);
        }
        if (event.key === 'Escape') {
            hideBig();
        }
    }
});


$('#bigCloseButton').on('click', hideBig);
$('#imfile').on('change', filesPicked);
$('#searchButton').on('click', albumCodeEntered);
$('#absubButton').on('click', subscribe);
$('#nextButton').on('click', nextPic);
$('#prevButton').on('click', prevPic);
$('#abremButton').on('click', removeAlbum);
$('#showabsButton').on('click', function() {window.location.href = '/'});
$('#downloadButton').on('click', downloadAlbum);

bigArea.hide();
viewAlbum(getSlug());
$('#abremButton').hide();
checkAlbums();


