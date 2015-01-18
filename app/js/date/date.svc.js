'use strict';

/**
 * This Service just keeps the values of the start and end date
 */

scheduleServices.factory('DateSVC', [function() {

    // currently using Date
    var startTime,
        endTime;

    return {

        /**
         * Resets the date to the supplied value
         * Note: - Being set by the directive, doesn't feel like the correct approach
         * @param type
         * @param value
         */
        setInitialValue: function(type, value) {
            if (type === 'dt_start' && !startTime) {
                startTime = new Date(value).getTime();

            } else if (type === 'dt_end' && !endTime) {
                endTime = new Date(value).getTime();
            }
        },

        // clears both values, used when a new project is in view
        reset: function() {
            startTime = endTime = undefined;
        },

        getStartTime: function() {
            return startTime;
        },

        getEndTime: function() {
            return endTime;
        },


        /**
         * Sets the either the startTime or endTime property
         * @param type a string which defines the startTime or endTime
         * @param newValue
         */
        setValue: function(type, newValue) {
            var oldValue;

            if (type === 'dt_start') {
                oldValue = startTime;
                if ((newValue && newValue <= endTime) || !endTime) {
                    // ok to update, so set the new value and return it
                    startTime = newValue;
                    return {newValue: startTime, oldValue: oldValue, type: type, code: 'OK'};

                } else {
                    // return error code so the end user can reset to the oldValue
                    return {oldValue: oldValue, newValue: newValue, type: type, code: 'ERROR'};
                }
            } else if (type === 'dt_end') {
                oldValue = endTime;
                if (newValue && newValue >= startTime || !startTime) {
                    // ok to update, so set the new value and return it
                    endTime = newValue;
                    return {newValue: endTime, oldValue: oldValue, type: type, code: 'OK'};

                } else {
                    // return error code so the end user can reset to the oldValue
                    return {oldValue: oldValue, newValue: newValue, type: type, code: 'ERROR'};
                }
            }
        }
    };
}]);
