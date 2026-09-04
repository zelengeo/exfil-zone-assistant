'use client';

import React from 'react';
import { cn } from '@/lib/utils';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { armorClassColor, armorClassLabel } from '@/lib/protection/armorClassScale';
import type { BodyArmor, FaceShield, Helmet } from '@/types/items';
import type { Defender } from '../utils/target-model';

/**
 * What the target is wearing.
 *
 * Three pieces and two durability tracks, and one rule the picker enforces rather than explains:
 * a face shield is only offered for a helmet that can carry it, and dropping the helmet drops the
 * shield with it. Worn without a helmet under it the shield's owner cast fails and it protects
 * nothing at all — so offering it would be offering a setting that does nothing.
 */

export interface DefenderPanelProps {
    defender: Defender;
    onChange: (patch: Partial<Defender>) => void;
    vests: BodyArmor[];
    helmets: Helmet[];
    shields: FaceShield[];
    className?: string;
}

const NONE = '__none__';

function ClassBadge({ value }: { value: number | undefined }) {
    if (!value) return null;
    return (
        <span className="micro-label flex items-center gap-1.5">
            <span
                className="w-2.5 h-2.5 shrink-0"
                style={{ backgroundColor: armorClassColor(value) }}
                aria-hidden="true"
            />
            Class {armorClassLabel(value)}
        </span>
    );
}

function Condition({
    label, value, onChange,
}: {
    label: string;
    value: number;
    onChange: (value: number) => void;
}) {
    return (
        <label className="flex items-center gap-2 mt-2 min-w-0">
            <span className="micro-label text-ink-600 shrink-0">{label}</span>
            <input
                type="range"
                min={0}
                max={100}
                step={5}
                value={Math.round(value * 100)}
                onChange={(event) => onChange(Number(event.target.value) / 100)}
                className="flex-1 min-w-0 h-2 bg-steel-700 appearance-none cursor-pointer
                    [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-4
                    [&::-webkit-slider-thumb]:h-8 [&::-webkit-slider-thumb]:bg-ember
                    [&::-moz-range-thumb]:w-4 [&::-moz-range-thumb]:h-8 [&::-moz-range-thumb]:bg-ember
                    [&::-moz-range-thumb]:border-0"
            />
            <span className="font-mono tabular text-sm text-ink-200 w-10 shrink-0 text-right">
                {Math.round(value * 100)}%
            </span>
        </label>
    );
}

export default function DefenderPanel({
    defender, onChange, vests, helmets, shields, className,
}: DefenderPanelProps) {
    // A shield clips to a specific helmet: the helmet's own `canAttach` list is the compatibility.
    const compatible = defender.helmet
        ? shields.filter((shield) => defender.helmet?.stats.canAttach?.includes(shield.id))
        : [];

    return (
        <section className={cn('border border-line-800 bg-steel-800 p-4', className)}>
            <h2 className="eyebrow mb-3">Target</h2>

            <div className="space-y-4">
                <div>
                    <Select
                        value={defender.vest?.id ?? NONE}
                        onValueChange={(value) => onChange({
                            vest: value === NONE ? null : vests.find((item) => item.id === value) ?? null,
                        })}
                    >
                        <SelectTrigger className="w-full min-h-11" aria-label="Body armour">
                            <SelectValue placeholder="No vest" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE}>No vest</SelectItem>
                            {vests.map((vest) => (
                                <SelectItem key={vest.id} value={vest.id}>{vest.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {defender.vest && (
                        <>
                            <div className="mt-1 text-ink-500">
                                <ClassBadge value={defender.vest.stats.armorClass} />
                            </div>
                            <Condition
                                label="Durability"
                                value={defender.vestCondition}
                                onChange={(value) => onChange({ vestCondition: value })}
                            />
                        </>
                    )}
                </div>

                <div>
                    <Select
                        value={defender.helmet?.id ?? NONE}
                        onValueChange={(value) => onChange({
                            helmet: value === NONE ? null : helmets.find((item) => item.id === value) ?? null,
                            faceShield: null,
                        })}
                    >
                        <SelectTrigger className="w-full min-h-11" aria-label="Helmet">
                            <SelectValue placeholder="No helmet" />
                        </SelectTrigger>
                        <SelectContent>
                            <SelectItem value={NONE}>No helmet</SelectItem>
                            {helmets.map((helmet) => (
                                <SelectItem key={helmet.id} value={helmet.id}>{helmet.name}</SelectItem>
                            ))}
                        </SelectContent>
                    </Select>
                    {defender.helmet && (
                        <>
                            <div className="mt-1 text-ink-500">
                                <ClassBadge value={defender.helmet.stats.armorClass} />
                            </div>
                            <Condition
                                label="Durability"
                                value={defender.helmetCondition}
                                onChange={(value) => onChange({ helmetCondition: value })}
                            />
                        </>
                    )}
                </div>

                {defender.helmet && (
                    <div>
                        <Select
                            value={defender.faceShield?.id ?? NONE}
                            onValueChange={(value) => onChange({
                                faceShield: value === NONE
                                    ? null
                                    : compatible.find((item) => item.id === value) ?? null,
                            })}
                            disabled={compatible.length === 0}
                        >
                            <SelectTrigger className="w-full min-h-11" aria-label="Face shield">
                                <SelectValue placeholder="No visor" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value={NONE}>No visor</SelectItem>
                                {compatible.map((shield) => (
                                    <SelectItem key={shield.id} value={shield.id}>{shield.name}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {defender.faceShield && (
                            <div className="mt-1 text-ink-500">
                                <ClassBadge value={defender.faceShield.stats.armorClass} />
                            </div>
                        )}
                        {compatible.length === 0 && (
                            <p className="micro-label text-ink-700 mt-1">
                                Nothing clips to this helmet.
                            </p>
                        )}
                    </div>
                )}
            </div>
        </section>
    );
}
