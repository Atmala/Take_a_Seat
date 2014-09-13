angular.module('DataResources', ['ngResource']).
    factory('MapProvider', [
        '$resource', function($resource) {
            return $resource('/Map/:action', {}, {
                'Get': { method: 'GET', params: { action: 'Get' } },
                'SaveRoom': { method: 'POST', params: { action: 'SaveRoom' } },
                'SaveWall': { method: 'POST', params: { action: 'SaveWall' } },
                'SaveTable': { method: 'POST', params: { action: 'SaveTable' } },
                'SaveEmployeeTableLink': { method: 'POST', params: { action: 'SaveEmployeeTableLink' } },
                'RemoveEmployeeTableLink': { method: 'POST', params: { action: 'RemoveEmployeeTableLink' } },
            });
        }])
 .factory('EmployeeProvider', [
            '$resource', function($resource) {
                return $resource('/Map/:action', {}, {
                    'query': { method: 'GET', params: { action: 'GetEmployeesWithoutSeat' }, isArray: true }
                });
            }]);