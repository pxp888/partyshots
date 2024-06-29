const say = (...msgs) => console.log(...msgs);


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


function md5(blob) {
    const hash = CryptoJS.MD5(blob);
    return hash.toString(CryptoJS.enc.Hex);
}


function codeEntered(){
    let code = $('#searchLine').val();
    window.location.href = '/browse/' + code;
}

$('#searchButton').click(codeEntered);