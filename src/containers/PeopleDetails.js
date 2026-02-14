import { useContext, useEffect, useState } from "react";
import { Box, Stack, Typography, Avatar, TableCell, Button, Dialog, DialogTitle, DialogContent, DialogActions, DialogContentText, Menu, MenuItem, ButtonGroup } from "@mui/material";
import { DownloadOutlined, KeyboardArrowDown, Download } from "@mui/icons-material";
import dayjs from "dayjs";
import AppTable from "../components/PeopleComponents/AppTable";
import AppTabs from "../components/PeopleComponents/AppTabs";
import ActionMenu from "../components/PeopleComponents/ActionMenu";
import { formatPhoneNumber } from "../assets/utils";
import StateContext from "../context/StateContext";
import { useNavigate } from "react-router-dom";
import MyInfoMain from "../components/myinfo/MyInfoMain";
import EmployeeForm from "../components/PeopleComponents/EmployeeForm";
/**
 * Expected headCell format for the table. Each object represents a
 * column. Note, AppTable implementation depends on this format to make the
 * table generic. Modification to the format may result in unpredictable outcome.
 */
const tableView = require("../assets/table-view.json");
const api = require("../assets/FetchServices");
// Number of rows to display on the table at a time.
const rowsPerPage = 10;

function formatTableData({
  data,
  headCells,
  empId,
  permissionId = 3,
  addActionMenu = false, // To display action menu where possible. True means display action while false means otherwise
  handleEdit,
  handleSurvey,
  handleTermination,
}) {
  // Store original employee data for editing
  const originalEmployeeData = new Map();

  // Create set of actions - ensure fresh functions each time
  const actions = (employee) => {
    const empId = employee.empId;
    const data = [];

    // Create and push handleEdit function menu - use original data
    data.push({
      label: "Edit employee",
      action: () => {
        const originalEmployee = originalEmployeeData.get(empId);
        if (originalEmployee) {
          handleEdit(originalEmployee);
        } else {
          handleEdit(employee);
        }
      },
    });

    // Create and push handleTermination function menu only for active employees
    // Don't show "End employment" option for already terminated employees
    const isTerminated = employee.terminationReason || 
                        employee.autoDeleteAt || 
                        employee.terminationDate || 
                        employee.isTerminated || 
                        employee.status === 'terminated' ||
                        employee.employmentStatus === 'terminated';
    
    if (!isTerminated) {
      data.push({
        label: "End employment",
        action: () => {
          const originalEmployee = originalEmployeeData.get(empId);
          if (originalEmployee) {
            handleTermination(originalEmployee);
          } else {
            handleTermination(employee);
          }
        },
      });
    }

    //If user has admin permission, show all functions. Otherwise, show only edit function
    return permissionId === 1 ? data : [data[0]];
  };

  //Inner function to create formatted TableCells
  const createTableCell = (item, key) => {
    return <TableCell key={key}> {item ? item : " "}</TableCell>;
  };
  const createActionTableCell = (item, key) => {
    return (
      <TableCell
        key={key}
        style={{
          position: "sticky",
          backgroundColor: "white",
          boxShadow: "5px 2px 5px grey",
          right: 0,
        }}
      >
        {item}
      </TableCell>
    );
  };

  // Inner function to disable action menu
  const disableActionMenu = (data, empId) => {
    if (permissionId === 1) {
      return false;
    }
    if (permissionId === 2) {
      return data.managerId !== empId;
    }
    return true;
  };

  // Inner function to check if action menu should be displayed.
  const showActionMenu = (key) => {
    return addActionMenu && key === "action" && permissionId < 3;
  };

  data.forEach((emp) => {
    // Store original employee data before formatting for display
    originalEmployeeData.set(emp.empId, { ...emp });

    // Now format for display
    emp.name = `${emp.firstName} ${emp.lastName}`;
    
    // Handle role (idempotent)
    if (emp.role && typeof emp.role === 'object') {
      emp.role = emp.role.roleTitle;
    }
    
    // Handle team (idempotent)
    if (emp.team && typeof emp.team === 'object') {
      emp.team = emp.team.teamName || "New Team";
    } else if (!emp.team) {
      emp.team = "New Team";
    }
    
    // Handle department (idempotent)
    if (emp.department && typeof emp.department === 'object') {
      emp.department = emp.department.departmentName;
    }
    
    emp.manager = emp.Manager && `${emp.Manager.firstName} ${emp.Manager.lastName}`;
    emp.salary = Number(emp.salary).toLocaleString();
    emp.hireDate = emp.hireDate && dayjs(emp.hireDate).format("DD MMMM, YYYY");
    emp.dateOfBirth = emp.dateOfBirth && dayjs(emp.dateOfBirth).format("DD MMMM, YYYY");
    emp.phoneNumber = formatPhoneNumber(emp.phoneNumber);
  });

  const getHeadCellIds = (headCellObj) => headCellObj.map((obj) => obj["id"]);
  const keys = getHeadCellIds(headCells);
  data.forEach((row) => {
    const newData = [];

    keys.forEach((key, index) => {
      let cell;
      if (key === "name") {
        cell = createTableCell(
          <Stack direction="row" spacing={1}>
            <Avatar sx={{ width: 25, height: 25 }} alt={row.name} src={"data:image/png;base64," + atob(row.photo)} />
            <Box sx={{ paddingTop: 0.5 }}>{row.name}</Box>
          </Stack>,
          `name-${row.empId}-${index}`
        );
      } else if (showActionMenu(key)) {
        cell = createActionTableCell(
          <ActionMenu key={`action-menu-${row.empId}`} actions={actions(row)} disableMenu={disableActionMenu(row, empId)} />,
          `action-${row.empId}`
        );
      } else if (key !== "action") {
        cell = createTableCell(row[key], `${key}-${row.empId}-${index}`);
      }
      newData.push(cell);
    });
    if (newData.length > 0) {
      row["cells"] = newData;
    }
  });
}
const tabItems = ({ isAdmin, loading, showActionHeader, employees, headCells, hasTeam, team, terminated, handleRowClick, handleTerminatedRowClick, onFilteredDataChange }) => {
  const tabs = [
    {
      label: "Employees",
      child: (
        <AppTable
          caption={"College Employees"}
          headCells={headCells}
          data={employees}
          rowsPerPage={rowsPerPage}
          loading={loading}
          showActionHeader={showActionHeader}
          handleRowClick={handleRowClick}
          onFilteredDataChange={onFilteredDataChange}
        />
      ),
    },
  ];

  if (hasTeam) {
    const teamTab = {
      label: "My Team",
      child: (
        <AppTable
          caption={"People in my team"}
          headCells={headCells}
          data={team}
          rowsPerPage={rowsPerPage}
          loading={loading}
          showActionHeader={true}
          handleRowClick={handleRowClick}
        />
      ),
    };
    // tabs.push(teamTab);
  }

  if (isAdmin) {
    const teamTab = {
      label: "Terminated Employees",
      child: (
        <AppTable
          caption={"Terminated employees"}
          headCells={headCells}
          data={terminated}
          rowsPerPage={rowsPerPage}
          loading={loading}
          showActionHeader={false}
          handleRowClick={handleTerminatedRowClick} // Use function that shows re-register modal
        />
      ),
    };
    tabs.push(teamTab);
  }
  return tabs;
};

