import * as React from 'react';
import Typography from '@mui/material/Typography';
import TextField from '@mui/material/TextField';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import { Contract, ethers } from 'ethers';
import bountyAbi from "../../assets/Bounty.json";

export default function ReceiveWeights(props) {
    const [weights, setWeights] = React.useState([]);

    const provider = new ethers.providers.JsonRpcProvider("http://localhost:8545");

    const fetch = async () => {
        const contract = new Contract(props.bounty.address, bountyAbi.abi, provider);
        const weights = [];
        for (let i = 3; i < 1004; i++) {
            const weight = await contract.input(i);
            weights.push(weight);
        }
        setWeights(weights);
    }

    return (
        <div>
            <Typography variant="h5" color="text.primary">Received model weights! Copy and decrypt locally.</Typography>
            <Box
                component="form"
                sx={{
                    "& .MuiTextField-root": { m: 1, width: "60vw" }
                }}
                noValidate
                autoComplete="off"
                textAlign="center"
            >
                <div>
                    <TextField
                        multiline
                        disabled
                        id="weights"
                        label="weights"
                        value={weights}
                    />
                </div>
                <Button
                    variant="contained"
                    onClick={fetch}
                >
                    Fetch
                </Button>
            </Box>
        </div>
    )
}