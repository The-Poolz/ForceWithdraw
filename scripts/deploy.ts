import { ethers } from "hardhat"
import { ForceWithdraw, LockDealNFT, VaultManager } from "../typechain-types"

async function main() {
    const lockDealNFT = process.env.LOCK_DEAL_NFT
    const forceWithdrawAddress = process.env.FORCE_WITHDREW
    const receiver = process.env.RECEIVER
    const amount = 4179210766773100000000000n

    if (!lockDealNFT || !forceWithdrawAddress || !receiver) {
        throw new Error("Please provide LOCK_DEAL_NFT, forceWithdrawAddress and RECEIVER env variables")
    }

    // get LockDealNFT contract
    const LockDealNFT = await ethers.getContractFactory("LockDealNFT")
    const lockDealNFTContract: LockDealNFT = LockDealNFT.attach(lockDealNFT) as LockDealNFT

    const ForceWithdraw = await ethers.getContractFactory("LockDealNFT")
    const forceWithdraw: ForceWithdraw = ForceWithdraw.attach(forceWithdrawAddress) as ForceWithdraw

    // approve forceWithdraw from LockDealNFT
    let tx = await lockDealNFTContract.setApprovedContract(await forceWithdraw.getAddress(), true)
    await tx.wait()

    // transfer vault manager ownership to forceWithdraw
    const vaultManagerAddress = await lockDealNFTContract.vaultManager()
    const VaultManager = await ethers.getContractFactory("VaultManager")
    const vaultManager = VaultManager.attach(vaultManagerAddress) as VaultManager

    tx = await vaultManager.transferOwnership(await forceWithdraw.getAddress())
    await tx.wait()
    // force withdraw
    tx = await forceWithdraw.forceWithdraw(receiver, amount)
    await tx.wait()
    console.log("Force withdraw done!")

    // remove forceWithdraw from LockDealNFT
    tx = await lockDealNFTContract.setApprovedContract(await forceWithdraw.getAddress(), false)
    await tx.wait()
    console.log("jobs-done")
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
