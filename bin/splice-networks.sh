#!/bin/bash
cd src/contracts/prebuilt_contracts;
mkdir spliced;
for filename in $(cat wallet_contracts.txt); do
  jq "{abi: .abi, bytecode: .bytecode, contractName: .contractName, networks: (.networks + $(jq .networks ${PATH_TO_WALLET_CONTRACTS}/${filename})) }" ${filename} > spliced/${filename};
done;
mv spliced/* .;
rm -rf spliced;