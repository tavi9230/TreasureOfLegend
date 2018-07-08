import {NavigationHelper} from 'Helpers/navigationHelper';
export const Error = {
    mounted: function () {
        NavigationHelper.setLocation(window.location.origin + '/Error');
    }
};