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
        // viewAlbum(response['code']);
        window.location.href = '/browse/' + response['code'];
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
        
        bum.find('.abimage').click(function() {
            // viewAlbum(response.code);
            window.location.href = '/browse/' + response.code;
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

$('#createAlbumButton').click(createAlbum);

getAlbums();