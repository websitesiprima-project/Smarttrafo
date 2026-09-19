"use client";

import React from "react";
import { Lock, Eye, EyeOff } from "lucide-react";

interface PasswordInputProps {
  value: string;
  onChange: (v: string) => void;
  show: boolean;
  onToggleShow: () => void;
  isDarkMode: boolean;
  placeholder?: string;
  minLength?: number;
  required?: boolean;
  disabled?: boolean;
}

export default function PasswordInput({
  value,
  onChange,
  show,
  onToggleShow,
  isDarkMode,
  placeholder,
  minLength,
  required,
  disabled,
}: PasswordInputProps) {
  return (
    <div className="relative">
      <Lock className="absolute left-3 top-3 text-slate-500" size={18} />
      <input
        type={show ? "text" : "password"}
        required={required}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        minLength={minLength}
        disabled={disabled}
        className={`w-full pl-10 pr-10 p-3 rounded-lg border outline-none focus:ring-2 focus:ring-[#146C94] ${
          disabled ? "opacity-50 cursor-not-allowed" : ""
        } ${isDarkMode ? "bg-slate-900 border-slate-600" : "bg-slate-50 border-gray-200"}`}
        placeholder={placeholder}
      />
      <button
        type="button"
        onClick={onToggleShow}
        disabled={disabled}
        className="absolute right-3 top-3 text-slate-500 hover:text-slate-700 transition disabled:opacity-50"
      >
        {show ? <EyeOff size={18} /> : <Eye size={18} />}
      </button>
    </div>
  );
}
