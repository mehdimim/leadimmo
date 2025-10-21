'use client';

import { useFormState } from 'react-dom';

export type LoginFormState = {
  error?: string | null;
};

type AdminLoginFormProps = {
  action: (state: LoginFormState, formData: FormData) => Promise<LoginFormState>;
  labels: {
    username: string;
    password: string;
    submit: string;
  };
};

const INITIAL_STATE: LoginFormState = {};

export default function AdminLoginForm({ action, labels }: AdminLoginFormProps) {
  const [state, formAction] = useFormState(action, INITIAL_STATE);

  return (
    <form action={formAction} className="mt-6 space-y-4">
      <label className="block text-sm text-slate-700">
        <span className="mb-1 block font-semibold">{labels.username}</span>
        <input
          name="username"
          type="text"
          className="form-input"
          autoComplete="username"
          required
        />
      </label>
      <label className="block text-sm text-slate-700">
        <span className="mb-1 block font-semibold">{labels.password}</span>
        <input
          name="password"
          type="password"
          className="form-input"
          autoComplete="current-password"
          required
        />
      </label>
      {state?.error ? <p className="text-sm text-red-600">{state.error}</p> : null}
      <button
        type="submit"
        className="w-full rounded-full bg-primary px-4 py-2 text-sm font-semibold text-white shadow hover:bg-primary-light focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      >
        {labels.submit}
      </button>
    </form>
  );
}
