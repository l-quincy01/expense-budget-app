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
import { useUploadReducer } from "./useUploadReducer";

type UploadStatementInput = {
  dashboardName: string;
  files: File[];
  onUploaded?: () => Promise<void> | void;
};

export function useUploadStatement() {
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

  const uploadStatement = useCallback(
    async ({ dashboardName, files, onUploaded }: UploadStatementInput) => {
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
        const data = await dashboardApi.uploadStatement(
          api,
          dashboardName,
          files
        );
        await onUploaded?.();

        toast.dismiss(uploadToastId);
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
    uploadStatement,
    status,
    error,
    isUploading,
    reset: resetUpload,
  };
}
