const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();


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
        
        $('#albumList').append(bum);
        
        bum.click(function() {
            viewAlbum(response.code);
        });

        if (response.thumbnail!==null) {
            bum.find('.abimage').attr('src', response.thumbnail);
        }
    });
}


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
        thumb.click(viewBig);
        thumb.find('.shremove').click(removeShot);
        $('#shotList').append(thumb);
    });
}


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
                }
            });
        }
    };
    reader.readAsDataURL(file);
}


function filesPicked(event) {
    const imdesc = $('#imdesc');
    if (imdesc.val() === '') {
        alert('Please enter a description or label');
        return;
    }

    let abcode = $('#abinfo').find('.abcode').text();
    if (abcode.length < 10) {
        alert('Please select an album');
        return;
    }

    let files = event.target.files;
    for (let i = 0; i < files.length; i++) {
        uploadFile(files[i]);
    }
}


function albumCodeEntered(event) {
    event.preventDefault();
    let code = $('#searchLine').val();
    if (code === '') {
        alert('Please enter an album code');
        return;
    }
    viewAlbum(code);
}



$('#createAlbumButton').on('click', createAlbum);
$('#imfile').on('change', filesPicked);
$('#searchButton').on('click', albumCodeEntered);

getAlbums();

