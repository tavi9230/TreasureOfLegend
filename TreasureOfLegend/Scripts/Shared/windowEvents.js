export const WindowEvents = {
	add: function (eventName, callback) {
		$(window).on(eventName, callback);
	},
	remove: function (eventName, callback) {
		$(window).off(eventName, callback);
	}
};