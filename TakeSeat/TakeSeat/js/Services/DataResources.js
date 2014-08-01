angular.module('DataResources', ['ngResource']).
    factory('MapProvider', ['$resource', function($resource) {
        return $resource('/Map/:action', {}, {
            'Get': { method: 'GET', params: { action: 'Get' }, isArray: true },
            'SaveLine': { method: 'POST', params: { action: 'SaveLine' } }
        });
    }
    ]);