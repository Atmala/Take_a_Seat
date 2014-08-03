angular.module('DataResources', ['ngResource']).
    factory('MapProvider', ['$resource', function($resource) {
        return $resource('/Map/:action', {}, {
            'Get': { method: 'GET', params: { action: 'Get' } },
            'SaveLine': { method: 'POST', params: { action: 'SaveLine' } },
            'MoveFullImage': { method: 'POST', params: { action: 'MoveFullImage' } }
        });
    }
    ]);