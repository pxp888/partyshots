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
        $('#albumList').append(bum);
        bum.click(viewAlbum);
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
        $('#shotList').append(thumb);
    });
}


function viewAlbum(event) {
    event.preventDefault();
    let code = $(this).closest('.album').find('.abcode').text();

    const abinfo = $('#abinfo');
    abinfo.find('.abcode').text($(this).closest('.album').find('.abcode').text());
    abinfo.find('.abname').text($(this).closest('.album').find('.abname').text());
    abinfo.find('.abuser').text($(this).closest('.album').find('.abuser').text());
    abinfo.find('.abdate').text($(this).closest('.album').find('.abdate').text());

    let data = {
        'action': 'getThumbs',
        'code': code,
    };
    ajaxPost(data, function(response) {
        $('.shot').not('.demo').remove();
        let thumbs = response['thumbs'];
        for (let i = 0; i < thumbs.length; i++) {
            getThumb(thumbs[i]);
        }
    });
}





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
                }
            });
        }
    };
    reader.readAsDataURL(file);
    $('#imfile').val('');
}


function filesPicked(event) {
    const imdesc = $('#imdesc');
    // if (imdesc.val() === '') {
    //     alert('Please enter a description or label');
    //     return;
    // }

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


$('#createAlbumButton').on('click', createAlbum);
$('#imfile').on('change', filesPicked);


getAlbums();
