angular.module('DataResources', ['ngResource']).
    factory('MapProvider', [
        '$resource', function($resource) {
            return $resource(':action', {}, {
                'Get': { method: 'GET', params: { action: '/Map/Get' } },
                'SaveRoom': { method: 'POST', params: { action: '/Map/SaveRoom' } },
                'SaveWall': { method: 'POST', params: { action: '/Map/SaveWall' } },
                'SaveTable': { method: 'POST', params: { action: '/Map/SaveTable' } },
                'SaveEmployeeTableLink': { method: 'POST', params: { action: '/Map/SaveEmployeeTableLink' } },
                'RemoveEmployeeTableLink': { method: 'POST', params: { action: '/Map/RemoveEmployeeTableLink' } },
                'DeleteRoomObject': { method: 'DELETE', params: { action: '/Map/DeleteRoomObject' } },
                'GetRooms': { method: 'GET', params: { action: '/Map/GetRooms' }, isArray: true },
                'ChangeRoom': { method: 'GET', params: { action: '/Map/ChangeRoom' } },
                'CreateNewRoom': { method: 'GET', params: { action: '/Map/CreateNewRoom' } },
                'SaveIdentNumber': { method: 'POST', params: { action: '/Map/SaveIdentNumber' } },
            });
        }
    ])
    .factory('EmployeeProvider', [
        '$resource', function($resource) {
            //return $resource('localhost:44039/Map/GetEmployeesWithoutSeat');
            return $resource(':action', {}, {
                'query': { method: 'GET', params: { action: '/Map/GetEmployeesWithoutSeat' }, isArray: true }
            });
       
 }]);