const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();

// Create a new album object and view its contents
function createAlbum(event) {
    event.preventDefault();
    let name = $('#createNameLine').val();
    if (name === '') {
        alert('Please enter a name for the album');
        return;
    }

    let data = {
        'action': 'createAlbum',
        'name': name,
    };

    ajaxPost(data, function(response) {
        if (response['ecode'] !== 0 ){
            let msg = response['Error'];
            alert(msg);
            return;
        }
        getAlbum(response['code']);
        viewAlbum(response['code']);
    });
}


// Get the shortcut for an album object
function getAlbum(code) {
    let data = {
        'action': 'getAlbum',
        'code': code,
    };
    ajaxPost(data, function(response) {
        let bum = $('.album.demo').clone().removeClass('demo');
        bum.find('.abuser').text(response.user);
        bum.find('.abcode').text(response.code);
        bum.find('.abname').text(response.name);
        bum.find('.abdate').text(response.created_at);
        bum.find('.abts').text(response.timestamp);
        bum.find('.abremove').click(removeAlbum);

        // $('#albumList').append(bum);
        
        bum.click(function() {
            viewAlbum(response.code);
        });

        if (response.thumbnail!==null) {
            bum.find('.abimage').attr('src', response.thumbnail);
        }

        let albums = $('.album').not('.demo');
        for (let i = 0; i < albums.length; i++) {
            let a = +$(albums[i]).find('.abts').text();
            let b = +bum.find('.abts').text();
            if (a > b) {
                $(albums[i]).before(bum);
                return;
            }
        }
        $('#albumList').append(bum);
    });
}


// Remove an album object
function removeAlbum(event) {
    event.preventDefault();
    let albumElement = $(this).closest('.album');
    let code = albumElement.find('.abcode').text();
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
        albumElement.remove();
    });
}


// Get a list of albums that should be displayed. 
function getAlbums() {
    let data = {
        'action': 'getAlbums',
    };
    ajaxPost(data, function(response) {
        let bums = response['albums'];
        for (let i = 0; i < bums.length; i++) {
            getAlbum(bums[i]);
        }
    });
}


// Get the thumbnail for a photo object
function getThumb(photoid) {
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
        thumb.click(viewBig);
        thumb.find('.shremove').click(removeShot);
        // $('#shotList').append(thumb);

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


// View the contents of an album object
function viewAlbum(code) {
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


// View the full size image of a photo object
function viewBig(event) {
    event.preventDefault();
    let code = $(this).closest('.shot').find('.shid').text();
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
    });
}


// Remove a photo object
function removeShot(event) {
    event.preventDefault();
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


// Upload a single file to the server
function uploadFile(file) {
    const chunkSize = 1024 * 1024;
    const filename = file.name;

    let reader = new FileReader();
    reader.onload = function(e) {
        let blob = e.target.result;
        let hash = md5(blob);
        say('test', blob.slice(0, 100))

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


// Handle the file selection event
function filesPicked(event) {
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


// View the album with the given code
function albumCodeEntered(event) {
    event.preventDefault();
    let code = $('#searchLine').val();
    if (code === '') {
        alert('Please enter an album code');
        return;
    }
    viewAlbum(code);
}


// Subscribe to an album owned by another user
function subscribe(event) {
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
        getAlbum(code);
    });
}


// The following functions handle item focus and which areas are showing
function focusAlbums() {
    $('#albumArea').show();
    $('#shotArea').hide();
    $('#bigArea').hide();
}

function focusShots(event) {
    if (event.target.className === 'abremove') {return;}
    if (event.target.parentElement.className === 'abremove') {return;}

    $('#albumArea').hide();
    $('#shotArea').show();
    $('#bigArea').hide();
}

function focusBig(event) {
    let target = event.target.className;
    if (target === 'shimage'){
        $('#albumArea').hide();
        $('#shotArea').hide();
        $('#bigArea').show();
    }
}

$('#albumList').click(focusShots);
$('#shotList').click(focusBig);
$('#bigimdiv').click(focusShots);
$('#showabsButton').click(focusAlbums);
$('#searchButton').click(focusShots);
focusAlbums();


$('#createAlbumButton').on('click', createAlbum);
$('#imfile').on('change', filesPicked);
$('#searchButton').on('click', albumCodeEntered);
$('#absubButton').on('click', subscribe);
getAlbums();

