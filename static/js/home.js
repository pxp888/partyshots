const csrfToken = $('input[name="csrfmiddlewaretoken"]').val();

const viewEventButton = $("#viewEventButton");
const event_id = $("#event_id");

function viewEvent(event) {
	event.preventDefault();
}

viewEventButton.click(viewEvent);
