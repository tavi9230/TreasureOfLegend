var VueScrollTo = require('vue-scrollto');

export const Scroll = {
    scrollTo: function(container, element, position, duration) {
        var scrollOptions = {
            container: container,
            easing: 'ease-in',
            offset: position,
            cancelable: true,
            x: false,
            y: true
        };

        VueScrollTo.scrollTo(element, duration, scrollOptions);
    }
};