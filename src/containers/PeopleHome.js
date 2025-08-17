import { useContext, useState, useEffect } from "react";
import { Box } from "@mui/material";
import PeopleDetails from "./PeopleDetails";
import EmployeeForm from "../components/PeopleComponents/EmployeeForm";
import EmployeeSnackbar from "../components/PeopleComponents/Snackbar";
import ActionButtonEmployee from "../components/PeopleComponents/EndEmployment";
import StateContext from "../context/StateContext";
import { useLocation } from "react-router-dom";
const api = require("../assets/FetchServices");

const getHomePath = (location) => {
  const fullUrl = window.location.href;
  const relativeUrl = location.pathname;
  if (fullUrl === relativeUrl) {
    return fullUrl;
  }
  return fullUrl.substring(0, fullUrl.indexOf(relativeUrl));
};

/**
 * This function enables users to view employees' details. Only the administrator can view all the details.
 * @param {*} props
 * @returns React component
 */
function PeopleHome() {
  const stateContext = useContext(StateContext);
  const location = useLocation();
  const [viewOnly, setViewOnly] = useState(true); // view by default
  const [selectedEmployee, setSelectedEmployee] = useState();
  const [alert, setAlert] = useState({ show: false });
  const [openEndEmployment, setOpenEndEmployment] = useState(false);
  const [linkSent, setLinkSent] = useState(false);

  // Check for employee selection from UpdatesPage
  useEffect(() => {
    const selectedEmployeeId = sessionStorage.getItem("selectedEmployeeId");
    if (selectedEmployeeId) {
      sessionStorage.removeItem("selectedEmployeeId"); // Clear it to avoid repeated triggers

      // Fetch the employee data and set it as selected
      const fetchAndSelectEmployee = async () => {
        try {
          const employeeData = await api.employee.fetchOne(selectedEmployeeId);
          if (employeeData) {
            setSelectedEmployee(employeeData);
            setViewOnly(true); // Set to view-only mode to show the employee details
          }
        } catch (error) {
          console.error("❌ Error fetching employee data:", error);
        }
      };

      fetchAndSelectEmployee();
    }
  }, []); // Run only once on component mount

  const handleEdit = async (data) => {
    if (!data) {
      console.error("❌ handleEdit called with null/undefined data");
      return;
    }

    try {
      // Clear cached employee data to force fresh fetch
      stateContext.updateState("pdEmployees", null);
      stateContext.updateState("pdMyTeam", null);

      // Force fresh data fetch for editing to avoid stale cache issues
      const freshEmployeeData = await api.employee.fetchOne(data.empId);

      if (freshEmployeeData) {
        setViewOnly(false);
        setSelectedEmployee({ ...freshEmployeeData });
      } else {
        console.warn("⚠️ Could not fetch fresh data, using cached data");
        setViewOnly(false);
        setSelectedEmployee({ ...data });
      }
    } catch (error) {
      console.error("❌ Error fetching fresh employee data:", error);
      setViewOnly(false);
      setSelectedEmployee({ ...data });
    }
  };

  const handleTermination = (data) => {
    // Clear cached data to ensure fresh data on return
    stateContext.updateState("pdEmployees", null);
    stateContext.updateState("pdMyTeam", null);

    setOpenEndEmployment(true);
    setSelectedEmployee(data);
  };

  const handleSurvey = async (data) => {
    if (!data || !data.empId) {
      return;
    }
    const params = {
      empId: data.empId,
      email: data.email,
      frontendUrl: `${getHomePath(location)}/`,
    };
    await api.offboarding.createOne(params);
    setLinkSent(true); // if the operation is successful
    setTimeout(() => {
      setLinkSent(false); // reset the variable
    }, 5000);
  };

  const handleAddNewEmployee = () => {
    setViewOnly(false);
    setSelectedEmployee(null);
  };

  const handleSave = () => {
    setViewOnly(true);
    const alertData = {
      show: true,
      message: selectedEmployee ? `Record successfully updated.` : `Employee successfully added.`,
    };
    setAlert(alertData);
    stateContext.updateState("pdEmployees", null); // Force reload of data
  };

  return (
    <Box>
      {linkSent && <EmployeeSnackbar isOpen={true} message={"Offboarding link has been sent to the user email"} />}
      {openEndEmployment && (
        <>
          {console.log("🖥️ Rendering ActionButtonEmployee dialog")}
          <ActionButtonEmployee
            empId={selectedEmployee && selectedEmployee.empId}
            open={openEndEmployment}
            onClose={setOpenEndEmployment}
          />
        </>
      )}
      {viewOnly && (
        <Box>
          <EmployeeSnackbar isOpen={alert.show} message={alert.message} />
          <PeopleDetails
            handleSurvey={handleSurvey}
            handleTermination={handleTermination}
            handleEdit={handleEdit}
            handleAddNewEmployee={handleAddNewEmployee}
            preSelectedEmployee={selectedEmployee}
          />
        </Box>
      )}
      {!viewOnly && (
        <EmployeeForm
          employee={selectedEmployee}
          onDiscard={() => {
            setViewOnly(true);
            setAlert({
              show: false,
              message: "",
            });
          }}
          onSave={handleSave}
        />
      )}
    </Box>
  );
}

export default PeopleHome;
