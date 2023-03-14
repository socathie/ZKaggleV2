require("dotenv").config();
const lighthouse = require('@lighthouse-web3/sdk');
const fs = require('fs');

const apiKey = process.env.API_KEY;

async function main() {
    const hashes = [];

    for (let i = 0; i < 1000; i++) {
        const path = "assets/" + i + ".pgm"; //Give path to the file
        const response = await lighthouse.uploadFileRaw(path, apiKey);
        console.log(response.data.Hash);
        hashes.push(response.data.Hash);
        if (i == 0) {
            console.assert(response.data.Hash == "bafkreig42jyiawthjkmskza765hn6krgqs7uk7cmtjmggb6mgnjql7dqje");
        }
        console.assert(response.data.Size == "797");
    }

    fs.writeFileSync("assets/cid.txt", hashes.join("\r"));
}

main().then(() => process.exit(0)).catch(error => {
    console.error(error);
    process.exit(1);
});