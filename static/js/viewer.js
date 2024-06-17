const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
const partyLabel = $('#partyLabel')
const partyname = localStorage.getItem('partyname');
const photolist = $('#photolist');
const addButton = $('#addButton');


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


function addButtonClicked(event) {
    event.preventDefault();
    
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/*';
    
}


addButton.click(addButtonClicked);




