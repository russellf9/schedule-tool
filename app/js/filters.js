'use strict';

/* Filters */

angular.module('scheduleFilters', []).filter('checkmark', function() {
    return function(input) {
        return input ? '\u2713' : '\u2718';
    };
});


angular.module('scheduleFilters').filter('momentDay', function($filter) {
    return function(input) {
        if (!input || input === null || input === 'undefined' || input === '') {
            return '';
        }
        // will get the week day as a number
        var day = moment(input).day();
        return moment.weekdays(day);
    };
});



/**
 * TODO - there is a 'repeat` happening here which needs to be looked at
 */
angular.module('scheduleFilters').filter('momentDateFilter', function($filter) {
    return function(input) {
        if (!input || input === null || input === 'undefined' || input === '') {
            return '';
        }
        var _date = $filter('date')(new Date(input), 'EEE: yyyy-MM-dd');
        return _date;
    };
});


angular.module('scheduleFilters').filter('dateFilter', function($filter) {
    return function(input) {
        console.log('input', input);

        //var moment = moment(input);
        //
        //return moment;


        var _date = $filter('date')(new Date(input), 'EEE: yyyy-MM-dd');
        return _date;
    };
});


/**
 * @param input an Object
 * @param filterKey the key within the `input` object to find
 * @param filterVal the value of the `key` to match
 */
angular.module('scheduleFilters').filter('objectByKeyValFilter', function() {
    return function(input, filterKey, filterVal) {

        var isBoolean = function(value) {
                return (value.toString().toLowerCase() === 'true' || value.toString().toLowerCase() === 'false');
            },

            convertToBoolean = function(value) {
                return value.toString().toLowerCase() === 'true';
            },

            filteredInput = {};

        angular.forEach(input, function(value, key) {


            // check for null property as well!
            if (value && value.hasOwnProperty(filterKey)) {

                var compareBoolean = isBoolean(value[filterKey]),

                    keyValue;

                // if the filterKey is a boolean we must compare the boolean values
                if (compareBoolean) {
                    // 1. convert the key
                    keyValue = convertToBoolean(value[filterKey]);

                    // and the comparison
                    filterVal = convertToBoolean(filterVal);

                } else {

                    // we compare strings
                    keyValue = value[filterKey].toString().toLowerCase();

                    filterVal = filterVal.toString().toLowerCase();
                }

                if (keyValue !== filterVal) {
                    filteredInput[key] = value;
                }
            }
        });
        return filteredInput;
    };
});

angular.module('scheduleFilters').filter('objectKeyContainsVal', function() {
    return function(input, filterKey, filterVal) {

        // if the search item has not been set yet return all
        if (!filterVal) {
            return input;
        }

        var filteredInput = {};

        angular.forEach(input, function(value, key) {

            // check for null as well
            if (value && value[filterKey]) {

                // search without case
                var index = String(value[filterKey]).toLowerCase().indexOf(String(filterVal).toLowerCase());

                // if found add to the return value
                if (index > -1) {
                    filteredInput[key] = value;
                }
            }
        });
        return filteredInput;
    };
});

// filter using the classic JS sort
// sorts on the `field` parameter
angular.module('scheduleFilters').filter('orderObjectBy', function() {
    return function(items, field, reverse) {

        if (!field) {
            return items;
        }

        // utility function
        function isNumeric(num) {
            return !isNaN(num);
        }

        // test if first char is `-`
        if (field.indexOf('-') === 0) {
            field = field.substring(1);
            reverse = 'reverse';
        }

        var filtered = [];

        // push the items into an array
        angular.forEach(items, function(item, key) {
            filtered.push(item);
        });


        // seems to be working for all cases...

        // NOTE - should really check the key value - ie what `type` is in the item[field]
        if (!isNumeric(field)) {
            // now use string sort

            filtered.sort(function(a, b) {

                if (a[field].toString().toLocaleLowerCase() > b[field].toString().toLocaleLowerCase()) {
                    return 1;
                }
                if (a[field].toString().toLocaleLowerCase() < b[field].toString().toLocaleLowerCase()) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });


        } else {
            // now use the classic alpha-numeric sort

            filtered.sort(function(a, b) {

                if (a[field] > b[field]) {
                    return 1;
                }
                if (a[field] < b[field]) {
                    return -1;
                }
                // a must be equal to b
                return 0;
            });
        }

        if (reverse && reverse === 'reverse') {
            filtered.reverse();
        }

        return filtered;
    };
});

/**
 * Returns the supplied object as an array
 * Useful when we want to return the correct $index value
 */
angular.module('scheduleFilters').filter('arrayFilter', function() {
    return function(input) {

        if (!input) {
            return [];
        }

        var array = [];

        angular.forEach(input, function(item) {
            array.push(item);
        });

        var filteredInput = [];

        for (var i = 0; i < array.length; i++) {
            filteredInput.push(array[i]);
        }

        return filteredInput;
    };
});

/**
 * For returning an array of artworks, which do not include those with the supplied `id`
 * also, only returns artworks which are not `stitched`
 * // TODO make more generic
 */
angular.module('scheduleFilters').filter('arrayWithoutSelf', function() {
    return function(input, id) {

        if (!input) {
            return [];
        }

        var filteredInput = [];

        angular.forEach(input, function(item) {
            if (item.id !== id && item.stitched !== 'yes') {
                filteredInput.push(item);
            }
        });

        return filteredInput;
    };
});

/**
 * A filter for the checkbox type data, will compare the `yes` or `no` to
 * the `true` or `false` property.
 * @param filterKey the key within the `input` object to find
 * @param filterVal the value filter will be true or false
 */
angular.module('scheduleFilters').filter('booleanKeyValFilter', function() {

    var convertToBoolean = function(value) {
        return (value.toString().toLowerCase() === 'true') || (value.toString().toLowerCase() === 'yes');
    };

    return function(input, filterKey, filterVal) {

        if (!filterVal || filterVal === 'false') {
            return input;
        }
        var filteredInput = {};

        angular.forEach(input, function(value, key) {
            // double-check for null property as well!
            if (value && value.hasOwnProperty(filterKey)) {
                // we need to compare the checkbox flags
                if (filterVal && convertToBoolean(value[filterKey])) {
                    filteredInput[key] = value;

                } else if (!filterVal && !convertToBoolean(value[filterKey])) {
                    filteredInput[key] = value;
                }
            }
        });

        return filteredInput;
    };
});

/**
 * Removes items which have a $id which is undefined.
 */
angular.module('scheduleFilters').filter('nullFilter', function() {

    return function(input, filterKey, filterVal) {

        var filteredInput = [];

        angular.forEach(input, function(value, key) {
            if (value.$id && (value.$id !== 'undefined')) {
                filteredInput.push(value);
            }
        });

        return filteredInput;
    };
});

angular.module('scheduleFilters').filter('nl2br', function($filter) {
    return function(data) {
        if (!data) {
            return data;
        }
        return data.replace(/\n\r?/g, '<br />');
    };
});

angular.module('scheduleFilters').filter('sanitize', ['$sce', function($sce) {
    return function(htmlCode) {
        return $sce.trustAsHtml(htmlCode);
    };
}]);

angular.module('scheduleFilters').filter('capitalizeAllWords', function() {
    return function(input, scope) {

        return input.replace(/\w\S*/g, function(txt) {
            return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();
        });
    };
});


