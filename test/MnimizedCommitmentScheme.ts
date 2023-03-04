import { expect } from "chai";
import { ethers } from "hardhat";
import { MnimizedCommitmentScheme } from "../typechain-types/MnimizedCommitmentScheme";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
import { arrayify } from "ethers/lib/utils";

const encodeParameters = (types: string[], values: any[]): string => {
  const abi = new ethers.utils.AbiCoder();
  return ethers.utils.keccak256(abi.encode(types, values));
};
describe("MnimizedCommitmentScheme", function () {
  let owner: SignerWithAddress;
  let alice: SignerWithAddress;
  let contract: MnimizedCommitmentScheme;

  before(async () => {
    // Contracts are deployed using the first signer/account by default
    [owner, alice] = await ethers.getSigners();

    const MnimizedCommitmentScheme = await ethers.getContractFactory(
      "MnimizedCommitmentScheme"
    );
    contract =
      (await MnimizedCommitmentScheme.deploy()) as MnimizedCommitmentScheme;
  });

  describe("commit and reveal", function () {
    it("success", async function () {
      const blindingFactor = ethers.utils.formatBytes32String("hoge");

      // ethersjsのencodeでaddress をencodeするとなぜかエラーがでてしまった。
      // const commitment = encodeParameters(
      //   ["address", "uint256", "bytes32"],
      //   [owner.address, 1, blindingFactor]
      // );

      const commitment = await contract.getEncodePacked(
        alice.address,
        1,
        blindingFactor
      );

      //commit
      await contract.connect(alice).commit(commitment);
      //reveal
      await contract.connect(alice).reveal(1, blindingFactor);
    });
  });
  it("fail choice mistook", async function () {
    const blindingFactor = ethers.utils.formatBytes32String("hoge");

    const commitment = await contract.getEncodePacked(
      alice.address,
      1,
      blindingFactor
    );

    //commit
    await contract.connect(alice).commit(commitment);
    //reveal
    await expect(contract.connect(alice).reveal(2, blindingFactor)).to.be
      .reverted;
  });
  it("fail address mistook", async function () {
    const blindingFactor = ethers.utils.formatBytes32String("hoge");

    const commitment = await contract.getEncodePacked(
      alice.address,
      1,
      blindingFactor
    );

    //commit
    await contract.connect(alice).commit(commitment);
    //reveal
    await expect(contract.connect(owner).reveal(1, blindingFactor)).to.be
      .reverted;
  });
  it("fail address mistook", async function () {
    const blindingFactor = ethers.utils.formatBytes32String("hoge");

    const commitment = await contract.getEncodePacked(
      alice.address,
      1,
      blindingFactor
    );

    //commit
    await contract.connect(alice).commit(commitment);
    //reveal
    await expect(
      contract
        .connect(alice)
        .reveal(1, ethers.utils.formatBytes32String("fuga"))
    ).to.be.reverted;
  });
});
