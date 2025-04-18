interface ModalProps {
  isOpen: boolean;
  title: string;
  children: React.ReactNode;
  onClose: () => void;
  sidebarOpen?: boolean;
}

export default function Modal({
  isOpen,
  title,
  children,
  onClose,
}: ModalProps) {
  if (!isOpen) return null;

  return (
    <div
      className="absolute top-10 w-3/4 right-5 shadow-md h-auto z-20 bg-white rounded-md p-5"
    >
      <div className="flex justify-between">
        <h2 className="text-lg font-bold">{title}</h2>
        <p
          onClick={onClose}
          className="text-white bg-red-500 text-lg font-bold cursor-pointer p-3"
        >
          X
        </p>
      </div>
      {children}
    </div>
  );
}