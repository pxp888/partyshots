const say = (...msgs) => console.log(...msgs);

const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();


// This is a convenience function for AJAX calls.  
function ajaxPost(data, successfunc) {
    $.ajax({
        type: 'POST',
        url: '/data/',
        data: data,
        headers: { 'X-CSRFToken': csrfToken, },
        success: function(response) {
            successfunc(response);
            $('#errorbar').addClass('hidden');
        }
        ,
        error: function(response) {
            $('#errorbar').removeClass('hidden');
            $('#errorbar p').html('Error: Connection Failure');
        },
    });
}


// Get the slug from the URL, which should match the album code
function getSlug() {
    let url = window.location.href;
    let parts = url.split('/');
    let slug = parts[parts.length - 2];
    return slug;
}


// return a hash value of the blob
function md5(blob) {
    const hash = CryptoJS.MD5(blob);
    return hash.toString(CryptoJS.enc.Hex);
}


// This function is called when the user clicks the search button
function codeEntered(){
    let code = $('#searchLine').val();
    msg = {
        'action': 'searchCode',
        'code': code,
    };
    ajaxPost(msg, function(response) {
        if (response['ecode'] !== 0) {
            alert('Sorry, nothing fits that code.');
            return;
        }
        else {
            if (response['type'] === 'album') {
                window.location.href = '/browse/' + code;
            }
            if (response['type'] === 'user') {
                window.location.href = '/search/' + code;
            }
        }
    });
}


$('#searchButton').click(codeEntered);

