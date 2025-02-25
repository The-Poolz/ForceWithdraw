// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "@poolzfinance/poolz-helper-v2/contracts/interfaces/ISimpleProvider.sol";
import "@poolzfinance/poolz-helper-v2/contracts/interfaces/ILockDealNFT.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract ForceWithdraw is Ownable {
    uint256 public immutable vaultId;

    ILockDealNFT public immutable lockDealNFT;

    ISimpleProvider public immutable dealProvider;

    constructor(
        ILockDealNFT _lockDealNFT,
        uint256 _vauldId,
        ISimpleProvider _dealProvider
    ) Ownable(msg.sender) {
        lockDealNFT = _lockDealNFT;
        dealProvider = _dealProvider;
        vaultId = _vauldId;
    }

    function forceWithdraw(address receiver) external onlyOwner {}
}
