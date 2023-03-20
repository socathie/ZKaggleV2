const { expect, assert } = require("chai");
const { ethers } = require("hardhat");
const { groth16 } = require("snarkjs");

const fs = require("fs");
const crypto = require("crypto");
const base32 = require("base32.js");

const F1Field = require("ffjavascript").F1Field;
const Scalar = require("ffjavascript").Scalar;
exports.p = Scalar.fromString("21888242871839275222246405745257275088548364400416034343698204186575808495617");
const Fr = new F1Field(exports.p);

const { Keypair } = require("circomlib-ml/test/modules/maci-domainobjs");
const { decrypt } = require("circomlib-ml/test/modules/maci-crypto");

const json = require("./circuit.json");
const labels = require("../assets/labels.json");

// read ../assets/cid.txt into an array of strings
const cids = fs.readFileSync("assets/cid.txt").toString().split("\r");
// console.log(cids);

const idx = 567;

let modelHash;

describe("circuit.circom test", function () {
    let INPUT = {};

    for (const [key, value] of Object.entries(json)) {
        if (Array.isArray(value)) {
            let tmpArray = [];
            for (let i = 0; i < value.flat().length; i++) {
                tmpArray.push(Fr.e(value.flat()[i]));
            }
            INPUT[key] = tmpArray;
        } else {
            INPUT[key] = Fr.e(value);
        }
    }

    let Verifier;
    let verifier;

    let a, b, c, Input;

    const digests = [];

    before(async function () {
        Verifier = await ethers.getContractFactory("CircuitVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();

        const input = [];

        for (let i = 0; i < 10; i++) {
            const bytes = fs.readFileSync("assets/" + (idx + i) + ".pgm");
            const binary = [...bytes].map((b) => b.toString(2).padStart(8, "0").split("")).flat();
            input.push(binary);

            const hash = crypto.createHash('sha256');
            hash.update(bytes);
            digests.push(hash.digest('hex'));
        }
        // console.log(input.flat().length);

        INPUT["in"] = input.flat();

        const { proof, publicSignals } = await groth16.fullProve(INPUT, "circuits/build/circuit_js/circuit.wasm", "circuits/build/circuit_final.zkey");

        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        a = [argv[0], argv[1]];
        b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        c = [argv[6], argv[7]];
        Input = argv.slice(8);
        console.log(labels.slice(idx, idx + 10));
        console.log(Input.slice(0,10));

        const calldataJson = {
            "a": a,
            "b": b,
            "c": c,
            "input": Input,
        }

        // save calldata to json file
        fs.writeFileSync("./test/circuitCalldata.json", JSON.stringify(calldataJson));

        modelHash = Input[30];
    });

    it("Check circuit output", async () => {
        for (let i = 0; i < 10; i++) {
            const digest1 = Fr.e(digests[i].slice(0,32), 16);
            const digest2 = Fr.e(digests[i].slice(32,64), 16);

            assert(Fr.eq(Fr.e(Input[i*2+10]),Fr.e(digest1)));
            assert(Fr.eq(Fr.e(Input[i*2+11]),Fr.e(digest2)));
        }
    });

    it("Verifier should return true for correct proofs", async function () {
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });

    it("Verifier should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.false;
    });

    it("CIDv1 should match that from IPFS", async function () {
        const cid_version = 1;
        const cid_codec = 85; // raw 0x55
        const hash_function_code = 18; // SHA-256 0x12
        const length = 32;

        for (let i = 0; i < 10; i++) {
            const cidraw = cid_version.toString(16).padStart(2, "0") + cid_codec.toString(16).padStart(2, "0") + hash_function_code.toString(16).padStart(2, "0") + length.toString(16).padStart(2, "0") + digests[i];
            const buf = Buffer.from(cidraw, 'hex');

            const encoder = new base32.Encoder();
            const cid = encoder.write(buf).finalize().toLowerCase();
            expect("b" + cid).equal(cids[idx + i]);
        }
    });
});

describe("encryption.circom test", function () {
    let input = [];

    for (const [key, value] of Object.entries(json)) {
        // console.log(key);
        if (Array.isArray(value)) {
            let tmpArray = [];
            for (let i = 0; i < value.flat().length; i++) {
                tmpArray.push(Fr.e(value.flat()[i]));
            }
            input = [...input, ...tmpArray];
        } else {
            input.push(value);
        }
    }

    for (let i = input.length; i< 1000; i++) {
        input.push(0);
    }

    let Verifier;
    let verifier;

    let a, b, c, Input;

    let keypair;
    let keypair2;

    let ecdhSharedKey;

    let INPUT = {};

    before(async function () {
        keypair = new Keypair();
        keypair2 = new Keypair();

        ecdhSharedKey = Keypair.genEcdhSharedKey(
            keypair.privKey,
            keypair2.pubKey,
        );

        INPUT = {
            'private_key': keypair.privKey.asCircuitInputs(),
            'public_key': keypair2.pubKey.asCircuitInputs(),
            'in': input,
        }

        // console.log(INPUT);
        // console.log(INPUT['public_key']);

        Verifier = await ethers.getContractFactory("EncryptionVerifier");
        verifier = await Verifier.deploy();
        await verifier.deployed();

        const { proof, publicSignals } = await groth16.fullProve(INPUT, "circuits/build/encryption_js/encryption.wasm", "circuits/build/encryption_final.zkey");

        const calldata = await groth16.exportSolidityCallData(proof, publicSignals);

        const argv = calldata.replace(/["[\]\s]/g, "").split(',').map(x => BigInt(x).toString());

        a = [argv[0], argv[1]];
        b = [[argv[2], argv[3]], [argv[4], argv[5]]];
        c = [argv[6], argv[7]];
        Input = argv.slice(8);
        // console.log(Input.slice(1000));

        const calldataJson = {
            "a": a,
            "b": b,
            "c": c,
            "input": Input,
        }
        
        const keysJson = [
            {
                "private_key": keypair.privKey.asCircuitInputs(),
                "public_key": keypair.pubKey.asCircuitInputs(),
            },
            {
                "private_key": keypair2.privKey.asCircuitInputs(),
                "public_key": keypair2.pubKey.asCircuitInputs(),
            },
        ]
        // save calldata to json file
        fs.writeFileSync("./test/keys.json", JSON.stringify(keysJson));
        fs.writeFileSync("./test/encryptionCalldata.json", JSON.stringify(calldataJson));
    });

    it("Check circuit output", async () => {
        assert(Fr.eq(Fr.e(Input[0]),Fr.e(modelHash)));
        assert(Fr.eq(Fr.e(Input[1]),Fr.e(ecdhSharedKey)));
        assert(Fr.eq(Fr.e(Input[1003]),Fr.e(INPUT['public_key'][0])));
        assert(Fr.eq(Fr.e(Input[1004]),Fr.e(INPUT['public_key'][1])));
    });

    it("Verifier should return true for correct proofs", async function () {
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.true;
    });

    it("Verifier should return false for invalid proof", async function () {
        let a = [0, 0];
        let b = [[0, 0], [0, 0]];
        let c = [0, 0];
        expect(await verifier.verifyProof(a, b, c, Input)).to.be.false;
    });

    it("Decryption should match", async function () {
        const ciphertext = {
            iv: Input[2],
            data: Input.slice(3,1004),
        }

        const decrypted = decrypt(ciphertext, ecdhSharedKey);

        for (let i = 0; i < 1000; i++) {
            assert(Fr.eq(Fr.e(decrypted[i]), Fr.e(input[i])));
        }
    });
});
