const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
const eventNameLine = $('#eventNameLine');
const findButton = $('#findButton');
const msgLine = $('#msgLine');

function findParty(event) {
    event.preventDefault();
    const name = eventNameLine.val();
    
    ajaxPost({
        action: 'findParty',
        name: name,
    }, function(response) {
        say('Response:', response);
        if (response.exists) {
            localStorage.setItem('partyname', name);
            window.location.href = '/viewer';
        } else {
            msgLine.text('Name not found');
        }
    });
}

findButton.click(findParty);

localStorage.removeItem('partyname');
