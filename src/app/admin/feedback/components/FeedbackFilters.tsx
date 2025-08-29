// src/components/admin/FeedbackFilters.tsx
'use client';

import React from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { X, Filter } from 'lucide-react';

interface FeedbackFiltersProps {
    currentFilters: {
        status?: string;
        type?: string;
        priority?: string;
        userId?: string;
    };
}

export function FeedbackFilters({ currentFilters }: FeedbackFiltersProps) {
    const router = useRouter();
    const searchParams = useSearchParams();

    const updateFilter = (key: string, value: string | null) => {
        const params = new URLSearchParams(searchParams);

        if (value && value !== 'all') {
            params.set(key, value);
        } else {
            params.delete(key);
        }

        // Reset page when filters change
        params.delete('page');

        router.push(`?${params.toString()}`);
    };

    const clearAllFilters = () => {
        router.push('/admin/feedback');
    };

    const activeFilterCount = Object.values(currentFilters).filter(Boolean).length;

    return (
        <div className="space-y-4">
            {/* Filter Controls */}
            <div className="flex flex-wrap items-center gap-4">
                <div className="flex items-center gap-2">
                    <Filter className="h-4 w-4 text-tan-500" />
                    <span className="text-sm font-medium text-tan-300">Filters:</span>
                </div>

                {/* Status Filter */}
                <div className="min-w-[140px]">
                    <Select
                        value={currentFilters.status || 'all'}
                        onValueChange={(value) => updateFilter('status', value)}
                    >
                        <SelectTrigger className="bg-military-700 border-military-600 text-tan-100 h-9">
                            <SelectValue placeholder="Status" />
                        </SelectTrigger>
                        <SelectContent className="bg-military-800 border-military-600">
                            <SelectItem value="all" className="text-tan-100 focus:bg-military-700">
                                All Status
                            </SelectItem>
                            <SelectItem value="new" className="text-tan-100 focus:bg-military-700">
                                New
                            </SelectItem>
                            <SelectItem value="in_review" className="text-tan-100 focus:bg-military-700">
                                In Review
                            </SelectItem>
                            <SelectItem value="accepted" className="text-tan-100 focus:bg-military-700">
                                Accepted
                            </SelectItem>
                            <SelectItem value="implemented" className="text-tan-100 focus:bg-military-700">
                                Implemented
                            </SelectItem>
                            <SelectItem value="rejected" className="text-tan-100 focus:bg-military-700">
                                Rejected
                            </SelectItem>
                            <SelectItem value="duplicate" className="text-tan-100 focus:bg-military-700">
                                Duplicate
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Type Filter */}
                <div className="min-w-[140px]">
                    <Select
                        value={currentFilters.type || 'all'}
                        onValueChange={(value) => updateFilter('type', value)}
                    >
                        <SelectTrigger className="bg-military-700 border-military-600 text-tan-100 h-9">
                            <SelectValue placeholder="Type" />
                        </SelectTrigger>
                        <SelectContent className="bg-military-800 border-military-600">
                            <SelectItem value="all" className="text-tan-100 focus:bg-military-700">
                                All Types
                            </SelectItem>
                            <SelectItem value="bug" className="text-tan-100 focus:bg-military-700">
                                Bug Report
                            </SelectItem>
                            <SelectItem value="feature" className="text-tan-100 focus:bg-military-700">
                                Feature Request
                            </SelectItem>
                            <SelectItem value="data_correction" className="text-tan-100 focus:bg-military-700">
                                Data Issue
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Priority Filter */}
                <div className="min-w-[140px]">
                    <Select
                        value={currentFilters.priority || 'all'}
                        onValueChange={(value) => updateFilter('priority', value)}
                    >
                        <SelectTrigger className="bg-military-700 border-military-600 text-tan-100 h-9">
                            <SelectValue placeholder="Priority" />
                        </SelectTrigger>
                        <SelectContent className="bg-military-800 border-military-600">
                            <SelectItem value="all" className="text-tan-100 focus:bg-military-700">
                                All Priorities
                            </SelectItem>
                            <SelectItem value="critical" className="text-tan-100 focus:bg-military-700">
                                Critical
                            </SelectItem>
                            <SelectItem value="high" className="text-tan-100 focus:bg-military-700">
                                High
                            </SelectItem>
                            <SelectItem value="medium" className="text-tan-100 focus:bg-military-700">
                                Medium
                            </SelectItem>
                            <SelectItem value="low" className="text-tan-100 focus:bg-military-700">
                                Low
                            </SelectItem>
                        </SelectContent>
                    </Select>
                </div>

                {/* Clear Filters Button */}
                {activeFilterCount > 0 && (
                    <Button
                        variant="outline"
                        size="sm"
                        onClick={clearAllFilters}
                        className="border-military-600 text-tan-300 hover:bg-military-700 h-9"
                    >
                        <X className="h-4 w-4 mr-1" />
                        Clear ({activeFilterCount})
                    </Button>
                )}
            </div>

            {/* Active Filters Display */}
            {activeFilterCount > 0 && (
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-tan-500">Active filters:</span>

                    {currentFilters.status && (
                        <Badge
                            variant="secondary"
                            className="bg-military-700 text-tan-300 cursor-pointer hover:bg-military-600"
                            onClick={() => updateFilter('status', null)}
                        >
                            Status: {currentFilters.status.replace('_', ' ')}
                            <X className="h-3 w-3 ml-1" />
                        </Badge>
                    )}

                    {currentFilters.type && (
                        <Badge
                            variant="secondary"
                            className="bg-military-700 text-tan-300 cursor-pointer hover:bg-military-600"
                            onClick={() => updateFilter('type', null)}
                        >
                            Type: {currentFilters.type.replace('_', ' ')}
                            <X className="h-3 w-3 ml-1" />
                        </Badge>
                    )}

                    {currentFilters.priority && (
                        <Badge
                            variant="secondary"
                            className="bg-military-700 text-tan-300 cursor-pointer hover:bg-military-600"
                            onClick={() => updateFilter('priority', null)}
                        >
                            Priority: {currentFilters.priority}
                            <X className="h-3 w-3 ml-1" />
                        </Badge>
                    )}
                </div>
            )}
        </div>
    );
}