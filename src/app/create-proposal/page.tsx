'use client';

import React, { useState, useRef, useCallback } from "react";
import { useForm, Controller } from "react-hook-form";
import {
  VStack,
  Text,
  Input,
  Button,
  Box,
  Group,
  Container,
  Center,
} from '@chakra-ui/react';
import {
  StepsRoot,
  StepsList,
  StepsItem,
  StepsContent,
  StepsNextTrigger,
  StepsPrevTrigger,
  StepsCompletedContent,
} from "@/components/ui/steps";
import { LuFileText, LuPlus, LuCheckCircle, LuPencil } from "react-icons/lu";
import TransactionTypes from "@/components/create-proposal/TransactionTypes";
import TransactionList from "@/components/create-proposal/TransactionList";
import TransactionItem from "@/components/create-proposal/TransactionItem";
import Editor from "@/components/create-proposal/Editor";
import Markdown from "@/components/proposal/markdown";
import SubmitProposalButton from "@/components/create-proposal/SubmitProposalButton"; // Import the new component
import { FaEthereum } from "react-icons/fa";

interface Transaction {
  type: string;
  details: any;
}

interface FormData {
  proposalTitle: string;
  editorContent: string;
}

const CreateProposalPage = () => {
  const { control, handleSubmit, watch } = useForm<FormData>();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [currentTransactionType, setCurrentTransactionType] = useState<string | null>(null);
  const [showTransactionOptions, setShowTransactionOptions] = useState(false);
  // Add state to track which transaction is being edited
  const [editingTransactionIndex, setEditingTransactionIndex] = useState<number | null>(null);
  const [initialTransactionValues, setInitialTransactionValues] = useState<Record<string, any> | undefined>(undefined);
  const proposalTitle = watch("proposalTitle");
  const editorContent = watch("editorContent");
  const [currentStep, setCurrentStep] = useState(0);

  const handleAddTransaction = useCallback(() => {
    setShowTransactionOptions(true);
  }, []);

  const handleSelectTransaction = useCallback((type: string) => {
    setCurrentTransactionType(type);
    setShowTransactionOptions(false);
  }, []);

  const handleAddTransactionDetails = useCallback(
    (transaction: Transaction) => {
      if (editingTransactionIndex !== null) {
        // If we're editing, update the transaction at that index
        setTransactions((prevTransactions) => {
          const newTransactions = [...prevTransactions];
          newTransactions[editingTransactionIndex] = transaction;
          return newTransactions;
        });
        // Reset editing state
        setEditingTransactionIndex(null);
        setInitialTransactionValues(undefined); // Change null to undefined
      } else {
        // If adding new, append to array
        setTransactions((prevTransactions) => [...prevTransactions, transaction]);
      }
      setCurrentTransactionType(null);
    },
    [editingTransactionIndex]
  );

  const handleCancelTransaction = useCallback(() => {
    setCurrentTransactionType(null);
    setEditingTransactionIndex(null);
    setInitialTransactionValues(undefined); // Change null to undefined
  }, []);

  const handleDeleteTransaction = useCallback((index: number) => {
    setTransactions((prevTransactions) => prevTransactions.filter((_, idx) => idx !== index));
  }, []);

  const isTitleValid = proposalTitle?.length > 5;

  return (
    <Container maxW="container.lg" px={{ base: "0", md: "20%" }}>
      <form onSubmit={handleSubmit(() => { })}>
        <StepsRoot defaultStep={0} count={4} step={currentStep} onStepChange={(details) => setCurrentStep(details.step)}>
          <StepsList>
            {/* Step 1: Proposal Title */}
            <StepsItem index={0} icon={<LuPencil />} />
            {/* Step 2: Add Transactions */}
            <StepsItem index={1} icon={<FaEthereum />} />
            {/* Step 3: Proposal Description */}
            <StepsItem index={2} icon={<LuFileText />} />
            {/* Step 4: Review and Submit */}
            <StepsItem index={3} icon={<LuPlus />} />
          </StepsList>

          {/* Step 1: Proposal Title */}
          <StepsContent index={0}>
            <VStack gap={4} align='stretch' p={4}>
              <Text fontSize='2xl' fontWeight='bold'>
                Proposal Title
              </Text>
              <Controller
                name='proposalTitle'
                control={control}
                defaultValue=''
                rules={{
                  required: 'Title is required',
                  minLength: {
                    value: 6,
                    message: 'Title must be longer than 5 characters',
                  },
                }}
                render={({ field, fieldState }) => (
                  <>
                    <Input placeholder='Enter your proposal title' {...field} />
                    {fieldState.error && (
                      <Text color='red.500'>{fieldState.error.message}</Text>
                    )}
                  </>
                )}
              />
            </VStack>
          </StepsContent>

          {/* Step 2: Add Transactions */}
          <StepsContent index={1}>
            <VStack gap={4} align='stretch' p={4}>
              <Text fontSize='2xl' fontWeight='bold'>
                Transactions
              </Text>

              {currentTransactionType ? (
                <TransactionItem
                  type={currentTransactionType}
                  onAdd={handleAddTransactionDetails}
                  onCancel={handleCancelTransaction}
                  initialValues={initialTransactionValues}
                />
              ) : showTransactionOptions ? (
                <TransactionTypes onSelect={handleSelectTransaction} />
              ) : (
                <>
                  <TransactionList
                    transactions={transactions}
                    onDelete={handleDeleteTransaction}
                    onEdit={(index, transaction) => {
                      // Set up editing state
                      setEditingTransactionIndex(index);
                      setCurrentTransactionType(transaction.type);
                      // Filter out internal fields for the form
                      const formValues = { ...transaction.details };
                      setInitialTransactionValues(formValues);
                    }}
                  />
                  <Button colorScheme='teal' onClick={handleAddTransaction}>
                    Add Transaction
                  </Button>
                </>
              )}
            </VStack>
          </StepsContent>

          {/* Step 3: Proposal Description */}
          <StepsContent index={2}>
            <VStack gap={4} align='stretch' p={4}>
              <Center border='0.6px solid' borderColor='gray.200' p={4} borderRadius='md'>
                <Text fontSize='2xl' fontWeight='bold'>
                  {proposalTitle}
                </Text>
              </Center>
              <Center>
                <Text fontSize='2xl' fontWeight='bold'>
                  Proposal Description
                </Text>
              </Center>
              <Controller
                name='editorContent'
                control={control}
                defaultValue=''
                render={({ field }) => (
                  <Editor
                    value={field.value} // Pass the form value to the editor
                    onChange={(content) => {
                      field.onChange(content); // Update react-hook-form state
                    }}
                  />
                )}
              />
            </VStack>
          </StepsContent>
          <StepsContent index={3}>

            {/* Review and Submit */}
            <VStack gap={4} align="stretch" p={4}>
              <Text fontSize="2xl" fontWeight="bold">Review and Submit</Text>
              <TransactionList
                transactions={transactions}
                onDelete={handleDeleteTransaction}
                onEdit={(index, transaction) => {
                  // Use same edit handler here too
                  setEditingTransactionIndex(index);
                  setCurrentTransactionType(transaction.type);
                  const formValues = { ...transaction.details };
                  setInitialTransactionValues(formValues);
                  // Go back to the transactions step
                  setCurrentStep(1);
                }}
              />
              <Center border='0.6px solid' borderColor='gray.200' p={4} borderRadius='md'>
                <Text fontSize='2xl' fontWeight='bold'>
                  {proposalTitle}
                </Text>
              </Center>
              <Box
                borderWidth="1px"
                borderRadius="md"
                borderColor={editorContent ? "gray.300" : "red.500"}
                p={4}
              >
                <Markdown text={editorContent} />
              </Box>
              <SubmitProposalButton
                isTitleValid={isTitleValid}
                transactions={transactions}
                proposalTitle={proposalTitle}
                editorContent={editorContent}
              />
            </VStack>
          </StepsContent>

          {/* Navigation Buttons */}
          <Group mt={6} justify="space-between">
            <StepsPrevTrigger asChild>
              <div>
                <Button variant="outline" size="sm">
                  Previous
                </Button>
              </div>
            </StepsPrevTrigger>
            <StepsNextTrigger asChild>
              <div>
                {currentStep < 3 && (
                  <Button
                    variant="solid"
                    size="sm"
                    colorScheme="teal"
                    disabled={!isTitleValid && !transactions.length}
                  >
                    Next
                  </Button>
                )}
              </div>
            </StepsNextTrigger>
          </Group>
        </StepsRoot>
      </form>
    </Container>
  );
};

export default CreateProposalPage;
