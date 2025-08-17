import Box from "@mui/system/Box";
import Stack from "@mui/system/Stack";
import TextField from "@mui/material/TextField";
import Autocomplete from "@mui/material/Autocomplete";
import Chip from "@mui/material/Chip";
import FormControl from "@mui/material/FormControl";
import FormLabel from "@mui/material/FormLabel";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import { styled } from "@mui/system";
import { useState, useEffect } from "react";
import HRMButton from "../Button/HRMButton";
import { colors, fonts } from "../../Styles";
import RecipientsList from "../SurveysPage/RecipientsList";
const api = require("../../assets/FetchServices");

// Custom styled components - moved outside to prevent re-creation on each render
const StyledTextField = styled(TextField)({
    '& .MuiOutlinedInput-root': {
        fontFamily: fonts.fontFamily,
    },
    '& .MuiInputLabel-root': {
        fontFamily: fonts.fontFamily,
    }
});

const StyledAutocomplete = styled(Autocomplete)({
    '& .MuiInputBase-root': {
        fontFamily: fonts.fontFamily,
    },
    '& .MuiInputLabel-root': {
        fontFamily: fonts.fontFamily,
    }
});

/**
 * Tab content component for composing and sending mass emails.
 * 
 * Props:
 * - style<Object>: Optional prop for adding further inline styling.
 *      Default: {}
 */
export default function ComposeEmailTabContent({style}) {
    const [emailTitle, setEmailTitle] = useState("");
    const [emailContent, setEmailContent] = useState("");
    const [recipientType, setRecipientType] = useState("department");
    const [selectedDepartments, setSelectedDepartments] = useState([]);
    const [selectedEmployees, setSelectedEmployees] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [employees, setEmployees] = useState([]);
    const [recipients, setRecipients] = useState([]);
    const [isLoading, setIsLoading] = useState(false);

    // Fetch departments and employees on component mount
    useEffect(() => {
        const fetchData = async () => {
            try {
                const deptData = await api.department.fetchAll();
                const empData = await api.employee.fetchAll();
                setDepartments(deptData || []);
                setEmployees(empData || []);
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        };
        fetchData();
    }, []);

    // Update recipients when selection changes
    useEffect(() => {
        if (recipientType === "department") {
            const deptEmployees = employees.filter(emp => 
                selectedDepartments.some(dept => dept.id === emp.departmentId)
            );
            const formattedRecipients = deptEmployees.map(emp => ({
                empId: emp.empId,
                name: `${emp.firstName} ${emp.lastName}`,
                teamName: departments.find(dept => dept.id === emp.departmentId)?.departmentName || "No Department"
            }));
            setRecipients(formattedRecipients);
        } else {
            const formattedRecipients = selectedEmployees.map(emp => ({
                empId: emp.empId,
                name: `${emp.firstName} ${emp.lastName}`,
                teamName: departments.find(dept => dept.id === emp.departmentId)?.departmentName || "No Department"
            }));
            setRecipients(formattedRecipients);
        }
    }, [recipientType, selectedDepartments, selectedEmployees, employees, departments]);

    const handleSendEmail = async () => {
        if (!emailTitle.trim() || !emailContent.trim()) {
            alert("Please fill in both email title and content.");
            return;
        }

        if (recipients.length === 0) {
            alert("Please select at least one recipient.");
            return;
        }

        setIsLoading(true);
        try {
            const emailData = {
                title: emailTitle,
                content: emailContent,
                recipients: recipients.map(r => r.empId),
                recipientType: recipientType
            };

            // API call to send mass email
            await api.communication.sendMassEmail(emailData);
            
            // Reset form
            setEmailTitle("");
            setEmailContent("");
            setSelectedDepartments([]);
            setSelectedEmployees([]);
            setRecipients([]);
            
            alert("Email sent successfully!");
        } catch (error) {
            console.error("Error sending email:", error);
            alert("Failed to send email. Please try again.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Box sx={{...{
            width: "100%",
            fontFamily: fonts.fontFamily
        }, ...style}}>
            <Stack spacing={3}>
                {/* Email Title */}
                <StyledTextField
                    label="Email Title"
                    value={emailTitle}
                    onChange={(e) => setEmailTitle(e.target.value)}
                    fullWidth
                    required
                />

                {/* Email Content */}
                <StyledTextField
                    label="Email Content"
                    value={emailContent}
                    onChange={(e) => setEmailContent(e.target.value)}
                    fullWidth
                    multiline
                    rows={6}
                    required
                />

                {/* Recipient Type Selection */}
                <FormControl component="fieldset">
                    <FormLabel component="legend" sx={{fontFamily: fonts.fontFamily, color: colors.darkGrey}}>
                        Send to:
                    </FormLabel>
                    <RadioGroup
                        row
                        value={recipientType}
                        onChange={(e) => setRecipientType(e.target.value)}
                    >
                        <FormControlLabel 
                            value="department" 
                            control={<Radio />} 
                            label="Entire Department(s)" 
                        />
                        <FormControlLabel 
                            value="individual" 
                            control={<Radio />} 
                            label="Individual Employees" 
                        />
                    </RadioGroup>
                </FormControl>

                {/* Department Selection */}
                {recipientType === "department" && (
                    <StyledAutocomplete
                        multiple
                        options={departments}
                        getOptionLabel={(option) => option.departmentName}
                        value={selectedDepartments}
                        onChange={(event, newValue) => setSelectedDepartments(newValue)}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    key={`dept-${option.id}-${index}`}
                                    variant="outlined"
                                    label={option.departmentName}
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Departments"
                                placeholder="Choose departments"
                            />
                        )}
                    />
                )}

                {/* Employee Selection */}
                {recipientType === "individual" && (
                    <StyledAutocomplete
                        multiple
                        options={employees}
                        getOptionLabel={(option) => `${option.firstName} ${option.lastName}`}
                        value={selectedEmployees}
                        onChange={(event, newValue) => setSelectedEmployees(newValue)}
                        renderTags={(value, getTagProps) =>
                            value.map((option, index) => (
                                <Chip
                                    key={`emp-${option.empId}-${index}`}
                                    variant="outlined"
                                    label={`${option.firstName} ${option.lastName}`}
                                    {...getTagProps({ index })}
                                />
                            ))
                        }
                        renderInput={(params) => (
                            <TextField
                                {...params}
                                label="Select Employees"
                                placeholder="Choose employees"
                            />
                        )}
                    />
                )}

                {/* Recipients List */}
                {recipients.length > 0 && (
                    <Box>
                        <h4 style={{color: colors.darkGrey, marginBottom: "16px"}}>
                            Recipients ({recipients.length})
                        </h4>
                        <RecipientsList 
                            recipients={recipients}
                            setRecipients={setRecipients}
                            canEdit={true}
                        />
                    </Box>
                )}

                {/* Send Button */}
                <Stack direction="row" justifyContent="flex-end" sx={{paddingTop: "16px"}}>
                    <HRMButton
                        mode="primary"
                        onClick={handleSendEmail}
                        disabled={isLoading}
                        sx={{minWidth: "120px"}}
                    >
                        {isLoading ? "Sending..." : "Send Email"}
                    </HRMButton>
                </Stack>
            </Stack>
        </Box>
    );
};

//Control panel settings for storybook
ComposeEmailTabContent.propTypes = {};

//Default values for this component
ComposeEmailTabContent.defaultProps = {
    style: {}
};
