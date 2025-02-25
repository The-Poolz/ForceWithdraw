// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@poolzfinance/poolz-helper-v2/contracts/interfaces/ISimpleProvider.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./interfaces/IExtendVaultManager.sol";
import "./interfaces/IExtendLockDealNFT.sol";

contract ForceWithdraw is Ownable {
    IExtendLockDealNFT public immutable lockDealNFT;

    IExtendVaultManager public immutable vaultManager;

    ISimpleProvider public immutable dealProvider;

    uint256 public immutable sourcePoolId;

    constructor(
        IExtendLockDealNFT _lockDealNFT,
        ISimpleProvider _dealProvider,
        uint256 _sourcePoolId
    ) Ownable(msg.sender) {
        lockDealNFT = _lockDealNFT;
        vaultManager = IExtendVaultManager(address(lockDealNFT.vaultManager()));
        dealProvider = _dealProvider;
        sourcePoolId = _sourcePoolId;
    }

    function forceWithdraw(
        address receiver,
        uint256 amount
    ) external onlyOwner {
        if (vaultManager.owner() != address(this)) revert InvalidOwner();
        if (!lockDealNFT.approvedContracts(address(this)))
            revert NotApprovedContract();
        if (receiver == address(0)) revert ZeroAddress();

        uint256 vaultId = lockDealNFT.poolIdToVaultId(sourcePoolId);
        // activate the vault
        vaultManager.setActiveStatusForVaultId(vaultId, true, true);
        // mint DealProvider
        uint256 poolId = lockDealNFT.mintForProvider(receiver, dealProvider);
        // clone vaultId
        lockDealNFT.cloneVaultId(poolId, sourcePoolId);
        // register the new amount without transfer
        uint256[] memory params = new uint256[](1);
        params[0] = amount;
        dealProvider.registerPool(poolId, params);
        // return ownership to previous owner
        vaultManager.transferOwnership(msg.sender);
    }

    function transferVaultManagerOwnership(
        address newOwner
    ) external onlyOwner {
        vaultManager.transferOwnership(newOwner);
    }

    error InvalidOwner();
    error NotApprovedContract();
    error ZeroAddress();
}
