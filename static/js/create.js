const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();
const genbutton = $('#genbutton');
const createbutton = $('#createbutton');
const evnameline = $('#evnameline');
const msgline= $('#msgline');

function genbuttonClick(event) {
    event.preventDefault();
    ajaxPost({
        action: 'generateName',
    }, function(response) {
        say('Response:', response);
        evnameline.val(response.name);
    });
}


function checkName(event) {
    event.preventDefault();
    const name = evnameline.val();
    
    if (name.length === 0) {
        msgline.text('');
        return;
    }

    if (name.length < 5) {
        msgline.text('Name is too short');
        return;
    }

    ajaxPost({
        action: 'checkName',
        name: name, 
    }, function(response) {
        say('Response:', response);
        if (response.exists) {
            msgline.text('Name already exists');
        } else {
            msgline.text('Name is available');
        }
    });
}


function createParty(event) {
    event.preventDefault();
    const name = evnameline.val();
    if (name.length < 5) {
        msgline.text('Name is too short');
        return;
    }

    ajaxPost({
        action: 'createParty',
        name: name,
    }, function(response) {
        say('Response:', response);
        if (response.success) {
            localStorage.setItem('partyname', name);
            window.location.href = '/viewer';
        } else {
            msgline.text('Failed to create party');
        }
    });
}


genbutton.click(genbuttonClick);
evnameline.on('input', checkName);
createbutton.click(createParty);

localStorage.removeItem('partyname');

