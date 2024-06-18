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
	});
}


function getEvents() {
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

getEvents();
