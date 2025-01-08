import React from "react";
import { VStack, Input, Button, HStack, Text } from "@chakra-ui/react";
import { Field } from "@/components/ui/field"; // Assuming this exists

type TransactionFormProps = {
    type: string;
    fields: { name: string; placeholder: string; type?: string; validate?: (value: string) => boolean | string }[];
    onAdd: (transaction: { type: string; details: Record<string, any> }) => void;
    onCancel: () => void;
    onFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
};

const TransactionForm: React.FC<TransactionFormProps> = ({ type, fields, onAdd, onCancel, onFileChange }) => {
    const [formData, setFormData] = React.useState<Record<string, string | undefined>>(
        fields.reduce((acc, field) => {
            acc[field.name] = field.name === "editionType" ? "defaultEdition" : "";
            return acc;
        }, {} as Record<string, string | undefined>)
    );
    const [errors, setErrors] = React.useState<Record<string, string>>({});

    const handleChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (fields.find(f => f.name === field)?.validate) {
            const validation = fields.find(f => f.name === field)?.validate!(value);
            setErrors((prev) => ({ ...prev, [field]: typeof validation === 'string' ? validation : '' }));
        }
    };

    const handleAdd = () => {
        const details = { ...formData };
        // Ensure animationURI can be empty
        if (type === "DROPOSAL MINT" && !formData.animationURI) {
            details.animationURI = "";
        }
        onAdd({ type, details });
    };

    const isFormValid = () => {
        return fields.every(field => {
            if (field.name === "animationURI") {
                return true; // Allow animationURI to be empty
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
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        />
                    ) : (
                        <Input
                            placeholder={field.placeholder}
                            value={formData[field.name] || ""}
                            onChange={(e) => handleChange(field.name, e.target.value)}
                        />
                    )}
                </Field>
            ))}
            {formData.editionType === "limitedEdition" && (
                <Field
                    key="editionSize"
                    label="Edition Size"
                    invalid={!!errors.editionSize}
                    errorText={errors.editionSize}
                >
                    <Input
                        placeholder="Edition Size"
                        value={formData.editionSize || ""}
                        onChange={(e) => handleChange("editionSize", e.target.value)}
                    />
                </Field>
            )}
            <HStack justify="space-between">
                <Button colorScheme="red" onClick={onCancel}>
                    Cancel
                </Button>
                <Button
                    colorScheme="teal"
                    onClick={handleAdd}
                    disabled={!isFormValid()}
                >
                    Add Transaction
                </Button>
            </HStack>
        </VStack>
    );
};

export default TransactionForm;
