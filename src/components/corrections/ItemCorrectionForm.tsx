// src/components/corrections/ItemCorrectionForm.tsx
"use client";

import {useState} from "react";
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {
    itemCorrectionSchema,
    type ItemCorrection,
    rarityEnum,
} from "@/lib/schemas/dataCorrection";
import {Item, CALIBERS} from "@/types/items";
import {Button} from "@/components/ui/button";
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
import {Input} from "@/components/ui/input";
import {Textarea} from "@/components/ui/textarea";
import {ScrollArea} from "@/components/ui/scroll-area";
import {Tabs, TabsContent, TabsList, TabsTrigger} from "@/components/ui/tabs";
import {Edit2, AlertCircle} from "lucide-react";
import {Alert, AlertDescription} from "@/components/ui/alert";
import {toast} from "sonner";
import {useSession} from "next-auth/react";

interface ItemCorrectionFormProps {
    item: Item;
    trigger?: React.ReactNode;
}

interface StatField {
    name: string;
    label: string;
    type: string;
    options?: string[]; // Used for 'select' type fields
    step?: string; // Used for 'number' type fields that need a step attribute
}

const field = (name: string, label: string, type: string = "number", props: Record<string, string | string[] | readonly string[]
> = {}): StatField => ({name, label, type, ...props});


// Helper to get nested values from an object
function getNestedValue(obj: object, path: string) {
    if (!path) return undefined;
    // @ts-expect-error - its fine
    return path.split('.').reduce((o, k) => (o && o[k] !== undefined) ? o[k] : undefined, obj);
}

