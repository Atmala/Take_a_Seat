using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CommonClasses.InfoClasses
{
    public class MethodResult<T> : BaseResult
    {
        public T AttachedObject { get; set; }

        public MethodResult() { }

        public MethodResult(T obj)
        {
            AttachedObject = obj;
        }
    }
}
