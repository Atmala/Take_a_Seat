angular.module('DataResources', ['ngResource']).
    factory('MapProvider', [
        '$resource', function($resource) {
            return $resource('/Map/:action', {}, {
                'Get': { method: 'GET', params: { action: 'Get' } },
                'SaveRoom': { method: 'POST', params: { action: 'SaveRoom' } },
                'SaveLine': { method: 'POST', params: { action: 'SaveLine' } },
                'MoveFullImage': { method: 'POST', params: { action: 'MoveFullImage' } }
            });
        }])
 .factory('EmployeeProvider', [
            '$resource', function($resource) {
                return $resource('/Map/:action', {}, {
                    'query': { method: 'GET', params: { action: 'GetEmployeesWithoutSeat' }, isArray: true }
                });
            }]);