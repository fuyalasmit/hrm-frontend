import React, { useState, useEffect } from "react";
import { Box, Card, Typography, Avatar, Grid, CircularProgress, Container, Stack, Alert, Chip } from "@mui/material";
import "./ViewEmployees.css";

import departmentPhoto from "../../assets/images/departmentPhoto.jpg";

const BASE_URL = require("../../assets/FetchServices/BaseUrl.json").value;

const ViewEmployees = () => {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Position hierarchy for sorting
  const getPositionRank = (position) => {
    if (!position) return 999;
    const pos = position.toLowerCase();
    if (pos.includes("professor")) return 1;
    if (pos.includes("associate")) return 2;
    if (pos.includes("assistant")) return 3;
    if (pos.includes("staff")) return 4;
    return 5;
  };

  // Post highlighting - important posts to highlight
  const isHighlightedPost = (post) => {
    if (!post) return false;
    const p = post.toLowerCase();
    return ["hod", "dhod", "head", "director", "dean", "principal"].includes(p);
  };

  // Group employees by position
  const groupEmployeesByPosition = (employeeList) => {
    const groups = {};

    employeeList.forEach((employee) => {
      const position = employee.position || "Other";
      if (!groups[position]) {
        groups[position] = [];
      }
      groups[position].push(employee);
    });

    // Define position hierarchy order (exact matching)
    const positionOrder = [
      "Professor",
      "Associate Professor",
      "Assistant Professor",
      "Lecturer",
      "Senior Instructor",
      "Instructor",
      "Assistant Instructor",
      "Staff",
    ];

    // Sort groups by hierarchy and then sort employees within each group
    const sortedGroups = {};

    // First, add positions in the specified order
    positionOrder.forEach((position) => {
      if (groups[position]) {
        // Sort employees within group by highlighted posts first
        sortedGroups[position] = groups[position].sort((a, b) => {
          const aHighlighted = isHighlightedPost(a.post);
          const bHighlighted = isHighlightedPost(b.post);

          if (aHighlighted && !bHighlighted) return -1;
          if (!aHighlighted && bHighlighted) return 1;
          return 0;
        });
        delete groups[position];
      }
    });

    // Add any remaining positions not covered by the hierarchy at the end
    Object.keys(groups).forEach((position) => {
      if (groups[position]) {
        sortedGroups[position] = groups[position].sort((a, b) => {
          const aHighlighted = isHighlightedPost(a.post);
          const bHighlighted = isHighlightedPost(b.post);

          if (aHighlighted && !bHighlighted) return -1;
          if (!aHighlighted && bHighlighted) return 1;
          return 0;
        });
      }
    });

    return sortedGroups;
  };

  useEffect(() => {
    const fetchEmployees = async () => {
      try {
        const response = await fetch(`${BASE_URL}/api/employees/public`);
        if (!response.ok) {
          throw new Error("Failed to fetch employees");
        }
        const data = await response.json();
        const groupedEmployees = groupEmployeesByPosition(data);
        setEmployees(groupedEmployees);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchEmployees();
  }, []);

  if (loading) {
    return (
      <Box className="view-employees-container" display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
        <Stack alignItems="center" spacing={3}>
          <CircularProgress size={60} thickness={4} sx={{ color: "#667eea" }} />
          <Typography variant="h4" fontWeight={600} sx={{ color: "#1a202c" }}>
            Loading...
          </Typography>
          <Typography variant="body1" sx={{ color: "#4a5568" }}>
            Please wait while we fetch employee information.
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (error) {
    return (
      <Box className="view-employees-container">
        <Container maxWidth="md" sx={{ pt: 4 }}>
          <Alert severity="error" sx={{ borderRadius: 3 }}>
            <Typography variant="h6">Error loading employees</Typography>
            <Typography variant="body2">{error}</Typography>
          </Alert>
        </Container>
      </Box>
    );
  }

  return (
    <Box className="view-employees-container">
      {/* Department Cover Photo - Full Width Banner */}
      <Box
        sx={{
          width: "100vw",
          height: { xs: "200px", sm: "250px", md: "350px" },
          position: "relative",
          left: "50%",
          right: "50%",
          marginLeft: "-50vw",
          marginRight: "-50vw",
          backgroundImage: `url(${departmentPhoto})`,
          backgroundSize: "cover",
          backgroundPosition: "center",
          backgroundRepeat: "no-repeat",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          mb: 2,
        }}
      >
        {/* Dark overlay for better text readability */}
        <Box
          sx={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: "rgba(0, 0, 0, 0.4)",
            zIndex: 1,
          }}
        />

        {/* Title overlay on the banner */}
        <Box sx={{ textAlign: "center", zIndex: 2, color: "white", maxWidth: "90%" }}>
          <Typography
            variant="h2"
            component="h1"
            sx={{
              fontSize: { xs: "2.5rem", sm: "3.5rem", md: "4.5rem" },
              fontWeight: 700,
              textShadow: "2px 2px 4px rgba(0,0,0,0.8)",
              mb: 2,
              letterSpacing: { xs: "0.02em", md: "0.03em" },
              fontFamily: "'Inter', 'Roboto', sans-serif",
              color: "white",
              textTransform: "uppercase",
            }}
          >
            Faculty
          </Typography>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 2,
              mb: 1,
            }}
          >
            <Box
              sx={{
                width: { xs: "30px", md: "50px" },
                height: "2px",
                background: "linear-gradient(90deg, transparent 0%, #60a5fa 100%)",
              }}
            />
            <Typography
              variant="h5"
              sx={{
                fontSize: { xs: "0.9rem", sm: "1.1rem", md: "1.3rem" },
                fontWeight: 300,
                textShadow: "2px 2px 4px rgba(0,0,0,0.6)",
                letterSpacing: "0.1em",
                fontFamily: "'Inter', 'Roboto', sans-serif",
                textTransform: "uppercase",
                color: "#e2e8f0",
              }}
            >
              Department of Electronics & Computer Engineering
            </Typography>
            <Box
              sx={{
                width: { xs: "30px", md: "50px" },
                height: "2px",
                background: "linear-gradient(90deg, #60a5fa 0%, transparent 100%)",
              }}
            />
          </Box>
          <Typography
            variant="body1"
            sx={{
              fontSize: { xs: "0.75rem", sm: "0.85rem", md: "0.95rem" },
              fontWeight: 400,
              textShadow: "1px 1px 2px rgba(0,0,0,0.5)",
              letterSpacing: "0.15em",
              fontFamily: "'Inter', 'Roboto', sans-serif",
              color: "#cbd5e1",
              opacity: 0.9,
            }}
          >
            ENGINEERING • INNOVATION • FUTURE
          </Typography>
        </Box>
      </Box>

      <Container maxWidth="lg" sx={{ py: 6 }}>
        {Object.entries(employees).map(([position, employeeList]) => (
          <Box key={position} mb={8}>
            {/* Position Section Header */}
            <Box sx={{ textAlign: "center", mb: 4, position: "relative" }}>
              <Typography
                variant="h4"
                component="h2"
                fontWeight={700}
                sx={{
                  color: "#1a202c",
                  fontSize: "2rem",
                  display: "inline-block",
                  position: "relative",
                  "&::after": {
                    content: '""',
                    position: "absolute",
                    bottom: "-8px",
                    left: "50%",
                    transform: "translateX(-50%)",
                    width: "90%",
                    height: "3px",
                    backgroundColor: "#667eea",
                    borderRadius: "2px",
                  },
                }}
              >
                {position}
              </Typography>
              <Typography
                component="span"
                sx={{
                  ml: 2,
                  fontSize: "1rem",
                  color: "#667eea",
                  fontWeight: 500,
                }}
              >
                ({employeeList.length})
              </Typography>
            </Box>

            {/* Employee Cards Grid for this position */}
            <Grid container spacing={6}>
              {employeeList.map((employee) => (
                <Grid item xs={12} sm={6} md={4} key={employee.empId}>
                  <Box
                    className="profile-card-wrapper"
                    sx={{
                      mt: 10,
                      "&:hover": {
                        "& .profile-avatar": {
                          transform: "translateX(-50%) translateY(-4px)",
                        },
                      },
                    }}
                  >
                    {/* Highlighted Post Badge */}
                    {isHighlightedPost(employee.post) && (
                      <Chip
                        label={employee.post}
                        className="post-badge"
                        sx={{
                          position: "absolute",
                          top: -10,
                          right: 16,
                          zIndex: 3,
                          bgcolor: "#e53e3e",
                          color: "white",
                          fontWeight: 700,
                          fontSize: "0.75rem",
                          textTransform: "uppercase",
                          letterSpacing: "0.5px",
                          "&:hover": {
                            bgcolor: "#c53030",
                          },
                        }}
                      />
                    )}

                    {/* Profile Picture - Half Above Card */}
                    <Avatar
                      src={employee.photo ? `data:image/png;base64,${atob(employee.photo)}` : undefined}
                      className="profile-avatar"
                      sx={{
                        width: 100,
                        height: 100,
                        position: "absolute",
                        top: -50,
                        left: "50%",
                        transform: "translateX(-50%)",
                        zIndex: 2,
                        border: "4px solid white",
                        boxShadow: "0 8px 24px rgba(0, 0, 0, 0.15)",
                        bgcolor: "#667eea",
                        fontSize: "2rem",
                        fontWeight: 600,
                        color: "white",
                      }}
                    >
                      {employee.preferredName?.charAt(0) || employee.firstName?.charAt(0) || "?"}
                    </Avatar>

                    {/* Card Content */}
                    <Card
                      className="profile-card"
                      sx={{
                        borderRadius: 4,
                        overflow: "visible",
                        boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                        transition: "all 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
                        bgcolor: "white",
                        border: "1px solid #e2e8f0",
                        "&:hover": {
                          transform: "translateY(-4px)",
                          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.15)",
                        },
                      }}
                    >
                      <Box
                        sx={{
                          pt: 7,
                          pb: 5,
                          px: 4,
                          textAlign: "center",
                          minHeight: 200,
                        }}
                      >
                        {/* Employee Name */}
                        <Typography
                          variant="h6"
                          component="h3"
                          fontWeight={600}
                          sx={{
                            color: "#1a202c",
                            mb: 1,
                            fontSize: "1.25rem",
                            lineHeight: 1.3,
                            textAlign: "center",
                          }}
                        >
                          {employee.preferredName || `${employee.firstName} ${employee.lastName}`}
                        </Typography>

                        {/* Position - Only show once, prioritize important info */}
                        <Typography
                          variant="body2"
                          sx={{
                            color: "#667eea",
                            fontWeight: 500,
                            mb: 1,
                            fontSize: "0.95rem",
                            textAlign: "center",
                          }}
                        >
                          {employee.position}
                        </Typography>

                        {/* Post - Show right after position if not highlighted */}
                        {employee.post && !isHighlightedPost(employee.post) && (
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#4a5568",
                              fontWeight: 500,
                              fontSize: "0.875rem",
                              textAlign: "center",
                              mb: 2,
                            }}
                          >
                            {employee.post}
                          </Typography>
                        )}

                        {/* Separator line and field of interest - only show if fieldOfInterest exists */}
                        {employee.fieldOfInterest && (
                          <Box
                            sx={{
                              mt: 2,
                              pt: 2,
                              borderTop: "1px solid #e2e8f0",
                            }}
                          >
                            <Typography
                              variant="body2"
                              sx={{
                                color: "#4a5568",
                                fontSize: "0.85rem",
                                textAlign: "center",
                                fontStyle: "italic",
                                lineHeight: 1.4,
                              }}
                            >
                              {employee.fieldOfInterest}
                            </Typography>
                          </Box>
                        )}
                      </Box>
                    </Card>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        ))}
      </Container>
    </Box>
  );
};

export default ViewEmployees;
