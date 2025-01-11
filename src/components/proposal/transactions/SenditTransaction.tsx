import { HStack, Text, Image, Code } from '@chakra-ui/react';
import { FormattedAddress } from '@/components/utils/ethereum';
import TransactionWrapper from './TransactionWrapper';

interface SenditTransactionProps {
    index: number;
    to: string;
    value: string;
}

const SenditTransaction: React.FC<SenditTransactionProps> = ({ index, to, value }) => {
    return (
        <TransactionWrapper
            index={index}
            title='Sendit Token Transfer'
            logoSrc='https://sendit.city/assets/images/image03.jpg?v=389a8e2f'
            logoAlt='SENDIT'
        >
            <HStack gap={2} align='center'>
                <Text>
                    This transaction sends
                </Text>
                <Code size={'sm'} variant={'surface'}>
                    {value}
                    <Image
                        src='https://sendit.city/assets/images/image03.jpg?v=389a8e2f'
                        alt='SENDIT'
                        boxSize='20px'
                        ml={2}
                        borderRadius={100}
                    />
                </Code>
                <Text>tokens from Gnars Treasury to</Text>
                <FormattedAddress address={to} />
            </HStack>
        </TransactionWrapper>
    );
};

export default SenditTransaction;
