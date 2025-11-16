import { baseSepolia } from 'viem/chains';
import { Address } from 'viem';

export const MONKERIA_CONTRACT: Address =
  '0xYourDeployedContractAddressHere'; // 🧠 Replace with actual testnet address

export const MONKERIA_ABI = [
  {
    inputs: [
      { internalType: 'string', name: '_tokenURI', type: 'string' },
      { internalType: 'uint256', name: 'quantity', type: 'uint256' },
    ],
    name: 'mint',
    outputs: [],
    stateMutability: 'payable',
    type: 'function',
  },
  {
    inputs: [{ internalType: 'address', name: 'user', type: 'address' }],
    name: 'getMintPrice',
    outputs: [{ internalType: 'uint256', name: '', type: 'uint256' }],
    stateMutability: 'view',
    type: 'function',
  },
];

export const MONKERIA_CHAIN = baseSepolia;
