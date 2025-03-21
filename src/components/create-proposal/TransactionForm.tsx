import { Field } from "@/components/ui/field"; // Assuming this exists
import { Button, HStack, Input, VStack, Text, Stack, Slider } from "@chakra-ui/react";
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
                acc[field.name] = field.name === "editionType" ? "defaultEdition" : "";
                return acc;
            }, {} as Record<string, string | undefined>);
        }
    });
    const [errors, setErrors] = useState<Record<string, string>>({});
    const amountInputRef = useRef<HTMLInputElement>(null);
    const [royalty, setRoyalty] = useState<number>(0);

    useEffect(() => {
        if (initialValues?.royalty) {
            const parsedRoyalty = parseFloat(String(initialValues.royalty)) / 100;
            console.log("Initializing royalty (percentage):", parsedRoyalty);
            setRoyalty(parsedRoyalty);
        }
        if (initialValues?.editionSize) {
            console.log("Initializing editionSize:", initialValues.editionSize);
        }
    }, [initialValues?.royalty, initialValues?.editionSize]);

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
        console.log("Submitting form with royalty (percentage):", royalty);
        console.log("Submitting form with formData:", formData);

        const details = { ...formData };
        if (type === "DROPOSAL MINT" && !formData.animationURI) {
            details.animationURI = "";
        }
        details.royalty = (royalty * 100).toString(); // Convert percentage to basis points
        console.log("Final royalty (basis points):", details.royalty);
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
            {type === "DROPOSAL MINT" && (
                <Field label="Royalty (%)">
                    <Stack width="200px" gap="4">
                        <Slider.Root
                            defaultValue={[royalty]}
                            onValueChange={({ value }: { value: number[] }) => {
                                console.log("Slider value changed:", value[0]);
                                setRoyalty(value[0]);
                            }}
                        >
                            <Slider.Label>Royalty</Slider.Label>
                            <Slider.Control>
                                <Slider.Track>
                                    <Slider.Range />
                                </Slider.Track>
                                <Slider.Thumb index={0} />
                            </Slider.Control>
                        </Slider.Root>
                        <Text width="4rem" textAlign="center">{royalty}%</Text>
                    </Stack>
                </Field>
            )}
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
                        onChange={(e) => {
                            console.log("Edition size changed:", e.target.value);
                            handleChange("editionSize", e.target.value);
                        }}
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
                    {initialValues ? 'Update Transaction' : 'Add Transaction'}
                </Button>
            </HStack>
        </VStack>
    );
};

export default TransactionForm;
