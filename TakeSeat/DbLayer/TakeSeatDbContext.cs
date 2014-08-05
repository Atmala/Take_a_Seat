using System;
using System.Collections.Generic;
using System.Data.Entity;
using System.Data.Entity.ModelConfiguration.Conventions;
using System.Linq;
using System.Linq.Expressions;
using CommonClasses.Database;

namespace DbLayer
{
    public class TakeSeatDbContext: DbContext
    {
        public DbSet<Room> Rooms { get; set; }
        public DbSet<RoomObject> RoomObjects { get; set; }
        public DbSet<RoomObjectType> RoomObjectTypes { get; set; }
        public DbSet<Point> Points { get; set; }
        public DbSet<Rectangle> Rectangles { get; set; }

        #region Auxilliary Properties and Methods

        private Dictionary<Type, object> _dbSetDict;
        protected Dictionary<Type, object> DbSetDict
        {
            get
            {
                if (_dbSetDict == null) InitializeDbSetDict();
                return _dbSetDict;
            }
        }

        private void InitializeDbSetDict()
        {
            _dbSetDict = new Dictionary<Type, object>();
            var propertyInfos = GetType().GetProperties();
            foreach (var propertyInfo in propertyInfos)
            {
                if (propertyInfo.PropertyType.FullName != null && propertyInfo.PropertyType.FullName.StartsWith("System.Data.Entity.DbSet"))
                {
                    _dbSetDict.Add(propertyInfo.PropertyType.GenericTypeArguments[0], propertyInfo.GetValue(this));
                }
            }
        }

        public DbSet<T> GetDbSet<T>() where T : class, IMapping
        {
            object result;
            if (!DbSetDict.TryGetValue(typeof(T), out result))
                throw new Exception("There is no DbSet for class " + typeof(T).Name);
            return (DbSet<T>)result;
        }

        protected override void OnModelCreating(DbModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            modelBuilder.Conventions.Remove<OneToManyCascadeDeleteConvention>();
        }

        public void Add<T>(T record) where T : class, IMapping
        {
            GetDbSet<T>().Add(record);
        }

        public T GetById<T>(int id) where T : class, IMapping
        {
            var param = Expression.Parameter(typeof(T), "e");
            var predicate =
                Expression.Lambda<Func<T, bool>>(Expression.Equal(Expression.Property(param, typeof(T).Name + "Id"),
                                                                  Expression.Constant(id)), param);
            return GetDbSet<T>().SingleOrDefault(predicate);
        }

        #endregion
    }
}
