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

import { useParams } from "next/navigation";
import { useUploadStatement } from "@/features/statements/hooks/useUploadStatement";

type AddStatementProps = {
  onUploaded?: () => Promise<void> | void;
};

export default function AddStatement({ onUploaded }: AddStatementProps) {
  const { isSignedIn } = useAuth();
  const { uploadStatement, isUploading, reset } = useUploadStatement();
  const [files, setFiles] = useState<File[]>([]);

  const [isOpen, setIsOpen] = useState(false);

  const params = useParams();
  const dashboardName = params?.dashboardName as string;
  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files ? Array.from(e.target.files) : [];
    setFiles(selected);
  };

  const onSubmit = async () => {
    const success = await uploadStatement({
      dashboardName,
      files,
      onUploaded,
    });

    if (success) {
      setFiles([]);
      setIsOpen(false);
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
                  reset();
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
