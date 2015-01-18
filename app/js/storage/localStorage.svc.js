'use strict';

/**
 *  A service responsible for saving and getting values from local storage
 */
scheduleServices.factory('storageSVC', ['$log', function($log) {
    return {
        visited: function() {
            // keep the values as strings
            return (localStorage.visited) ? (localStorage.visited && localStorage.visited === 'true') : false;
        },

        setVisited : function(value) {
            localStorage.setItem('visited', value);
        },

        canImportData : function() {
            return false;
        },

        canExportData : function() {
            return this.isEditMode();
        },

        isEditMode : function() {
            return (localStorage.editMode) ? (localStorage.editMode && localStorage.editMode === 'true') : false;
        },
        /**
         * Sets the property of the edit mode to the supplied value
         * If the new value is undefined will set the property to false
         * @param value
         */
        setEditMode : function(value) {
            if (value && value.toLowerCase() === 'true') {
                localStorage.setItem('editMode', 'true');
            } else if (!value || value.toLowerCase() === 'false') {
                localStorage.setItem('editMode', 'false');
            } else {
                $log.error('Can only set `editMode` to `true` or `false` - not: ', value);
            }
        }
    };
}]);

