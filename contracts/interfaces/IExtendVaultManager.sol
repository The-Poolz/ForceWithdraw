// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@poolzfinance/poolz-helper-v2/contracts/interfaces/IVaultManager.sol";

interface IExtendVaultManager is IVaultManager {
    function transferOwnership(address newOwner) external;
    
    function owner() external view returns (address);

    function setActiveStatusForVaultId(
        uint vaultId,
        bool depositStatus,
        bool withdrawStatus
    ) external;
}
