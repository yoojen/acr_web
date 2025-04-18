interface ActionButtonsProps {
  onEdit: () => void;
  onDelete: () => void;
  isSubPage?: boolean;
  isUserPage?: boolean;
  isTeamPage?: boolean
}

export default function ActionButtons({
  onEdit,
  onDelete,
  isUserPage,
}: ActionButtonsProps) {
  return (
    <div className="flex space-x-2 justify-end [&>*]:underline">

      {isUserPage && (
        <>
          <p className="text-slate-500 cursor-pointer" onClick={onEdit}>Flag Inactive</p>
          <span>|</span>
        </>
      )}

      <p className="text-primary cursor-pointer" onClick={onEdit}>Edit</p>
      <span>|</span>
      <p className="text-red-500 cursor-pointer" onClick={onDelete}>Delete</p>
    </div>
  );
}
