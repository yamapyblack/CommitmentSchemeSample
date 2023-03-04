import { expect } from "chai";
import { ethers } from "hardhat";
import { SimplizedCommitmentScheme } from "../typechain-types/SimplizedCommitmentScheme";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { arrayify } from "ethers/lib/utils";

const encodeParameters = (types: string[], values: any[]): string => {
  const abi = new ethers.utils.AbiCoder();
  return ethers.utils.keccak256(abi.encode(types, values));
};
describe("SimplizedCommitmentScheme", function () {
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let bob: SignerWithAddress;
  let contract: SimplizedCommitmentScheme;

  before(async () => {
    // Contracts are deployed using the first signer/account by default
    [owner, alice, bob] = await ethers.getSigners();

    const SimplizedCommitmentScheme = await ethers.getContractFactory(
      "SimplizedCommitmentScheme"
    );
    contract = (await SimplizedCommitmentScheme.deploy(
      1
    )) as SimplizedCommitmentScheme;
  });

  describe("commit and reveal", function () {
    it("success", async function () {
      const blindingFactor1 = ethers.utils.formatBytes32String("hoge");
      const blindingFactor2 = ethers.utils.formatBytes32String("fuga");

      const commitment1 = await contract.getEncodePacked(
        alice.address,
        1,
        blindingFactor1
      );
      const commitment2 = await contract.getEncodePacked(
        bob.address,
        2,
        blindingFactor2
      );

      //commit
      await contract.connect(alice).commit(commitment1);
      await contract.connect(bob).commit(commitment2);
      //reveal
      await contract.connect(alice).reveal(1, blindingFactor1);
      await contract.connect(bob).reveal(2, blindingFactor2);
      //judgement
      await contract.judgement();
      expect(await contract.winner()).to.equal(1);
    });
  });
});
