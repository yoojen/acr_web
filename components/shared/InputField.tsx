import { TextInputFieldProps } from "@/interface";

const InputField: React.FC<TextInputFieldProps> = ({
  type = "text",
  name,
  value,
  placeholder,
  onChange
}) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      name={name}
      className="w-full h-12 text-textLight placeholder-gray-400  shadow-sm bg-transparent text-lg font-normal leading-7 rounded-full border border-gray-200 focus:outline-none pl-4 mb-10"
      onChange={(e) => onChange?.(e.target.name, e.target.value)}
    />
  );
};

export default InputField;
