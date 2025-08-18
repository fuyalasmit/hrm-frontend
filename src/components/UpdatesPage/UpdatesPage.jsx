import Box from "@mui/system/Box";
import { Stack, Typography, Card, CardContent, Grid } from "@mui/material";
import { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import StateContext from "../../context/StateContext";

const api = require("../../assets/FetchServices");

/**
 * Home page of the HRM application. Contains employee statistics and dashboard.
 *
 * Props:
 * - style<Object>: Optional prop for adding further inline styling.
 *      Default: {}
 */
export default function UpdatesPage({ style }) {
  const stateContext = useContext(StateContext);
  const navigate = useNavigate();
  const [stats, setStats] = useState({
    totalEmployees: 0,
    contractEmployees: 0,
    fullTimeEmployees: 0,
    partTimeEmployees: 0,
    departmentBreakdown: [],
    terminatedEmployees: 0,
    employmentTypes: {},
    recentHires: 0,
    loading: true,
  });

  let firstName = "Guest";
  if (stateContext.state.employee) {
    firstName = stateContext.state.employee.firstName;
  } else if (stateContext.state.user) {
    firstName = stateContext.state.user.firstName;
  }

  // Function to handle clicking on a contract employee
  const handleEmployeeClick = (employee) => {
    try {
      // Store the employee ID for PeopleHome to pick up
      sessionStorage.setItem("selectedEmployeeId", employee.empId);

      // Dispatch a custom event to trigger navigation to people menu
      const event = new CustomEvent("navigateToPeople", {
        detail: { employeeId: employee.empId },
      });
      window.dispatchEvent(event);
    } catch (error) {
      console.error("Error navigating to employee details:", error);
    }
  };

  useEffect(() => {
    const fetchEmployeeStats = async () => {
      try {
        setStats((prev) => ({ ...prev, loading: true }));

        // Fetch all employees
        const allEmployees = await api.employee.fetchAll();

        // Fetch terminated employees
        const terminatedEmployees = await api.employee.fetchTerminated();

        // Fetch department summary
        const departmentSummary = await api.employee.fetchSummaryByDepartments();

        // Calculate employment type statistics
        const employmentTypes = {};
        allEmployees.forEach((emp) => {
          if (emp.employmentType) {
            const type = emp.employmentType;
            employmentTypes[type] = (employmentTypes[type] || 0) + 1;
          }
        });

        const contractEmployees = allEmployees.filter(
          (emp) =>
            emp.employmentType &&
            (emp.employmentType.toLowerCase().includes("contract") || emp.employmentType.toLowerCase().includes("commission"))
        ).length;

        const fullTimeEmployees = allEmployees.filter(
          (emp) => emp.employmentType && emp.employmentType.toLowerCase().includes("full-time")
        ).length;

        const partTimeEmployees = allEmployees.filter(
          (emp) => emp.employmentType && emp.employmentType.toLowerCase().includes("part-time")
        ).length;

        // Calculate recent hires (last 30 days)
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const recentHires = allEmployees.filter((emp) => emp.hireDate && new Date(emp.hireDate) >= thirtyDaysAgo).length;

        // Calculate contracts ending soon (next 60 days)
        const sixtyDaysFromNow = new Date();
        sixtyDaysFromNow.setDate(sixtyDaysFromNow.getDate() + 60);
        const contractsEndingSoon = allEmployees.filter((emp) => {
          if (!emp.employmentType || !emp.contractExpiryDate) return false;

          const isContractEmployee =
            emp.employmentType.toLowerCase().includes("contract") || emp.employmentType.toLowerCase().includes("commission");

          if (!isContractEmployee) return false;

          const expiryDate = new Date(emp.contractExpiryDate);
          const today = new Date();

          return expiryDate >= today && expiryDate <= sixtyDaysFromNow;
        });

        setStats({
          totalEmployees: allEmployees.length,
          contractEmployees,
          fullTimeEmployees,
          partTimeEmployees,
          departmentBreakdown: departmentSummary,
          terminatedEmployees: terminatedEmployees.length,
          employmentTypes,
          recentHires,
          contractsEndingSoon,
          loading: false,
        });
      } catch (error) {
        console.error("Error fetching employee statistics:", error);
        setStats((prev) => ({ ...prev, loading: false }));
      }
    };

    fetchEmployeeStats();
  }, []);

  const StatCard = ({ title, value, subtitle, color = "#7F56D9", children }) => (
    <Card sx={{ minWidth: 200, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", borderRadius: 2, height: "100%" }}>
      <CardContent>
        <Typography
          gutterBottom
          variant="body1"
          sx={{
            fontWeight: "600",
            fontSize: "0.95rem",
            color: "#374151",
          }}
        >
          {title}
        </Typography>
        {children ? (
          children
        ) : (
          <>
            <Typography variant="h4" component="div" sx={{ color, fontWeight: "bold" }}>
              {stats.loading ? "..." : value}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="textSecondary">
                {subtitle}
              </Typography>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );

  console.log(stats.employmentTypes);
  console.log(stats.employmentTypes["Permanent employment"]);

  return (
    <Box sx={style}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ fontWeight: "bold", color: "#101828" }}>
        Welcome back, {firstName}!
      </Typography>
      <Typography variant="body1" color="textSecondary" sx={{ mb: 4 }}>
        Here's an overview of your organization
      </Typography>

      <Grid container spacing={3}>
        {/* Main Statistics Row */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Total Employees" value={stats.totalEmployees} subtitle="Current Active Staff" color="#7F56D9" />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Contract Employees" value={stats.contractEmployees} subtitle="On Contract" color="#2E90FA" />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Permanent Employees"
            value={stats.employmentTypes["Permanent employment"]}
            subtitle="Full-Time Permanent"
            color="#2E90FA"
          />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Full-time Employees" value={stats.fullTimeEmployees} subtitle="Currently Full-Time" color="#12B76A" />
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Part-time Employees" value={stats.partTimeEmployees} subtitle="Currently Part-Time" color="#F79009" />
        </Grid>

        {/* Terminated Employees */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Terminated Employees" value={stats.terminatedEmployees} subtitle="Former Employees" color="#F04438" />
        </Grid>

        {/* Recent Hires */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard title="Recent Hires" value={stats.recentHires} subtitle="Last 30 days" color="#9E77ED" />
        </Grid>

        {/* Employment Types Overview */}
        <Grid item xs={12} md={4}>
          <StatCard title="Employment Types">
            {stats.loading ? (
              <Typography color="textSecondary">Loading employment data...</Typography>
            ) : Object.keys(stats.employmentTypes).length > 0 ? (
              <Stack spacing={1}>
                {Object.entries(stats.employmentTypes)
                  .sort(([, a], [, b]) => b - a)
                  .slice(0, 4)
                  .map(([type, count]) => (
                    <Box key={type} sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.875rem" }}>
                        {type}
                      </Typography>
                      <Typography variant="body1" sx={{ fontWeight: "bold", color: "#2E90FA" }}>
                        {count}
                      </Typography>
                    </Box>
                  ))}
                {Object.keys(stats.employmentTypes).length > 4 && (
                  <Typography variant="body2" color="textSecondary" sx={{ fontSize: "0.75rem" }}>
                    +{Object.keys(stats.employmentTypes).length - 4} more types
                  </Typography>
                )}
              </Stack>
            ) : (
              <Typography color="textSecondary">No employment type data available</Typography>
            )}
          </StatCard>
        </Grid>

        {/* Department Breakdown */}
        <Grid item xs={12} md={8}>
          <StatCard title="Sub Department">
            {stats.loading ? (
              <Typography color="textSecondary">Loading department data...</Typography>
            ) : stats.departmentBreakdown.length > 0 ? (
              <Stack spacing={0.5}>
                {stats.departmentBreakdown.slice(0, 6).map((dept, index) => (
                  <Box
                    key={`dept-${dept.departmentName}-${index}`}
                    sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}
                  >
                    <Typography variant="body1" color="textSecondary">
                      {dept.departmentName}
                    </Typography>
                    <Typography variant="h6" sx={{ fontWeight: "bold", color: "#7F56D9" }}>
                      {dept.count}
                    </Typography>
                  </Box>
                ))}
                {stats.departmentBreakdown.length > 6 && (
                  <Typography variant="body2" color="textSecondary">
                    And {stats.departmentBreakdown.length - 6} more departments...
                  </Typography>
                )}
              </Stack>
            ) : (
              <Typography color="textSecondary">No department data available</Typography>
            )}
          </StatCard>
        </Grid>

        {/* Contracts Ending Soon */}
        <Grid item xs={12} md={8}>
          <StatCard title="Contracts Ending Soon">
            {stats.loading ? (
              <Typography color="textSecondary">Loading contract data...</Typography>
            ) : stats.contractsEndingSoon && stats.contractsEndingSoon.length > 0 ? (
              <Stack spacing={2}>
                {stats.contractsEndingSoon.slice(0, 6).map((employee, index) => {
                  const expiryDate = new Date(employee.contractExpiryDate);
                  const today = new Date();
                  const daysUntilExpiry = Math.ceil((expiryDate - today) / (1000 * 60 * 60 * 24));

                  return (
                    <Box
                      key={`contract-${employee.id}-${index}`}
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        cursor: "pointer",
                        padding: "8px",
                        borderRadius: "4px",
                        "&:hover": {
                          backgroundColor: "#f5f5f5",
                        },
                      }}
                      onClick={() => handleEmployeeClick(employee)}
                    >
                      <Box>
                        <Typography variant="body1" sx={{ fontWeight: "medium", color: "#1976d2" }}>
                          {employee.firstName} {employee.lastName}
                        </Typography>
                        <Typography variant="body2" color="textSecondary">
                          {employee.departmentName} • Expires: {expiryDate.toLocaleDateString()}
                        </Typography>
                      </Box>
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: "bold",
                          color: daysUntilExpiry <= 7 ? "#d32f2f" : daysUntilExpiry <= 15 ? "#ed6c02" : "#7F56D9",
                        }}
                      >
                        {daysUntilExpiry} days left
                      </Typography>
                    </Box>
                  );
                })}
                {stats.contractsEndingSoon.length > 6 && (
                  <Typography variant="body2" color="textSecondary">
                    And {stats.contractsEndingSoon.length - 6} more contracts expiring soon...
                  </Typography>
                )}
              </Stack>
            ) : (
              <Typography color="textSecondary">No contracts ending soon</Typography>
            )}
          </StatCard>
        </Grid>
      </Grid>
    </Box>
  );
}

//Control panel settings for storybook
UpdatesPage.propTypes = {};

//Default values for this component
UpdatesPage.defaultProps = {
  style: {},
};
