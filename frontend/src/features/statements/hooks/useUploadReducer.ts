import { useCallback, useReducer } from "react";

type UploadStatus = "idle" | "uploading" | "success" | "error";

type UploadState = {
  status: UploadStatus;
  error: string | null;
};

type UploadAction =
  | { type: "uploading" }
  | { type: "success" }
  | { type: "error"; error: string }
  | { type: "reset" };

const initialUploadState: UploadState = {
  status: "idle",
  error: null,
};

function uploadReducer(
  state: UploadState,
  action: UploadAction
): UploadState {
  switch (action.type) {
    case "uploading":
      return { status: "uploading", error: null };
    case "success":
      return { status: "success", error: null };
    case "error":
      return { status: "error", error: action.error };
    case "reset":
      return initialUploadState;
    default:
      return state;
  }
}

export function useUploadReducer() {
  const [state, dispatch] = useReducer(uploadReducer, initialUploadState);
  const startUpload = useCallback(() => dispatch({ type: "uploading" }), []);
  const markSuccess = useCallback(() => dispatch({ type: "success" }), []);
  const markError = useCallback(
    (error: string) => dispatch({ type: "error", error }),
    []
  );
  const resetUpload = useCallback(() => dispatch({ type: "reset" }), []);

  return {
    status: state.status,
    error: state.error,
    isUploading: state.status === "uploading",
    startUpload,
    markSuccess,
    markError,
    resetUpload,
  };
}
