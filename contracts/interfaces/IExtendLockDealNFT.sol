// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@poolzfinance/poolz-helper-v2/contracts/interfaces/ILockDealNFT.sol";
import "@poolzfinance/poolz-helper-v2/contracts/interfaces/IVaultManager.sol";

interface IExtendLockDealNFT is ILockDealNFT {
    function vaultManager() external view returns (IVaultManager);

    function poolIdToVaultId(uint256 poolId) external view returns (uint256);
}
