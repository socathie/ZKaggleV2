import * as React from 'react';
import { useDebounce } from 'use-debounce';
import {
    usePrepareContractWrite,
    useContractWrite,
    useWaitForTransaction,
} from 'wagmi'
import { ethers } from 'ethers';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Box from '@mui/material/Box';
import InputAdornment from '@mui/material/InputAdornment';
import Alert from '@mui/material/Alert';
import BountyFactory from '../assets/BountyFactory.json';
import CIDS from '../assets/cidraw.json';
import LABELS from '../assets/labels.json';

export default function CreateBounty() {

    const [name, setName] = React.useState("Bounty 1");
    const [debounceName] = useDebounce(name, 500);

    const [description, setDescription] = React.useState("Achieve 70% accuracy on the MNIST dataset.");
    const [debounceDescription] = useDebounce(description, 500);

    const [dataCIDs, setDataCIDs] = React.useState(CIDS.join("\n"));
    const [debounceDataCIDs] = useDebounce(dataCIDs.split("\n"), 500);

    const [labels, setLabels] = React.useState(LABELS.join("\n"));
    const [debounceLabels] = useDebounce(labels.split("\n"), 500);

    const [accuracy, setAccuracy] = React.useState("70");
    const [debounceAccuracy] = useDebounce(accuracy, 500);

    const [amount, setAmount] = React.useState("1.5");
    const [debounceAmount] = useDebounce(ethers.utils.parseUnits(amount, "ether"), 500);

    const {
        config,
        error: prepareError,
        isError: isPrepareError,
    } = usePrepareContractWrite({
        address: BountyFactory.address,
        abi: BountyFactory.abi,
        functionName: 'createBounty',
        args: [
            debounceName,
            debounceDescription,
            debounceDataCIDs,
            debounceLabels,
            debounceAccuracy,
        ],
        overrides: {
            value: debounceAmount,
        },
    });

    const { data, error, isError, write } = useContractWrite(config);

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    return (
        <Box
            component="form"
            sx={{
                "& .MuiTextField-root": { m: 1, width: "60vw" }
            }}
            noValidate
            autoComplete="off"
            textAlign="center"
        >
            <h2>Create a new bounty</h2>
            <div>
                <TextField
                    required
                    id="name"
                    label="Name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                />
            </div><div>
                <TextField
                    required
                    id="description"
                    label="Description"
                    value={description}
                    onChange={(event) => setDescription(event.target.value)}
                />

            </div><div>
                <TextField
                    required
                    multiline
                    id="dataCIDs"
                    label="Data CIDs (one per line)"
                    value={dataCIDs}
                    onChange={(event) => setDataCIDs(event.target.value)}
                />

            </div><div>
                <TextField
                    required
                    multiline
                    id="labels"
                    label="Labels (one per line)"
                    value={labels}
                    onChange={(event) => setLabels(event.target.value)}
                />

            </div><div>
                <TextField
                    required
                    id="accuracy"
                    label="Accuracy"
                    value={accuracy}
                    onChange={(event) => setAccuracy(event.target.value)}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">%</InputAdornment>,
                    }}
                />
                <TextField
                    required
                    id="amount"
                    label="Amount"
                    value={amount}
                    onChange={(event) => setAmount(event.target.value)}
                    InputProps={{
                        endAdornment: <InputAdornment position="end">ETH</InputAdornment>,
                    }}
                />
            </div>
            <Button
                variant="contained"
                disabled={isPrepareError || isLoading}
                onClick={(e) => {
                e.preventDefault();
                write?.();
            }}>
                Submit
            </Button>
            {(isPrepareError || isError) && <Alert severity="error">{(prepareError || error)?.message.split(", method")[0]}</Alert>}
            {isLoading && <Alert severity="info">Waiting for transaction to be mined...</Alert>}
            {isSuccess && <Alert severity="success">Transaction mined!</Alert>}
        </Box>
    );
}