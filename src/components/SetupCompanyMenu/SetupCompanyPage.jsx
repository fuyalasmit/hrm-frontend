import Box from "@mui/system/Box";
import SetupCompanyMenu from "./SetupCompanyMenu";
import SetupMenu from "./SetupMenu";
import SuccessMenu from "./SuccessMenu";
import CustomizedSteppers from "./CustomizedSteppers";
import { useContext, useEffect, useState } from "react";
import StateContext from "../../context/StateContext";
// import { useNavigate } from "react-router-dom";
//Option data
const departmentOptions = require("../../assets/DepartmentOptions.json");
const roleOptions = require("../../assets/RoleOptions.json");
// api call module
const api = require("../../assets/FetchServices");

/**
 * Company registration page for the HRM application. Contains menus for adding new companies,
 * departments and roles to the database.
 *
 * Props:
 * - style<Object>: Optional prop for adding further inline styling
 *      Default: {}
 */
export default function SetupCompanyPage({ style }) {
  const [page, setPage] = useState("Company"); //The current menu component to be displayed
  const stateContext = useContext(StateContext);
  // const navigate = useNavigate();
  
  const steps = [
    {
      label: "Add company details",
      description: "Add company details",
    },
    {
      label: "Select departments",
      description: "Select departments",
    },
    {
      label: "Select roles",
      description: "Select roles",
    },
    {
      label: "Complete setup",
      description: "Complete setup",
    },
  ];

  // useEffect(() => {
  //   // Added Deparment data
  //   const departmentData = async () => {
  //     const data = {
  //       companyName: "Pulchowk Campus",
  //       companyWebsite: "https://" + "pcampus.edu.np",
  //       companyLogo: null,
  //       administratorEmail:
  //         stateContext.state.user && stateContext.state.user.email,
  //     };
  //     //Send the PUT request
  //     try {
        
  //       const response = await api.company.createOne(data);
  //       console.log(response);
  //       // if (companyLogo) {
  //       //   stateContext.updateState("logo", companyLogo);
  //       // }
  //     } catch (error) {
  //       console.log(error);
  //     } 
  //   };

  //   // Added Department names and roles
  //   const fillDepartmentNamesAndRoles = async () => {
  //     const data = [{"departmentName": "Electronics"}, {"departmentName": "Computer"}]
  //     await api.department.createMany(data);
  //     await api.role.createMany([
  //       {"roleTitle": "Teacher"},
  //       {"roleTitle": "Staff"},
  //     ])
  //   }

    
  //   const initializeData = async () => {
  //     await departmentData();
  //     await fillDepartmentNamesAndRoles();

  //     navigate("/dashboard", {replace: true});
  //   }

  //   initializeData();
  // }, []);

  return (
    <Box
      sx={{
        ...{
          width: "100%",
          height: "100vh",
          paddingX: "15%",
          paddingY: "50px",
          backgroundColor: "#FCFCFD",
        },
        ...style,
      }}
    >
      <img
        src={stateContext.state.logo}
        alt={"Company Logo"}
        style={{
          display: "block",
          margin: "60px auto",
          maxWidth: "30%",
        }}
      />
      <CustomizedSteppers
        stepnumber={
          page === "Company"
            ? 0
            : page === "Departments"
            ? 1
            : page === "Roles"
            ? 2
            : 3
        }
        steps={steps}
        style={{
          margin: "auto",
          padding: "2% 150px",
          marginY: "40px",
        }}
      />
      {page === "Company" && (
        <SetupCompanyMenu
          advancePage={() => setPage("Departments")}
          style={{ margin: "40px auto" }}
        />
      )}
      {page === "Departments" && (
        <SetupMenu
          item={"Departments"}
          options={departmentOptions}
          onSubmit={api.department.createMany}
          columnName={"departmentName"}
          advancePage={() => setPage("Roles")}
          style={{ margin: "40px auto" }}
        />
      )}
      {page === "Roles" && (
        <SetupMenu
          item={"Roles"}
          options={roleOptions}
          onSubmit={api.role.createMany}
          columnName={"roleTitle"}
          advancePage={() => setPage("Success")}
          style={{ margin: "40px auto" }}
        />
      )}
      {page === "Success" && <SuccessMenu style={{ margin: "40px auto" }} />}
    </Box>
  );
}

//Control panel settings for storybook
SetupCompanyPage.propTypes = {};

//Default values for this component
SetupCompanyPage.defaultProps = {
  style: {},
};
