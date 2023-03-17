// SPDX-License-Identifier: GPL-3.0

pragma solidity ^0.8.17;

interface IEncryptionVerifier {
    function verifyProof(
        uint[2] memory a,
        uint[2][2] memory b,
        uint[2] memory c,
        uint[1005] memory input
    ) external view returns (bool);
}