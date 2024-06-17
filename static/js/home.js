const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();

function test() {
    ajaxPost({ 
        'action': 'test' 
    },
        function(response) {
        say(response);
    });
}

test();

