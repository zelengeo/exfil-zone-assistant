// src/app/admin/corrections/page.tsx
"use client";

import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {Badge, badgeVariants} from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
    Check,
    X,
    Eye,
    Search,
    ChevronLeft,
    ChevronRight,
    AlertCircle,
    Download,
    RefreshCw,
} from "lucide-react";
import { toast } from "sonner";
import {CorrectionStatus, IPopulatedDataCorrection} from "@/lib/schemas/dataCorrection";
import { formatDistanceToNow } from "date-fns";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {VariantProps} from "class-variance-authority";

export default function CorrectionsAdminPage() {
    const [corrections, setCorrections] = useState<IPopulatedDataCorrection[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedCorrection, setSelectedCorrection] = useState<IPopulatedDataCorrection | null>(null);
    const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
    const [reviewNotes, setReviewNotes] = useState("");
    const [filters, setFilters] = useState({
        status: "pending",
        entityType: "all",
        search: "",
    });
    const [pagination, setPagination] = useState({
        page: 1,
        limit: 20,
        total: 0,
        pages: 0,
    });

    // Fetch corrections
    const fetchCorrections = async () => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                page: pagination.page.toString(),
                limit: pagination.limit.toString(),
                ...(filters.status !== "all" && { status: filters.status }),
                ...(filters.entityType !== "all" && { entityType: filters.entityType }),
            });

            const response = await fetch(`/api/admin/corrections?${params}`);
            const data = await response.json();

            if (response.ok) {
                setCorrections(data.corrections);
                setPagination(data.pagination);
            }
        } catch (error) {
            console.error("Failed to fetch corrections:", error);
            toast.error("Error", {
                description: "Failed to load corrections",
            });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCorrections();
    }, [pagination.page, filters]);

    // Handle review submission
    const handleReview = async (status: "approved" | "rejected") => {
        if (!selectedCorrection) return;

        try {
            const response = await fetch(`/api/admin/corrections/${selectedCorrection._id}`, {
                method: "PATCH",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    status,
                    reviewNotes,
                }),
            });

            if (response.ok) {
                toast.success("Success", {
                    description: `Correction ${status}`,
                });
                setReviewDialogOpen(false);
                setSelectedCorrection(null);
                setReviewNotes("");
                await fetchCorrections();
            } else {
                throw new Error("Failed to review correction");
            }
        } catch (error) {
            console.error("Review error:", error);
            toast.error("Error",{
                description: "Failed to submit review",
            });
        }
    };

    // Export corrections for local processing
    const exportCorrections = async () => {
        try {
            const params = new URLSearchParams({
                status: "approved",
                limit: "1000", // Get all approved corrections
            });

            const response = await fetch(`/api/admin/corrections?${params}`);
            const data = await response.json();

            if (response.ok) {
                const exportData = data.corrections.map((c: IPopulatedDataCorrection) => ({
                    id: c._id,
                    entityType: c.entityType,
                    entityId: c.entityId,
                    proposedData: c.proposedData,
                    reason: c.reason,
                    submittedBy: c.userId?.username || "Anonymous",
                    submittedAt: c.createdAt,
                }));

                const blob = new Blob([JSON.stringify(exportData, null, 2)], {
                    type: "application/json",
                });
                const url = URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `corrections_export_${new Date().toISOString().split("T")[0]}.json`;
                a.click();
                URL.revokeObjectURL(url);

                toast.success("Export successful", {
                    description: `Exported ${exportData.length} approved corrections`,
                });
            }
        } catch (error) {
            console.error("Export error:", error);
            toast.error("Error",{
                description: "Failed to export corrections",
            });
        }
    };

    // Status badge styling
    const getStatusBadge = (status: CorrectionStatus) => {
        const variants: Record<CorrectionStatus, { variant: VariantProps<typeof badgeVariants>["variant"]; label: string }> = {
            pending: { variant: "outline", label: "Pending" },
            approved: { variant: "default", label: "Approved" },
            rejected: { variant: "destructive", label: "Rejected" },
            implemented: { variant: "default", label: "Implemented" },
        };

        const config = variants[status];
        return <Badge variant={config.variant}>{config.label}</Badge>;
    };

    // Compute changes on-the-fly
    return (
        <div className="container mx-auto py-8">
            <div className="mb-8">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold mb-2">Data Corrections</h1>
                        <p className="text-muted-foreground">
                            Review and manage user-submitted data corrections
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            onClick={() => fetchCorrections()}
                            disabled={loading}
                        >
                            <RefreshCw className={`h-4 w-4 mr-2 ${loading ? "animate-spin" : ""}`} />
                            Refresh
                        </Button>
                        <Button onClick={exportCorrections}>
                            <Download className="h-4 w-4 mr-2" />
                            Export Approved
                        </Button>
                    </div>
                </div>
            </div>

            <Alert className="mb-6">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                    Approved corrections will be exported for local processing. Use your script to apply changes to the JSON files, then mark them as implemented.
                </AlertDescription>
            </Alert>

            {/* Filters */}
            <div className="flex gap-4 mb-6">
                <Select
                    value={filters.status}
                    onValueChange={(value) => setFilters({ ...filters, status: value })}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by status" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Statuses</SelectItem>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="approved">Approved</SelectItem>
                        <SelectItem value="rejected">Rejected</SelectItem>
                        <SelectItem value="implemented">Implemented</SelectItem>
                    </SelectContent>
                </Select>

                <Select
                    value={filters.entityType}
                    onValueChange={(value) => setFilters({ ...filters, entityType: value })}
                >
                    <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="Filter by type" />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="all">All Types</SelectItem>
                        <SelectItem value="item">Items</SelectItem>
                        <SelectItem value="task">Tasks</SelectItem>
                        <SelectItem value="npc">NPCs</SelectItem>
                        <SelectItem value="location">Locations</SelectItem>
                        <SelectItem value="quest">Quests</SelectItem>
                    </SelectContent>
                </Select>

                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                        placeholder="Search by entity ID..."
                        value={filters.search}
                        onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                        className="pl-10"
                    />
                </div>
            </div>

            {/* Corrections Table */}
            <div className="border rounded-lg">
                <Table>
                    <TableHeader>
                        <TableRow>
                            <TableHead>Type</TableHead>
                            <TableHead>Entity ID</TableHead>
                            <TableHead>Changes</TableHead>
                            <TableHead>Submitted By</TableHead>
                            <TableHead>Status</TableHead>
                            <TableHead>Submitted</TableHead>
                            <TableHead className="text-right">Actions</TableHead>
                        </TableRow>
                    </TableHeader>
                    <TableBody>
                        {loading ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    Loading corrections...
                                </TableCell>
                            </TableRow>
                        ) : corrections.length === 0 ? (
                            <TableRow>
                                <TableCell colSpan={7} className="text-center py-8">
                                    No corrections found
                                </TableCell>
                            </TableRow>
                        ) : (
                            corrections.map((correction) => (
                                <TableRow key={correction._id.toString()}>
                                    <TableCell className="capitalize">{correction.entityType}</TableCell>
                                    <TableCell className="font-mono text-sm">{correction.entityId}</TableCell>
                                    <TableCell>
                                        {Object.keys(correction.proposedData).length} fields
                                    </TableCell>
                                    <TableCell>
                                        {correction.userId ? (
                                            <div className="flex items-center gap-2">
                        <span className="text-sm">
                          {correction.userId?.username || "Unknown"}
                        </span>
                                            </div>
                                        ) : (
                                            <span className="text-muted-foreground">Anonymous</span>
                                        )}
                                    </TableCell>
                                    <TableCell>{getStatusBadge(correction.status)}</TableCell>
                                    <TableCell className="text-sm text-muted-foreground">
                                        {formatDistanceToNow(new Date(correction.createdAt), { addSuffix: true })}
                                    </TableCell>
                                    <TableCell className="text-right">
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => {
                                                setSelectedCorrection(correction);
                                                setReviewDialogOpen(true);
                                            }}
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            Review
                                        </Button>
                                    </TableCell>
                                </TableRow>
                            ))
                        )}
                    </TableBody>
                </Table>
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-4">
                    <p className="text-sm text-muted-foreground">
                        Showing {((pagination.page - 1) * pagination.limit) + 1} to{" "}
                        {Math.min(pagination.page * pagination.limit, pagination.total)} of{" "}
                        {pagination.total} corrections
                    </p>
                    <div className="flex gap-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination({ ...pagination, page: pagination.page - 1 })}
                            disabled={pagination.page === 1}
                        >
                            <ChevronLeft className="h-4 w-4" />
                            Previous
                        </Button>
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setPagination({ ...pagination, page: pagination.page + 1 })}
                            disabled={pagination.page === pagination.pages}
                        >
                            Next
                            <ChevronRight className="h-4 w-4" />
                        </Button>
                    </div>
                </div>
            )}

            {/* Review Dialog */}
            <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
                <DialogContent className="max-w-3xl max-h-[90vh]">
                    {selectedCorrection && (
                        <>
                            <DialogHeader>
                                <DialogTitle>
                                    Review Correction: {selectedCorrection.entityType} - {selectedCorrection.entityId}
                                </DialogTitle>
                                <DialogDescription>
                                    Review the proposed changes and decide whether to approve or reject them.
                                </DialogDescription>
                            </DialogHeader>

                            <ScrollArea className="h-[400px] pr-4">
                                <div className="space-y-4">
                                    <div>
                                        <h3 className="font-semibold mb-2">Proposed Changes</h3>
                                        <div className="space-y-2">
                                            {Object.entries(selectedCorrection.proposedData).map(([key, value]) => (
                                                <div key={key} className="border rounded-lg p-3">
                                                    <p className="font-medium text-sm">{key}</p>
                                                    <code className="block mt-1 p-2 bg-muted rounded text-sm">
                                                        {typeof value === 'object'
                                                            ? JSON.stringify(value, null, 2)
                                                            : String(value)}
                                                    </code>
                                                </div>
                                            ))}
                                        </div>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Reason</h3>
                                        <p className="text-sm p-3 bg-muted rounded">{selectedCorrection.reason}</p>
                                    </div>

                                    <div>
                                        <h3 className="font-semibold mb-2">Metadata</h3>
                                        <div className="space-y-1 text-sm">
                                            <p>
                                                <span className="text-muted-foreground">Submitted by:</span>{" "}
                                                {selectedCorrection.userId
                                                    ? selectedCorrection.userId.username || "Unknown user"
                                                    : "Anonymous"}
                                            </p>
                                            <p>
                                                <span className="text-muted-foreground">Submitted:</span>{" "}
                                                {formatDistanceToNow(new Date(selectedCorrection.createdAt), { addSuffix: true })}
                                            </p>
                                            <p>
                                                <span className="text-muted-foreground">Current status:</span>{" "}
                                                {getStatusBadge(selectedCorrection.status)}
                                            </p>
                                        </div>
                                    </div>

                                    {selectedCorrection.status !== "pending" && (
                                        <div>
                                            <h3 className="font-semibold mb-2">Review History</h3>
                                            <div className="space-y-1 text-sm p-3 bg-muted rounded">
                                                {selectedCorrection.reviewedBy && (
                                                    <p>
                                                        <span className="text-muted-foreground">Reviewed by:</span>{" "}
                                                        {selectedCorrection.reviewedBy.username || "Unknown"}
                                                    </p>
                                                )}
                                                {selectedCorrection.reviewedAt && (
                                                    <p>
                                                        <span className="text-muted-foreground">Reviewed at:</span>{" "}
                                                        {new Date(selectedCorrection.reviewedAt).toLocaleString()}
                                                    </p>
                                                )}
                                                {selectedCorrection.reviewNotes && (
                                                    <div className="mt-2">
                                                        <span className="text-muted-foreground">Notes:</span>
                                                        <p className="mt-1">{selectedCorrection.reviewNotes}</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    )}

                                    {selectedCorrection.status === "pending" && (
                                        <div>
                                            <label className="text-sm font-medium">Review Notes (Optional)</label>
                                            <Textarea
                                                placeholder="Add notes about your decision..."
                                                value={reviewNotes}
                                                onChange={(e) => setReviewNotes(e.target.value)}
                                                className="mt-2"
                                            />
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>

                            <DialogFooter className="gap-2">
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setReviewDialogOpen(false);
                                        setSelectedCorrection(null);
                                        setReviewNotes("");
                                    }}
                                >
                                    Close
                                </Button>
                                {selectedCorrection.status === "pending" && (
                                    <>
                                        <Button
                                            variant="destructive"
                                            onClick={() => handleReview("rejected")}
                                        >
                                            <X className="h-4 w-4 mr-1" />
                                            Reject
                                        </Button>
                                        <Button
                                            onClick={() => handleReview("approved")}
                                        >
                                            <Check className="h-4 w-4 mr-1" />
                                            Approve
                                        </Button>
                                    </>
                                )}
                            </DialogFooter>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    );
}