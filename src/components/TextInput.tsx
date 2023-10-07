import { FC } from "react";

type TextInputProps = {
    label: string;
    value: string;
    onChange: (value: string) => void;
    type?: string;
    placeholder?: string;
    required?: boolean;
    disabled?: boolean;
};
export const TextInput: FC<TextInputProps> = ({
    label,
    value,
    onChange,
    type = "text",
    placeholder,
    required = false,
    disabled = false,
}) => (
    <div className="flex flex-col gap-2 text-primary-pale">
        <label className="flex flex-col">{label}</label>
        <input
            type={type}
            className="active:border-primary focus:border-primary border-1 border-transparent bg-primary-pale text-black h-10 px-4 py-6 max-w-[420px] pr-16 rounded-lg text-sm focus:outline-none"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            required={required}
            disabled={disabled}
        />
    </div>
);
