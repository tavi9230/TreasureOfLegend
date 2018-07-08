export const AjaxHelper = {
    get: function (uri, data) {
        return this._ajaxCall(uri, data, 'GET');
    },

    post: function (uri, data, contentType) {
        return this._ajaxCall(uri, data, 'POST', contentType);
    },

    put: function (uri, data) {
        return this._ajaxCall(uri, data, 'PUT');
    },

    // Delete is a reserved word
    remove: function (uri, data) {
        return this._ajaxCall(uri, data, 'DELETE');
    },

    _ajaxCall: function (uri, data, operation, contentType, isTraditional) {
        return $.ajax({
            url: uri,
            type: operation,
            data: data,
            contentType: contentType,
            traditional: isTraditional || false,
            error: function (xhr) {
                if (xhr.status === 401) {
                    // TODO: No content
                }
                if (xhr.status === 400) {
                    // TODO: No content
                }
                if (xhr.status === 204) {
                    // TODO: No content
                }
            }
        });
    }
};