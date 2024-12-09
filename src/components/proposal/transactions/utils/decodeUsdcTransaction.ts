import { Address, decodeFunctionData } from 'viem';
import USDC_ABI from './USDC_abi';

export const decodeUsdcTransaction = (calldata: Address) => {
    try {
        // Find the "transfer" function in the USDC_ABI
        const transferFunction = USDC_ABI.find((item) => item.name === 'transfer' && item.type === 'function');
        if (!transferFunction) {
            throw new Error('Transfer function not found in the ABI');
        }

        // Decode the calldata using the ABI function definition
        const { args } = decodeFunctionData({
            abi: [transferFunction],
            data: calldata,
        });

        const [to, value] = args as [Address, bigint];

        return { to, value };
    } catch (error) {
        console.error('Error decoding USDC transaction:', error);
        return null;
    }
};
