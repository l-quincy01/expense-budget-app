"use client";

import { useAuth } from "@clerk/nextjs";
import { useCallback } from "react";
import { toast } from "sonner";
import { useApi } from "@/lib/api";
import {
  dashboardApi,
  getIngestTransactionsInserted,
} from "@/features/dashboard/api/dashboard-api";
import { getErrorMessage } from "@/lib/utils";
import { useUploadReducer } from "@/features/statements/hooks/useUploadReducer";

type CreateDashboardInput = {
  dashboardName: string;
  files: File[];
  onCreated?: (dashboardName: string) => Promise<void> | void;
};

export function useCreateDashboard() {
  const { isSignedIn } = useAuth();
  const api = useApi();
  const {
    status,
    error,
    isUploading,
    startUpload,
    markSuccess,
    markError,
    resetUpload,
  } = useUploadReducer();

  const createDashboard = useCallback(
    async ({ dashboardName, files, onCreated }: CreateDashboardInput) => {
      if (!isSignedIn) {
        const message = "Sign in to upload a statement.";
        markError(message);
        toast.error(message);
        return false;
      }

      startUpload();
      const uploadToastId = toast.loading(
        "Uploading and processing your statement(s)…"
      );

      try {
        const data = await dashboardApi.create(api, dashboardName, files);
        await onCreated?.(dashboardName);

        toast.dismiss(uploadToastId);
        const transactionsInserted = getIngestTransactionsInserted(data);
        toast.success(`Dashboard "${dashboardName}" created.`, {
          description:
            transactionsInserted != null
              ? `${transactionsInserted} transactions ingested.`
              : undefined,
          action: {
            label: "View",
            onClick: () => onCreated?.(dashboardName),
          },
        });
        markSuccess();
        return true;
      } catch (err: unknown) {
        toast.dismiss(uploadToastId);
        const message = getErrorMessage(err, "Upload failed.");
        markError(message);
        toast.error(message);
        return false;
      }
    },
    [api, isSignedIn, markError, markSuccess, startUpload]
  );

  return {
    createDashboard,
    status,
    error,
    isUploading,
    reset: resetUpload,
  };
}
