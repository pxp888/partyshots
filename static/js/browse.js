const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
const bigArea = $('#bigArea');


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


// Handle thumbnail click event
function viewBig(event) {
    if (event.target.className === 'shremove') {return;}
    event.preventDefault();
    let code = $(this).closest('.shot').find('.shid').text();
    showBig(code);
}


// View the full size image of a photo object
function showBig(code) {
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


// Hide the full size image
function hideBig() {
    bigArea.hide();
}


// Remove a photo object
function removeShot(event) {
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


// Upload a single file to the server
function uploadFile(file) {
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
        viewAlbum(code);
        checkAlbums();
    });
}


// show the next image in the list
function nextPic(event) {
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


// show the previous image in the list
function prevPic(event) {
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


// Get the slug from the URL, which should match the album code
function getSlug() {
    let url = window.location.href;
    let parts = url.split('/');
    let slug = parts[parts.length - 2];
    return slug;
}


// check ownership of the album, and show the appropriate buttons
function checkAlbums() {
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


document.addEventListener('keydown', function(event) {
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

viewAlbum(getSlug());
bigArea.hide();
$('#abremButton').hide();
checkAlbums();


