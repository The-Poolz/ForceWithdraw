import { ethers } from "hardhat"
import { LockDealNFT, ForceWithdraw } from "../typechain-types"

async function main() {
    const lockDealNFT = process.env.LOCK_DEAL_NFT
    const dealProvider = process.env.DEAL_PROVIDER
    const sourcePoolId = process.env.SOURCE_POOL_ID
    const receiver = process.env.RECEIVER
    const amount = 4179210766773100000000000n

    if (!lockDealNFT || !dealProvider || !sourcePoolId || !receiver) {
        throw new Error("Please provide LOCK_DEAL_NFT, DEAL_PROVIDER, SOURCE_POOL_ID and RECEIVER env variables")
    }

    // get LockDealNFT contract
    const LockDealNFT = await ethers.getContractFactory("LockDealNFT")
    const lockDealNFTContract: LockDealNFT = LockDealNFT.attach(lockDealNFT) as LockDealNFT

    // deploy forceWithdraw
    const ForceWithdraw = await ethers.getContractFactory("ForceWithdraw")
    const forceWithdraw = await ForceWithdraw.deploy(lockDealNFT, dealProvider, sourcePoolId)
    console.log("ForceWithdraw deployed to:", await forceWithdraw.getAddress())

    // approve forceWithdraw from LockDealNFT
    await lockDealNFTContract.setApprovedContract(await forceWithdraw.getAddress(), true)

    // transfer vault manager ownership to forceWithdraw
    const vaultManagerAddress = await lockDealNFTContract.vaultManager()
    const VaultManager = await ethers.getContractFactory("ForceWithdraw")
    const vaultManager = VaultManager.attach(vaultManagerAddress) as ForceWithdraw

    await vaultManager.transferOwnership(await forceWithdraw.getAddress())

    // force withdraw
    await forceWithdraw.forceWithdraw(receiver, amount)
    console.log("Force withdraw done!")
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
