import { useMemo, useState, useEffect, useRef } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TableSortLabel from "@mui/material/TableSortLabel";
import { visuallyHidden } from "@mui/utils";
import { Box, Stack, Typography, Toolbar, TextField, Select, MenuItem, FormControl, Checkbox, Chip, ListItemText } from "@mui/material";
import Paper from "@mui/material/Paper";
import PropTypes from "prop-types";
import TablePagination from "./AppTablePagination";
import FilterButton from "./FilterButton";
import NoContentComponent from "./NoContentComponent";
import SearchIcon from "@mui/icons-material/Search";
import CloseIcon from "@mui/icons-material/Close";

const customStyle = (id, width) => {
  if (id === "action") {
    return {
      minWidth: width,
      padding: 1,
      position: "sticky",
      right: 0,
      backgroundColor: "#F9FAFB",
      boxShadow: "5px 2px 5px grey",
    };
  } else {
    return { minWidth: width, padding: 1 };
  }
};

// This is a utility function to create a custom React element.
function TableToolbar(props) {
  const { caption, count, column, setColumnData, searchValue, onSearchChange, searchInputRef } = props;
  return (
    <Stack spacing={2}>
      <Toolbar sx={{ ml: -2, mr: -2, my: 2 }}>
        <Typography
          variant="h6"
          id="tableTitle"
          component="div"
          color={"inherent"}
        >
          {caption}
        </Typography>
        {count !== null && (
          <Typography
            sx={{
              color: "#6941C6",
              backgroundColor: "#F9F5FF",
              ml: 2,
              pl: 1,
              pr: 1,
            }}
            color="inherit"
            variant="subtitle1"
            component="div"
            border={2}
            borderRadius={"30%"}
            borderColor={"#E9D7FE"}
          >
            {count}
          </Typography>
        )}
        <Box
          sx={{ flex: "1 1 40%" }}
          display={"flex"}
          justifyContent={"right"}
          alignContent={"right"}
        >
          <FilterButton columnData={column} setColumnData={setColumnData} />
        </Box>
      </Toolbar>
      
      {/* Search Bar */}
      <Box sx={{ mb: 4 }}>
        <TextField
          inputRef={searchInputRef}
          fullWidth
          size="small"
          placeholder="Search employees by name, position, post, department, or any attribute..."
          value={searchValue}
          onChange={(e) => onSearchChange(e.target.value)}
          sx={{
            maxWidth: 600,
            "& .MuiOutlinedInput-root": {
              borderRadius: "8px",
              fontSize: "14px",
            }
          }}
          slotProps={{
            input: {
              startAdornment: (
                <SearchIcon 
                  sx={{ 
                    color: "#6B7280", 
                    mr: 1, 
                    fontSize: "20px" 
                  }} 
                />
              ),
              endAdornment: searchValue && (
                <CloseIcon
                  onClick={() => onSearchChange("")}
                  sx={{
                    color: "#6B7280",
                    cursor: "pointer",
                    fontSize: "20px",
                    "&:hover": {
                      color: "#374151"
                    }
                  }}
                />
              )
            }
          }}
        />
      </Box>
    </Stack>
  );
}
TableToolbar.propTypes = {
  caption: PropTypes.string,
  count: PropTypes.number,
  column: PropTypes.array,
  setColumnData: PropTypes.func,
  searchValue: PropTypes.string,
  onSearchChange: PropTypes.func,
  searchInputRef: PropTypes.object,
};

//Utility function to get the column names
const getColumnName = (data) => {
  const columnNames = [];
  for (let item of data) {
    if (item.visible) {
      columnNames.push(item["id"]);
    }
  }
  return columnNames;
};

// Utility function to create a TableRow.
function CreateTableRow(headCell, headCellIds, row, rowIndex, handleSelection, handleRowClick) {
  if (row.cells) {
    return (
      <TableRow tabIndex={-1} key={rowIndex} sx={{ cursor: "pointer" }} onClick={() => handleRowClick(row)}>
        {row.cells.map((cell, index) => {
          if (headCell[index].visible) {
            return cell;
          }
        })}
      </TableRow>
    );
  }
  return (
    <TableRow tabIndex={-1} key={rowIndex} sx={{ cursor: "pointer" }} onClick={() => handleRowClick(row)}>
      {headCellIds.map((key, index) => {
        if (row[key]) {
          return (
            <TableCell key={`${rowIndex}-${key}-${index}`} align="left">
              {row[key]}
            </TableCell>
          );
        } else {
          return <TableCell key={`${rowIndex}-${key}-${index}`} align="left"></TableCell>;
        }
      })}
    </TableRow>
  );
}

