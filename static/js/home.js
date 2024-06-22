const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();

const searchLine = $('#searchLine');
const searchButton = $('#searchButton');

const nameLine = $('#nameLine');
const randomizeNameButton = $('#randomizeNameButton');
const descriptionLine = $('#descriptionLine');
const submitButton = $('#submitButton');


function randomName(event) {
	event.preventDefault();
	ajaxPost({
		'action': 'generateName'
	}, function(response) {
		
		nameLine.val(response.name);
	});
}


function eventView(name) {
	$('#createEventDiv').hide();
	$('#eventList').hide();
	$('#eventDetailDiv').show();
	$('#addFileDiv').show();
	$('#photoList').show();

	ajaxPost({
		'action': 'getEvent',
		'name': name
	}, function(response) {
		let det = $('#eventDetailDiv');
		det.find('.nameLabel').text(response.name);
		det.find('.descriptionLabel').text(response.description);
		det.find('.ownerLabel').text(response.owner);
		det.find('.createdLabel').text(response.created);
	});
}



function addFile(event) {
    event.preventDefault();
    let files = $('#fileInput').prop('files');
    if (files.length > 0) {
        let file = files[0];
        let reader = new FileReader();
        reader.onload = function(e) {
            let contents = e.target.result;
			ajaxPost({
				'action': 'addPhoto',
				'name': $('#eventDetailDiv .nameLabel').text(),
				'data': contents
			}, function(response) {
				say(response);
				// let photoDiv = $('.photoDiv.demo').clone().removeClass('demo').addClass('photoDiv');
				// photoDiv.find('.nameLabel').text(response.name);
				// photoDiv.find('.ownerLabel').text(response.owner);
				// photoDiv.find('.createdLabel').text(response.created);
				// photoDiv.find('.photo').attr('src', response.file);
				// photoDiv.appendTo('#photoList');
			});
        };
        reader.readAsDataURL(file);
    }
}


function eventClicked(event) {
	let name = event.currentTarget.querySelector('.nameLabel').innerText;
	eventView(name);
}


function getEvent(name) {
	ajaxPost({
		'action': 'getEvent',
		'name': name
	}, function(response) {
		let eventDiv = $('.eventDiv.demo').clone().removeClass('demo').addClass('eventDiv');
		eventDiv.find('.nameLabel').text(response.name);
		eventDiv.find('.descriptionLabel').text(response.description);
		eventDiv.find('.ownerLabel').text(response.owner);
		eventDiv.find('createdLabel').text(response.created);
		eventDiv.appendTo('#eventList');
		eventDiv.click(eventClicked);
	});
}


function getEvents() {
	$('#createEventDiv').show();
	$('#eventList').show();
	$('#eventDetailDiv').hide();
	$('#addFileDiv').hide();
	$('#photoList').hide();

	$('.eventDiv').not('.demo').remove();
	ajaxPost({
		'action': 'getEvents',
	}, function(response) {
		let events = response.events;
		for (let i=0; i<events.length; i++) {
			getEvent(events[i]);
		};
	});
}


function createEvent(event) {
	event.preventDefault();
	if (nameLine.val()==='') {
		alert('Please enter a valid event name');
		return;
	}

	ajaxPost({
		'action': 'createEvent',
		'name': nameLine.val(),
		'description': descriptionLine.val()
	}, function(response) {
		if (response.error===1){
			alert('An event with that name already exists');
		}
		getEvents();
	});
}


randomizeNameButton.click(randomName);
submitButton.click(createEvent);
$('#fileInput').change(addFile);
getEvents();

