# ZKaggleV2

If you ever wonder why this is `V2`, check out [ZKaggle](https://github.com/z-kaggle/ZKaggle).

Make sure to visit this [blogpost](https://hackmd.io/@cathie/zkml) for more information on the background and rationale, development process, technology highlights, and future work.

## Setup

Make sure to run this command if you want to use the `keras2circom` submodule:
```bash
git submodule update --init --recursive
```

Full setup:
```bash
cd keras2circom
python main.py models/best_practice.h5 -o ../hardhat/circuits/ # you may need to manually rename your output files, and delete the last line of the circom file
```

## Usage

The contracts are currently too large to be deployed on any testnet. You can run the application locally, but you will need to run a local node.

```shell
cd hardhat
npm install
npx hardhat node
```

In a new terminal, run the following commands:

```shell
cd frontend
npm install
npm run build
npm run preview
```