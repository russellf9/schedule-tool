'use strict';


scheduleServices.factory('DaysSVC', function() {

    var times = ['05:00', '10:30', '11:30', '14:30', '16:00', '20:00', '05:00'],
        timeDisplay = ['05:00', '10:30', '11:30', '14:30', '16:00', '20:00', '05:00'],
        slots = ['breakfast', 'mainday', 'mainday', 'mainday', 'mainday', 'mainday'];

    return {

        /**
         * Populates the object with the set of `date slots`
         *
         05:00 - 10:30
         10:30 - 11:30
         11:30 - 14:30
         14:30 - 16:00
         16:00 - 20:00
         20:00 - close/5:00
         */


        getSlots: function() {
            var num = 6,
                array = [],
                obj = {};
            for (var i = 0; i < num; i++) {
                obj = {day_part_time: slots[i], artwork_id: ''};
                array.push(obj);
            }
            return array;
        },


        /**
         *
         * @param day_type
         * @param run_daily
         * @returns {Array}
         */
        getTimeSlots: function(day_type, run_daily) {
            var num = (day_type === 'all') ? 6 : 1,
                array = [],
                obj = {};
            for (var i = 0; i < num; i++) {

                if (day_type === 'mainday') {
                    obj = {time: 'mainday', artwork_id: ''};
                } else if (day_type === 'breakfast') {
                    obj = {time: 'breakfast', artwork_id: ''};
                } else if (day_type === 'all') {
                    obj = {startTime: times[i], endTime: times[i + 1], artwork_id: ''};
                } else { // the default if there is no day_type
                    obj = {time: 'mainday', artwork_id: ''};
                }

                array.push(obj);
            }

            return array;
        }
    };
});
