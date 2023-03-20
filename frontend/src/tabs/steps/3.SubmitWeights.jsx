import * as React from "react";
import TextField from '@mui/material/TextField';
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { useContractRead, usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import { useDebounce } from 'use-debounce';
import bountyAbi from "../../assets/Bounty.json";
import encryptionCalldata from "../../assets/encryptionCalldata.json";

export default function SubmitWeights(props) {
    const { data: publicKey0 } = useContractRead({
        address: props.bounty.address,
        abi: bountyAbi.abi,
        functionName: "publicKeys",
        args: [0],
    });

    const { data: publicKey1 } = useContractRead({
        address: props.bounty.address,
        abi: bountyAbi.abi,
        functionName: "publicKeys",
        args: [1],
    });

    const [a, setA] = React.useState(encryptionCalldata.a.toString());
    const [debounceA] = useDebounce(a?.split(','), 500);

    const [b, setB] = React.useState(encryptionCalldata.b.toString());
    const [debounceB] = useDebounce(b?.split(','), 500);

    const [c, setC] = React.useState(encryptionCalldata.c.toString());
    const [debounceC] = useDebounce(c?.split(','), 500);

    const [input, setInput] = React.useState(encryptionCalldata.input.toString());
    const [debounceInput] = useDebounce(input?.split(','), 500);


    const {
        config,
        error: prepareError,
        isError: isPrepareError,
    } = usePrepareContractWrite({
        address: props.bounty.address,
        abi: bountyAbi.abi,
        functionName: "claimBounty",
        args: [
            debounceA,
            [[debounceB[0], debounceB[1]], [debounceB[2], debounceB[3]]],
            debounceC,
            debounceInput,
        ],
    });

    const { data, error, isError, write } = useContractWrite(config);

    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
    });

    return (<div>
        <Typography
            variant="h4" color="text.primary">
            Public keys
        </Typography>

        <Box
            component="form"
            sx={{
                "& .MuiTextField-root": { m: 1, width: "60vw" }
            }}
            noValidate
            autoComplete="off"
            textAlign="center"
        >
            <TextField
                required
                multiline
                id="public-keys"
                label="Public keys"
                value={publicKey0.toString() + '\n' + publicKey1.toString()}
                disabled
            />
        </Box>
        <Typography
            variant="h4" color="text.primary">
            Submit encyrpted weights
        </Typography>

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
                    required
                    id="a"
                    label="a"
                    value={a}
                    onChange={(event) => setA(event.target.value)}
                />
            </div><div>
                <TextField
                    required
                    id="b"
                    label="b"
                    value={b}
                    onChange={(event) => setB(event.target.value)}
                />
            </div><div>
                <TextField
                    required
                    id="c"
                    label="c"
                    value={c}
                    onChange={(event) => setC(event.target.value)}
                />
            </div><div>
                <TextField
                    required
                    id="input"
                    label="input"
                    value={input}
                    onChange={(event) => setInput(event.target.value)}
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
            {(isPrepareError || isError) && <Alert severity="error">{(prepareError || error)?.message?.split(", method")[0]}</Alert>}
            {isLoading && <Alert severity="info">Waiting for transaction to be mined...</Alert>}
            {isSuccess && <Alert severity="success">Transaction mined!</Alert>}
        </Box>
    </div>
    );
}