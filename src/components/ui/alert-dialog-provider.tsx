// Ref: https://gist.github.com/alexanderson1993/623bf0324f740ec4e33f33b59487dda7
"use client";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import * as React from "react";

export const AlertDialogContext = React.createContext<
  <T extends AlertAction>(
    params: T,
  ) => Promise<T["type"] extends "alert" | "confirm" ? boolean : null | string>
>(() => null!);

export type AlertAction =
  | { type: "alert"; title: string; body?: string; cancelButton?: string }
  | {
      type: "confirm";
      title: string;
      body?: string;
      cancelButton?: string;
      actionButton?: string;
    }
  | {
      type: "prompt";
      title: string;
      body?: string;
      cancelButton?: string;
      actionButton?: string;
      defaultValue?: string;
      inputProps?: React.DetailedHTMLProps<
        React.InputHTMLAttributes<HTMLInputElement>,
        HTMLInputElement
      >;
    }
  | { type: "close" };

interface AlertDialogState {
  open: boolean;
  title: string;
  body: string;
  type: "alert" | "confirm" | "prompt";
  cancelButton: string;
  actionButton: string;
  defaultValue?: string;
  inputProps?: React.PropsWithoutRef<
    React.DetailedHTMLProps<
      React.InputHTMLAttributes<HTMLInputElement>,
      HTMLInputElement
    >
  >;
}

export function alertDialogReducer(
  state: AlertDialogState,
  action: AlertAction,
): AlertDialogState {
  switch (action.type) {
    case "close":
      return { ...state, open: false };
    case "alert":
    case "confirm":
    case "prompt":
      return {
        ...state,
        open: true,
        ...action,
        cancelButton:
          action.cancelButton || (action.type === "alert" ? "Okay" : "Cancel"),
        actionButton:
          ("actionButton" in action && action.actionButton) || "Okay",
      };
    default:
      return state;
  }
}

export function AlertDialogProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [state, dispatch] = React.useReducer(alertDialogReducer, {
    open: false,
    title: "",
    body: "",
    type: "alert",
    cancelButton: "Cancel",
    actionButton: "Okay",
  });

  const resolveRef = React.useRef<(tf: any) => void>();

  function close() {
    dispatch({ type: "close" });
    resolveRef.current?.(false);
  }

  function confirm(value?: string) {
    dispatch({ type: "close" });
    resolveRef.current?.(value ?? true);
  }

  const dialog = React.useCallback(async <T extends AlertAction>(params: T) => {
    dispatch(params);

    return new Promise<
      T["type"] extends "alert" | "confirm" ? boolean : null | string
    >((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  return (
    <AlertDialogContext.Provider value={dialog}>
      {children}
      <AlertDialog
        open={state.open}
        onOpenChange={(open: boolean) => {
          if (!open) close();
          return;
        }}
      >
        <AlertDialogContent asChild>
          <form
            onSubmit={(event) => {
              event.preventDefault();
              confirm(event.currentTarget.prompt?.value);
            }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>{state.title}</AlertDialogTitle>
              {state.body ? (
                <AlertDialogDescription>{state.body}</AlertDialogDescription>
              ) : null}
            </AlertDialogHeader>
            {state.type === "prompt" && (
              <Input
                name="prompt"
                defaultValue={state.defaultValue}
                {...state.inputProps}
              />
            )}
            <AlertDialogFooter>
              <Button type="button" onClick={close}>
                {state.cancelButton}
              </Button>
              {state.type === "alert" ? null : (
                <Button type="submit" variant="destructive">{state.actionButton}</Button>
              )}
            </AlertDialogFooter>
          </form>
        </AlertDialogContent>
      </AlertDialog>
    </AlertDialogContext.Provider>
  );
}
type Params<T extends "alert" | "confirm" | "prompt"> =
  | Omit<Extract<AlertAction, { type: T }>, "type">
  | string;

export function useConfirm() {
  const dialog = React.useContext(AlertDialogContext);

  return React.useCallback(
    (params: Params<"confirm">) => {
      return dialog({
        ...(typeof params === "string" ? { title: params } : params),
        type: "confirm",
      });
    },
    [dialog],
  );
}
export function usePrompt() {
  const dialog = React.useContext(AlertDialogContext);

  return (params: Params<"prompt">) =>
    dialog({
      ...(typeof params === "string" ? { title: params } : params),
      type: "prompt",
    });
}
export function useAlert() {
  const dialog = React.useContext(AlertDialogContext);
  return (params: Params<"alert">) =>
    dialog({
      ...(typeof params === "string" ? { title: params } : params),
      type: "alert",
    });
}
