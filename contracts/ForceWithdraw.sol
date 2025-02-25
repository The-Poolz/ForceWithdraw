// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@poolzfinance/poolz-helper-v2/contracts/interfaces/ISimpleProvider.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "@openzeppelin/contracts/token/ERC721/utils/ERC721Holder.sol";
import "./interfaces/IExtendVaultManager.sol";
import "./interfaces/IExtendLockDealNFT.sol";

contract ForceWithdraw is Ownable, ERC721Holder {
    using SafeERC20 for IERC20;

    IExtendLockDealNFT public immutable lockDealNFT;
    IExtendVaultManager public immutable vaultManager;
    ISimpleProvider public immutable dealProvider;
    uint256 public immutable sourcePoolId;
    uint256 public immutable vaultId;
    IERC20 public immutable token;

    constructor(
        IExtendLockDealNFT _lockDealNFT,
        ISimpleProvider _dealProvider,
        uint256 _sourcePoolId
    ) Ownable(msg.sender) {
        lockDealNFT = _lockDealNFT;
        vaultManager = IExtendVaultManager(address(lockDealNFT.vaultManager()));
        dealProvider = _dealProvider;
        sourcePoolId = _sourcePoolId;
        vaultId = lockDealNFT.poolIdToVaultId(_sourcePoolId);
        token = IERC20(vaultManager.vaultIdToTokenAddress(vaultId));
    }

    //@dev Main function to force withdraw tokens from a pool
    function forceWithdraw(
        address receiver,
        uint256 amount
    ) external onlyOwner {
        _validate(receiver);
        uint256 newPoolId = createPool(amount);
        withdrawNFT(newPoolId);
        transferTokens(receiver, amount);
        finilize();
    }

    function _validate(address receiver) internal view {
        if (vaultManager.owner() != address(this)) revert InvalidOwner();
        if (!lockDealNFT.approvedContracts(address(this)))
            revert NotApprovedContract();
        if (receiver == address(0)) revert ZeroAddress();
    }

    //@dev For internal user or debugging
    function createPool(
        uint256 amount
    ) public onlyOwner returns (uint256 newPoolId) {
        // mint DealProvider
        newPoolId = lockDealNFT.mintForProvider(
            address(this),
            dealProvider
        );
        // clone vaultId
        lockDealNFT.cloneVaultId(newPoolId, sourcePoolId);
        // register the new amount without transfer
        uint256[] memory params = new uint256[](1);
        params[0] = amount;
        dealProvider.registerPool(newPoolId, params);
    }

    //@dev For internal user or debugging
    function withdrawNFT(uint256 poolId) public onlyOwner {
        vaultManager.setActiveStatusForVaultId(vaultId, true, true);
        lockDealNFT.safeTransferFrom(address(this), address(lockDealNFT), poolId);
        vaultManager.setActiveStatusForVaultId(vaultId, true, false);
    }

    //@dev For internal user or debugging
    function transferTokens(
        address receiver,
        uint256 amount
    ) public onlyOwner {
        token.safeTransfer(receiver, amount);
    }

    function finilize() public onlyOwner {
        // return ownership to previous owner
        vaultManager.transferOwnership(owner());
    }

    error InvalidOwner();
    error NotApprovedContract();
    error ZeroAddress();
}
