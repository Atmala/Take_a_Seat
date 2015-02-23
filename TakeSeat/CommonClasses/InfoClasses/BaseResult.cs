using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CommonClasses.InfoClasses
{
    public enum ResultTypeEnum
    {
        NotLoggedIn,
        AccessDenied,
        Error,
        Success
    }
    public class BaseResult
    {
        private ResultTypeEnum _resultType = ResultTypeEnum.Success;
        public ResultTypeEnum ResultType
        {
            get { return _resultType; }
            set { _resultType = value; }
        }

        private string _errorMessage;
        public string ErrorMessage
        {
            get { return _errorMessage; }
            set
            {
                _errorMessage = value;
                _resultType = ResultTypeEnum.Error;
            }
        }

        public bool IsSuccess()
        {
            return _resultType == ResultTypeEnum.Success;
        }

        public bool IsNotLoggedIn()
        {
            return _resultType == ResultTypeEnum.NotLoggedIn;
        }

        public bool IsError()
        {
            return _resultType == ResultTypeEnum.Error;
        }
    }
}
