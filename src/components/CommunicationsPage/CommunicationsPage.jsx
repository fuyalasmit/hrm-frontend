import Box from "@mui/system/Box";
import Stack from "@mui/system/Stack";
import CommunicationsMenu from "./CommunicationsMenu";
import { fonts } from "../../Styles";

/**
 * Communications page of the HRM application. Contains the communications menu.
 * 
 * Props:
 * - style<Object>: Optional prop for adding further inline styling.
 *      Default: {}
 */
export default function CommunicationsPage({style}) {
    return (
        <Box sx={{...{
            //padding: "40px",
            paddingBottom: "40px",
            fontFamily: fonts.fontFamily
        }, ...style}}>
            <Stack
                direction="row"
                alignItems="center"
                justifyContent="flex-start"
                sx={{
                    marginBottom: "16px",
                    minWidth: "1042px"
                }}    
            >
                <h3>Mass Communications</h3>
            </Stack>
            <CommunicationsMenu />
        </Box>
    );
};

//Control panel settings for storybook
CommunicationsPage.propTypes = {};

//Default values for this component
CommunicationsPage.defaultProps = {
    style: {},
};