/**
 * This component was designed to demonstrate other components such as
 * AppTable, AppTablePagination, AppTab, and AppDatePickers.
 * @returns A React component.
 */
export default function People({ handleAddNewEmployee, handleEdit, handleSurvey, handleTermination, preSelectedEmployee }) {
  const stateContext = useContext(StateContext);
  const [employees, setEmployees] = useState([]);
  const [myTeam, setMyTeam] = useState([]);
  const [terminated, setTerminated] = useState([]);
  const [filteredEmployees, setFilteredEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewDetails, setViewDetails] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState(null);
  const [showReRegisterModal, setShowReRegisterModal] = useState(false);
  const [employeeToReRegister, setEmployeeToReRegister] = useState(null);
  const [downloadMenuAnchor, setDownloadMenuAnchor] = useState(null);
  // const [editEmployee, setEditEmployee] = useState(false);
  const navigate = useNavigate();
  const isAdmin = stateContext.state.user && stateContext.state.user.permission.id === 1;
  const headCells = isAdmin ? tableView.admin : tableView.others;
  const hasTeam = stateContext.state.user && stateContext.state.user.permission.id < 3;
  const empId = stateContext.state.employee ? stateContext.state.employee.empId : -1;
  const permissionId = stateContext.state.user ? stateContext.state.user.permission.id : -1;

  const params = {
    data: null,
    headCells,
    empId,
    permissionId,
    addActionMenu: permissionId < 3,
    handleEdit,
    handleSurvey,
    handleTermination,
  };

  useEffect(() => {
    async function fetchData() {
      try {
        if (stateContext.state.pdEmployees) {
          // Create fresh copy of data to avoid mutation issues
          const employeesCopy = JSON.parse(JSON.stringify(stateContext.state.pdEmployees));
          
          // Filter out terminated employees from cached data as well
          const activeEmployees = employeesCopy.filter(emp => 
            !emp.terminationReason && 
            !emp.autoDeleteAt && 
            !emp.terminationDate && 
            !emp.isTerminated && 
            emp.status !== 'terminated' &&
            emp.employmentStatus !== 'terminated'
          );
          
          const freshParams = { ...params, data: activeEmployees };
          formatTableData(freshParams);
          setEmployees(freshParams.data);
          setLoading(false);
        } else {
          const res = await api.employee.fetchAll();
          setLoading(false);
          
          // Filter out terminated employees from the main employees list
          const activeEmployees = res.filter(emp => 
            !emp.terminationReason && 
            !emp.autoDeleteAt && 
            !emp.terminationDate && 
            !emp.isTerminated && 
            emp.status !== 'terminated' &&
            emp.employmentStatus !== 'terminated'
          );
          
          const freshParams = { ...params, data: activeEmployees };
          formatTableData(freshParams);
          setEmployees(freshParams.data);
          stateContext.updateState("pdEmployees", freshParams.data);
        }

        if (stateContext.state.employee) {
          if (stateContext.state.pdMyTeam) {
            const teamCopy = JSON.parse(JSON.stringify(stateContext.state.pdMyTeam));
            const freshParams = { ...params, data: teamCopy, addActionMenu: true };
            formatTableData(freshParams);
            setMyTeam(freshParams.data);
          } else {
            const managerId = stateContext.state.employee.empId;
            const team = await api.employee.fetchMyTeam(managerId);
            const freshParams = { ...params, data: team, addActionMenu: true };
            formatTableData(freshParams);
            setMyTeam(freshParams.data);
            stateContext.updateState("pdMyTeam", freshParams.data);
          }
        }
        if (isAdmin) {
          if (stateContext.state.pdTerminated) {
            const terminatedCopy = JSON.parse(JSON.stringify(stateContext.state.pdTerminated));
            const freshParams = { ...params, data: terminatedCopy, addActionMenu: false };
            formatTableData(freshParams);
            setTerminated(freshParams.data);
          } else {
            const terms = await api.employee.fetchTerminated();
            const freshParams = { ...params, data: terms, addActionMenu: false };
            formatTableData(freshParams);
            setTerminated(freshParams.data);
            stateContext.updateState("pdTerminated", freshParams.data);
          }
        }
      } catch (err) {
        console.error("Error fetching data:", err);
      }
    }
    fetchData();
  }, [stateContext.state.pdEmployees, stateContext.state.pdMyTeam, stateContext.state.pdTerminated]);

  // Handle preSelectedEmployee prop from PeopleHome
  useEffect(() => {
    if (preSelectedEmployee) {
      setSelectedEmployee(preSelectedEmployee);
      setViewDetails(true);
    }
  }, [preSelectedEmployee]);

  const handleRowClick = (row) => {
    // Don't allow viewing profile for terminated employees
    // Check for various termination indicators
    if (row.terminationReason || 
        row.autoDeleteAt || 
        row.terminationDate || 
        row.isTerminated || 
        row.status === 'terminated' ||
        row.employmentStatus === 'terminated') {
      console.log('Blocked viewing details for terminated employee:', row.firstName, row.lastName);
      return; // Do nothing for terminated employees
    }
    setSelectedEmployee(row);
    setViewDetails(true);
  };

  // Handler for terminated employees - shows re-registration modal
  const handleTerminatedRowClick = (row) => {
    setEmployeeToReRegister(row);
    setShowReRegisterModal(true);
  };

  // Handle re-registration of terminated employee
  const handleReRegister = async () => {
    try {
      console.log("Starting re-registration for employee:", employeeToReRegister);
      
      if (!employeeToReRegister) {
        console.error("No employee selected for re-registration");
        return;
      }
      
      console.log("Calling API to re-register employee with empId:", employeeToReRegister.empId);
      
      // Call API to re-register the employee (remove termination data)
      const response = await api.employee.reRegister(employeeToReRegister.empId);
      
      console.log("API response:", response);
      
      if (response && (response.employee || response.message)) {
        console.log("Re-registration successful, updating UI...");
        
        // Update local state - remove from terminated list
        setTerminated(prev => {
          const updated = prev.filter(emp => emp.empId !== employeeToReRegister.empId);
          console.log("Updated terminated list:", updated);
          return updated;
        });
        
        // If we have employee data, add to active employees
        if (response.employee) {
          // Format the restored employee data and add to employees list
          const freshParams = { 
            ...params, 
            data: [response.employee]
          };
          formatTableData(freshParams);
          
          setEmployees(prev => {
            const updated = [...prev, ...freshParams.data];
            console.log("Updated employees list:", updated);
            return updated;
          });
        }
        
        // Clear state context to force refresh on next load
        stateContext.updateState("pdEmployees", null);
        stateContext.updateState("pdTerminated", null);
        
        // Close modal and reset state
        setShowReRegisterModal(false);
        setEmployeeToReRegister(null);
        
        console.log("Employee re-registered successfully");
        alert("Employee re-registered successfully!"); // Temporary feedback
      } else {
        console.error("Invalid response from API:", response);
        alert("Failed to re-register employee. Please try again.");
      }
    } catch (error) {
      console.error("Error re-registering employee:", error);
      alert("Error occurred while re-registering employee: " + error.message);
    }
  };

  // Handle modal close
  const handleCloseReRegisterModal = () => {
    setShowReRegisterModal(false);
    setEmployeeToReRegister(null);
  };

  // Handle filtered data changes from AppTable
  const handleFilteredDataChange = (filteredData) => {
    setFilteredEmployees(filteredData);
  };

  const handleGoBack = () => {
    setViewDetails(false);
    setSelectedEmployee(null);
  };

  // Find the original employee object by empId before editing
  const handleEditFromDetails = () => {
    if (!selectedEmployee) return;
    // Try to find the original employee from the employees array (raw data)
    const original = employees.find((e) => e.empId === selectedEmployee.empId);
    handleEdit(original || selectedEmployee);
  };

  // Download handlers
  const handleDownloadMenuClick = (event) => {
    setDownloadMenuAnchor(event.currentTarget);
  };

  const handleDownloadMenuClose = () => {
    setDownloadMenuAnchor(null);
  };

  const handleDownloadDocument = (fileName) => {
    const link = document.createElement('a');
    link.href = `/${fileName}`;
    link.download = fileName;
    link.click();
    handleDownloadMenuClose();
  };

  // Function to generate and download filtered employee report
  const generateFilteredEmployeeReport = async () => {
    try {
      // Get the current filtered data from AppTable
      const currentData = filteredEmployees.length > 0 ? filteredEmployees : employees; // Use filtered data if available, fallback to all employees
      
      // Fetch all necessary data for summary statistics
      const [allEmployees, terminatedEmployees, departmentSummary] = await Promise.all([
        api.employee.fetchAll(),
        api.employee.fetchTerminated(),
        api.employee.fetchSummaryByDepartments()
      ]);

      // Calculate summary statistics
      const reportDate = new Date().toLocaleDateString();
      const reportTime = new Date().toLocaleTimeString();
      
      // Employment type breakdown for all employees
      const employmentTypes = {};
      allEmployees.forEach((emp) => {
        if (emp.employmentType) {
          const type = emp.employmentType;
          employmentTypes[type] = (employmentTypes[type] || 0) + 1;
        }
      });

      // Contract employees
      const contractEmployees = allEmployees.filter(
        (emp) =>
          emp.employmentType &&
          (emp.employmentType.toLowerCase().includes("contract") || 
           emp.employmentType.toLowerCase().includes("commission"))
      ).length;

      // Full-time and part-time employees
      const fullTimeEmployees = allEmployees.filter(
        (emp) => emp.employmentType && emp.employmentType.toLowerCase().includes("full-time")
      ).length;

      const partTimeEmployees = allEmployees.filter(
        (emp) => emp.employmentType && emp.employmentType.toLowerCase().includes("part-time")
      ).length;

      // Recent hires (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentHires = allEmployees.filter(
        (emp) => emp.hireDate && new Date(emp.hireDate) >= thirtyDaysAgo
      ).length;

      // Contracts ending soon (next 60 days)
      const sixtyDaysFromNow = new Date();
      sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
      const contractsEndingSoon = allEmployees.filter((emp) => {
        if (!emp.employmentType || !emp.contractExpiryDate) return false;
        const isContractEmployee =
          emp.employmentType.toLowerCase().includes("contract") || 
          emp.employmentType.toLowerCase().includes("commission");
        if (!isContractEmployee) return false;
        const expiryDate = new Date(emp.contractExpiryDate);
        const today = new Date();
        return expiryDate >= today && expiryDate <= sixtyDaysFromNow;
      });

      // Generate CSV content with filtered data
      const csvContent = generateFilteredCSVReport({
        reportDate,
        reportTime,
        totalEmployees: allEmployees.length,
        filteredEmployees: currentData,
        terminatedEmployees: terminatedEmployees.length,
        contractEmployees,
        fullTimeEmployees,
        partTimeEmployees,
        recentHires,
        contractsEndingSoon: contractsEndingSoon.length,
        employmentTypes,
        departmentBreakdown: departmentSummary
      });

      // Download the report
      downloadCSV(csvContent, `HRM_Filtered_Employee_Report_${new Date().toISOString().split('T')[0]}.csv`);

    } catch (error) {
      console.error("Error generating report:", error);
      alert("Error generating report. Please try again.");
    }
  };

  // Function to generate CSV content for filtered data
  const generateFilteredCSVReport = (data) => {
    let csv = "HRM Employee Report\n";
    csv += `Generated on: ${data.reportDate} at ${data.reportTime}\n`;
    csv += `Report contains ${data.filteredEmployees.length} employees (after filters applied)\n\n`;
    
    // Summary Statistics (for entire organization)
    csv += "ORGANIZATION SUMMARY STATISTICS\n";
    csv += "Category,Count\n";
    csv += `Total Active Employees,${data.totalEmployees}\n`;
    csv += `Terminated Employees,${data.terminatedEmployees}\n`;
    csv += `Contract Employees,${data.contractEmployees}\n`;
    csv += `Full-time Employees,${data.fullTimeEmployees}\n`;
    csv += `Part-time Employees,${data.partTimeEmployees}\n`;
    csv += `Recent Hires (Last 30 days),${data.recentHires}\n`;
    csv += `Contracts Ending Soon (Next 60 days),${data.contractsEndingSoon}\n\n`;

    // Employment Types Breakdown (for entire organization)
    csv += "EMPLOYMENT TYPES BREAKDOWN (Organization)\n";
    csv += "Employment Type,Count\n";
    Object.entries(data.employmentTypes).forEach(([type, count]) => {
      csv += `"${type}",${count}\n`;
    });
    csv += "\n";

    // Department Breakdown (for entire organization)
    csv += "DEPARTMENT BREAKDOWN (Organization)\n";
    csv += "Department,Employee Count\n";
    data.departmentBreakdown.forEach(dept => {
      csv += `"${dept.departmentName}",${dept.count}\n`;
    });
    csv += "\n";

    // Filtered Employees Details - only show columns that are visible in the table
    csv += `FILTERED EMPLOYEES DETAILS (${data.filteredEmployees.length} employees)\n`;
    
    // Get the visible columns from headCells, excluding department and action
    const visibleColumns = headCells.filter(cell => cell.visible && cell.id !== 'action' && cell.id !== 'department');
    const columnHeaders = visibleColumns.map(cell => cell.label).join(',');
    csv += `${columnHeaders}\n`;
    
    // Add employee data based on visible columns
    data.filteredEmployees.forEach(emp => {
      const rowData = visibleColumns.map(cell => {
        let value = emp[cell.id];
        
        // Handle different data types and formatting
        if (cell.id === 'name') {
          value = `${emp.firstName} ${emp.lastName}`;
        } else if (cell.id === 'department' && emp.department) {
          value = typeof emp.department === 'object' ? emp.department.departmentName : emp.department;
        } else if (cell.id === 'role' && emp.role) {
          value = typeof emp.role === 'object' ? emp.role.roleTitle : emp.role;
        } else if (cell.id === 'manager' && emp.Manager) {
          value = `${emp.Manager.firstName} ${emp.Manager.lastName}`;
        } else if (cell.id === 'hireDate' && emp.hireDate) {
          value = new Date(emp.hireDate).toLocaleDateString();
        } else if (cell.id === 'dateOfBirth' && emp.dateOfBirth) {
          value = new Date(emp.dateOfBirth).toLocaleDateString();
        } else if (cell.id === 'salary' && emp.salary) {
          value = Number(emp.salary).toLocaleString();
        }
        
        // Clean and format the value for CSV
        if (value === null || value === undefined) {
          return 'N/A';
        }
        
        // Escape quotes and wrap in quotes if contains comma
        const stringValue = String(value);
        if (stringValue.includes(',') || stringValue.includes('"') || stringValue.includes('\n')) {
          return `"${stringValue.replace(/"/g, '""')}"`;
        }
        
        return stringValue;
      });
      
      csv += `${rowData.join(',')}\n`;
    });

    return csv;
  };

  // Function to download CSV file
  const downloadCSV = (csvContent, fileName) => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    
    if (link.download !== undefined) {
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', fileName);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  };

  return (
    <Stack sx={{ minWidth: window.innerWidth < 1550 ? 1100 : 1350 }}>
      <Box
        sx={{
          boxSizing: "border-box",
          width: "100%",
          height: "87px",
          mt: 5,
          mb: -5,
          display: "flex",
          justifyContent: "space-between",
        }}
      >
        <Typography variant="h5" id="tableTitle" component="div" color={"inherent"} fontWeight={600}>
          People
        </Typography>
        {isAdmin && (
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="contained"
              startIcon={<Download />}
              onClick={generateFilteredEmployeeReport}
              sx={{
                height: "34px",
                backgroundColor: "#7F56D9",
                color: "#FFFFFF",
                fontSize: 13,
                fontWeight: 400,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#6941C6",
                },
              }}
            >
              Download Report
            </Button>
            <ButtonGroup variant="contained" disableElevation>
              <Button
                startIcon={<DownloadOutlined />}
                onClick={handleDownloadMenuClick}
                sx={{
                  height: "34px",
                  border: "1px solid #D0D5DD",
                  backgroundColor: "#FFFFFF",
                  color: "#475467",
                  fontSize: 13,
                  fontWeight: 400,
                  textTransform: "none",
                  "&:hover": {
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #D0D5DD",
                  },
                }}
              >
                Download Forms
              </Button>
              <Button
                size="small"
                onClick={handleDownloadMenuClick}
                sx={{
                  width: "32px",
                  minWidth: "32px",
                  height: "34px",
                  border: "1px solid #D0D5DD",
                  borderLeft: "none",
                  backgroundColor: "#FFFFFF",
                  color: "#475467",
                  "&:hover": {
                    backgroundColor: "#F9FAFB",
                    border: "1px solid #D0D5DD",
                    borderLeft: "none",
                  },
                }}
              >
                <KeyboardArrowDown />
              </Button>
            </ButtonGroup>
            <Menu
              anchorEl={downloadMenuAnchor}
              open={Boolean(downloadMenuAnchor)}
              onClose={handleDownloadMenuClose}
              MenuListProps={{
                'aria-labelledby': 'download-button',
              }}
            >
              <MenuItem onClick={() => handleDownloadDocument('contractpaper.docx')}>
                Contract Paper (DOCX)
              </MenuItem>
              <MenuItem onClick={() => handleDownloadDocument('NewEmployeeForm.pdf')}>
                New Employee Form (PDF)
              </MenuItem>
            </Menu>
            <Button
              variant="contained"
              disableElevation
              onClick={(evt) => handleAddNewEmployee()}
              sx={{
                width: "166px",
                height: "34px",
                border: "1px solid #7F56D9",
                backgroundColor: "#7F56D9",
                fontSize: 13,
                fontWeight: 400,
                textTransform: "none",
                "&:hover": {
                  backgroundColor: "#602ece",
                  border: "1px solid #602ece",
                },
              }}
            >
              Add new employee
            </Button>
          </Box>
        )}
      </Box>

      <Stack
        sx={{
          boxSizing: "border-box",
          display: "flex",
          width: "100%",
          height: "100%",
          minHeight: "50vh",
          backgroundColor: "#FFFFFF",
          border: "1px solid #EBEBEB",
          borderRadius: "10px",
          pt: 7.5,
          pb: 4,
          pr: 4,
          pl: 5,
          mt: 0,
          mb: 5,
        }}
      >
        {viewDetails ? (
          <Box>
            <Button
              variant="contained"
              disableElevation
              onClick={handleGoBack}
              sx={{
                width: "auto",
                height: "34px",
                border: "1px solid #D0D5DD",
                backgroundColor: "#FFFFFF",
                color: "#000000",
                fontSize: 13,
                fontWeight: 400,
                fontFamily: "Inter",
                textTransform: "none",
                mb: 2,
                "&:hover": {
                  backgroundColor: "#F5F5F5",
                  border: "1px solid #D0D5DD",
                },
              }}
            >
              Go back
            </Button>
            <MyInfoMain employee={selectedEmployee} onClickEdit={handleEditFromDetails} />
          </Box>
        ) : (
          <AppTabs
            items={tabItems({
              isAdmin,
              loading,
              showActionHeader: permissionId < 3,
              employees,
              hasTeam,
              team: myTeam,
              headCells,
              terminated,
              handleRowClick,
              handleTerminatedRowClick,
              onFilteredDataChange: handleFilteredDataChange,
            })}
          />
        )}
      </Stack>

      {/* Re-registration Modal */}
      <Dialog
        open={showReRegisterModal}
        onClose={handleCloseReRegisterModal}
        aria-labelledby="re-register-dialog-title"
        aria-describedby="re-register-dialog-description"
      >
        <DialogTitle id="re-register-dialog-title">
          Re-register Employee
        </DialogTitle>
        <DialogContent>
          <DialogContentText id="re-register-dialog-description">
            {employeeToReRegister && (
              <>
                Do you want to re-register <strong>{employeeToReRegister.firstName} {employeeToReRegister.lastName}</strong>?
                <br /><br />
                This will restore the employee to active status and remove them from the terminated employees list.
              </>
            )}
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button 
            onClick={handleCloseReRegisterModal}
            sx={{ textTransform: "none" }}
          >
            Cancel
          </Button>
          <Button 
            onClick={handleReRegister} 
            variant="contained"
            sx={{ 
              textTransform: "none",
              backgroundColor: "#7F56D9",
              "&:hover": {
                backgroundColor: "#602ece"
              }
            }}
          >
            Re-register
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
}
