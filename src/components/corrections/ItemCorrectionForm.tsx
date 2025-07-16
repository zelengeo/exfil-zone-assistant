// src/components/corrections/ItemCorrectionForm.tsx
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { itemCorrectionSchema, type ItemCorrection } from "@/lib/schemas/dataCorrection";
import { Item } from "@/types/items";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    Form,
    FormControl,
    FormDescription,
    FormField,
    FormItem,
    FormLabel,
    FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Edit2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";

interface ItemCorrectionFormProps {
    item: Item;
    trigger?: React.ReactNode;
}

export function ItemCorrectionForm({ item, trigger }: ItemCorrectionFormProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Extract current stats as flat object
    const currentStats = item.stats || {};

    const form = useForm<ItemCorrection>({
        resolver: zodResolver(itemCorrectionSchema),
        defaultValues: {
            entityId: item.id,
            currentData: {
                name: item.name,
                description: item.description || "",
                stats: currentStats,
            },
            proposedData: {
                stats: {}
            },
            reason: "",
        },
    });

    const onSubmit = async (data: ItemCorrection) => {
        setIsSubmitting(true);

        try {
            // Calculate changes diff
            const changes: Record<string, { from: any; to: any }> = {};

            // Check name change
            if (data.proposedData.name && data.proposedData.name !== item.name) {
                changes.name = { from: item.name, to: data.proposedData.name };
            }

            // Check description change
            if (data.proposedData.description && data.proposedData.description !== item.description) {
                changes.description = { from: item.description, to: data.proposedData.description };
            }

            // Check stats changes
            if (data.proposedData.stats) {
                Object.entries(data.proposedData.stats).forEach(([key, value]) => {

                });
            }

            // Only submit if there are actual changes
            if (Object.keys(changes).length === 0) {
                toast.warning("No changes detected", {
                    description: "Please modify at least one field before submitting.",
                });
                return;
            }

            const response = await fetch("/api/corrections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entityType: "item",
                    entityId: item.id,
                    currentData: data.currentData,
                    proposedData: data.proposedData,
                    reason: data.reason,
                }),
            });

            if (!response.ok) throw new Error("Failed to submit correction");

            toast.success("Correction submitted", {
                description: "Thank you for helping improve our data!",
            });

            setOpen(false);
            form.reset();
        } catch (error) {
            console.error("Failed to submit correction:", error);
            toast.error("Submission failed", {
                description: "Please try again later."
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // Common stats fields based on item category
    const getStatsFields = () => {
        const fields = [
            { name: "price", label: "Price", type: "number" },
            { name: "rarity", label: "Rarity", type: "select", options: ["Common", "Uncommon", "Rare", "Epic", "Legendary", "Ultimate"] },
            { name: "weight", label: "Weight", type: "number", step: "0.01" },
        ];

        if (item.category === "weapons") {
            fields.push(
                { name: "fireRate", label: "Fire Rate", type: "number" },
                { name: "ergonomics", label: "Ergonomics", type: "number" },
                { name: "MOA", label: "MOA", type: "number", step: "0.01" },
            );
        } else if (item.category === "ammo") {
            fields.push(
                { name: "damage", label: "Damage", type: "number" },
                { name: "penetration", label: "Penetration", type: "number" },
                { name: "muzzleVelocity", label: "Muzzle Velocity", type: "number" },
            );
        } else if (item.category === "medicine") {
            fields.push(
                { name: "uses", label: "Uses", type: "number" },
                { name: "useTime", label: "Use Time", type: "number", step: "0.1" },
            );
        }

        return fields;
    };

    return (
        <>
            {trigger ? (
                <div onClick={() => setOpen(true)}>{trigger}</div>
            ) : (
                <Button
                    variant="outline"
                    size="sm"
                    onClick={() => setOpen(true)}
                    className="gap-2"
                >
                    <Edit2 className="h-4 w-4" />
                    Suggest Edit
                </Button>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Suggest Correction: {item.name}</DialogTitle>
                        <DialogDescription>
                            Help us improve the accuracy of this item&#39;s data. Only fill in the fields you want to change.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <ScrollArea className="h-[500px] pr-4">
                                <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="grid w-full grid-cols-2">
                                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                        <TabsTrigger value="stats">Stats</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="basic" className="space-y-4 mt-4">
                                        <FormField
                                            control={form.control}
                                            name="proposedData.name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={item.name}
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Current: {item.name}
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="proposedData.description"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Description</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={item.description || "No description"}
                                                            className="min-h-[100px]"
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Current: {item.description || "No description"}
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>

                                    <TabsContent value="stats" className="space-y-4 mt-4">
                                        {getStatsFields().map((statField) => (
                                            <FormField
                                                key={statField.name}
                                                control={form.control}
                                                name={`proposedData.stats.${statField.name}` as any}
                                                render={({ field }) => (
                                                    <FormItem>
                                                        <FormLabel>{statField.label}</FormLabel>
                                                        <FormControl>
                                                            {statField.type === "select" ? (
                                                                <select
                                                                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                                                    {...field}
                                                                    value={field.value || ""}
                                                                >
                                                                    <option value="">No change</option>
                                                                    {statField.options?.map((option) => (
                                                                        <option key={option} value={option}>
                                                                            {option}
                                                                        </option>
                                                                    ))}
                                                                </select>
                                                            ) : (
                                                                <Input
                                                                    type={statField.type}
                                                                    step={statField.step}
                                                                    placeholder={String(currentStats[statField.name] || "N/A")}
                                                                    {...field}
                                                                    value={field.value || ""}
                                                                    onChange={(e) => {
                                                                        const value = statField.type === "number"
                                                                            ? e.target.value ? Number(e.target.value) : undefined
                                                                            : e.target.value;
                                                                        field.onChange(value);
                                                                    }}
                                                                />
                                                            )}
                                                        </FormControl>
                                                        <FormDescription>
                                                            Current: {String(currentStats[statField.name] || "N/A")}
                                                        </FormDescription>
                                                        <FormMessage />
                                                    </FormItem>
                                                )}
                                            />
                                        ))}
                                    </TabsContent>
                                </Tabs>

                                <div className="mt-6">
                                    <FormField
                                        control={form.control}
                                        name="reason"
                                        render={({ field }) => (
                                            <FormItem>
                                                <FormLabel>Reason for correction</FormLabel>
                                                <FormControl>
                                                    <Textarea
                                                        placeholder="Please explain why this correction is needed..."
                                                        className="min-h-[100px]"
                                                        {...field}
                                                    />
                                                </FormControl>
                                                <FormDescription>
                                                    Help reviewers understand why this change is necessary
                                                </FormDescription>
                                                <FormMessage />
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Alert className="mt-4">
                                    <AlertCircle className="h-4 w-4" />
                                    <AlertDescription>
                                        Your suggestion will be reviewed by our team. If approved, the changes will be applied to the item.
                                    </AlertDescription>
                                </Alert>
                            </ScrollArea>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={() => setOpen(false)}
                                    disabled={isSubmitting}
                                >
                                    Cancel
                                </Button>
                                <Button type="submit" disabled={isSubmitting}>
                                    {isSubmitting ? "Submitting..." : "Submit Correction"}
                                </Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}