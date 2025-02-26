import { ethers } from "hardhat"
import { LockDealNFT, ForceWithdraw, VaultManager, DealProvider } from "../typechain-types"

async function main() {
    const [owner] = await ethers.getSigners()
    const lockDealNFTAddress = ""
    const dealProviderAddress = ""
    const user = "" // receiver address
    const vaultAmount = 4179210766773100000000000n

    // get LockDealNFT contract
    const LockDealNFT = await ethers.getContractFactory("LockDealNFT")
    const lockDealNFTContract: LockDealNFT = LockDealNFT.attach(lockDealNFTAddress) as LockDealNFT

    // transfer vault manager ownership to forceWithdraw
    const vaultManagerAddress = await lockDealNFTContract.vaultManager()
    const VaultManager = await ethers.getContractFactory("VaultManager")
    const vaultManager = VaultManager.attach(vaultManagerAddress) as VaultManager
    const poolAmount = vaultAmount / 2n
    const Token = await ethers.getContractFactory("ERC20Token")
    const token = await Token.deploy("TEST", "test")
    // create new vault
    let tx = await vaultManager["createNewVault(address)"](await token.getAddress())
    await tx.wait()
    const DealProvider = await ethers.getContractFactory("DealProvider")
    const dealProvider = DealProvider.attach(dealProviderAddress) as DealProvider

    tx = await token.approve(await vaultManager.getAddress(), vaultAmount)
    await tx.wait()
    // create 2 pools for user.
    for (let i = 0; i < 2; i++) {
        const nonce = await vaultManager.nonces(await owner.getAddress())
        const packedData = ethers.solidityPackedKeccak256(
            ["address", "uint256", "uint256"],
            [await token.getAddress(), poolAmount, nonce]
        )
        const tokenSignature = await owner.signMessage(ethers.getBytes(packedData))
        tx = await dealProvider.createNewPool(
            [user, await token.getAddress()],
            [poolAmount],
            tokenSignature,
            {
                gasLimit: 1129494,
                gasPrice: ethers.parseUnits("5", "gwei"),
            }
        )
        await tx.wait()
    }
    const sourcePoolId = (await lockDealNFTContract.totalSupply()) - 1n

    // deploy forceWithdraw
    const ForceWithdraw = await ethers.getContractFactory("ForceWithdraw")
    const forceWithdraw = await ForceWithdraw.deploy(lockDealNFTAddress, dealProviderAddress, sourcePoolId)
    console.log("ForceWithdraw deployed to:", await forceWithdraw.getAddress())
    const vaultId = (await vaultManager.totalVaults()) - 1n

    // approve forceWithdraw from LockDealNFT
    tx = await lockDealNFTContract.setApprovedContract(await forceWithdraw.getAddress(), true)
    await tx.wait()
    console.log("Approved ForceWithdraw from LockDealNFT")
    tx = await vaultManager.setActiveStatusForVaultId(vaultId, true, false)
    console.log("Vault active status set to false")
    await tx.wait()
    console.log("Approved ForceWithdraw from LockDealNFT")
    tx = await vaultManager.transferOwnership(await forceWithdraw.getAddress())
    await tx.wait()
    console.log("VaultManager ownership transferred to ForceWithdraw")
    // force withdraw
    await forceWithdraw.forceWithdraw("", poolAmount)
    console.log("Force withdraw done!")
}

main().catch((error) => {
    console.error(error)
    process.exitCode = 1
})
