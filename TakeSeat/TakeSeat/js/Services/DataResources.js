angular.module('DataResources', ['ngResource']).
    factory('MapProvider', ['$resource', function($resource) {
        return $resource('/Map/Get');
        }
    ]);