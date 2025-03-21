import { Field } from "@/components/ui/field"; // Assuming this exists
import { Button, HStack, Input, VStack, Text, Stack } from "@chakra-ui/react";
import React, { useRef, useState, useEffect } from "react";

type TransactionFormProps = {
    type: string;
    fields: { name: string; placeholder: string; type?: string; validate?: (value: string) => boolean | string; onChange?: (event: React.ChangeEvent<HTMLInputElement>) => void }[];
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
            details.royalty = "5000"; // Hardcoded royalty value (50%)
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

    return (
        <VStack gap={4} align="stretch">
            {fields.map((field) => (
                <Field
                    key={field.name}
                    label={field.placeholder}
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
                    ) : (
                        <Input
                            ref={field.name === "amount" ? amountInputRef : undefined}
                            placeholder={field.placeholder}
                            value={formData[field.name] || ""}
                            onChange={(e) => {
                                handleChange(field.name, e.target.value);
                                field.onChange && field.onChange(e);
                            }}
                        />
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
