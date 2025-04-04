import { Field } from "@/components/ui/field";
import { Button, HStack, Input, VStack, Flex } from "@chakra-ui/react";
import React, { useRef, useState, useEffect } from "react";
import Link from "next/link"; // Import Next.js Link instead of Chakra UI Link
type TransactionFormProps = {
    type: string;
    fields: {
        name: string;
        placeholder: string;
        label?: string; // New property for custom label
        type?: string;
        validate?: (value: string) => boolean | string;
        onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void
    }[];
    onAdd: (transaction: { type: string; details: Record<string, any> }) => void;
    onCancel: () => void;
    onFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
    onAmountChange?: (amount: number) => void; // Add callback for amount change
    formatNumber: (value: string) => string; // Add formatNumber prop
    initialValues?: Record<string, any>; // Add this prop
};

const TransactionForm: React.FC<TransactionFormProps> = ({
    type,
    fields,
    onAdd,
    onCancel,
    onFileChange,
    onAmountChange,
    formatNumber,
    initialValues
}) => {
    const [formData, setFormData] = useState<Record<string, string | undefined>>(() => {
        if (initialValues) {
            console.log("Initializing formData with initialValues:", initialValues);
            return fields.reduce((acc, field) => {
                const value = initialValues[field.name];
                acc[field.name] = value !== undefined ? String(value) : '';
                return acc;
            }, {} as Record<string, string | undefined>);
        } else {
            return fields.reduce((acc, field) => {
                acc[field.name] = "";
                return acc;
            }, {} as Record<string, string | undefined>);
        }
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const amountInputRef = useRef<HTMLInputElement>(null);

    const handleChange = (field: string, value: string) => {
        console.log(`Field changed: ${field}, Value: ${value}`);
        if (field === "amount") {
            const formattedValue = formatNumber(value.replace(/,/g, ""));
            setFormData((prev) => ({ ...prev, [field]: formattedValue }));

            if (onAmountChange) {
                onAmountChange(value === "" ? 0 : parseFloat(value.replace(/,/g, '')));
            }
        } else if ((field === "imageURI" || field === "animationURI") && type === "DROPOSAL MINT") {
            // For IPFS fields, store with protocol but allow user to input just the CID
            let processedValue = value.trim();

            // If the value contains a protocol, extract just the resource part
            if (processedValue.includes("://")) {
                const parts = processedValue.split("://");
                processedValue = parts[parts.length - 1];
            }

            // Store the value with ipfs:// prefix in formData
            setFormData((prev) => ({ ...prev, [field]: `ipfs://${processedValue}` }));
        } else {
            setFormData((prev) => ({ ...prev, [field]: value }));
        }

        if (fields.find(f => f.name === field)?.validate) {
            const validation = fields.find(f => f.name === field)?.validate!(value.replace(/,/g, ''));
            setErrors((prev) => ({ ...prev, [field]: typeof validation === 'string' ? validation : '' }));
        }
    };

    const handleAdd = () => {
        console.log("Submitting form with formData:", formData);

        const details = { ...formData };

        // Ensure all required fields are included
        if (type === "DROPOSAL MINT") {
            if (!formData.animationURI) {
                details.animationURI = "";
            }
            details.editionSize = "18446744073709551615"; // Open Edition by default
            details.royalty = "2000"; // Hardcoded royalty value (20%)
        }

        console.log("Final transaction details being submitted:", details);
        onAdd({ type, details });
    };

    const isFormValid = () => {
        return fields.every(field => {
            if (field.name === "animationURI") {
                return true;
            }
            return field.type !== "file" && formData[field.name]?.trim() && !errors[field.name];
        });
    };

    // Helper function to extract CID from ipfs:// URI for display in input
    const getDisplayValue = (field: string, value?: string): string => {
        if (!value) return "";

        if ((field === "imageURI" || field === "animationURI") && value.startsWith("ipfs://")) {
            return value.substring(7); // Remove "ipfs://" prefix
        }

        return value;
    };

    return (
        <VStack gap={4} align="stretch">
            {fields.map((field) => (
                <Field
                    key={field.name}
                    label={field.label || field.placeholder}
                    invalid={!!errors[field.name]}
                    errorText={errors[field.name]}
                >
                    {field.type === "file" ? (
                        <Input
                            type="file"
                            placeholder={field.placeholder}
                            onChange={onFileChange}
                        />
                    ) : field.type === "date" ? (
                        <Input
                            type="date"
                            placeholder={field.placeholder}
                            value={formData[field.name] || ""}
                            onChange={(e) => {
                                handleChange(field.name, e.target.value);
                                field.onChange && field.onChange(e);
                            }}
                        />
                    ) : (field.name === "imageURI" || field.name === "animationURI") && type === "DROPOSAL MINT" ? (
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            width: '100%',
                            borderWidth: '1px',
                            borderRadius: '0.375rem',
                            overflow: 'hidden'
                        }}>
                            <div style={{
                                backgroundColor: 'var(--chakra-colors-gray-100)',
                                color: 'var(--chakra-colors-gray-600)',
                                padding: '0 0.75rem',
                                height: '2.5rem',
                                display: 'flex',
                                alignItems: 'center',
                                borderRight: '1px solid var(--chakra-colors-gray-200)',
                                fontSize: '0.875rem',
                                fontWeight: 500
                            }}>
                                ipfs://
                            </div>
                            <input
                                style={{
                                    border: 'none',
                                    outline: 'none',
                                    padding: '0 0.75rem',
                                    flex: 1,
                                    height: '2.5rem',
                                    backgroundColor: 'transparent'
                                }}
                                placeholder={field.placeholder}
                                value={getDisplayValue(field.name, formData[field.name])}
                                onChange={(e) => {
                                    handleChange(field.name, e.target.value);
                                    field.onChange && field.onChange(e);
                                }}
                            />
                        </div>
                    ) : (
                        <>
                            <Input
                                ref={field.name === "amount" ? amountInputRef : undefined}
                                placeholder={field.placeholder}
                                value={formData[field.name] || ""}
                                onChange={(e) => {
                                    handleChange(field.name, e.target.value);
                                    field.onChange && field.onChange(e);
                                }}
                            />
                            {field.name === "payoutAddress" && type === "DROPOSAL MINT" && (
                                <Flex mt={1} ml={3} justifyContent="flex-end">
                                    <Link
                                        href="https://app.splits.org/"
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        style={{
                                            fontSize: '0.875rem',
                                            color: '#3182ce',
                                            textDecoration: 'none'
                                        }}
                                    >
                                        Create a Split with Gnars Dao here
                                    </Link>
                                </Flex>
                            )}
                        </>
                    )}
                </Field>
            ))}
            <HStack justify="space-between">
                <Button colorScheme="red" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    colorScheme="teal"
                    onClick={handleAdd}
                    disabled={!isFormValid()}
                >
                    {initialValues ? 'Update Transaction' : 'Add Transaction'}
                </Button>
            </HStack>
        </VStack>
    );
};

export default TransactionForm;
