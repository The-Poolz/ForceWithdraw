import { VaultManager, DealProvider, LockDealNFT, ForceWithdraw } from "../typechain-types"
import { expect } from "chai"
import { ethers } from "hardhat"
import { SignerWithAddress } from "@nomicfoundation/hardhat-ethers/signers"
import { ERC20Token } from "../typechain-types/contracts/mocks/ERC20Token"

describe("ForceWithdraw tests", function () {
    let token: ERC20Token
    let USDT: ERC20Token
    let sourcePoolId: bigint
    let vaultManager: VaultManager
    let owner: SignerWithAddress
    let receiver: SignerWithAddress
    let user: SignerWithAddress
    let lockDealNFT: LockDealNFT
    let dealProvider: DealProvider
    let forceWithdraw: ForceWithdraw
    const vaultAmount = 4179210766773100000000000n
    let vaultId: bigint

    before(async () => {
        [owner, receiver, user] = await ethers.getSigners()
        const Token = await ethers.getContractFactory("ERC20Token")
        token = await Token.deploy("TEST", "test")
        USDT = await Token.deploy("USDT", "USDT")
        vaultManager = await (await ethers.getContractFactory("VaultManager")).deploy()
        const LockDealNFTFactory = await ethers.getContractFactory("LockDealNFT")
        lockDealNFT = (await LockDealNFTFactory.deploy(await vaultManager.getAddress(), "")) as LockDealNFT
        const DealProviderFactory = await ethers.getContractFactory("DealProvider")
        dealProvider = (await DealProviderFactory.deploy(await lockDealNFT.getAddress())) as DealProvider

        // set trustee
        await vaultManager.setTrustee(await lockDealNFT.getAddress())

        // approve deal provider
        await lockDealNFT.setApprovedContract(await dealProvider.getAddress(), true)

        // create new vault
        await vaultManager["createNewVault(address)"](await token.getAddress())

        const poolAmount = vaultAmount / 10n
        await token.approve(await vaultManager.getAddress(), vaultAmount)
        // create 10 pools for user.
        for (let i = 0; i < 10; i++) {
            const nonce = await vaultManager.nonces(await owner.getAddress())
            const packedData = ethers.solidityPackedKeccak256(
                ["address", "uint256", "uint256"],
                [await token.getAddress(), poolAmount, nonce]
            )
            const tokenSignature = await owner.signMessage(ethers.getBytes(packedData))
            sourcePoolId = await lockDealNFT.totalSupply()
            await dealProvider.createNewPool(
                [await user.getAddress(), await token.getAddress()],
                [poolAmount],
                tokenSignature
            )
        }
        const ForceWithdrawFactory = await ethers.getContractFactory("ForceWithdraw")
        forceWithdraw = (await ForceWithdrawFactory.deploy(
            await lockDealNFT.getAddress(),
            await dealProvider.getAddress(),
            sourcePoolId
        )) as ForceWithdraw
        // approve force withdraw
        await lockDealNFT.setApprovedContract(await forceWithdraw.getAddress(), true)
        // transfer vault manager ownership to force withdraw
        vaultId = (await vaultManager.totalVaults()) - 1n
        // close withdraw in vault manager
        await vaultManager.setActiveStatusForVaultId(vaultId, true, false)
        await vaultManager.transferOwnership(await forceWithdraw.getAddress())
    })

    it("should force withdraw", async () => {
        await forceWithdraw.forceWithdraw(await receiver.getAddress(), vaultAmount)
        expect(await token.balanceOf(await receiver.getAddress())).to.equal(vaultAmount)
    })

    it("should return false withdraw status", async () => {
        const withdrawStatus = await vaultManager.isWithdrawalActiveForVaultId(vaultId)
        expect(withdrawStatus).to.equal(false)
    })
})
