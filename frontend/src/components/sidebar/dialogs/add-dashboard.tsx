import React, { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { CopyPlus, LayoutDashboard } from "lucide-react";
import { FileUpload } from "@/components/ui/file-upload";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export default function AddDashboard() {
  const [files, setFiles] = useState<File[]>([]);
  const handleFileUpload = (files: File[]) => {
    setFiles(files);
    console.log(files);
  };

  return (
    <Dialog>
      <DialogTrigger className="w-full">
        <div className="flex flex-row items-center  gap-2 p-2 bg-accent-foreground/90 hover:bg-accent-foreground/75 rounded-2xl cursor-pointer">
          <CopyPlus className="text-accent" strokeWidth={1.5} />
          <span className="text-accent"> New Dashboard</span>
        </div>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Dashboard </DialogTitle>
        </DialogHeader>
        <Input id="dashboard-name" placeholder="Dashboard Name" type="text" />

        <div className="flex flex-col gap-2">
          <Label htmlFor="fileUpload">Bank Statement</Label>
          <div id="fileUpload" className="border rounded-xl">
            <Input type="file" onChange={() => handleFileUpload} />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
