"use client";

import { useRouter } from "next/navigation";
import { FormEvent, useRef, useState } from "react";

type CreatedInvitation = {
  email: string;
  expiresAt: string;
  url: string;
};

type InviteMemberFormProps = {
  workspaceSlug: string;
};

export function InviteMemberForm({ workspaceSlug }: InviteMemberFormProps) {
  const router = useRouter();
  const linkInputRef = useRef<HTMLInputElement>(null);
  const [emailError, setEmailError] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [invitation, setInvitation] = useState<CreatedInvitation | null>(null);
  const [copyMessage, setCopyMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const form = event.currentTarget;

    setEmailError("");
    setFormError("");
    setInvitation(null);
    setCopyMessage("");
    setIsSubmitting(true);

    const formData = new FormData(form);

    try {
      const response = await fetch(`/api/workspaces/${workspaceSlug}/invitations`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: formData.get("email") }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (data.error === "VALIDATION_ERROR") {
          setEmailError(data.fields?.email?.[0] ?? "Enter a valid email address.");
          return;
        }

        if (data.error === "ALREADY_MEMBER") {
          setEmailError(data.message);
          return;
        }

        if (response.status === 401) {
          router.push("/login");
          return;
        }

        setFormError(data.message ?? "Unable to create the invitation.");
        return;
      }

      form.reset();
      setInvitation(data.invitation);
    } catch {
      setFormError(
        "Something went wrong while creating the invitation. Please try again.",
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleCopy() {
    if (!invitation) {
      return;
    }

    try {
      await navigator.clipboard.writeText(invitation.url);
      setCopyMessage("Link copied.");
    } catch {
      // The Clipboard API is only available on HTTPS or localhost.
      linkInputRef.current?.select();
      setCopyMessage("Press Ctrl+C to copy the selected link.");
    }
  }

  return (
    <div className="space-y-5">
      <form className="flex flex-col gap-3 sm:flex-row sm:items-start" onSubmit={handleSubmit}>
        <div className="flex-1">
          <label htmlFor="email" className="sr-only">
            Email address
          </label>

          <input
            id="email"
            name="email"
            type="email"
            autoComplete="off"
            placeholder="person@example.com"
            aria-invalid={Boolean(emailError)}
            className="block w-full rounded-lg border border-zinc-300 bg-white px-3.5 py-2.5 text-sm text-zinc-950 shadow-sm outline-none placeholder:text-zinc-400 focus:border-zinc-950 focus:ring-1 focus:ring-zinc-950"
          />

          {emailError && (
            <p className="mt-2 text-xs text-red-600">{emailError}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-zinc-950 px-4 py-2.5 text-sm font-medium text-white shadow-sm transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {isSubmitting ? "Creating..." : "Create invitation"}
        </button>
      </form>

      {formError && (
        <div
          role="alert"
          className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
        >
          {formError}
        </div>
      )}

      {invitation && (
        <div
          role="status"
          className="rounded-lg border border-green-200 bg-green-50 px-4 py-4 text-sm text-green-800"
        >
          <p>
            Invitation created for {invitation.email}. Share this link with
            the person you&apos;re inviting.
          </p>

          <div className="mt-3 flex flex-col gap-2 sm:flex-row">
            <input
              ref={linkInputRef}
              readOnly
              value={invitation.url}
              onFocus={(event) => event.currentTarget.select()}
              aria-label="Invitation link"
              className="block w-full rounded-lg border border-green-200 bg-white px-3 py-2 text-sm text-zinc-950 outline-none"
            />

            <button
              type="button"
              onClick={handleCopy}
              className="rounded-lg border border-green-300 bg-white px-4 py-2 text-sm font-medium text-green-800 hover:bg-green-100"
            >
              Copy link
            </button>
          </div>

          <p className="mt-2 text-xs text-green-700">
            {copyMessage ||
              `The link can be used once and expires on ${new Date(
                invitation.expiresAt,
              ).toLocaleDateString()}.`}
          </p>
        </div>
      )}
    </div>
  );
}
