pragma circom 2.0.0;

include "./utils/encrypt.circom";

template Main() {
    // public inputs
    signal input public_key[2];

    // private inputs
    signal input in[1000]; // zero-padded at the end
    signal input private_key;

    // outputs
    signal output hash;
    signal output shared_key;
    signal output out[1001];

    component hasher = hash1000();
    component enc = encrypt1000();

    enc.public_key[0] <== public_key[0];
    enc.public_key[1] <== public_key[1];
    enc.private_key <== private_key;

    for (var i = 0; i < 1000; i++) {
        hasher.in[i] <== in[i];
        enc.in[i] <== in[i];
    }

    hash <== hasher.out;
    shared_key <== enc.shared_key;

    for (var i = 0; i < 1001; i++) {
        out[i] <== enc.out[i];
    }
}

component main { public [ public_key ] } = Main();