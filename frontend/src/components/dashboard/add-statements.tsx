/* eslint-disable @typescript-eslint/no-explicit-any */
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
import { CopyPlus, FileText, LayoutDashboard, Plus } from "lucide-react";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@clerk/nextjs";

import { toast } from "sonner";
import { useParams } from "next/navigation";

type IngestResult = {
  userId: string;
  month: string;
  transactionsInserted: number;
  incomeExpensesInserted: number;
  categoryRowsInserted: number;
};

export default function AddStatement() {
  const { isSignedIn, userId, getToken } = useAuth();
  const [files, setFiles] = useState<File[]>([]);

  const [isOpen, setIsOpen] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<IngestResult | null>(null);

  const params = useParams();
  const dashboardName = params?.dashboardName as string;

  const apiBase = process.env.NEXT_PUBLIC_API_BASE || "";

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    setFiles(selected);
  };

  const onSubmit = async () => {
    try {
      setError(null);
      if (!isSignedIn) return setError("Sign in to upload a statement.");
      if (!files) return setError("Please select a PDF bank statement.");

      const token = await getToken();
      if (!token) throw new Error("No Clerk token available.");

      const form = new FormData();
      form.append("dashboardName", dashboardName);
      files.forEach((file) => {
        form.append("pdfs", file, file.name);
      });

      setIsUploading(true);

      // ADD: show loading toast
      let uploadToastId: string | number | undefined;
      uploadToastId = toast.loading(
        "Uploading and processing your statement(s)…"
      );

      const res = await fetch(`${apiBase}/api/dashboard/create`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
        body: form,
      });

      if (!res.ok) throw new Error(await res.text());

      const data = await res.json();
      setResult(data.nodeResponse || data);
      setFiles([]);

      setIsOpen(false);

      if (uploadToastId !== undefined) toast.dismiss(uploadToastId);
      toast.success(`Dashboard "${dashboardName}" created.`, {
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
              dashboardName
            )}`;
          },
        },
      });
    } catch (err: any) {
      const msg = err?.message || "Upload failed.";
      setError(msg);

      toast.error(msg);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogTrigger asChild>
          <button className="">
            <div className="flex flex-row items-center gap-2 p-2 bg-accent-foreground/90 hover:bg-accent-foreground/75 rounded-lg cursor-pointer">
              {/* <FileText className="text-accent" strokeWidth={1.5} /> */}
              <Plus size={18} className="text-accent" />
              {/* <span className="text-accent">Add </span> */}
            </div>
          </button>
        </DialogTrigger>

        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {" "}
              Add statement for:
              {dashboardName}
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
                  setError(null);
                  setFiles([]);
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
