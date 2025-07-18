// src/components/corrections/TaskCorrectionForm.tsx
"use client";

import {useState} from "react";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {z} from 'zod';
import {
    type TaskCorrection,
    TaskCorrectionProposedData,
    taskCorrectionSchema,
    taskMapsEnum,
    taskTypesEnum
} from "@/lib/schemas/dataCorrection";
import {Task} from "@/types/tasks";
import {Button} from "@/components/ui/button";
import {Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle,} from "@/components/ui/dialog";
import {Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage,} from "@/components/ui/form";
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {AlertCircle, Edit2, Plus, Trash2} from "lucide-react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {toast} from "sonner";
import {useSession} from "next-auth/react";
import {Checkbox} from "@/components/ui/checkbox";
import {Select, SelectContent, SelectItem, SelectTrigger, SelectValue} from "@/components/ui/select";
import {deepEqual} from "@/lib/utils";

interface TaskCorrectionFormProps {
    task: Task;
    trigger?: React.ReactNode;
}

export function TaskCorrectionForm({task, trigger}: TaskCorrectionFormProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const form = useForm<TaskCorrection>({
        resolver: zodResolver(taskCorrectionSchema),
        defaultValues: {
            entityId: task.id,
            proposedData: {
                ...task,
            },
        },
    });

    const {fields: objectiveFields, append: appendObjective, remove: removeObjective} = useFieldArray({
        control: form.control,
        name: "proposedData.objectives",
    });
    const {fields: requiredTasksFields, append: appendRequiredTask, remove: removeRequiredTask} = useFieldArray({
        control: form.control,
        name: "proposedData.requiredTasks",
    });
    const {fields: rewardFields, append: appendReward, remove: removeReward} = useFieldArray({
        control: form.control,
        name: "proposedData.reward",
    });
    const {fields: preRewardFields, append: appendPreReward, remove: removePreReward} = useFieldArray({
        control: form.control,
        name: "proposedData.preReward",
    });
    const {fields: videoGuidesFields, append: appendVideoGuide, remove: removeVideoGuide} = useFieldArray({
        control: form.control,
        name: "proposedData.videoGuides",
    });

    const onSubmit = async (data: TaskCorrection) => {
        setIsSubmitting(true);
        try {
            const proposedData: TaskCorrectionProposedData = {};

            // Iterate over the keys of the proposed data from the form
            for (const _key  in data.proposedData) {
                const key = _key as keyof TaskCorrectionProposedData;
                const formValue = data.proposedData[key];
                const originalValue = task[key];

                // Skip undefined, null, or empty strings from the form that are not booleans
                if (formValue === undefined || formValue === null || formValue === '') {
                    continue;
                }

                if (!deepEqual(formValue, originalValue)) {
                    proposedData[key] = formValue;
                }
            }

            // Only submit if there are actual changes
            if (Object.keys(proposedData).length === 0) {
                toast.error("No changes detected", {
                    description: "Please modify at least one field before submitting.",
                });
                setIsSubmitting(false);
                return;
            }

            const validationResult = taskCorrectionSchema.safeParse({
                entityId: task.id,
                proposedData,
                reason: data.reason
            });

            if (!validationResult.success) {
                console.error("Validation errors:", z.prettifyError(validationResult.error));
                toast.error("Validation failed", {
                    description: "Please check the fields for errors.",
                });
                setIsSubmitting(false);
                return;
            }

            const response = await fetch("/api/corrections", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    entityType: "task",
                    entityId: task.id,
                    proposedData: validationResult.data.proposedData,
                    reason: validationResult.data.reason,
                }),
            });

            if (!response.ok) throw new Error("Failed to submit correction");

            toast.success("Correction submitted", {
                description: "Thank you for helping improve our data!",
            });

            setOpen(false);
            form.reset({
                entityId: task.id,
                proposedData: {...task},
                reason: ''
            });
        } catch (error) {
            console.error("Failed to submit correction:", error);
            toast.error("Submission failed", {
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
                    <Edit2 className="h-4 w-4"/>
                    Suggest Edit
                </Button>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-4xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Suggest Correction: {task.name}</DialogTitle>
                        <DialogDescription>
                            Help us improve the accuracy of this task&#39;s data. Only fill in the fields you want to
                            change.
                        </DialogDescription>
                    </DialogHeader>

                    <Form {...form}>
                        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                            <ScrollArea className="h-[600px] pr-4">
                                <Tabs defaultValue="basic" className="w-full">
                                    <TabsList className="grid w-full grid-cols-6">
                                        <TabsTrigger value="basic">Basic</TabsTrigger>
                                        <TabsTrigger value="objectives">Objectives</TabsTrigger>
                                        <TabsTrigger value="details">Details</TabsTrigger>
                                        <TabsTrigger value="requirements">Requirements</TabsTrigger>
                                        <TabsTrigger value="rewards">Rewards</TabsTrigger>
                                        <TabsTrigger value="guides">Guides</TabsTrigger>
                                    </TabsList>

                                    <TabsContent value="basic" className="space-y-4 mt-4">
                                        {/* Name and Description */}
                                        <FormField control={form.control} name="proposedData.name"
                                                   render={({field}) => (
                                                       <FormItem><FormLabel>Task Name</FormLabel><FormControl><Input
                                                           placeholder={task.name} {...field}
                                                           value={field.value || ""}/></FormControl><FormDescription>Current: {task.name}</FormDescription><FormMessage/></FormItem>)}/>
                                        <FormField control={form.control} name="proposedData.description"
                                                   render={({field}) => (
                                                       <FormItem><FormLabel>Description</FormLabel><FormControl><Textarea
                                                           placeholder={task.description}
                                                           className="min-h-[150px]" {...field}
                                                           value={field.value || ""}/></FormControl><FormDescription>Current
                                                           description shown
                                                           above</FormDescription><FormMessage/></FormItem>)}/>
                                    </TabsContent>

                                    <TabsContent value="objectives" className="space-y-4 mt-4">
                                        {/* Objectives */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Objectives</FormLabel><Button type="button" variant="outline"
                                                                                         size="sm"
                                                                                         onClick={() => appendObjective({description: ""})}><Plus
                                                className="h-4 w-4 mr-1"/>Add Objective</Button></div>
                                            <FormDescription>Current
                                                objectives: {task.objectives?.join(", ") || "None"}</FormDescription>
                                            <div className="space-y-2">{objectiveFields.map((field, index) => (
                                                <FormField key={field.id} control={form.control}
                                                           name={`proposedData.objectives.${index}`}
                                                           render={({field: objectiveField}) => (<FormItem>
                                                               <div className="flex gap-2">
                                                                   <FormControl><Input {...objectiveField}
                                                                                       placeholder="Enter objective"/></FormControl><Button
                                                                   type="button" variant="ghost" size="icon"
                                                                   onClick={() => removeObjective(index)}><Trash2
                                                                   className="h-4 w-4"/></Button></div>
                                                               <FormMessage/></FormItem>)}/>))}</div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="details" className="space-y-4 mt-4">
                                        {/* Task Type and Map */}
                                        <FormField control={form.control} name="proposedData.type" render={() => (
                                            <FormItem><FormLabel>Task Type</FormLabel>
                                                <div className="grid grid-cols-4 gap-2">{taskTypesEnum.map((type) => (
                                                    <FormField key={type} control={form.control}
                                                               name="proposedData.type" render={({field}) => {
                                                        const safeValue = Array.isArray(field.value) ? field.value : [];
                                                        return (<FormItem
                                                            className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox
                                                            checked={safeValue.includes(type)}
                                                            onCheckedChange={(checked) => {
                                                                return checked ? field.onChange([...safeValue, type]) : field.onChange(safeValue.filter((value) => value !== type));
                                                            }}/></FormControl><FormLabel
                                                            className="font-normal">{type}</FormLabel></FormItem>);
                                                    }}/>))}</div>
                                                <FormDescription>Current: {task.type.join(", ")}</FormDescription><FormMessage/></FormItem>)}/>
                                        <FormField control={form.control} name="proposedData.map" render={() => (
                                            <FormItem><FormLabel>Map</FormLabel>
                                                <div className="grid grid-cols-3 gap-2">{taskMapsEnum.map((map) => (
                                                    <FormField key={map} control={form.control} name="proposedData.map"
                                                               render={({field}) => {
                                                                   const safeValue = Array.isArray(field.value) ? field.value : [];
                                                                   return (<FormItem
                                                                       className="flex flex-row items-start space-x-3 space-y-0"><FormControl><Checkbox
                                                                       checked={safeValue.includes(map)}
                                                                       onCheckedChange={(checked) => {
                                                                           return checked ? field.onChange([...safeValue, map]) : field.onChange(safeValue.filter((value) => value !== map));
                                                                       }}/></FormControl><FormLabel
                                                                       className="font-normal">{map}</FormLabel></FormItem>);
                                                               }}/>))}</div>
                                                <FormDescription>Current: {task.map.join(", ")}</FormDescription><FormMessage/></FormItem>)}/>
                                        <FormField control={form.control} name="proposedData.tips"
                                                   render={({field}) => (
                                                       <FormItem><FormLabel>Tips</FormLabel><FormControl><Textarea
                                                           placeholder="Task tips..." {...field}
                                                           value={field.value || ""}/></FormControl><FormDescription>Current
                                                           tips: {task.tips || "None"}</FormDescription><FormMessage/></FormItem>)}/>
                                    </TabsContent>

                                    <TabsContent value="requirements" className="space-y-4 mt-4">
                                        {/* Required Level and Tasks */}
                                        <FormField control={form.control} name="proposedData.requiredLevel"
                                                   render={({field}) => (<FormItem><FormLabel>Required Level</FormLabel><FormControl><Input
                                                       type="number"
                                                       placeholder={String(task.requiredLevel || 0)} {...field}
                                                       value={field.value || ""}
                                                       onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}/></FormControl><FormDescription>Current:
                                                       Level {task.requiredLevel || 0}</FormDescription><FormMessage/></FormItem>)}/>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between"><FormLabel>Required
                                                Tasks</FormLabel><Button type="button" variant="outline" size="sm"
                                                                         onClick={() => appendRequiredTask("")}><Plus
                                                className="h-4 w-4 mr-1"/>Add Task</Button></div>
                                            <FormDescription>Current: {task.requiredTasks?.join(", ") || "None"}</FormDescription>
                                            <div className="space-y-2">{requiredTasksFields.map((field, index) => (
                                                <FormField key={field.id} control={form.control}
                                                           name={`proposedData.requiredTasks.${index}`}
                                                           render={({field: requiredTaskField}) => (<FormItem>
                                                               <div className="flex gap-2">
                                                                   <FormControl><Input {...requiredTaskField}
                                                                                       placeholder="Enter required task ID"/></FormControl><Button
                                                                   type="button" variant="ghost" size="icon"
                                                                   onClick={() => removeRequiredTask(index)}><Trash2
                                                                   className="h-4 w-4"/></Button></div>
                                                               <FormMessage/></FormItem>)}/>))}</div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="rewards" className="space-y-6 mt-4">
                                        {/* Rewards and Pre-Rewards */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Rewards</FormLabel><Button type="button" variant="outline"
                                                                                      size="sm"
                                                                                      onClick={() => appendReward({
                                                                                          type: 'item',
                                                                                          quantity: 1
                                                                                      })}><Plus
                                                className="h-4 w-4 mr-1"/>Add Reward</Button></div>
                                            <div className="space-y-4">{rewardFields.map((field, index) => (
                                                <div key={field.id}
                                                     className="p-4 border rounded-md grid grid-cols-2 gap-4 relative">
                                                    <Button type="button" variant="ghost" size="icon"
                                                            className="absolute top-2 right-2"
                                                            onClick={() => removeReward(index)}><Trash2
                                                        className="h-4 w-4"/></Button><Controller control={form.control}
                                                                                                  name={`proposedData.reward.${index}.type`}
                                                                                                  render={({field: typeField}) => (
                                                                                                      <Select
                                                                                                          onValueChange={typeField.onChange}
                                                                                                          defaultValue={typeField.value}><FormControl><SelectTrigger><SelectValue
                                                                                                          placeholder="Type"/></SelectTrigger></FormControl><SelectContent><SelectItem
                                                                                                          value="money">Money</SelectItem><SelectItem
                                                                                                          value="experience">Experience</SelectItem><SelectItem
                                                                                                          value="reputation">Reputation</SelectItem><SelectItem
                                                                                                          value="item">Item</SelectItem></SelectContent></Select>)}/><FormField
                                                    control={form.control}
                                                    name={`proposedData.reward.${index}.quantity`}
                                                    render={({field: quantityField}) => (
                                                        <Input type="number" placeholder="Quantity" {...quantityField}
                                                               onChange={e => quantityField.onChange(parseInt(e.target.value, 10) || 0)}/>)}/><FormField
                                                    control={form.control} name={`proposedData.reward.${index}.corpId`}
                                                    render={({field: corpIdField}) => (<Input
                                                        placeholder="Corp ID (optional)" {...corpIdField} />)}/><FormField
                                                    control={form.control} name={`proposedData.reward.${index}.item_id`}
                                                    render={({field: itemIdField}) => (
                                                        <Input placeholder="Item ID (optional)" {...itemIdField} />)}/>
                                                </div>))}</div>
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between">
                                                <FormLabel>Pre-Rewards</FormLabel><Button type="button"
                                                                                          variant="outline" size="sm"
                                                                                          onClick={() => appendPreReward({
                                                                                              type: 'item',
                                                                                              quantity: 1
                                                                                          })}><Plus
                                                className="h-4 w-4 mr-1"/>Add Pre-Reward</Button></div>
                                            <div className="space-y-4">{preRewardFields.map((field, index) => (
                                                <div key={field.id}
                                                     className="p-4 border rounded-md grid grid-cols-2 gap-4 relative">
                                                    <Button type="button" variant="ghost" size="icon"
                                                            className="absolute top-2 right-2"
                                                            onClick={() => removePreReward(index)}><Trash2
                                                        className="h-4 w-4"/></Button><Controller control={form.control}
                                                                                                  name={`proposedData.preReward.${index}.type`}
                                                                                                  render={({field: typeField}) => (
                                                                                                      <Select
                                                                                                          onValueChange={typeField.onChange}
                                                                                                          defaultValue={typeField.value}><FormControl><SelectTrigger><SelectValue
                                                                                                          placeholder="Type"/></SelectTrigger></FormControl><SelectContent><SelectItem
                                                                                                          value="money">Money</SelectItem><SelectItem
                                                                                                          value="experience">Experience</SelectItem><SelectItem
                                                                                                          value="reputation">Reputation</SelectItem><SelectItem
                                                                                                          value="item">Item</SelectItem></SelectContent></Select>)}/><FormField
                                                    control={form.control}
                                                    name={`proposedData.preReward.${index}.quantity`}
                                                    render={({field: quantityField}) => (
                                                        <Input type="number" placeholder="Quantity" {...quantityField}
                                                               onChange={e => quantityField.onChange(parseInt(e.target.value, 10) || 0)}/>)}/><FormField
                                                    control={form.control}
                                                    name={`proposedData.preReward.${index}.corpId`}
                                                    render={({field: corpIdField}) => (<Input
                                                        placeholder="Corp ID (optional)" {...corpIdField} />)}/><FormField
                                                    control={form.control}
                                                    name={`proposedData.preReward.${index}.item_id`}
                                                    render={({field: itemIdField}) => (
                                                        <Input placeholder="Item ID (optional)" {...itemIdField} />)}/>
                                                </div>))}</div>
                                        </div>
                                    </TabsContent>

                                    <TabsContent value="guides" className="space-y-4 mt-4">
                                        {/* Video Guides */}
                                        <div className="space-y-2">
                                            <div className="flex items-center justify-between"><FormLabel>Video
                                                Guides</FormLabel><Button type="button" variant="outline" size="sm"
                                                                          onClick={() => appendVideoGuide({
                                                                              author: "",
                                                                              ytId: ""
                                                                          })}><Plus className="h-4 w-4 mr-1"/>Add Guide</Button>
                                            </div>
                                            <div className="space-y-4">{videoGuidesFields.map((field, index) => (
                                                <div key={field.id}
                                                     className="p-4 border rounded-md grid grid-cols-2 gap-4 relative">
                                                    <Button type="button" variant="ghost" size="icon"
                                                            className="absolute top-2 right-2"
                                                            onClick={() => removeVideoGuide(index)}><Trash2
                                                        className="h-4 w-4"/></Button><FormField control={form.control}
                                                                                                 name={`proposedData.videoGuides.${index}.author`}
                                                                                                 render={({field: authorField}) => (
                                                                                                     <Input
                                                                                                         placeholder="Author" {...authorField} />)}/><FormField
                                                    control={form.control}
                                                    name={`proposedData.videoGuides.${index}.ytId`}
                                                    render={({field: ytIdField}) => (
                                                        <Input placeholder="YouTube ID" {...ytIdField} />)}/><FormField
                                                    control={form.control}
                                                    name={`proposedData.videoGuides.${index}.startTs`}
                                                    render={({field: startTsField}) => (
                                                        <Input type="number" placeholder="Start (sec)" {...startTsField}
                                                               onChange={e => startTsField.onChange(parseInt(e.target.value, 10) || 0)}/>)}/><FormField
                                                    control={form.control}
                                                    name={`proposedData.videoGuides.${index}.endTs`}
                                                    render={({field: endTsField}) => (
                                                        <Input type="number" placeholder="End (sec)" {...endTsField}
                                                               onChange={e => endTsField.onChange(parseInt(e.target.value, 10) || 0)}/>)}/>
                                                </div>))}</div>
                                        </div>
                                    </TabsContent>
                                </Tabs>

                                <div className="mt-6">
                                    <FormField control={form.control} name="reason" render={({field}) => (
                                        <FormItem><FormLabel>Reason for correction</FormLabel><FormControl><Textarea
                                            placeholder="Please explain why this correction is needed..."
                                            className="min-h-[100px]" {...field} /></FormControl><FormDescription>Help
                                            reviewers understand why this change is
                                            necessary</FormDescription><FormMessage/></FormItem>)}/>
                                </div>

                                <Alert className="mt-4">
                                    <AlertCircle className="h-4 w-4"/>
                                    <AlertDescription>
                                        Your suggestion will be reviewed by our team. If approved, the changes will be
                                        applied to the task.
                                    </AlertDescription>
                                </Alert>
                            </ScrollArea>

                            <div className="flex justify-end gap-2 pt-4 border-t">
                                <Button type="button" variant="outline" onClick={() => setOpen(false)}
                                        disabled={isSubmitting}>Cancel</Button>
                                <Button type="submit"
                                        disabled={isSubmitting}>{isSubmitting ? "Submitting..." : "Submit Correction"}</Button>
                            </div>
                        </form>
                    </Form>
                </DialogContent>
            </Dialog>
        </>
    );
}

export function TaskCorrectionFormAuth({task, trigger}: TaskCorrectionFormProps) {
    const {data: session} = useSession();
    if (!session) {
        return null;
    }
    return <TaskCorrectionForm task={task} trigger={trigger}/>;
}