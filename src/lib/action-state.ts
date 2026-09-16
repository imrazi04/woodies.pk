export type FieldErrors = Partial<Record<string, string[]>>;

/** Result shape shared by Server Actions and the forms that call them. */
export type ActionState<T = undefined> = {
  status: "idle" | "success" | "error";
  message?: string;
  fieldErrors?: FieldErrors;
  data?: T;
};

export const initialActionState: ActionState<never> = { status: "idle" };

export function errorState(message: string, fieldErrors?: FieldErrors): ActionState<never> {
  return { status: "error", message, fieldErrors };
}

export function successState(message?: string): ActionState<never> {
  return { status: "success", message };
}
