pragma circom 2.0.0;

include "./model.circom";
include "./utils/cid.circom";
include "./utils/encrypt.circom";

template Main(n) {
    // private inputs
    signal input in[n][797*8];
    signal input conv2d_weights[3][3][1][4];
    signal input conv2d_bias[4];
    signal input batch_normalization_a[4];
    signal input batch_normalization_b[4];
    signal input conv2d_1_weights[3][3][4][16];
    signal input conv2d_1_bias[16];
    signal input batch_normalization_1_a[16];
    signal input batch_normalization_1_b[16];
    signal input dense_weights[16][10];
    signal input dense_bias[10];

    // outputs
    signal output out[n];
    signal output cids[n*2];
    signal output hash;

    // recurring components
    component pixel[n];
    component model[n];
    component cid[n];

    for (var i = 0; i < n; i++) {
        model[i] = Model();
        pixel[i] = getPixels();
        cid[i] = getCid();

        for (var i0 = 0; i0 < 797*8; i0++) {
            pixel[i].in[i0] <== in[i][i0];
            cid[i].in[i0] <== in[i][i0];
        }

        // get cid
        for (var i0 = 0; i0 < 2; i0++) {
            cids[i*2+i0] <== cid[i].out[i0];
        }

        for (var i0 = 0; i0 < 28; i0++) {
            for (var i1 = 0; i1 < 28; i1++) {
                for (var i2 = 0; i2 < 1; i2++) {
                    model[i].in[i0][i1][i2] <== pixel[i].out[i0][i1][i2];
        }}}

        for (var i0 = 0; i0 < 3; i0++) {
            for (var i1 = 0; i1 < 3; i1++) {
                for (var i2 = 0; i2 < 1; i2++) {
                    for (var i3 = 0; i3 < 4; i3++) {
                        model[i].conv2d_weights[i0][i1][i2][i3] <== conv2d_weights[i0][i1][i2][i3];
        }}}}
        for (var i0 = 0; i0 < 4; i0++) {
            model[i].conv2d_bias[i0] <== conv2d_bias[i0];
        }

        for (var i0 = 0; i0 < 4; i0++) {
            model[i].batch_normalization_a[i0] <== batch_normalization_a[i0];
        }
        for (var i0 = 0; i0 < 4; i0++) {
            model[i].batch_normalization_b[i0] <== batch_normalization_b[i0];
        }

        for (var i0 = 0; i0 < 3; i0++) {
            for (var i1 = 0; i1 < 3; i1++) {
                for (var i2 = 0; i2 < 4; i2++) {
                    for (var i3 = 0; i3 < 16; i3++) {
                        model[i].conv2d_1_weights[i0][i1][i2][i3] <== conv2d_1_weights[i0][i1][i2][i3];
        }}}}
        for (var i0 = 0; i0 < 16; i0++) {
            model[i].conv2d_1_bias[i0] <== conv2d_1_bias[i0];
        }

        for (var i0 = 0; i0 < 16; i0++) {
            model[i].batch_normalization_1_a[i0] <== batch_normalization_1_a[i0];
        }
        for (var i0 = 0; i0 < 16; i0++) {
            model[i].batch_normalization_1_b[i0] <== batch_normalization_1_b[i0];
        }

        for (var i0 = 0; i0 < 16; i0++) {
            for (var i1 = 0; i1 < 10; i1++) {
                model[i].dense_weights[i0][i1] <== dense_weights[i0][i1];
        }}
        for (var i0 = 0; i0 < 10; i0++) {
            model[i].dense_bias[i0] <== dense_bias[i0];
        }

        out[i] <== model[i].out[0];
    }

    // hash model weights

    component mimc = hash1000();
    var idx = 0;

    for (var i0 = 0; i0 < 3; i0++) {
        for (var i1 = 0; i1 < 3; i1++) {
            for (var i2 = 0; i2 < 1; i2++) {
                for (var i3 = 0; i3 < 4; i3++) {
                    mimc.in[idx] <== conv2d_weights[i0][i1][i2][i3];
                    idx++;
    }}}}

    for (var i0 = 0; i0 < 4; i0++) {
        mimc.in[idx] <== conv2d_bias[i0];
        idx++;
    }

    for (var i0 = 0; i0 < 4; i0++) {
            mimc.in[idx] <== batch_normalization_a[i0];
            idx++;
    }
    for (var i0 = 0; i0 < 4; i0++) {
        mimc.in[idx] <== batch_normalization_b[i0];
        idx++;
    }

    for (var i0 = 0; i0 < 3; i0++) {
        for (var i1 = 0; i1 < 3; i1++) {
            for (var i2 = 0; i2 < 4; i2++) {
                for (var i3 = 0; i3 < 16; i3++) {
                    mimc.in[idx] <== conv2d_1_weights[i0][i1][i2][i3];
                    idx++;
    }}}}
    for (var i0 = 0; i0 < 16; i0++) {
        mimc.in[idx] <== conv2d_1_bias[i0];
        idx++;
    }

    for (var i0 = 0; i0 < 16; i0++) {
        mimc.in[idx] <== batch_normalization_1_a[i0];
        idx++;
    }
    for (var i0 = 0; i0 < 16; i0++) {
        mimc.in[idx] <== batch_normalization_1_b[i0];
        idx++;
    }

    for (var i0 = 0; i0 < 16; i0++) {
        for (var i1 = 0; i1 < 10; i1++) {
            mimc.in[idx] <== dense_weights[i0][i1];
            idx++;
    }}
    for (var i0 = 0; i0 < 10; i0++) {
        mimc.in[idx] <== dense_bias[i0];
        idx++;
    }

    // padding
    for (var i = idx; i < 1000; i++) {
        mimc.in[i] <== 0;
    }

    hash <== mimc.out;
    log(hash);
}

component main = Main(10);