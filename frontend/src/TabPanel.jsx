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
import { useAccount, useContractRead, useContractEvent, useBalance } from 'wagmi';
import { Contract, ethers } from 'ethers';
import BountyFactory from './assets/BountyFactory.json';
import bountyAbi from './assets/Bounty.json';

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
    const { address, isConnected } = useAccount();

    const [value, setValue] = React.useState(1);
    const [index, setIndex] = React.useState(0);

    const handleChange = (event, newValue) => {
        event.preventDefault();
        setValue(newValue);
    };

    const { data: bountyCount } = useContractRead({
        address: BountyFactory.address,
        abi: BountyFactory.abi,
        functionName: 'bountyCount',
    });
    const initialBounties = [];
    for (let i = 0; i < bountyCount?.toNumber(); i++) {
        const { data: address } = useContractRead({
            address: BountyFactory.address,
            abi: BountyFactory.abi,
            functionName: 'bounties',
            args: [i],
        });
        const bountyContract = {
            address: address,
            abi: bountyAbi.abi,
        };
        const { data: owner } = useContractRead({
            ...bountyContract,
            functionName: 'owner',
        });
        const { data: bountyHunter } = useContractRead({
            ...bountyContract,
            functionName: 'bountyHunter',
        });
        const { data: name } = useContractRead({
            ...bountyContract,
            functionName: 'name',
        });
        const { data: description } = useContractRead({
            ...bountyContract,
            functionName: 'description',
        });
        const { data: accuracyThreshold } = useContractRead({
            ...bountyContract,
            functionName: 'accuracyThreshold',
        });
        const { data: completedStep } = useContractRead({
            ...bountyContract,
            functionName: 'completedStep',
        });

        const { data: reward } = useBalance({
            address: address,
        });

        initialBounties.push({
            address: address,
            owner: owner,
            bountyHunter: bountyHunter,
            name: name,
            description: description,
            accuracyThreshold: accuracyThreshold,
            completedStep: completedStep,
            reward: reward,
        });
    }

    const [bounties, setBounties] = React.useState(initialBounties);

    const provider = new ethers.providers.JsonRpcProvider(
      "http://localhost:8545"
    );

    useContractEvent({
        address: BountyFactory.address,
        abi: BountyFactory.abi,
        eventName: 'BountyCreated',
        async listener(node, event) {
            const newAddress = event.args[0];
            console.log('BountyCreated', newAddress);
            for (let i = 0; i < bounties.length; i++) {
                if (bounties[i].address === newAddress) {
                    return;
                }
            }
            const bountyContract = new Contract(newAddress, bountyAbi.abi, provider);
            const owner = await bountyContract.owner();
            const bountyHunter = await bountyContract.bountyHunter();
            const name = await bountyContract.name();
            const description = await bountyContract.description();
            const accuracyThreshold = await bountyContract.accuracyThreshold();
            const reward = await provider.getBalance(newAddress);
            
            setBounties([...bounties, {
                address: newAddress,
                owner: owner,
                bountyHunter: bountyHunter,
                name: name,
                description: description,
                accuracyThreshold: accuracyThreshold,
                reward: {formatted: ethers.utils.formatEther(reward)},
            }]);

            if (address===owner) setValue(3);
        },
    });


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
                    <Tab label="ZKaggleV2" {...a11yProps(0)} />
                    <Tab label="About" {...a11yProps(1)} />
                    <Tab label="All Bounties" {...a11yProps(2)} />
                    <Tab label="My Bounties" {...a11yProps(3)} />
                    <Tab label="My Submissions" {...a11yProps(4)} />
                    <Tab label="Create Bounty" {...a11yProps(5)} />
                </Tabs>
                <ConnectButton />
            </Box>
            <TabPanel value={value} index={0}>
                {!isConnected && <h2>Connect your wallet to get started</h2>}
                {isConnected && <Bounty bounty={bounties[index]}/>}
            </TabPanel>
            <TabPanel value={value} index={1}>
                <About />
            </TabPanel>
            <TabPanel value={value} index={2}>
                {!isConnected && <h2>Connect your wallet to get started</h2>}
                {isConnected && <AllBounties setTab={setValue} setIndex={setIndex} bounties={bounties}/>}
            </TabPanel>
            <TabPanel value={value} index={3}>
                {!isConnected && <h2>Connect your wallet to get started</h2>}
                {isConnected && <MyBounties setTab={setValue} setIndex={setIndex} bounties={bounties}/>}
            </TabPanel>
            <TabPanel value={value} index={4}>
                {!isConnected && <h2>Connect your wallet to get started</h2>}
                {isConnected && <MySubmissions setTab={setValue} setIndex={setIndex} bounties={bounties}/>}
            </TabPanel>
            <TabPanel value={value} index={5}>
                {!isConnected && <h2>Connect your wallet to get started</h2>}
                {isConnected && <CreateBounty setTab={setValue} setIndex={setIndex} bounties={bounties}/>}
            </TabPanel>
        </Box >
    );
}