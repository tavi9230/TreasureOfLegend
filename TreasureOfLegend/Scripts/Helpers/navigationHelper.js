export const NavigationHelper = {
    setLocation: function(newLocation) {
        window.location = newLocation;
    },
    getLocation: function() {
        return window.location;
    },
    openLocationInNewTab: function(location) {
        window.open(location, '_blank');
    },
    getTabName: function() {
        return window.location.hash.split('/')[1];
	},
	isLanding: function () {
		return window.location.hash.split('/')[1] === '';
	}
};