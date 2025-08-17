import Box from "@mui/system/Box";
import Stack from "@mui/system/Stack";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TextField from "@mui/material/TextField";
import CloseIcon from "@mui/icons-material/Close";
import { styled } from "@mui/system";
import { useState, useEffect } from "react";
import { colors, fonts } from "../../Styles";
import HRMButton from "../Button/HRMButton";
const api = require("../../assets/FetchServices");

/**
 * Tab content component for viewing sent email history.
 * 
 * Props:
 * - style<Object>: Optional prop for adding further inline styling.
 *      Default: {}
 */
export default function EmailHistoryTabContent({style}) {
    const [emailHistory, setEmailHistory] = useState([]);
    const [filteredHistory, setFilteredHistory] = useState([]);
    const [filterTitle, setFilterTitle] = useState("");
    const [filterDate, setFilterDate] = useState("");
    const [isLoading, setIsLoading] = useState(false);

    //Custom style elements
    const TableHeaderCell = styled(TableCell)({
        color: colors.darkGrey,
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "12px",
        paddingBottom: "12px",
        fontFamily: fonts.fontFamily
    });

    const TableBodyCell = styled(TableCell)({
        color: colors.darkGrey,
        paddingLeft: "24px",
        paddingRight: "24px",
        paddingTop: "16px",
        paddingBottom: "16px",
        fontFamily: fonts.fontFamily
    });

    // Fetch email history on component mount
    useEffect(() => {
        const fetchEmailHistory = async () => {
            setIsLoading(true);
            try {
                const historyData = await api.communication.fetchEmailHistory();
                setEmailHistory(historyData || []);
                setFilteredHistory(historyData || []);
            } catch (error) {
                console.error("Error fetching email history:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchEmailHistory();
    }, []);

    // Filter email history based on title and date
    useEffect(() => {
        let filtered = emailHistory;

        if (filterTitle) {
            filtered = filtered.filter(email => 
                email.title.toLowerCase().includes(filterTitle.toLowerCase())
            );
        }

        if (filterDate) {
            filtered = filtered.filter(email => 
                new Date(email.sentDate).toDateString() === new Date(filterDate).toDateString()
            );
        }

        setFilteredHistory(filtered);
    }, [filterTitle, filterDate, emailHistory]);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    return (
        <Box sx={{...{
            width: "100%",
            fontFamily: fonts.fontFamily
        }, ...style}}>
            <Stack spacing={3}>
                {/* Filter Section */}
                <Stack 
                    direction="row" 
                    alignContent="center" 
                    justifyContent="flex-start"
                    spacing={2}
                    sx={{marginBottom: "20px"}}
                >
                    <TextField 
                        placeholder="Search by email title" 
                        size="small" 
                        value={filterTitle}
                        onChange={(e) => setFilterTitle(e.target.value)}
                        sx={{width: "300px"}} 
                        slotProps={{
                            input: {
                                endAdornment: <CloseIcon 
                                    onClick={() => setFilterTitle("")}
                                    sx={{
                                        color: colors.lightGrey,
                                        "&:hover": {
                                            cursor: "pointer"
                                        }
                                    }} 
                                />
                            }
                        }}
                    />
                    <TextField 
                        type="date"
                        size="small" 
                        label="Filter by date"
                        value={filterDate}
                        onChange={(e) => setFilterDate(e.target.value)}
                        sx={{width: "200px"}}
                        InputLabelProps={{
                            shrink: true,
                        }}
                        slotProps={{
                            input: {
                                endAdornment: filterDate && <CloseIcon 
                                    onClick={() => setFilterDate("")}
                                    sx={{
                                        color: colors.lightGrey,
                                        "&:hover": {
                                            cursor: "pointer"
                                        }
                                    }}
                                />
                            }
                        }}
                    />
                </Stack>

                {/* Email History Table */}
                {isLoading ? (
                    <Box sx={{textAlign: "center", padding: "40px"}}>
                        <p>Loading email history...</p>
                    </Box>
                ) : filteredHistory.length === 0 ? (
                    <Box sx={{textAlign: "center", padding: "40px"}}>
                        <p>No email history found.</p>
                    </Box>
                ) : (
                    <TableContainer>
                        <Table>
                            <TableHead>
                                <TableRow sx={{backgroundColor: "#F9FAFB"}}>
                                    <TableHeaderCell><b>Email Title</b></TableHeaderCell>
                                    <TableHeaderCell><b>Recipients</b></TableHeaderCell>
                                    <TableHeaderCell><b>Sent Date</b></TableHeaderCell>
                                    <TableHeaderCell><b>Status</b></TableHeaderCell>
                                    <TableHeaderCell><b>Actions</b></TableHeaderCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredHistory.map((email) => (
                                    <TableRow key={email.id}>
                                        <TableBodyCell>
                                            <b>{email.title}</b>
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            {email.recipientCount} recipients
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            {formatDate(email.sentDate)}
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            <span style={{
                                                color: email.status === 'sent' ? colors.green : colors.red,
                                                fontWeight: 'bold'
                                            }}>
                                                {email.status.toUpperCase()}
                                            </span>
                                        </TableBodyCell>
                                        <TableBodyCell>
                                            <Stack direction="row" spacing={1}>
                                                <HRMButton 
                                                    mode="tertiary" 
                                                    onClick={() => {
                                                        // Handle view email details
                                                        console.log("View email:", email);
                                                    }}
                                                    sx={{fontSize: "12px", padding: "4px 8px"}}
                                                >
                                                    View
                                                </HRMButton>
                                            </Stack>
                                        </TableBodyCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Stack>
        </Box>
    );
};

//Control panel settings for storybook
EmailHistoryTabContent.propTypes = {};

//Default values for this component
EmailHistoryTabContent.defaultProps = {
    style: {}
};
