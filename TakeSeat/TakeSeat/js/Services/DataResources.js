angular.module('DataResources', ['ngResource']).
    factory('MapProvider', [
        '$resource', function($resource) {
            return $resource(':action', {}, {
                'SaveRoom': { method: 'POST', params: { action: window.saveRoomPath } },
                'SaveWall': { method: 'POST', params: { action: window.saveWallPath } },
                'SaveTable': { method: 'POST', params: { action: window.saveTablePath } },
                'SaveEmployeeTableLink': { method: 'POST', params: { action: window.saveEmployeeTableLinkPath } },
                'RemoveEmployeeTableLink': { method: 'POST', params: { action: window.removeEmployeeTableLinkPath } },
                'DeleteRoomObject': { method: 'DELETE', params: { action: window.deleteRoomObjectPath } },
                'GetRooms': { method: 'GET', params: { action: window.getRooms }, isArray: true },
                'ChangeRoom': { method: 'GET', params: { action: window.changeRoom } },
                'CreateNewRoom': { method: 'GET', params: { action: window.createNewRoom } },
                'SaveIdentNumber': { method: 'POST', params: { action: window.saveIdentNumber } },
            });
        }
    ])
    .factory('EmployeeProvider', [
        '$resource', function ($resource) {
            //return $resource('localhost:44039/Map/GetEmployeesWithoutSeat');
            return $resource(':action', {}, {
                //'query': { method: 'GET', params: { action: '/Map/GetEmployeesWithoutSeat' }, isArray: true }
                'query': { method: 'GET', params: { action: window.getEmployeesWithoutSeatPath }, isArray: true }
            });
       
 }]);