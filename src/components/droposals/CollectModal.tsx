import { useMemo, useState } from 'react';
import { Button } from "@/components/ui/button";
import {
    DialogBody,
    DialogCloseTrigger,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogRoot,
} from "@/components/ui/dialog";
import { Box, Flex, Text, VStack, Image, DialogFooter, Heading, Textarea, Input } from '@chakra-ui/react';
import { ReactFlow, Background, Controls, Node, Edge, Handle, Position } from 'reactflow';
import CustomVideoPlayer from './CustomVideoPlayer';
import { FormattedAddress } from '../utils/names';
import { useAccount } from 'wagmi';
import 'reactflow/dist/style.css'; // Import the required CSS

// TODO: Learn how to query the NFT contract from the proposal data, 
// there is no NFT contract address at the moment of the proposal transaction creation, so we need to seek a relationship between the proposal and the NFT contract that was created after
const droposalContractDictionary: { [key: number]: string } = {
    0: '0x58c3ccb2dcb9384e5ab9111cd1a5dea916b0f33c',
    1: '0xd2f21a72730259512f6edc60cfd182a79420dae6',
};

const CustomNode = ({ data }: { data: { label: string; imageUrl: string } }) => {
    return (
        <div style={{ textAlign: 'center', position: 'relative' }}>
            <Handle
                type="source"
                position={Position.Right}
                style={{ background: '#555', top: '50%' }} // Center the line vertically
            />
            <Image
                src={data.imageUrl}
                alt={data.label}
                style={{ width: '30px', height: '30px', display: 'block', margin: '0 auto' }} // Center the image
            />
            <div style={{ marginTop: '5px' }}> {/* Add margin to separate the label from the image */}
                {data.label.startsWith('0x') ? (
                    <FormattedAddress address={data.label} />
                ) : (
                    data.label
                )}
            </div>
            <Handle
                type="target"
                position={Position.Left}
                style={{ background: '#555', top: '50%' }} // Center the line vertically
            />
        </div>
    );
};

const CollectModal = ({
    isOpen,
    onClose,
    title,
    royalties,
    proposer,
    fundsRecipient,
    description,
    saleConfig,
    mediaSrc,
    isVideo,
    index, // Accept the index prop
}: {
    isOpen: boolean;
    onClose: () => void;
    title: string;
    royalties: string;
    proposer: string;
    fundsRecipient: string;
    description: string;
    saleConfig: any;
    mediaSrc: string;
    isVideo: boolean;
    index: number; // Define the index prop type
}) => {
    const percentageSplit = parseInt(royalties)
    const [numMints, setNumMints] = useState(1); // Add state for number of mints
    const userAccount = useAccount();
    // TODO: Thats not the nftcontract, this is the contract that creates the nfts with the method CreateEdition
    const ZoraNFTreator = droposalContractDictionary[index] || 'Unknown Contract'; // Assign NFT contract based on index

    console.log('all props', {
        title,
        royalties,
        proposer,
        fundsRecipient,
        description,
        saleConfig,
        mediaSrc,
        isVideo,
        index,
    }
    )

    return (
        <DialogRoot open={isOpen} onOpenChange={onClose} size="sm" placement="center" motionPreset="slide-in-bottom">
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Collect {title}</DialogTitle>
                    <DialogCloseTrigger />
                </DialogHeader>
                <DialogBody>
                    <Flex direction={{ base: 'column', md: 'row' }} gap={4}>
                        <VStack align="start" w={{ base: '100%', md: '50%' }}>
                            <Text mt={4}>NFT Creator: {ZoraNFTreator}</Text> {/* Display NFT contract */}
                            <Text mt={4}>Token Created: </Text>
                            <Text mt={4}>
                                Number of Mints:
                                <Input
                                    type="number"
                                    value={numMints}
                                    onChange={(e) => setNumMints(Number(e.target.value))}
                                    min="1"
                                    style={{ marginLeft: '10px', width: '60px' }}
                                />
                            </Text>
                        </VStack>

                    </Flex>
                </DialogBody>
                <DialogFooter>
                    <Flex justify="flex-end" mt={4}>
                        <Button colorScheme="blue" mr={3} onClick={onClose}>
                            Close
                        </Button>
                        <Button variant="ghost">Confirm</Button>
                    </Flex>
                </DialogFooter>
            </DialogContent>
        </DialogRoot>
    );
};

export default CollectModal;
