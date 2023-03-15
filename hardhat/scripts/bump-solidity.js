const fs = require("fs");
const solidityRegex = /pragma solidity \^\d+\.\d+\.\d+/
const inputRegex = /uint\[\d+\] memory input(?!;)/
const contentRegex = /proof\.C = Pairing\.G1Point\(c\[0\], c\[1\]\);([\s\S]*?)if \(verify\(inputValues, proof\) == 0\)/
const verifierRegex = /contract Verifier/

let content = fs.readFileSync("./contracts/circuitVerifier.sol", { encoding: 'utf-8' });
let bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.17');
bumped = bumped.replace(inputRegex, 'uint[] memory input');
bumped = bumped.replace(contentRegex, 'proof.C = Pairing.G1Point(c[0], c[1]);\n\n        if (verify(input, proof) == 0)');
let renamed = bumped.replace(verifierRegex, 'contract CircuitVerifier');

fs.writeFileSync("./contracts/circuitVerifier.sol", renamed);

content = fs.readFileSync("./contracts/encryptionVerifier.sol", { encoding: 'utf-8' });
bumped = content.replace(solidityRegex, 'pragma solidity ^0.8.17');
// bumped = bumped.replace(inputRegex, 'uint[] memory input');
// bumped = bumped.replace(contentRegex, 'proof.C = Pairing.G1Point(c[0], c[1]);\n\n        if (verify(input, proof) == 0)');
renamed = bumped.replace(verifierRegex, 'contract EncryptionVerifier');

fs.writeFileSync("./contracts/encryptionVerifier.sol", renamed);
