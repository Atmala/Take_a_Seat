angular.module('DataResources', ['ngResource']).
    factory('MapProvider', [
        '$resource', function($resource) {
            return $resource('/Map/:action', {}, {
                'Get': { method: 'GET', params: { action: 'Get' } },
                'SaveRoom': { method: 'POST', params: { action: 'SaveRoom' } },
                'SaveWall': { method: 'POST', params: { action: 'SaveWall' } },
                'MoveFullImage': { method: 'POST', params: { action: 'MoveFullImage' } }
            });
        }])
 .factory('EmployeeProvider', [
            '$resource', function($resource) {
                return $resource('/Map/:action', {}, {
                    'query': { method: 'GET', params: { action: 'GetEmployeesWithoutSeat' }, isArray: true }
                });
            }]);