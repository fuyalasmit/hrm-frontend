import Box from "@mui/system/Box";
import CustomTabs from "../tabs/CustomTabs";
import ComposeEmailTabContent from "./ComposeEmailTabContent";
import EmailHistoryTabContent from "./EmailHistoryTabContent";
import { fonts } from "../../Styles";

/**
 * Menu component for the communications page.
 * 
 * Props: 
 * - style<Object>: Optional prop for adding further inline styling.
 *      Default: {}
 */
export default function CommunicationsMenu({style}) {
    const tabs = [
        { label: "Compose Email", child: <ComposeEmailTabContent /> },
        { label: "Email History", child: <EmailHistoryTabContent />}
    ]

    return (
        <Box sx={{...{
            boxSizing: "border-box",
            minWidth: "980px",
            paddingX: "45px",
            paddingY: "57px",
            border: "1px solid #EAECF0",
            borderRadius: "5px",
            backgroundColor: "#FFFFFF",
            fontFamily: fonts.fontFamily
        }, ...style}}>
            <CustomTabs items={tabs} />
        </Box>
    );
};

//Control panel settings for storybook
CommunicationsMenu.propTypes = {};

//Default values for this component
CommunicationsMenu.defaultProps = {
    style: {}
};
