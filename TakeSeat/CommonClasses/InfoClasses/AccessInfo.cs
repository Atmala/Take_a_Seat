using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;

namespace CommonClasses.InfoClasses
{
    public class AccessInfo
    {
        public bool EditPlan { get; private set; }
        public bool SetTableInformation { get; private set; }
        public bool Search { get; private set; }

        public AccessInfo(bool editPlan, bool setTableInformation, bool search)
        {
            EditPlan = editPlan;
            SetTableInformation = setTableInformation;
            Search = search;
        }
    }
}
