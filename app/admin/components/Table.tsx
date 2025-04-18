import { User } from "@/interface";
import { JSX } from "react";

interface TableProps<T> {
  data: T[];
  columns: { key: string, label: string }[];
  actions?: (item: T) => JSX.Element;
}

export default function Table<T>({ data, columns, actions }: TableProps<T>) {
  return (
    <div className="overflow-x-auto">
      <table className="table-auto min-w-full border-collapse">
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index} className="px-4 py-2 border whitespace-nowrap">
                {col.label}
              </th>
            ))}
            {actions && <th className="px-4 py-2 border">Actions</th>}
          </tr>
        </thead>
        <tbody>
          {(data as User[]).map((item, index) => {
            return <tr key={index}>
              {columns.map((col, index) => {
                return <td key={index} className="px-4 py-2 border whitespace-nowrap">
                  {item[col.key as keyof User] as string}
                </td>
              }

              )}
              {/* {actions && <td className="px-4 py-2 border text-right">{actions(item)}</td>} */}
            </tr>
          })}
        </tbody>
      </table>
    </div>
  );
}