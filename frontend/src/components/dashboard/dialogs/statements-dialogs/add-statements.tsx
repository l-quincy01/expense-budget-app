"use client";

import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogDescription,
} from "@/components/ui/dialog";
import { Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

import { toast } from "sonner";
import { useParams } from "next/navigation";
import { getErrorMessage } from "@/lib/utils";
import { useApi } from "@/lib/api";
import {
  dashboardApi,
  getIngestTransactionsInserted,
} from "@/lib/api-adapters";

type AddStatementProps = {
  onUploaded?: () => Promise<void> | void;
};

export default function AddStatement({ onUploaded }: AddStatementProps) {
  const { isSignedIn } = useAuth();
  const api = useApi();
  const [files, setFiles] = useState<File[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const params = useParams();
  const dashboardName = params?.dashboardName as string;
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    setFiles(selected);
  };

  const onSubmit = async () => {
    try {
      if (!isSignedIn) {
        toast.error("Sign in to upload a statement.");
        return;
      }

      setIsUploading(true);

      // ADD: show loading toast
      const uploadToastId = toast.loading(
        "Uploading and processing your statement(s)…"
      );

      const data = await dashboardApi.uploadStatement(api, dashboardName, files);
      setFiles([]);

      setIsOpen(false);
      await onUploaded?.();

      if (uploadToastId !== undefined) toast.dismiss(uploadToastId);
      const transactionsInserted = getIngestTransactionsInserted(data);
      toast.success(`Dashboard "${dashboardName}" updated.`, {
        description:
          transactionsInserted != null
            ? `${transactionsInserted} transactions ingested.`
            : undefined,
        action: {
          label: "View",
          onClick: () => onUploaded?.(),
        },
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Upload failed.");
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  const displayDashboardName = decodeURIComponent(dashboardName);

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="">
            <div className="flex flex-row items-center gap-2 p-2 bg-accent-foreground/90 hover:bg-accent-foreground/75 rounded-lg cursor-pointer">
              <Plus size={18} className="text-accent" />
            </div>
          </button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {" "}
              Add statement for:
              {displayDashboardName}
            </DialogTitle>
            <DialogDescription>
              Build your dashboard with more statements.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 ">
            <Label htmlFor="fileUpload">Bank Statement (PDF)</Label>
            <Input
              id="fileUpload"
              type="file"
              accept="application/pdf"
              multiple
              onChange={onFileChange}
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFiles([]);
                }}
              >
                Reset
              </Button>
              <Button onClick={onSubmit} disabled={isUploading || !isSignedIn}>
                {isUploading ? "Uploading..." : "Add"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
