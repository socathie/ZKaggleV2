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
        const EncyrptionVerifier = await ethers.getContractFactory("EncryptionVerifier");
        const encryptionVerifier = await EncyrptionVerifier.deploy();
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