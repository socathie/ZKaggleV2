import * as React from "react";
import lighthouse from "@lighthouse-web3/sdk";
import TextField from '@mui/material/TextField';
import Button from "@mui/material/Button";
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import Alert from '@mui/material/Alert';
import { usePrepareContractWrite, useContractWrite, useWaitForTransaction } from "wagmi";
import { useDebounce } from 'use-debounce';
import { Contract, ethers } from "ethers";
import base32 from "base32.js";
import bountyAbi from "../../assets/Bounty.json";
import circuitCalldata from "../../assets/circuitCalldata.json";

export default function SubmitBounty(props) {
    const urlPrefix = "https://gateway.lighthouse.storage/ipfs/";
    const [links, setLinks] = React.useState([]);
    const [zkey, setZkey] = React.useState("QmVMBwFdacBj4PtqwVSraSDHZUQAgpmTFTDa2DYh2pB6L4");
    const [circom, setCircom] = React.useState("QmSgPr6FktpWnR2MC67e3Ec72zoNEriquZVaemGHfS3v8d");
    const [verifier, setVerifier] = React.useState("QmYuPSkG3GPFtiuE6BL3fA3n5ad8uWP9YrQhFmsaZHGjkm");

    const [verifierAddress, setVerifierAddress] = React.useState("0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0");
    const [debounceVerifierAddress] = useDebounce(verifierAddress, 500);

    const [a, setA] = React.useState(circuitCalldata.a.toString());
    const [debounceA] = useDebounce(a?.split(','), 500);

    const [b, setB] = React.useState(circuitCalldata.b.toString());
    const [debounceB] = useDebounce(b?.split(','), 500);

    const [c, setC] = React.useState(circuitCalldata.c.toString());
    const [debounceC] = useDebounce(c?.split(','), 500);

    const [input, setInput] = React.useState(circuitCalldata.input.toString());
    const [debounceInput] = useDebounce(input?.split(','), 500);

    const progressCallback = (progressData) => {
        let percentageDone =
            100 - (progressData?.total / progressData?.uploaded)?.toFixed(2);
        console.log(percentageDone);
    };

    const uploadZkey = async (e) => {
        const output = await lighthouse.upload(e, import.meta.env.VITE_LIGHTHOUSE_API_KEY, progressCallback);
        console.log('File Status:', output);
        console.log('Visit at https://gateway.lighthouse.storage/ipfs/' + output.data.Hash);
        setZkey(output.data.Hash);
    }

    const uploadCircom = async (e) => {
        const output = await lighthouse.upload(e, import.meta.env.VITE_LIGHTHOUSE_API_KEY, progressCallback);
        console.log('File Status:', output);
        console.log('Visit at https://gateway.lighthouse.storage/ipfs/' + output.data.Hash);
        setCircom(output.data.Hash);
    }

    const uploadVerifier = async (e) => {
        const output = await lighthouse.upload(e, import.meta.env.VITE_LIGHTHOUSE_API_KEY, progressCallback);
        console.log('File Status:', output);
        console.log('Visit at https://gateway.lighthouse.storage/ipfs/' + output.data.Hash);
        setVerifier(output.data.Hash);
    }

    const provider = new ethers.providers.JsonRpcProvider(
        "http://localhost:8545"
    );
    const loadCids = async () => {
        const newLinks = [];
        const contract = new Contract(
            props.bounty.address,
            bountyAbi.abi,
            provider
        );
        let index = 0;
        let ok = true;
        while (ok) {
            await contract.dataCIDs(index)
                .then((cid) => {
                    console.log(cid);
                    const encoder = new base32.Encoder();
                    const CID =
                        "b" +
                        encoder
                            .write(ethers.utils.arrayify(cid))
                            .finalize()
                            .toLowerCase();
                    newLinks.push(urlPrefix + CID);
                    index++;
                })
                .catch((err) => {
                    ok = false;
                });
        }
        setLinks(newLinks);
    }

    const {
        config,
        error: prepareError,
        isError: isPrepareError,
    } = usePrepareContractWrite({
        address: props.bounty.address,
        abi: bountyAbi.abi,
        functionName: "submitBounty",
        args: [
            Buffer.from(zkey),
            Buffer.from(circom),
            Buffer.from(verifier),
            debounceVerifierAddress,
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

    return (
        <div>
            <Typography
                variant="h4" color="text.primary">
                1. Download data
            </Typography>
            <div>
                <Button

                    variant="contained"
                    color="primary"
                    onClick={() => loadCids()}
                >
                    Fetch
                </Button>
            </div><div>
                {links.map((link, index) => {
                    return (
                        <Button
                            key={index}
                            variant="outlined" color="secondary"
                            href={link} target="_blank">
                            Download file {index}
                        </Button>
                    )
                })}
            </div>
            <br />
            <Typography
                variant="h4" color="text.primary">
                2. Process task locally
            </Typography>
            <br />
            <div>
                <Typography
                    variant="h4" color="text.primary">
                    3. Upload circom, zkey, and verifier
                </Typography>
                <Typography
                    variant="h6" color="text.secondary">
                    Upload zkey file
                </Typography>
                <input onChange={e => uploadZkey(e)} type="file" />
                <Typography
                    variant="h6" color="text.secondary">
                    Upload circom file
                </Typography>
                <input onChange={e => uploadCircom(e)} type="file" />
                <Typography
                    variant="h6" color="text.secondary">
                    Upload verifier file
                </Typography>
                <input onChange={e => uploadVerifier(e)} type="file" />
            </div><br />
            <Typography
                variant="h4" color="text.primary">
                4. Submit bounty
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
                        id="verifier-address"
                        label="Verifier Address"
                        value={verifierAddress}
                        onChange={(event) => setVerifierAddress(event.target.value)}
                    />
                </div><div>
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