export function ItemCorrectionForm({item, trigger}: ItemCorrectionFormProps) {
    const [open, setOpen] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Extract current stats as flat object
    const currentStats = item.stats || {};

    const form = useForm<ItemCorrection>({
        resolver: zodResolver(itemCorrectionSchema),
        defaultValues: {
            entityId: item.id,
            proposedData: {
                name: item.name,
                description: item.description,
                stats: item.stats,
                tips: item.tips,
            },
        },
    });

    const onSubmit = async (data: ItemCorrection) => {
        setIsSubmitting(true);

        try {
            const proposedData: ItemCorrection["proposedData"] = {};

            // Handle top-level fields
            if (data.proposedData.name && data.proposedData.name !== item.name) {
                proposedData.name = data.proposedData.name;
            }
            if (data.proposedData.description && data.proposedData.description !== item.description) {
                proposedData.description = data.proposedData.description;
            }
            if (data.proposedData.tips && data.proposedData.tips !== item.tips) {
                proposedData.tips = data.proposedData.tips;
            }

            // Handle stats, which may have dot-notation keys for nested properties
            if (data.proposedData.stats) {
                const stats: ItemCorrection["proposedData"]["stats"] = {};
                for (const key in data.proposedData.stats) {
                    const proposedValue = data.proposedData.stats[key];
                    const originalValue = getNestedValue(item.stats || {}, key);

                    // Check for actual change, ignoring undefined and empty strings
                    if (proposedValue !== undefined && proposedValue !== '' && String(proposedValue) !== String(originalValue)) {
                        // Un-flatten the key to create a nested object structure
                        const keys = key.split('.');
                        let current = stats;
                        for (let i = 0; i < keys.length - 1; i++) {
                            current[keys[i]] = current[keys[i]] || {};
                            current = current[keys[i]];
                        }
                        current[keys[keys.length - 1]] = proposedValue;
                    }
                }
                if (Object.keys(stats).length > 0) {
                    proposedData.stats = stats;
                }
            }

            if (Object.keys(proposedData).length === 0) {
                toast.warning("No changes detected", {
                    description: "Please modify at least one field before submitting.",
                });
                setIsSubmitting(false);
                return;
            }

            const response = await fetch("/api/corrections", {
                method: "POST",
                headers: {"Content-Type": "application/json"},
                body: JSON.stringify({
                    entityType: "item",
                    entityId: item.id,
                    proposedData: proposedData,
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
                description: "Please try again later.",
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    const getStatsFields = () => {
        const fields = [
            field("price", "Price", "number"),
            field("rarity", "Rarity", "select", {options: rarityEnum}),
            field("weight", "Weight", "number", {step: "0.01"}),
        ];

        switch (item.category) {
            case "weapons":
                fields.push(
                    field("fireRate", "Fire Rate"),
                    field("caliber", "Caliber", "select", {options: [...CALIBERS]}),
                    field("MOA", "MOA", "number", {step: "0.01"}),
                    field("ADSSpeed", "ADS Speed"),
                    field("ergonomics", "Ergonomics"),
                    field("fireMode", "Fire Mode", "select", {options: ["semiAuto", "fullAuto", "pumpAction", "boltAction", "burstFire"]}),
                    field("firingPower", "Firing Power"),
                    // field("recoilParameters.shiftMomentum", "Recoil Shift Momentum"),
                    // field("recoilParameters.pitchBaseMomentum", "Recoil Pitch Base Momentum"),
                    // field("recoilParameters.yawBaseMomentum", "Recoil Yaw Base Momentum"),
                    // field("recoilParameters.rollBaseMomentum", "Recoil Roll Base Momentum"),
                    // field("recoilParameters.shiftStiffness", "Recoil Shift Stiffness"),
                    // field("recoilParameters.pitchStiffness", "Recoil Pitch Stiffness"),
                    // field("recoilParameters.yawStiffness", "Recoil Yaw Stiffness"),
                    // field("recoilParameters.rollStiffness", "Recoil Roll Stiffness"),
                    // field("recoilParameters.shiftDamping", "Recoil Shift Damping"),
                    // field("recoilParameters.pitchDamping", "Recoil Pitch Damping"),
                    // field("recoilParameters.yawDamping", "Recoil Yaw Damping"),
                    // field("recoilParameters.rollDamping", "Recoil Roll Damping"),
                    // field("recoilParameters.shiftMass", "Recoil Shift Mass"),
                    // field("recoilParameters.pitchMass", "Recoil Pitch Mass"),
                    // field("recoilParameters.yawMass", "Recoil Yaw Mass"),
                    // field("recoilParameters.rollMass", "Recoil Roll Mass"),
                    // field("recoilParameters.oneHandedADSMultiplier", "One-Handed ADS Multiplier"),
                    field("recoilParameters.verticalRecoilControl", "Vertical Recoil Control", "number", {step: "0.01"}),
                    field("recoilParameters.horizontalRecoilControl", "Horizontal Recoil Control", "number", {step: "0.01"}),
                );
                break;
            case "ammo":
                fields.push(
                    field("damage", "Damage"),
                    field("penetration", "Penetration"),
                    // field("pellets", "Pellets"),
                    field("caliber", "Caliber", "select", {options: [...CALIBERS]}),
                    field("bluntDamageScale", "Blunt Damage Scale", "number", {step: "0.01"}),
                    field("bleedingChance", "Bleeding Chance", "number", {step: "0.01"}),
                    field("protectionGearPenetratedDamageScale", "Protection Gear Penetrated Damage Scale", "number", {step: "0.01"}),
                    field("protectionGearBluntDamageScale", "Protection Gear Blunt Damage Scale", "number", {step: "0.01"}),
                    field("muzzleVelocity", "Muzzle Velocity"),
                    field("bulletDropFactor", "Bullet Drop Factor", "number", {step: "0.01"}),
                );
                break;
            case "grenades":
                fields.push(
                    field("fuseTime", "Fuse Time"),
                    field("radius", "Radius"),
                    field("bluntDamageScale", "Blunt Damage Scale", "number", {step: "0.01"}),
                    field("bleedingChance", "Bleeding Chance", "number", {step: "0.01"}),
                    field("effectTime", "Effect Time"),
                    field("protectionGearPenetratedDurabilityDamageScale", "Protection Gear Penetrated Durability Damage Scale", "number", {step: "0.01"}),
                    field("protectionGearBluntDurabilityDamageScale", "Protection Gear Blunt Durability Damage Scale", "number", {step: "0.01"}),
                );
                break;
            case "attachments":
                if (item.subcategory === "Magazines") {
                    fields.push(
                        field("capacity", "Capacity"),
                        field("caliber", "Caliber", "select", {options: [...CALIBERS]}),
                        field("ADSSpeedModifier", "ADS Speed Modifier", "number", {step: "0.01"}),
                        field("ergonomicsModifier", "Ergonomics Modifier", "number", {step: "0.01"}),
                    );
                } else if (item.subcategory === "Sights") {
                    fields.push(
                        field("magnification", "Magnification", "number", {step: "0.1"}),
                        field("zeroedDistanceValue", "Zeroed Distance"),
                    );
                } else if (item.subcategory === "Tactical") {
                    fields.push(
                        field("traceDistance", "Trace Distance"),
                    );
                }
                fields.push(
                    // field("attachmentModifier.headDamageScaleModifier", "Head Damage Scale Modifier", "number", { step: "0.01" }),
                    // field("attachmentModifier.bulletVelocityModifier", "Bullet Velocity Modifier", "number", { step: "0.01" }),
                    // field("attachmentModifier.gunHitDamageModifier", "Gun Hit Damage Modifier", "number", { step: "0.01" }),
                    // field("attachmentModifier.damageDropModifer", "Damage Drop Modifier", "number", { step: "0.01" }),
                    field("attachmentModifier.ADSSpeedModifier", "ADS Speed Modifier", "number", {step: "0.01"}),
                    field("attachmentModifier.ergonomicsModifier", "Ergonomics Modifier", "number", {step: "0.01"}),
                    // field("attachmentModifier.shotGunBulletSpreadModifer", "Shotgun Bullet Spread Modifier", "number", { step: "0.01" }),
                    field("attachmentModifier.verticalRecoilModifier", "Vertical Recoil Modifier", "number", {step: "0.01"}),
                    field("attachmentModifier.horizontalRecoilModifier", "Horizontal Recoil Modifier", "number", {step: "0.01"}),
                    // field("attachmentModifier.shiftMomentumModifer", "Shift Momentum Modifier", "number", { step: "0.01" }),
                    // field("attachmentModifier.shiftStiffnessModifer", "Shift Stiffness Modifier", "number", { step: "0.01" }),
                    // field("attachmentModifier.yawMomentumModifer", "Yaw Momentum Modifier", "number", { step: "0.01" }),
                    // field("attachmentModifier.yawStiffnessModifer", "Yaw Stiffness Modifier", "number", { step: "0.01" }),
                    // field("attachmentModifier.rollMomentumModifer", "Roll Momentum Modifier", "number", { step: "0.01" }),
                    // field("attachmentModifier.rollStiffnessModifer", "Roll Stiffness Modifier", "number", { step: "0.01" }),
                    // field("attachmentModifier.pitchMomentumModifer", "Pitch Momentum Modifier", "number", { step: "0.01" }),
                    // field("attachmentModifier.pitchStiffnessModifer", "Pitch Stiffness Modifier", "number", { step: "0.01" }),
                    // field("attachmentData.recoilPitchInfluent", "Recoil Pitch Influent", "number", { step: "0.01" }),
                    // field("attachmentData.recoilYawInfluent", "Recoil Yaw Influent", "number", { step: "0.01" }),
                );
                break;
            case "gear":
                if (item.subcategory === "Body Armor" || item.subcategory === "Helmets" || item.subcategory === "Face Shields") {
                    fields.push(
                        field("armorClass", "Armor Class"),
                        field("maxDurability", "Max Durability"),
                        field("currentDurability", "Current Durability"),
                        field("durabilityDamageScalar", "Durability Damage Scalar", "number", {step: "0.01"}),
                        field("bluntDamageScalar", "Blunt Damage Scalar", "number", {step: "0.01"}),
                    );
                }
                if (item.subcategory === "Helmets") {
                    fields.push(
                        field("soundMix", "Sound Mix", "select", {options: ["default", "Delta", "OPSWAT", "MuffledGeneral"]}),
                    );
                }
                if (item.subcategory === "Backpacks") {
                    fields.push(
                        field("sizes", "Sizes", "text"),
                    );
                }
                break;
            case "medicine":
                if (item.subcategory === "Bandages") {
                    fields.push(
                        field("canHealDeepWound", "Can Heal Deep Wound", "checkbox"),
                    );
                } else if (item.subcategory === "Suturing Tools") {
                    fields.push(
                        field("hpPercentage", "HP Percentage"),
                        field("useTime", "Use Time"),
                        field("usesCount", "Uses Count"),
                        field("brokenHP", "Broken HP"),
                    );
                } else if (item.subcategory === "Painkillers") {
                    fields.push(
                        field("usesCount", "Uses Count"),
                        field("effectTime", "Effect Time"),
                        field("energyFactor", "Energy Factor", "number", {step: "0.01"}),
                        field("hydraFactor", "Hydration Factor", "number", {step: "0.01"}),
                        field("sideEffectTime", "Side Effect Time"),
                    );
                } else if (item.subcategory === "Stims") {
                    fields.push(
                        field("useTime", "Use Time"),
                        field("effectTime", "Effect Time"),
                    );
                } else if (item.subcategory === "Syringes") {
                    fields.push(
                        field("capacity", "Capacity"),
                        field("cureSpeed", "Cure Speed"),
                        field("canReduceBleeding", "Can Reduce Bleeding", "checkbox"),
                    );
                }
                break;
            case "provisions":
                fields.push(
                    field("capacity", "Capacity"),
                    field("threshold", "Threshold"),
                    field("consumptionSpeed", "Consumption Speed"),
                    field("energyFactor", "Energy Factor"),
                    field("hydraFactor", "Hydration Factor"),
                );
                break;
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
                    <Edit2 className="h-4 w-4"/>
                    Suggest Edit
                </Button>
            )}

            <Dialog open={open} onOpenChange={setOpen}>
                <DialogContent className="max-w-2xl max-h-[90vh]">
                    <DialogHeader>
                        <DialogTitle>Suggest Correction: {item.name}</DialogTitle>
                        <DialogDescription>
                            Help us improve the accuracy of this item&#39;s data. Only fill in the fields you want to
                            change.
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
                                            render={({field}) => (
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
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="proposedData.description"
                                            render={({field}) => (
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
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />

                                        <FormField
                                            control={form.control}
                                            name="proposedData.tips"
                                            render={({field}) => (
                                                <FormItem>
                                                    <FormLabel>Tips</FormLabel>
                                                    <FormControl>
                                                        <Textarea
                                                            placeholder={item.tips || "No tips"}
                                                            className="min-h-[100px]"
                                                            {...field}
                                                            value={field.value || ""}
                                                        />
                                                    </FormControl>
                                                    <FormDescription>
                                                        Current: {item.description || "No description"}
                                                    </FormDescription>
                                                    <FormMessage/>
                                                </FormItem>
                                            )}
                                        />
                                    </TabsContent>

                                    <TabsContent value="stats" className="space-y-4 mt-4">
                                        {getStatsFields().map((statField) => {
                                            const currentValue = getNestedValue(currentStats, statField.name);
                                            return (
                                                <FormField
                                                    key={statField.name}
                                                    control={form.control}
                                                    name={`proposedData.stats.${statField.name}`}
                                                    render={({field}) => (
                                                        <FormItem>
                                                            <FormLabel>{statField.label}</FormLabel>
                                                            <FormControl>
                                                                {statField.type === "checkbox" ? (
                                                                    <input
                                                                        type="checkbox"
                                                                        className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                                                                        checked={!!field.value}
                                                                        onChange={(e) => field.onChange(e.target.checked)}
                                                                    />
                                                                ) : statField.type === "select" ? (
                                                                    <select
                                                                        className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background"
                                                                        {...field}
                                                                        value={field.value}
                                                                    >
                                                                        {statField.options?.map((option: string) => (
                                                                            <option key={option} value={option}>
                                                                                {option}
                                                                            </option>
                                                                        ))}
                                                                    </select>
                                                                ) : (
                                                                    <Input
                                                                        type={statField.type}
                                                                        step={statField.step}
                                                                        placeholder={String(currentValue ?? "N/A")}
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
                                                                Current: {String(currentValue ?? "N/A")}
                                                            </FormDescription>
                                                            <FormMessage/>
                                                        </FormItem>
                                                    )}
                                                />
                                            );
                                        })}
                                    </TabsContent>
                                </Tabs>

                                <div className="mt-6">
                                    <FormField
                                        control={form.control}
                                        name="reason"
                                        render={({field}) => (
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
                                                <FormMessage/>
                                            </FormItem>
                                        )}
                                    />
                                </div>

                                <Alert className="mt-4">
                                    <AlertCircle className="h-4 w-4"/>
                                    <AlertDescription>
                                        Your suggestion will be reviewed by our team. If approved, the changes will be
                                        applied to the item.
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

export function ItemCorrectionFormAuth({ item, trigger }: ItemCorrectionFormProps) {
    const { data: session } = useSession();

    // No session = no button/trigger rendered at all
    if (!session) {
        return null;
    }

    // Session exists = render the full form component
    return <ItemCorrectionForm item={item} trigger={trigger} />;
}