// This function sorts element of the object array
function sortData(data, order = "asc", orderBy) {
  const descComparator = (a, b, orderBy) => {
    if (b[orderBy] < a[orderBy]) {
      return -1;
    }
    if (b[orderBy] > a[orderBy]) {
      return 1;
    }
    return 0;
  };
  if (order.toLowerCase() === "asc")
    return data.slice().sort((a, b) => -descComparator(a, b, orderBy));

  return data.slice().sort((a, b) => descComparator(a, b, orderBy));
}

/*
Utility function to format the tableHead.
@param props custom properties of the tableHead.
*/
function CustomisedTableHead(props) {
  const { headCells, order, orderBy, onRequestSort, showActionHeader, columnFilters, onFilterChange, data } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  // Function to get unique values for dropdown options
  const getUniqueValues = (fieldId) => {
    if (!data || data.length === 0) return [];
    
    const values = data.map(row => {
      let value = row[fieldId];
      if (typeof value === 'object' && value !== null) {
        // Handle nested objects
        if (value.departmentName) value = value.departmentName;
        else if (value.roleTitle) value = value.roleTitle;
        else if (value.firstName && value.lastName) value = `${value.firstName} ${value.lastName}`;
      }
      return value;
    }).filter(val => val != null && val !== '');
    
    return [...new Set(values)].sort();
  };

  return (
    <TableHead sx={{ backgroundColor: "#F9FAFB" }}>
      {/* Header Row */}
      <TableRow>
        {headCells.map((cell) => {
          if (cell.visible && cell.id !== "action") {
            return (
              <TableCell
                key={cell.id}
                align="left"
                padding="none"
                sortDirection={orderBy === cell.id ? order : false}
                component="th"
                sx={customStyle(cell.id, cell.width)}
              >
                <TableSortLabel
                  active={orderBy === cell.id}
                  direction={orderBy === cell.id ? order : "asc"}
                  onClick={createSortHandler(cell.id)}
                >
                  {cell.label}
                  {orderBy === cell.id ? (
                    <Box component="span" sx={visuallyHidden}>
                      {order === "desc"
                        ? "sorted descending"
                        : "sorted ascending"}
                    </Box>
                  ) : null}
                </TableSortLabel>
              </TableCell>
            );
          }
        })}
        {showActionHeader && (
          <TableCell
            key={"action"}
            align="left"
            padding="none"
            component="th"
            sx={customStyle("action", 30)}
          >
            Action
          </TableCell>
        )}
      </TableRow>
      
      {/* Filter Row */}
      <TableRow sx={{ backgroundColor: "#F3F4F6" }}>
        {headCells.map((cell) => {
          if (cell.visible && cell.id !== "action") {
            const uniqueValues = getUniqueValues(cell.id);
            return (
              <TableCell
                key={`filter-${cell.id}`}
                align="left"
                padding="none"
                sx={customStyle(cell.id, cell.width)}
              >
                <FormControl size="small" fullWidth sx={{ minWidth: 80 }}>
                  <Select
                    multiple
                    value={columnFilters[cell.id] || []}
                    onChange={(e) => onFilterChange(cell.id, e.target.value)}
                    displayEmpty
                    renderValue={(selected) => {
                      if (selected.length === 0) {
                        return <em>All</em>;
                      }
                      if (selected.length === 1) {
                        return selected[0];
                      }
                      return (
                        <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 0.5 }}>
                          <Chip
                            label={`${selected.length} selected`}
                            size="small"
                            sx={{ 
                              height: '20px', 
                              fontSize: '10px',
                              backgroundColor: '#E3F2FD',
                              color: '#1565C0'
                            }}
                          />
                        </Box>
                      );
                    }}
                    sx={{
                      fontSize: '12px',
                      backgroundColor: 'white',
                      '& .MuiSelect-select': {
                        padding: '4px 8px',
                      },
                    }}
                    MenuProps={{
                      PaperProps: {
                        style: {
                          maxHeight: 250,
                        },
                      },
                    }}
                  >
                    {uniqueValues.map((value) => (
                      <MenuItem key={value} value={value} sx={{ fontSize: '12px' }}>
                        <Checkbox 
                          checked={(columnFilters[cell.id] || []).indexOf(value) > -1}
                          size="small"
                        />
                        <ListItemText 
                          primary={value} 
                          sx={{ 
                            '& .MuiTypography-root': { 
                              fontSize: '12px' 
                            } 
                          }} 
                        />
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </TableCell>
            );
          }
        })}
        {showActionHeader && (
          <TableCell
            key={"filter-action"}
            align="left"
            padding="none"
            sx={customStyle("action", 30)}
          >
            {/* Empty cell for action column */}
          </TableCell>
        )}
      </TableRow>
    </TableHead>
  );
}

// headCell required properties.
const headCellsPropTypes = PropTypes.shape({
  id: PropTypes.string.isRequired,
  width: PropTypes.number.isRequired,
  label: PropTypes.string.isRequired,
  visible: PropTypes.bool,
});

CustomisedTableHead.propTypes = {
  headCells: PropTypes.arrayOf(headCellsPropTypes).isRequired,
  order: PropTypes.oneOf(["asc", "desc"]).isRequired,
  orderBy: PropTypes.string.isRequired,
  onRequestSort: PropTypes.func.isRequired,
  showActionHeader: PropTypes.bool,
  columnFilters: PropTypes.object,
  onFilterChange: PropTypes.func,
  data: PropTypes.array,
};

/**
 * This component renders a table with search and pagination.
 * @param {*} props Caption: It is the table title.
* headCells: An array of head cell properties (id, width, and label). 
The value of the id should match a key in the data object.
Label: This contains that column title. 
data: An array of data objects to be displayed. 
The cells property of the object is for formatting the TableCell Component. 
The properties of the object should match the values of the id property of 
the headCells.
onFilteredDataChange: Callback function to pass filtered data to parent component
 * @returns  {ReactNode} A Stack React element.
 */
export default function AppTable(props) {
  const {
    caption,
    headCells,
    data,
    rowsPerPage,
    handleSelection,
    loading,
    showActionHeader,
    handleRowClick,
    onFilteredDataChange,
  } = props;
  const [order, setOrder] = useState("asc");
  const [orderBy, setOrderBy] = useState("name");
  const [page, setPage] = useState(1);
  const [column, setColumn] = useState(headCells);
  const [dataSize, setDataSize] = useState(data.length);
  const [searchValue, setSearchValue] = useState("");
  const [columnFilters, setColumnFilters] = useState({});
  const searchInputRef = useRef(null);

  const columnNames = getColumnName(headCells);

  // Function to handle column filter changes
  const handleFilterChange = (columnId, filterValue) => {
    setColumnFilters(prev => ({
      ...prev,
      [columnId]: filterValue
    }));
    setPage(1); // Reset to first page when filter changes
  };

  // Function to check if row matches column filters
  const matchesColumnFilters = (row) => {
    return Object.entries(columnFilters).every(([columnId, filterValues]) => {
      if (!filterValues || filterValues.length === 0) return true; // No filter applied
      
      let rowValue = row[columnId];
      
      // Handle nested objects
      if (typeof rowValue === 'object' && rowValue !== null) {
        if (rowValue.departmentName) rowValue = rowValue.departmentName;
        else if (rowValue.roleTitle) rowValue = rowValue.roleTitle;
        else if (rowValue.firstName && rowValue.lastName) rowValue = `${rowValue.firstName} ${rowValue.lastName}`;
      }
      
      // Check if the row value is included in the selected filter values
      return filterValues.includes(String(rowValue));
    });
  };

  // Function to filter data based on search term and column filters
  const getFilteredData = () => {
    let filtered = data;

    // Apply column filters first
    filtered = filtered.filter(matchesColumnFilters);

    // Then apply search filter
    if (searchValue.trim()) {
      const searchTerm = searchValue.toLowerCase().trim();
      filtered = filtered.filter((row) => {
        // Search through all visible columns and common employee attributes
        const searchableFields = [
          'name', 'firstName', 'lastName', 'preferredName', 'email', 
          'phoneNumber', 'position', 'post', 'department', 'role', 
          'team', 'manager', 'officeLocation', 'nationality', 'gender'
        ];
        
        return searchableFields.some(field => {
          const value = row[field];
          if (value) {
            // Handle different data types
            if (typeof value === 'string') {
              return value.toLowerCase().includes(searchTerm);
            } else if (typeof value === 'object' && value.departmentName) {
              // Handle department object
              return value.departmentName.toLowerCase().includes(searchTerm);
            } else if (typeof value === 'object' && value.roleTitle) {
              // Handle role object
              return value.roleTitle.toLowerCase().includes(searchTerm);
            } else if (typeof value === 'object' && value.firstName && value.lastName) {
              // Handle manager object
              return `${value.firstName} ${value.lastName}`.toLowerCase().includes(searchTerm);
            }
          }
          return false;
        });
      });
    }

    return filtered;
  };

  const filteredData = getFilteredData();

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === "asc";
    setOrder(isAsc ? "desc" : "asc");
    setOrderBy(property);
  };

  const handleSearchChange = (value) => {
    setSearchValue(value);
    setPage(1); // Reset to first page when searching
  };

  useEffect(() => {
    setDataSize(filteredData.length);
    // Pass filtered data to parent component if callback is provided
    if (onFilteredDataChange) {
      onFilteredDataChange(filteredData);
    }
  }, [filteredData.length, loading, onFilteredDataChange, filteredData]);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleDataChange = (startIndex, endIndex) => {
    return sortData(filteredData, order, orderBy).slice(startIndex, endIndex);
  };

  const visibleRows = useMemo(
    () =>
      handleDataChange(
        (page - 1) * rowsPerPage,
        (page - 1) * rowsPerPage + rowsPerPage
      ),
    [order, orderBy, page, column, filteredData.length, loading, searchValue, columnFilters]
  );
  if (loading) {
    return (
      <NoContentComponent>
        <p>Loading. Please wait...</p>
      </NoContentComponent>
    );
  }
  if (data.length === 0) {
    return (
      <Box sx={{ padding: 16 }}>
      <NoContentComponent>
        <p>No data to display</p>
      </NoContentComponent>
      </Box>
    );
  }
  
  // Check if there are no results after filtering
  const hasNoSearchResults = filteredData.length === 0 && searchValue.trim();

  return (
    <Stack>
      <Stack>
        <TableToolbar
          caption={caption ? caption : "Table"}
          count={hasNoSearchResults ? 0 : filteredData.length}
          rowsPerPage={rowsPerPage}
          column={headCells}
          setColumnData={(columnData) => setColumn(columnData)}
          searchValue={searchValue}
          onSearchChange={handleSearchChange}
          searchInputRef={searchInputRef}
        />
        
        {hasNoSearchResults ? (
          <Box sx={{ padding: 16 }}>
            <NoContentComponent>
              <p>No employees found matching "{searchValue}". Try a different search term.</p>
            </NoContentComponent>
          </Box>
        ) : (
          <>
            <TableContainer
              component={Paper}
              sx={{
                border: "1px solid #EBEBEB",
                maxWidth: window.innerWidth < 1550 ? 1000 : 1250,
                minWidth: "100%",
                mt: 3
              }}
        >
          <Table aria-label="app table">
            <CustomisedTableHead
              headCells={headCells}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              showActionHeader={showActionHeader}
              columnFilters={columnFilters}
              onFilterChange={handleFilterChange}
              data={data}
            />
            <TableBody>
              {visibleRows.map((row, index) => {
                return CreateTableRow(
                  headCells,
                  columnNames,
                  row,
                  index,
                  handleSelection,
                  handleRowClick
                );
              })}
            </TableBody>
          </Table>
        </TableContainer>
        {dataSize > 10 && (
          <TablePagination
            count={filteredData.length}
            rowsPerPage={rowsPerPage}
            handleChangePage={handleChangePage}
          />
        )}
        </>
        )}
      </Stack>
    </Stack>
  );
}
