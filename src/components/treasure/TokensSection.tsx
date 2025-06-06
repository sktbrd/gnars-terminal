import React from 'react';
import {
  Box,
  Button,
  Heading,
  HStack,
  Image,
  Table,
  Text,
} from '@chakra-ui/react';
import styles from './TreasurePage.module.css';
import { formatBalance } from '@/utils/helpers';
import Link from 'next/link';

interface Token {
  token: {
    address: string;
    symbol: string;
    price: string; // Change from number to string
    balance: number;
    balanceUSD: number;
  };
}

interface TokensSectionProps {
  tokens: Token[];
  totalBalance: number;
  hideLowBalance: boolean;
  setHideLowBalance: React.Dispatch<React.SetStateAction<boolean>>;
}

const getTokenLogo = (symbol: string): string => {
  switch (symbol) {
    case 'Sendit':
      return '/images/sendit.jpg';
    case 'USDC':
      return '/images/usdc.png';
    case 'ETH':
      return '/images/ethereum.png';
    case 'WETH':
      return '/images/weth.png';
    case 'SPACE':
      return '/images/space.png';
    default:
      return '/images/loading.gif';
  }
};

const TokensSection: React.FC<TokensSectionProps> = ({
  tokens,
  totalBalance,
  hideLowBalance,
  setHideLowBalance,
}) => {
  return (
    <Box className={styles.wallet}>
      <Box className={styles.walletHeader}>
        <Heading as='h2' size='lg'>
          Wallet
        </Heading>
        <Button onClick={() => setHideLowBalance(!hideLowBalance)}>
          {hideLowBalance ? 'Show All Tokens' : 'Hide Low Balance Tokens'}
        </Button>
      </Box>
      <Table.Root className={styles.tokenTable}>
        <Table.Header className={styles.tokenTable}>
          <Table.Row className={styles.tokenTable}>
            <Table.ColumnHeader></Table.ColumnHeader>
            <Table.ColumnHeader className={styles.hideOnMobile}>
              Price
            </Table.ColumnHeader>
            <Table.ColumnHeader>Balance</Table.ColumnHeader>
            <Table.ColumnHeader>Balance USD</Table.ColumnHeader>
          </Table.Row>
        </Table.Header>
        <Table.Body className={styles.tokenTable}>
          {tokens.map((token) => (
            <Table.Row key={token.token.address} className={styles.tokenRow}>
              <Table.Cell>
                <HStack>
                  <Image
                    borderRadius={'100%'}
                    boxSize={12}
                    src={getTokenLogo(token.token.symbol)}
                    alt={`${token.token.symbol} logo`}
                    className={styles.tokenLogo}
                  />
                  <Link
                    href={`https://nounspace.com/t/base/${token.token.address}`}
                    target='_blank'
                    rel='noopener noreferrer'
                  >
                    {token.token.symbol}
                  </Link>
                </HStack>
              </Table.Cell>
              <Table.Cell className={styles.hideOnMobile}>
                ${parseFloat(token.token.price).toFixed(4)}
              </Table.Cell>
              <Table.Cell>{formatBalance(token.token.balance)}</Table.Cell>
              <Table.Cell>${formatBalance(token.token.balanceUSD)}</Table.Cell>
            </Table.Row>
          ))}
        </Table.Body>
      </Table.Root>
    </Box>
  );
};

export default TokensSection;
