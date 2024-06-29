const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();


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
        
        bum.find('.abimage').click(function() {
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


function getUserAlbums(event) {
    let uname = $('#usernameLine').val();
    let data = {
        'action': 'getUserAlbums',
        'username': uname,
    };
    ajaxPost(data, function(response) {
        if (response['ecode'] !== 0 ){
            let msg = response['Error'];
            alert(msg);
            return;
        }
        for (let i = 0; i < response['albums'].length; i++) {
            getAlbum(response['albums'][i]);
        }
    });
}


$('#searchUserButton').click(getUserAlbums);
