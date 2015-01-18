'use strict';

/**
 * A service used to perform various CRUD operations on the Firebase database
 */


scheduleServices.factory('FirebaseSVC', ['fbutil', 'globalFuncs', '$firebase', '$q', function(fbutil, globalFuncs, $firebase, $q) {

    /**
     *
     * @param error
     */
    var onComplete = function(error) {
        if (error) {
            console.log('Date Synchronization failed');
        } else {
            console.log('Date Synchronization succeeded');
        }
    };

    return {

        /**
         * Returns a promise for the creation of a new Project
         * @param data the new Project's data
         * @returns {*} the promise which contains the id of the new Project or contains the error message
         */
        createNewProject: function(data) {

            var ref = new Firebase(globalFuncs.getFirebaseUrl() + '/projects'),

                sync = $firebase(ref),

                deferred = $q.defer(),

                project = sync.$push(data).then(function(ref) {

                sync = $firebase(ref);

                var updateId = {id: ref.key()};

                sync.$update(updateId).then(function(ref) {

                    deferred.resolve(updateId);

                },function(error) {
                    deferred.resolve(error);
                });
            }, function(error) {
                deferred.resolve(error);
            });

            return deferred.promise;
        },

        /**
         * Updates the supplied key value pair to the firebase data
         * @param projectRef
         * @param obj the new data
         * @returns {*} the promise which either contains the key of the reference modified or contains the error message
         */
        update : function(projectRef, obj) {

            var deferred = $q.defer();

            $firebase(projectRef).$update(obj).then(function(ref) {
                deferred.resolve(ref.key());
            }, function(error) {
                deferred.resolve(error);
            });

            return deferred.promise;
        },

        /**
         * Creates a new Artwork in the Firebase db
         * @param data
         * @returns {*} the promise which contains the id of the new Artwork or contains the error message
         */
        createNewArtwork : function(data) {

            console.log('C CREATE ARTWORK');

            var artworkRef = new Firebase(globalFuncs.getFirebaseUrl() + '/artwork'),

                deferred = $q.defer(),

                newObj;

            newObj = artworkRef.push(data, function(error, result) {
                if (error) {
                    console.log('E CREATE ARTWORK -- ERROR! :-(');
                    deferred.resolve(error);
                } else {

                    console.log('E CREATE ARTWORK -- SUCCESS! :-)');
                    var objUid = newObj.key(),
                        updateId = {id: objUid},
                        updateObj = artworkRef.child(objUid).update(updateId);
                    deferred.resolve(updateId);
                }
            });

            return deferred.promise;
        },

        /**
         * Creates a new Product Category in the Firebase db
         * @param data the data
         * @returns {*} the promise which contains the id of the new Product or contains the error message
         */
        createProductCategory : function(data) {

            var dataRef = new Firebase(globalFuncs.getFirebaseUrl() + '/product_category'),

                deferred = $q.defer(),
                newObj;

            newObj = dataRef.push(data, function(error, result) {
                if (error) {
                    deferred.resolve(error);
                } else {
                    var objUid = newObj.key(),
                        updateId = {id: objUid},
                        updateObj = dataRef.child(objUid).update(updateId);
                    deferred.resolve(updateId);
                }
            });

            return deferred.promise;
        },

        /**
         * Creates a new Asset in the Firebase db
         * @param data the new asset data
         * @returns {*} the promise which contains the id of the new Asset or contains the error message
         */
        createAsset : function(data) {

            var dataRef = new Firebase(globalFuncs.getFirebaseUrl() + '/asset'),

                deferred = $q.defer(),
                newObj = dataRef.push(data, function(error, result) {
                if (error) {
                    deferred.resolve(error);
                } else {
                    var objUid = newObj.key(),
                        updateId = {id: objUid},
                        updateObj = dataRef.child(objUid).update(updateId);
                    deferred.resolve(updateId);
                }
            });

            return deferred.promise;
        }
    };
}]);
