const { expect } = require("chai");
const { ethers } = require("hardhat");

const fs = require("fs");
const base32 = require("base32.js");

const labels = require("../assets/labels.json");

// read ../assets/cid.txt into an array of strings
const cids = fs.readFileSync("assets/cid.txt").toString().split("\r");

const idx = 567;

const _labels = [];

describe("BountyFactory test", function () {
    let factory;
    let Bounty;
    const cidraw = []; // raw CIDs of the uploaded files

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

        const BountyFactory = await ethers.getContractFactory("BountyFactory");
        factory = await BountyFactory.deploy(encryptionVerifier.address);
        await factory.deployed();

        Bounty = await ethers.getContractFactory("Bounty");

        for (let i = 0; i < 10; i++) {
            const decoder = new base32.Decoder();
            cidraw.push(decoder.write(cids[idx + i].slice(1)).finalize());
            _labels.push(labels[idx + i]);
        }
    });

    it("Should create a new bounty", async function () {
        const tx = await factory.createBounty(
            "Bounty 1",
            "This is the first bounty",
            cidraw,
            _labels,
            70,
            { value: ethers.utils.parseEther("1") }
        );
        await tx.wait();

        const bounty = await Bounty.attach(await factory.bounties(0));

        expect(await bounty.owner()).to.equal(await ethers.provider.getSigner(0).getAddress());
        expect(await ethers.provider.getBalance(bounty.address)).to.equal(ethers.utils.parseEther("1"));
        
        expect(await bounty.name()).to.equal("Bounty 1");
        expect(await bounty.description()).to.equal("This is the first bounty");
        expect(await factory.bountyCount()).to.equal(1);

        // TODO: add more checks
    });

    it("Should calculate future bounty address", async function () {
        const nonce = await ethers.provider.getTransactionCount(factory.address);
        const futureAddress = ethers.utils.getContractAddress({ from: factory.address, nonce: nonce });

        await expect(factory.createBounty(
            "Bounty 2",
            "This is the second bounty",
            cidraw,
            _labels,
            70,
            { value: ethers.utils.parseEther("1") }
        )).to.emit(factory, "BountyCreated").withArgs(futureAddress);
        expect(await factory.bountyCount()).to.equal(2);
    });
});