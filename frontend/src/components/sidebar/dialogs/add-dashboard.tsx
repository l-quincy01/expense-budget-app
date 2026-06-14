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
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { RiFunctionAddFill } from "react-icons/ri";
import { getErrorMessage } from "@/lib/utils";

type AddDashboardProps = {
  onCreated?: (dashboardName: string) => void | Promise<void>;
};

export default function AddDashboard({ onCreated }: AddDashboardProps) {
  const { isSignedIn, getToken } = useAuth();
  const router = useRouter();
  const [files, setFiles] = useState<File[]>([]);
  const [dashboardName, setDashboardName] = useState("");
  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";

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

      const token = await getToken();
      if (!token) throw new Error("No Clerk token available.");

      const form = new FormData();
      form.append("dashboardName", dashboardName);
      files.forEach((file) => {
        form.append("pdfs", file, file.name);
      });

      setIsUploading(true);

      // ADD: show loading toast
      const uploadToastId = toast.loading(
        "Uploading and processing your statement(s)…"
      );

      const res = await fetch(`${apiBase}/api/dashboards`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      const createdDashboardName = dashboardName;
      setFiles([]);
      setDashboardName("");
      setIsOpen(false);

      await onCreated?.(createdDashboardName);
      router.refresh();

      if (uploadToastId !== undefined) toast.dismiss(uploadToastId);
      toast.success(`Dashboard "${createdDashboardName}" created.`, {
        description:
          (data?.nodeResponse?.transactionsInserted ??
            data?.transactionsInserted) != null
            ? `${
                (data.nodeResponse || data).transactionsInserted
              } transactions ingested.`
            : undefined,
        action: {
          label: "View",
          onClick: () => {
            window.location.href = `/dashboard/${encodeURIComponent(
              createdDashboardName
            )}`;
          },
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
