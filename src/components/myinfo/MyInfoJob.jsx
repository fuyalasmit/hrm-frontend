import React from 'react'
import { Divider, Box,  } from '@mui/material'
import { List, ListItem, Grid, Typography } from '@mui/material';
import { createTheme, ThemeProvider } from '@mui/material/styles';



const theme = createTheme({
  typography: {

    h2: {
      fontWeight: 600,
      fontFamily:'Inter',
      fontSize: '16px',
      color: '#344054',
      marginTop:'55px',
      marginBottom:'13px',
    },
   
    body1: {
      fontWeight: 600,
      fontFamily:'Inter',
      fontSize: '13px',
      color: '#344054',
    },

    body2: {
      fontWeight: 400,
      fontFamily:'Inter',
      fontSize: '13px',
      color: '#344054',
    },
   
  },
});


function MyInfoJob({employee, isAdmin}) {
  return (
    <Box>
       <ThemeProvider theme={theme}>
        <Box>
          <List>
          <ListItem sx={{paddingLeft:'0px'}}>
            <Grid container spacing={-35}>
              <Grid item xs={6} >
                <Typography variant="body1">Hire date:</Typography>
              </Grid>
              <Grid item xs={6} >
                <Typography variant="body2">{new Date(employee.hireDate).toLocaleDateString('en-GB',{year: 'numeric', month: 'long', day: 'numeric'})}</Typography>
              </Grid>
            </Grid>
          </ListItem>
          {employee.Manager && employee.Manager.firstName && employee.Manager.lastName && (
            <ListItem sx={{paddingLeft:'0px'}}>
              <Grid container spacing={-35}>
                <Grid item xs={6}>
                  <Typography variant="body1">Reports to:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{`${employee.Manager.firstName} ${employee.Manager.lastName}`}</Typography>
                </Grid>
              </Grid>
            </ListItem>
          )}
          {employee.post && (
            <ListItem sx={{paddingLeft:'0px'}}>
              <Grid container spacing={-35}>
                <Grid item xs={6}>
                  <Typography variant="body1">Post:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{employee.post}</Typography>
                </Grid>
              </Grid>
            </ListItem>
          )}
          <ListItem sx={{paddingLeft:'0px'}}>
            <Grid container spacing={-35}>
              <Grid item xs={6}>
                <Typography variant="body1">College:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">{employee.officeLocation}</Typography>
              </Grid>
            </Grid>
          </ListItem>
          <ListItem sx={{paddingLeft:'0px'}}>
            <Grid container spacing={-35}>
              <Grid item xs={6}>
                <Typography variant="body1">Employment type:</Typography>
              </Grid>
              <Grid item xs={6}>
                <Typography variant="body2">{employee.employmentType}</Typography>
              </Grid>
            </Grid>
          </ListItem>
          {isAdmin && employee.ioeEmployeeId && (
            <ListItem sx={{paddingLeft:'0px'}}>
              <Grid container spacing={-35}>
                <Grid item xs={6}>
                  <Typography variant="body1">IOE Employee ID:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{employee.ioeEmployeeId}</Typography>
                </Grid>
              </Grid>
            </ListItem>
          )}
          {isAdmin && employee.tuEmployeeId && (
            <ListItem sx={{paddingLeft:'0px'}}>
              <Grid container spacing={-35}>
                <Grid item xs={6}>
                  <Typography variant="body1">TU Employee ID:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{employee.tuEmployeeId}</Typography>
                </Grid>
              </Grid>
            </ListItem>
          )}
          {isAdmin && employee.bankAccountNumber && (
            <ListItem sx={{paddingLeft:'0px'}}>
              <Grid container spacing={-35}>
                <Grid item xs={6}>
                  <Typography variant="body1">Bank Account Number:</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2">{employee.bankAccountNumber}</Typography>
                </Grid>
              </Grid>
            </ListItem>
          )}
          </List>
        </Box>
       </ThemeProvider>
    </Box>
  )
}

MyInfoJob.propTypes = {}

export default MyInfoJob
