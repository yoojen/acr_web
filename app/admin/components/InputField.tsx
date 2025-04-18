interface InputFieldProps {
  label: string;
  type: string;
  value: string;
  required?: boolean;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
}

export default function InputField({
  label,
  type,
  value,
  onChange,
  required,
}: InputFieldProps) {
  return (
    <div className="mb-4 w-full mx-auto">
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="peer px-3 w-full rounded-md border-b border-gray-500 text-slate-600
        focus:outline-none transition-all duration-200 ease-in-out hover:border-gray-400"
        required={required}
      />
      <label
        className={`block mb-1 font-semibold text-gray-500 ml-1 transition-all duration-200 ease-in-out
          ${value ? "mt-2" : "-mt-6"} peer-focus:mt-2`}
      >
        {["first_name", "last_name", "position", "tel", "email"].includes(label) ? (
          <>
            {label.split("_").join(" ").toLocaleUpperCase()}{" "}
            <span className="text-red-500">*</span>
          </>
        ) : label.includes("_") ? (
          label.split("_").join(" ").toLocaleUpperCase()
        ) : (
          label.toLocaleUpperCase()
        )}
      </label>
    </div>
  );
}
