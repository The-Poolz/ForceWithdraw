# ForceWithdraw

[![Build and Test](https://github.com/The-Poolz/ForceWithdraw/actions/workflows/node.js.yml/badge.svg)](https://github.com/The-Poolz/ForceWithdraw/actions/workflows/node.js.yml)
[![codecov](https://codecov.io/gh/The-Poolz/ForceWithdraw/graph/badge.svg)](https://codecov.io/gh/The-Poolz/ForceWithdraw)
[![CodeFactor](https://www.codefactor.io/repository/github/the-poolz/ForceWithdraw/badge)](https://www.codefactor.io/repository/github/the-poolz/ForceWithdraw)
[![License](https://img.shields.io/badge/License-MIT-blue.svg)](https://github.com/The-Poolz/ForceWithdraw/blob/master/LICENSE)

**The ForceWithdraw** contract provides an emergency mechanism for forcibly withdrawing tokens from a `locked deal pool`. The contract allows the **owner** to create a new pool, withdraw an **NFT** representing the locked assets, and transfer the associated tokens to a designated receiver.

### Navigation

-   [Installation](#installation)
-   [Use Case](#use-case)
-   [Features](#features)
-   [Main Functions](#main-functions)
-   [License](#license)

## Installation

**Install the packages:**

```console
npm i
```

**Compile contracts:**

```console
npx hardhat compile
```

**Run tests:**

```console
npx hardhat test
```

**Run coverage:**

```console
npx hardhat coverage
```

**Deploy:**

```console
npx truffle dashboard
```

```console
npx hardhat run ./scripts/deploy.ts --network truffleDashboard
```

## Use Case

If NFT tokens are not closed at the correct time, the **ForceWithdraw** contract can be used to resolve the issue. This is especially relevant for the Veritas project, where adjustments were required to align with the updated **Token Generation Event (TGE)** timeline.

For more detailed information on the **Veritas** project and this use case, refer to the [Veritas project document](https://docs.google.com/document/d/1HeGXlsrOBG9JfZuRAEm58Z2uJPc1d_p3X1uJZwARIFU/edit?tab=t.0).

## Features

-   **Force Withdrawal:** Allows the contract owner to forcibly withdraw tokens from a locked deal pool.
-   **NFT Interaction:** Manages NFT-based deal locks by transferring and modifying their status.
-   **Token Transfer:** Ensures secure token transfers using OpenZeppelin's `SafeERC20`.
-   **Ownership Control:** Returns vault ownership back to the original owner after execution.

## Contract Dependencies

-   [OpenZeppelin Contracts](https://github.com/OpenZeppelin/openzeppelin-contracts)
    -   `Ownable.sol`: Provides ownership control mechanisms.
    -   `SafeERC20.sol`: Ensures secure token transfers.
    -   `ERC721Holder.sol`: Enables handling of ERC721 tokens.
-   [Poolz Finance](https://github.com/The-Poolz)
    -   `ISimpleProvider.sol`: Interface for dealing with Poolz's provider contracts.
    -   `IExtendLockDealNFT.sol`: Manages locked deal NFTs.
    -   `IExtendVaultManager.sol`: Handles vault-related operations.

## Constructor

```solidity
constructor(
    IExtendLockDealNFT _lockDealNFT,
    ISimpleProvider _dealProvider,
    uint256 _sourcePoolId
)
```

### Parameters:

-   `_lockDealNFT`: Address of the LockDealNFT contract.
-   `_dealProvider`: Address of the deal provider.
-   `_sourcePoolId`: ID of the source pool from which token data will be cloned.

### Initializes:

-   `lockDealNFT`: Reference to the LockDealNFT contract.
-   `vaultManager`: Extracts vault manager from `lockDealNFT`.
-   `dealProvider`: Stores the provider contract instance.
-   `sourcePoolId`: Stores the pool ID being withdrawn from.
-   `vaultId`: Retrieves the vault ID linked to the pool.
-   `token`: Fetches the ERC20 token linked to the vault.

## Main Functions

### `forceWithdraw(address receiver, uint256 amount) external onlyOwner`

Executes the force withdrawal process by:

1. Validating the receiver and contract permissions.
2. Creating a new pool with the specified amount.
3. Withdrawing the NFT from the vault.
4. Transferring the tokens to the receiver.
5. Finalizing the process by restoring ownership.

### `createPool(uint256 amount) public onlyOwner returns (uint256 newPoolId)`

-   Creates a new deal pool for forced withdrawal.
-   Clones the vault ID from the original pool.
-   Registers the new amount in the deal provider.

### `withdrawNFT(uint256 poolId) public onlyOwner`

-   Activates the vault for the forced withdrawal process.
-   Transfers the NFT to the `lockDealNFT` contract.
-   Deactivates the vault status after withdrawal.

### `transferTokens(address receiver, uint256 amount) public onlyOwner`

-   Transfers the specified token amount to the receiver.

### `finilize() public onlyOwner`

-   Transfers ownership of the vault manager back to the original owner.

## Errors

-   `InvalidOwner()`: Thrown if the contract is not the vault manager's owner.
-   `NotApprovedContract()`: Thrown if the contract is not an approved operator.
-   `ZeroAddress()`: Thrown if an invalid zero address is provided as a receiver.

## Security Considerations

-   Only the contract owner can invoke force withdrawals.
-   Utilizes OpenZeppelin's `SafeERC20` to prevent unsafe token transfers.
-   Ensures only pre-approved contracts can interact with `lockDealNFT`.

## License

[The-Poolz](https://poolz.finance/) Contracts is released under the [MIT License](https://github.com/The-Poolz/ForceWithdraw/blob/master/LICENSE).
