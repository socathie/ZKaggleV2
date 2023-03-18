import * as React from 'react';
import Tabs from '@mui/material/Tabs';
import Tab from '@mui/material/Tab';
import Box from '@mui/material/Box';
import About from './tabs/About';
import AllBounties from './tabs/AllBounties';
import MyBounties from './tabs/MyBounties';
import MySubmissions from './tabs/MySubmissions';
import Bounty from './tabs/Bounty';
import CreateBounty from './tabs/CreateBounty';
import { ConnectButton } from '@rainbow-me/rainbowkit';

function TabPanel(props) {
    const { children, value, index, ...other } = props;

    return (
        <div
            role="tabpanel"
            hidden={value !== index}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            {...other}
        >
            {value === index && (
                <Box sx={{ p: 3 }}>
                    {children}
                </Box>
            )}
        </div>
    );
}

function a11yProps(index) {
    return {
        id: `tab-${index}`,
        'aria-controls': `tabpanel-${index}`,
    };
}

export default function BasicTabs() {
    const [value, setValue] = React.useState(1);

    const handleChange = (event, newValue) => {
        setValue(newValue);
    };

    return (
        <Box sx={{ width: '100%' }}>
            <Box sx={{ borderBottom: 1, display: "flex", justifyContent: "space-between" }}>
                <Tabs
                    value={value}
                    onChange={handleChange}
                    variant="scrollable"
                    scrollButtons="auto"
                    allowScrollButtonsMobile={true}
                    aria-label="scrollable auto tabs example"
                >
                    <Tab label="ZKaggleV2" {...a11yProps(0)} disabled />
                    <Tab label="About" {...a11yProps(1)} />
                    <Tab label="All Bounties" {...a11yProps(2)} />
                    <Tab label="My Bounties" {...a11yProps(3)} />
                    <Tab label="My Submissions" {...a11yProps(4)} />
                    <Tab label="Create Bounty" {...a11yProps(5)} />
                </Tabs>
                <ConnectButton />
            </Box>
            <TabPanel value={value} index={0}>
                <Bounty />
            </TabPanel>
            <TabPanel value={value} index={1}>
                <About />
            </TabPanel>
            <TabPanel value={value} index={2}>
                <AllBounties setTab={setValue} />
            </TabPanel>
            <TabPanel value={value} index={3}>
                <MyBounties setTab={setValue} />
            </TabPanel>
            <TabPanel value={value} index={4}>
                <MySubmissions setTab={setValue} />
            </TabPanel>
            <TabPanel value={value} index={5}>
                <CreateBounty setTab={setValue} />
            </TabPanel>
        </Box>
    );
}