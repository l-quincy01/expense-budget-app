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
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";
import { toast } from "sonner";
import { RiFunctionAddFill } from "react-icons/ri";
import { getErrorMessage } from "@/lib/utils";
import { useApi } from "@/lib/api";
import {
  dashboardApi,
  getIngestTransactionsInserted,
} from "@/lib/api-adapters";

type AddDashboardProps = {
  onCreated?: (dashboardName: string) => void | Promise<void>;
};

export default function AddDashboard({ onCreated }: AddDashboardProps) {
  const { isSignedIn } = useAuth();
  const api = useApi();
  const [files, setFiles] = useState<File[]>([]);
  const [dashboardName, setDashboardName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
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

      const data = await dashboardApi.create(api, dashboardName, files);
      const createdDashboardName = dashboardName;
      setFiles([]);
      setDashboardName("");
      setIsOpen(false);

      await onCreated?.(createdDashboardName);

      if (uploadToastId !== undefined) toast.dismiss(uploadToastId);
      const transactionsInserted = getIngestTransactionsInserted(data);
      toast.success(`Dashboard "${createdDashboardName}" created.`, {
        description:
          transactionsInserted != null
            ? `${transactionsInserted} transactions ingested.`
            : undefined,
        action: {
          label: "View",
          onClick: () => onCreated?.(createdDashboardName),
        },
      });
    } catch (err: unknown) {
      const msg = getErrorMessage(err, "Upload failed.");
      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <Button variant={"outline"}>
            <RiFunctionAddFill />

            <span className="">Add Dashboard</span>
          </Button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>Dashboard</DialogTitle>
            <DialogDescription>
              Upload a bank statement PDF to build your dashboard.
            </DialogDescription>
          </DialogHeader>

          <div className="flex flex-col gap-2 ">
            <Label htmlFor="dashboard-name">Dashboard Name</Label>
            <Input
              id="dashboard-name"
              placeholder="My October Finances"
              type="text"
              value={dashboardName}
              onChange={(e) => setDashboardName(e.target.value)}
            />

            <Label htmlFor="fileUpload">Bank Statement (PDF)</Label>
            <Input
              id="fileUpload"
              type="file"
              accept="application/pdf"
              onChange={onFileChange}
            />

            <div className="flex justify-end gap-2">
              <Button
                variant="outline"
                onClick={() => {
                  setFiles([]);
                  setDashboardName("");
                }}
              >
                Reset
              </Button>
              <Button onClick={onSubmit} disabled={isUploading || !isSignedIn}>
                {isUploading ? "Uploading..." : "Create"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
