angular.module('DataResources', ['ngResource']).
    factory('MapProvider', [
        '$resource', function($resource) {
            return $resource('/Map/:action', {}, {
                'Get': { method: 'GET', params: { action: 'Get' } },
                'SaveRoom': { method: 'POST', params: { action: 'SaveRoom' } },
                'SaveWall': { method: 'POST', params: { action: 'SaveWall' } },
                'SaveTable': { method: 'POST', params: { action: 'SaveTable' } },
            });
        }])
 .factory('EmployeeProvider', [
            '$resource', function($resource) {
                return $resource('/Map/:action', {}, {
                    'query': { method: 'GET', params: { action: 'GetEmployeesWithoutSeat' }, isArray: true }
                });
            }]);