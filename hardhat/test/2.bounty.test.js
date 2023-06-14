const { expect } = require("chai");
const { ethers } = require("hardhat");

const fs = require("fs");
const base32 = require("base32.js");

const labels = require("../assets/labels.json");

const circuitCalldata = require("./circuitCalldata.json");
const encryptionCalldata = require("./encryptionCalldata.json");

// read ../assets/cid.txt into an array of strings
const cids = fs.readFileSync("assets/cid.txt").toString().split("\r");

const idx = 567;

const _labels = [];

describe("Bounty contract test", function () {
    const cidraw = []; // raw CIDs of the uploaded files
    let encryptionVerifierAddress;

    describe("Tx 1: Creating a bounty", function () {

        before(async function () {
            // deploy pairing contracts from pairing100 to pairing1000
            const Pairing100 = await ethers.getContractFactory("Pairing100");
            const pairing100 = await Pairing100.deploy();
            await pairing100.deployed();
    
            const Pairing200 = await ethers.getContractFactory("Pairing200");
            const pairing200 = await Pairing200.deploy();
            await pairing200.deployed();
    
            const Pairing300 = await ethers.getContractFactory("Pairing300");
            const pairing300 = await Pairing300.deploy();
            await pairing300.deployed();
    
            const Pairing400 = await ethers.getContractFactory("Pairing400");
            const pairing400 = await Pairing400.deploy();
            await pairing400.deployed();
    
            const Pairing500 = await ethers.getContractFactory("Pairing500");
            const pairing500 = await Pairing500.deploy();
            await pairing500.deployed();
    
            const Pairing600 = await ethers.getContractFactory("Pairing600");
            const pairing600 = await Pairing600.deploy();
            await pairing600.deployed();
    
            const Pairing700 = await ethers.getContractFactory("Pairing700");
            const pairing700 = await Pairing700.deploy();
            await pairing700.deployed();
    
            const Pairing800 = await ethers.getContractFactory("Pairing800");
            const pairing800 = await Pairing800.deploy();
            await pairing800.deployed();
    
            const Pairing900 = await ethers.getContractFactory("Pairing900");
            const pairing900 = await Pairing900.deploy();
            await pairing900.deployed();
    
            const Pairing1000 = await ethers.getContractFactory("Pairing1000");
            const pairing1000 = await Pairing1000.deploy();
            await pairing1000.deployed();

            const EncyrptionVerifier = await ethers.getContractFactory("EncryptionVerifier");
            const encryptionVerifier = await EncyrptionVerifier.deploy(pairing100.address, pairing200.address, pairing300.address, pairing400.address, pairing500.address, pairing600.address, pairing700.address, pairing800.address, pairing900.address, pairing1000.address);
            await encryptionVerifier.deployed();
            encryptionVerifierAddress = encryptionVerifier.address;

            for (let i = 0; i < 10; i++) {
                const decoder = new base32.Decoder();
                cidraw.push(decoder.write(cids[idx + i].slice(1)).finalize());
                _labels.push(labels[idx + i]);
            }

            // write cidraw into a json file
            fs.writeFileSync("./test/cidraw.json", JSON.stringify(cidraw.map((cid) => '0x' + cid.toString('hex'))));
            // write _labels into a json file
            fs.writeFileSync("./test/labels.json", JSON.stringify(_labels));
        });

        it("Should reject deploying the contract is msg.value is 0", async function () {
            const owner = await ethers.provider.getSigner(0).getAddress();
            const Bounty = await ethers.getContractFactory("Bounty");
            const bounty = await Bounty.deploy();
            await bounty.deployed();

            await expect(bounty.initialize(
                owner,
                "Bounty 1",
                "This is the first bounty",
                cidraw,
                _labels,
                70,
                encryptionVerifierAddress,
            )).to.be.revertedWith("Bounty reward must be greater than 0");
        });

        it("Should deploy the contract and set owner to first input", async function () {
            const owner = await ethers.provider.getSigner(0).getAddress();
            const Bounty = await ethers.getContractFactory("Bounty");
            const bounty = await Bounty.deploy();
            await bounty.deployed();

            const tx = await bounty.initialize(
                owner,
                "Bounty 1",
                "This is the first bounty",
                cidraw,
                _labels,
                70,
                encryptionVerifierAddress,
                { value: ethers.utils.parseEther("1") }
            );
            await tx.wait();
            expect(await bounty.name()).to.equal("Bounty 1");
            expect(await bounty.description()).to.equal("This is the first bounty");
            for (let i = 0; i < 10; i++) {
                expect(await bounty.dataCIDs(i)).to.equal('0x' + cidraw[i].toString('hex'));
                expect(await bounty.labels(i)).to.equal(_labels[i]);
            }
            expect(await bounty.owner()).to.equal(owner);
            expect(await bounty.completedStep()).to.equal(1);
        });
    });

    let a, b, c, Input;

    describe("Tx 2: Submitting a bounty", function () {
        let bounty, verifier, encryptionVerifierAddress;
        const digests = [];

        before(async function () {
            // deploy pairing contracts from pairing100 to pairing1000
            const Pairing100 = await ethers.getContractFactory("Pairing100");
            const pairing100 = await Pairing100.deploy();
            await pairing100.deployed();
    
            const Pairing200 = await ethers.getContractFactory("Pairing200");
            const pairing200 = await Pairing200.deploy();
            await pairing200.deployed();
    
            const Pairing300 = await ethers.getContractFactory("Pairing300");
            const pairing300 = await Pairing300.deploy();
            await pairing300.deployed();
    
            const Pairing400 = await ethers.getContractFactory("Pairing400");
            const pairing400 = await Pairing400.deploy();
            await pairing400.deployed();
    
            const Pairing500 = await ethers.getContractFactory("Pairing500");
            const pairing500 = await Pairing500.deploy();
            await pairing500.deployed();
    
            const Pairing600 = await ethers.getContractFactory("Pairing600");
            const pairing600 = await Pairing600.deploy();
            await pairing600.deployed();
    
            const Pairing700 = await ethers.getContractFactory("Pairing700");
            const pairing700 = await Pairing700.deploy();
            await pairing700.deployed();
    
            const Pairing800 = await ethers.getContractFactory("Pairing800");
            const pairing800 = await Pairing800.deploy();
            await pairing800.deployed();
    
            const Pairing900 = await ethers.getContractFactory("Pairing900");
            const pairing900 = await Pairing900.deploy();
            await pairing900.deployed();
    
            const Pairing1000 = await ethers.getContractFactory("Pairing1000");
            const pairing1000 = await Pairing1000.deploy();
            await pairing1000.deployed();

            const EncyrptionVerifier = await ethers.getContractFactory("EncryptionVerifier");
            const encryptionVerifier = await EncyrptionVerifier.deploy(pairing100.address, pairing200.address, pairing300.address, pairing400.address, pairing500.address, pairing600.address, pairing700.address, pairing800.address, pairing900.address, pairing1000.address);
            await encryptionVerifier.deployed();
            encryptionVerifierAddress = encryptionVerifier.address;

            const owner = await ethers.provider.getSigner(0).getAddress();
            const Bounty = await ethers.getContractFactory("Bounty");
            bounty = await Bounty.deploy();
            await bounty.deployed();

            const tx = await bounty.initialize(
                owner,
                "Bounty 1",
                "This is the first bounty",
                cidraw,
                _labels,
                70,
                encryptionVerifierAddress,
                { value: ethers.utils.parseEther("1") }
            );
            await tx.wait();

            // Deploy the verifier
            const Verifier = await ethers.getContractFactory("CircuitVerifier");
            verifier = await Verifier.deploy();
            await verifier.deployed();

            a = circuitCalldata.a;
            b = circuitCalldata.b;
            c = circuitCalldata.c;
            Input = circuitCalldata.input;
        });

        it("Should reject a bounty with wrong proof", async function () {
            await expect(bounty.connect(ethers.provider.getSigner(1)).
                submitBounty(
                    0x0,
                    0x0,
                    0x0,
                    verifier.address,
                    [0, 0],
                    [[0, 0], [0, 0]],
                    [0, 0],
                    Input
                )).to.be.revertedWith("Invalid proof");
        });

        it("Should reject a bounty with wrong verifier", async function () {
            await expect(bounty.connect(ethers.provider.getSigner(1)).
                submitBounty(
                    0x0,
                    0x0,
                    0x0,
                    ethers.constants.AddressZero,
                    a,
                    b,
                    c,
                    Input
                )).to.be.revertedWith("Invalid verifier address");
        });

        it("Should reject a bounty with wrong input", async function () {
            await expect(bounty.connect(ethers.provider.getSigner(1)).
                submitBounty(
                    0x0,
                    0x0,
                    0x0,
                    verifier.address,
                    a,
                    b,
                    c,
                    [..._labels, ...Array(21).keys()]
                )).to.be.revertedWith("Data CID mismatch");
        });

        it("Should reject a bounty with low accuracy", async function () {
            await expect(bounty.connect(ethers.provider.getSigner(1)).
                submitBounty(
                    0x0,
                    0x0,
                    0x0,
                    verifier.address,
                    a,
                    b,
                    c,
                    [...Array(31).keys()]
                )).to.be.revertedWith("Accuracy threshold not met");
        });

        it("Should submit a bounty", async function () {
            const submitter = await ethers.provider.getSigner(1).getAddress();
            const tx = await bounty.connect(ethers.provider.getSigner(1)).
                submitBounty(
                    0x0,
                    0x0,
                    0x0,
                    verifier.address,
                    a,
                    b,
                    c,
                    Input
                );
            await tx.wait();

            expect(tx).to.emit(bounty, "BountySubmitted");
            expect(await bounty.bountyHunter()).to.equal(submitter);
            expect(await bounty.completedStep()).to.equal(2);
        });

        it("Should reject submitting a submitted bounty", async function () {
            await expect(bounty.connect(ethers.provider.getSigner(1)).
                submitBounty(
                    0x0,
                    0x0,
                    0x0,
                    verifier.address,
                    a,
                    b,
                    c,
                    Input
                )).to.be.revertedWith("Bounty already submitted");
        });
    });

    let publicKeys;

    describe("Tx 3: Releasing a bounty", function () {
        let bounty, verifier, encryptionVerifierAddress;

        before(async function () {
            // deploy pairing contracts from pairing100 to pairing1000
            const Pairing100 = await ethers.getContractFactory("Pairing100");
            const pairing100 = await Pairing100.deploy();
            await pairing100.deployed();
    
            const Pairing200 = await ethers.getContractFactory("Pairing200");
            const pairing200 = await Pairing200.deploy();
            await pairing200.deployed();
    
            const Pairing300 = await ethers.getContractFactory("Pairing300");
            const pairing300 = await Pairing300.deploy();
            await pairing300.deployed();
    
            const Pairing400 = await ethers.getContractFactory("Pairing400");
            const pairing400 = await Pairing400.deploy();
            await pairing400.deployed();
    
            const Pairing500 = await ethers.getContractFactory("Pairing500");
            const pairing500 = await Pairing500.deploy();
            await pairing500.deployed();
    
            const Pairing600 = await ethers.getContractFactory("Pairing600");
            const pairing600 = await Pairing600.deploy();
            await pairing600.deployed();
    
            const Pairing700 = await ethers.getContractFactory("Pairing700");
            const pairing700 = await Pairing700.deploy();
            await pairing700.deployed();
    
            const Pairing800 = await ethers.getContractFactory("Pairing800");
            const pairing800 = await Pairing800.deploy();
            await pairing800.deployed();
    
            const Pairing900 = await ethers.getContractFactory("Pairing900");
            const pairing900 = await Pairing900.deploy();
            await pairing900.deployed();
    
            const Pairing1000 = await ethers.getContractFactory("Pairing1000");
            const pairing1000 = await Pairing1000.deploy();
            await pairing1000.deployed();

            const EncyrptionVerifier = await ethers.getContractFactory("EncryptionVerifier");
            const encryptionVerifier = await EncyrptionVerifier.deploy(pairing100.address, pairing200.address, pairing300.address, pairing400.address, pairing500.address, pairing600.address, pairing700.address, pairing800.address, pairing900.address, pairing1000.address);
            await encryptionVerifier.deployed();
            encryptionVerifierAddress = encryptionVerifier.address;

            const owner = await ethers.provider.getSigner(0).getAddress();
            const Bounty = await ethers.getContractFactory("Bounty");
            bounty = await Bounty.deploy();
            await bounty.deployed();
            const tx = await bounty.initialize(
                owner,
                "Bounty 1",
                "This is the first bounty",
                cidraw,
                _labels,
                70,
                encryptionVerifierAddress,
                { value: ethers.utils.parseEther("1") }
            );
            await tx.wait();

            // Deploy the verifier
            const Verifier = await ethers.getContractFactory("CircuitVerifier");
            verifier = await Verifier.deploy();
            await verifier.deployed();

            publicKeys = [encryptionCalldata.input[1003], encryptionCalldata.input[1004]];
        });

        it("Should reject releasing an unsubmitted bounty", async function () {
            await expect(bounty.releaseBounty(publicKeys)).to.be.revertedWith("Bounty hunter has not submitted proof");
        });

        it("Should reject releasing a bounty by non-owner", async function () {

            const tx = await bounty.connect(ethers.provider.getSigner(1)).
                submitBounty(
                    0x0,
                    0x0,
                    0x0,
                    verifier.address,
                    a,
                    b,
                    c,
                    Input
                );
            await tx.wait();
            await expect(bounty.connect(ethers.provider.getSigner(1)).releaseBounty(publicKeys)).to.be.revertedWith("Ownable: caller is not the owner");
        });

        it("Should release a bounty", async function () {
            const tx = await bounty.releaseBounty(publicKeys);
            await tx.wait();

            expect(tx).to.emit(bounty, "BountyReleased");
            expect(await bounty.isComplete()).to.equal(true);
            expect(await bounty.completedStep()).to.equal(3);
        });

        it("Should reject releasing a bounty twice", async function () {
            await expect(bounty.releaseBounty(publicKeys)).to.be.revertedWith("Bounty is already complete");
        });
    });

    describe("Tx 4: Claiming a bounty", function () {
        let bounty, verifier, encryptionVerifierAddress;

        before(async function () {
            // deploy pairing contracts from pairing100 to pairing1000
            const Pairing100 = await ethers.getContractFactory("Pairing100");
            const pairing100 = await Pairing100.deploy();
            await pairing100.deployed();
    
            const Pairing200 = await ethers.getContractFactory("Pairing200");
            const pairing200 = await Pairing200.deploy();
            await pairing200.deployed();
    
            const Pairing300 = await ethers.getContractFactory("Pairing300");
            const pairing300 = await Pairing300.deploy();
            await pairing300.deployed();
    
            const Pairing400 = await ethers.getContractFactory("Pairing400");
            const pairing400 = await Pairing400.deploy();
            await pairing400.deployed();
    
            const Pairing500 = await ethers.getContractFactory("Pairing500");
            const pairing500 = await Pairing500.deploy();
            await pairing500.deployed();
    
            const Pairing600 = await ethers.getContractFactory("Pairing600");
            const pairing600 = await Pairing600.deploy();
            await pairing600.deployed();
    
            const Pairing700 = await ethers.getContractFactory("Pairing700");
            const pairing700 = await Pairing700.deploy();
            await pairing700.deployed();
    
            const Pairing800 = await ethers.getContractFactory("Pairing800");
            const pairing800 = await Pairing800.deploy();
            await pairing800.deployed();
    
            const Pairing900 = await ethers.getContractFactory("Pairing900");
            const pairing900 = await Pairing900.deploy();
            await pairing900.deployed();
    
            const Pairing1000 = await ethers.getContractFactory("Pairing1000");
            const pairing1000 = await Pairing1000.deploy();
            await pairing1000.deployed();

            const EncyrptionVerifier = await ethers.getContractFactory("EncryptionVerifier");
            const encryptionVerifier = await EncyrptionVerifier.deploy(pairing100.address, pairing200.address, pairing300.address, pairing400.address, pairing500.address, pairing600.address, pairing700.address, pairing800.address, pairing900.address, pairing1000.address);
            await encryptionVerifier.deployed();
            encryptionVerifierAddress = encryptionVerifier.address;

            const owner = await ethers.provider.getSigner(0).getAddress();
            const Bounty = await ethers.getContractFactory("Bounty");
            bounty = await Bounty.deploy();
            await bounty.deployed();

            let tx = await bounty.initialize(
                owner,
                "Bounty 1",
                "This is the first bounty",
                cidraw,
                _labels,
                70,
                encryptionVerifierAddress,
                { value: ethers.utils.parseEther("1") }
            );
            await tx.wait();

            // Deploy the verifier
            const Verifier = await ethers.getContractFactory("CircuitVerifier");
            verifier = await Verifier.deploy();
            await verifier.deployed();

            tx = await bounty.connect(ethers.provider.getSigner(1)).
                submitBounty(
                    0x0,
                    0x0,
                    0x0,
                    verifier.address,
                    a,
                    b,
                    c,
                    Input
                );
            await tx.wait();

            a = encryptionCalldata.a;
            b = encryptionCalldata.b;
            c = encryptionCalldata.c;
            Input = encryptionCalldata.input;
        });

        it("Should reject claiming a bounty by non bounty hunter", async function () {
            await expect(bounty.connect(ethers.provider.getSigner(2))
                .claimBounty(a, b, c, Input)).to.be.revertedWith("Only bounty hunter can claim bounty");
        });

        it("Should reject claiming an uncompleted bounty", async function () {
            await expect(bounty.connect(ethers.provider.getSigner(1))
                .claimBounty(a, b, c, Input))
                .to.be.revertedWith("Bounty is not complete");
        });

        it("Should claim a bounty", async function () {
            const bountyHunter = await ethers.provider.getSigner(1).getAddress();
            const balance = await ethers.provider.getBalance(bountyHunter);
            let tx = await bounty.releaseBounty(publicKeys);
            await tx.wait();

            tx = await bounty.connect(ethers.provider.getSigner(1))
                .claimBounty(a, b, c, Input);
            await tx.wait();

            expect(tx).to.emit(bounty, "BountyClaimed");
            // Check that the bounty hunter has been paid
            expect(await ethers.provider.getBalance(bountyHunter)).to.greaterThan(balance);
            expect(await bounty.completedStep()).to.equal(4);
        });

        it("Should reject claiming a claimed bounty", async function () {
            await expect(bounty.connect(ethers.provider.getSigner(1))
                .claimBounty(a, b, c, Input))
                .to.be.revertedWith("Bounty already claimed");
        });

        // TODO: add more tests for new features
    });
});
