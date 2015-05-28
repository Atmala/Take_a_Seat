-- Export of users
select e.Surname + ' ' + e.Firstname, e.Uid, ro.IdentNumber
from Employees e
  left join EmployeeTableLinks etl 
    on etl.EmployeeId = e.Id
  left join RoomObjects ro
    on etl.RoomObjectId = ro.Id
order by e.Uid

-- Removing of walls with zero length
delete from Points where Id in
(
select p1.id
from Points p1 
  inner join Points p2 on p1.RoomObjectId = p2.RoomObjectId
  and p1.Id <> p2.Id
where 
  p1.X = p2.X and p1.Y = p2.Y
union 
select p2.id
from Points p1 
  inner join Points p2 on p1.RoomObjectId = p2.RoomObjectId
  and p1.Id <> p2.Id
where 
  p1.X = p2.X and p1.Y = p2.Y
  )
  
delete from RoomObjects
where RoomObjectTypeId = 1 
  and not exists (select * from Points p where p.RoomObjectId = RoomObjects.Id)
