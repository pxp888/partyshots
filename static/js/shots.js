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



function viewAlbum(event) {
    event.preventDefault();
    let code = $(this).closest('.album').find('.abcode').text();

    const abinfo = $('#abinfo');
    abinfo.find('.abcode').text($(this).closest('.album').find('.abcode').text());
    abinfo.find('.abname').text($(this).closest('.album').find('.abname').text());
    abinfo.find('.abuser').text($(this).closest('.album').find('.abuser').text());
    abinfo.find('.abdate').text($(this).closest('.album').find('.abdate').text());

    data = {
        'action': 'getPhotos',
        'code': code,
    };
    ajaxPost(data, function(response) {
        say(response);
    });
}




function uploadFile(file) {
    let reader = new FileReader();
    reader.onload = function(e) {
        $('#shotArea').show();
        $('#shotArea').attr('src', e.target.result);
        let abcode = $('#abinfo').find('.abcode').text();
        let imdesc = $('#imdesc').val();
        let data = {
            'action': 'addPhoto',
            'code': abcode,
            'imdesc': imdesc,
            'blob': e.target.result,
            'filename': file.name,
        };
        ajaxPost(data, function(response) {
            if (response['ecode'] !== 0 ){
                let msg = response['Error'];
                alert(msg);
                return;
            }
        });
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
    if (abcode === '') {
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


// $('#shotArea').hide();
getAlbums();

