var modal = document.querySelector(".cmodal");
var trigger = document.querySelector(".trigger");
var closeButton = document.querySelector(".close-button");

function toggleModal() {
	modal.classList.toggle("cshow-modal");
}

function windowOnClick(event) {
	if (event.target === modal) {
		toggleModal();
	}
}

try {
	trigger.addEventListener("click", toggleModal);
	closeButton.addEventListener("click", toggleModal);
	window.addEventListener("click", windowOnClick);
} catch(e) {
	console.log("Error in loading modal");
}


document.querySelector('body').onclick = function (event) {
	if (event.target != document.querySelector('.nav-sidebar') && event.target != document.querySelector('#nav-toggle-button')) {
		document.querySelector('#nav-toggle-button').checked = false;
	}
}

window.onload = function () {
	var success_alert = document.querySelector('.alert-success');
	var error_alert = document.querySelector('.alert-failure');

	if (success_alert || error_alert) {
		this.setTimeout(function () {
			if (success_alert) {
				success_alert.remove();
			}
			if (error_alert) {
				error_alert.remove();
			}
		}, 10000);
	}
}