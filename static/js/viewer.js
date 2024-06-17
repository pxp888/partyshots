const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
const partyLabel = $('#partyLabel')
const partyname = localStorage.getItem('partyname');


if (!partyname) {
    partyLabel.text('No party selected');
}
else {
    ajaxPost({
        action: 'getParty',
        name: partyname,
    }, function(response) {
        say('Response:', response);
        partyLabel.text('Party: ' + response.name);
    });
}







