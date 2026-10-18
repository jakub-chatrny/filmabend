"use client";

import { useState, useTransition } from "react";
import { Field, Select } from "@/components/Field";
import type { TitleLanguage } from "@/lib/auth";
import { updateTitleLanguage } from "./actions";

export function SettingsForm({ titleLanguage }: { titleLanguage: TitleLanguage }) {
    const [value, setValue] = useState(titleLanguage);
    const [pending, startTransition] = useTransition();
    const [status, setStatus] = useState<{ saved?: boolean; error?: string }>({});

    const save = (language: TitleLanguage) => {
        setValue(language);
        startTransition(async () => {
            const result = await updateTitleLanguage(language);
            setStatus(result.error ? { error: result.error } : { saved: true });
        });
    };

    return (
        <div className="flex flex-col gap-2">
            <Field label="Název filmu">
                <Select value={value} disabled={pending} onChange={(event) => save(event.target.value as TitleLanguage)}>
                    <option value="cs">česky</option>
                    <option value="en">anglicky</option>
                </Select>
            </Field>
            <p className={`min-h-5 text-sm ${status.error ? "text-danger" : "text-primary-lightest"}`} aria-live="polite">
                {pending ? "Ukládám…" : (status.error ?? (status.saved ? "Uloženo" : ""))}
            </p>
        </div>
    );
}
