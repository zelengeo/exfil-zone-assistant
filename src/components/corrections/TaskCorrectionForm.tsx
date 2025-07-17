// src/components/corrections/TaskCorrectionForm.tsx
"use client";

import { useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { taskCorrectionSchema, type TaskCorrection } from "@/lib/schemas/dataCorrection";
import { Task } from "@/types/tasks"; // Assuming you have task types
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
import { Edit2, Plus, Trash2, AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import {useSession} from "next-auth/react";

interface TaskCorrectionFormProps {
    task: Task;
    trigger?: React.ReactNode;
}

export function TaskCorrectionForm({ task, trigger }: TaskCorrectionFormProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TaskCorrection>({
        resolver: zodResolver(taskCorrectionSchema),
        defaultValues: {
            entityId: task.id,
            proposedData: {},
            reason: "",
        },
    });

    const { fields: objectiveFields, append: appendObjective, remove: removeObjective } = useFieldArray({
        control: form.control,
        name: "proposedData.objectives",
    });

    const onSubmit = async (data: TaskCorrection) => {
        setIsSubmitting(true);

        try {
            // Calculate changes
            const changes: Record<string, { from: any; to: any }> = {};

            // Check basic field changes
            if (data.proposedData.name && data.proposedData.name !== task.name) {
                changes.name = { from: task.name, to: data.proposedData.name };
            }

            if (data.proposedData.description && data.proposedData.description !== task.description) {
                changes.description = { from: task.description, to: data.proposedData.description };
            }

            if (data.proposedData.requiredLevel && data.proposedData.requiredLevel !== task.requiredLevel) {
                changes.requiredLevel = { from: task.requiredLevel, to: data.proposedData.requiredLevel };
            }

            // Check objectives changes
            if (data.proposedData.objectives &&
                JSON.stringify(data.proposedData.objectives) !== JSON.stringify(task.objectives)) {
                changes.objectives = { from: task.objectives, to: data.proposedData.objectives };
            }

            // Only submit if there are actual changes
            if (Object.keys(changes).length === 0) {
                toast.error("No changes detected",{
                    description: "Please modify at least one field before submitting.",
                });
                return;
            }

            const response = await fetch("/api/corrections", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    entityType: "task",
                    entityId: task.id,
                    proposedData: data.proposedData,
                    reason: data.reason,
                }),
            });

            if (!response.ok) throw new Error("Failed to submit correction");

            toast.success("Correction submitted",{
                description: "Thank you for helping improve our data!",
            });

            setOpen(false);
            form.reset();
        } catch (error) {
            console.error("Failed to submit correction:", error);
            toast.error("Submission failed",{
                description: "Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
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
                        <DialogTitle>Suggest Correction: {task.name}</DialogTitle>
                        <DialogDescription>
                            Help us improve the accuracy of this task&#39;s data. Only fill in the fields you want to change.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <ScrollArea className="h-[500px] pr-4">
                                <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="grid w-full grid-cols-3">
                                        <TabsTrigger value="basic">Basic Info</TabsTrigger>
                                        <TabsTrigger value="objectives">Objectives</TabsTrigger>
                                        <TabsTrigger value="requirements">Requirements</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="basic" className="space-y-4 mt-4">
                                        <FormField
                                            control={form.control}
                                            name="proposedData.name"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Task Name</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            placeholder={task.name}
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Current: {task.name}
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
                                                            placeholder={task.description}
                                                            className="min-h-[150px]"
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Current description shown above
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>

                                    <TabsContent value="objectives" className="space-y-4 mt-4">
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Objectives</FormLabel>
                                                <Button
                                                    type="button"
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => appendObjective("")}
                                                >
                                                    <Plus className="h-4 w-4 mr-1" />
                                                    Add Objective
                                                </Button>
                                            </div>

                                            <FormDescription>
                                                Current objectives: {task.objectives?.join(", ") || "None"}
                                            </FormDescription>

                                            <div className="space-y-2">
                                                {objectiveFields.map((field, index) => (
                                                    <FormField
                                                        key={field.id}
                                                        control={form.control}
                                                        name={`proposedData.objectives.${index}`}
                                                        render={({ field }) => (
                                                            <FormItem>
                                                                <div className="flex gap-2">
                                                                    <FormControl>
                                                                        <Input {...field} placeholder="Enter objective" />
                                                                    </FormControl>
                                                                    <Button
                                                                        type="button"
                                                                        variant="ghost"
                                                                        size="icon"
                                                                        onClick={() => removeObjective(index)}
                                                                    >
                                                                        <Trash2 className="h-4 w-4" />
                                                                    </Button>
                                                                </div>
                                                                <FormMessage />
                                                            </FormItem>
                                                        )}
                                                    />
                                                ))}
                                            </div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="requirements" className="space-y-4 mt-4">
                                        <FormField
                                            control={form.control}
                                            name="proposedData.requiredLevel"
                                            render={({ field }) => (
                                                <FormItem>
                                                    <FormLabel>Required Level</FormLabel>
                                                    <FormControl>
                                                        <Input
                                                            type="number"
                                                            placeholder={String(task.requiredLevel || 0)}
                                                            {...field}
                                                            value={field.value || ""}
                                                            onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Current: Level {task.requiredLevel || 0}
                                                    </FormDescription>
                                                    <FormMessage />
                                                </FormItem>
                                            )}
                                        />
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
                                        Your suggestion will be reviewed by our team. If approved, the changes will be applied to the task.
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

export function TaskCorrectionFormAuth({ task, trigger }: TaskCorrectionFormProps) {
    const { data: session } = useSession();

    // No session = no button/trigger rendered at all
    if (!session) {
        return null;
    }

    // Session exists = render the full form component
    return <TaskCorrectionForm task={task} trigger={trigger} />;
}