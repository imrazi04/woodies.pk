import { startTransition, useActionState, type FormEvent } from "react";
import { initialActionState, type ActionState } from "@/lib/action-state";

/**
 * useActionState for forms submitted through onSubmit instead of the `action` prop,
 * so React doesn't reset the fields afterwards and input survives validation errors.
 */
export function useActionForm<T = undefined>(
  action: (state: ActionState<T>, formData: FormData) => Promise<ActionState<T>>,
) {
  const [state, dispatch, pending] = useActionState<ActionState<T>, FormData>(action, initialActionState);

  function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    startTransition(() => dispatch(formData));
  }

  return { state, pending, onSubmit };
}
