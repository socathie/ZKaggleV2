SETUP_MK="setup_2^21.key"
BIG_SETUP_MK="setup_2^23.key"

# compile circuit and calculate witness
snarkit2 check . --witness_type bin --backend wasm

# universal setup
plonkit setup --power 21 --srs_monomial_form $SETUP_MK --overwrite
plonkit setup --power 23 --srs_monomial_form $BIG_SETUP_MK --overwrite

# export verification key
plonkit export-verification-key -m $SETUP_MK -c circuit.r1cs -v vk.bin --overwrite

# generate each proof
for witness_dir in `ls data`
do
  WITNESS_DIR=data/$witness_dir
  plonkit prove -m $SETUP_MK -c circuit.r1cs -w $WITNESS_DIR/witness.wtns -p $WITNESS_DIR/proof.bin -j $WITNESS_DIR/proof.json -i $WITNESS_DIR/public.json -t rescue --overwrite
done

# collect old_proofs list
OLD_PROOF_LIST=old_proof_list.txt
rm -rf $OLD_PROOF_LIST
touch $OLD_PROOF_LIST
i=0
for witness_dir in `ls data`
do
  WITNESS_DIR=data/$witness_dir
  echo $WITNESS_DIR/proof.bin >> $OLD_PROOF_LIST
  let "i++"
done
cat $OLD_PROOF_LIST

# export recursive vk
time (plonkit export-recursive-verification-key -c $i -i 3 -m $BIG_SETUP_MK -v recursive_vk.bin --overwrite)

# generate recursive proof
time (plonkit recursive-prove -m $BIG_SETUP_MK -f $OLD_PROOF_LIST -v vk.bin -n recursive_proof.bin -j recursive_proof.json --overwrite)

# verify recursive proof
time (plonkit recursive-verify -p recursive_proof.bin -v recursive_vk.bin)

# check aggregation
plonkit check-aggregation -o $OLD_PROOF_LIST -v vk.bin -n recursive_proof.bin

# generate recursive verifier smart contract
plonkit generate-recursive-verifier -o vk.bin -n recursive_vk.bin -i 3 -s verifier.sol --overwrite

# verify via smart contract
cp recursive_proof.json ../test/data/proof.json
cp verifier.sol ../contracts/verifier.sol
cd ..
npm run test -- test/recursive.test.js