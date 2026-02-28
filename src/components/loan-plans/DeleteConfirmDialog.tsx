import { AlertTriangle, Trash2 } from "lucide-react"

export type ConfirmAction = "deactivate" | "delete"

interface DeleteConfirmDialogProps {
  action: ConfirmAction
  onCancel: () => void
  onConfirm: () => void
}

export function DeleteConfirmDialog({ action, onCancel, onConfirm }: DeleteConfirmDialogProps) {
  const isDelete = action === "delete"

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-2xl">
        <div className="flex items-center gap-3 text-red-600">
          <div className="rounded-full bg-red-50 p-2">
            {isDelete ? <Trash2 size={20} /> : <AlertTriangle size={20} />}
          </div>
          <h3 className="text-lg font-semibold text-gray-900">
            {isDelete ? "Delete Plan Permanently?" : "Deactivate Plan?"}
          </h3>
        </div>
        <p className="mt-3 text-sm text-gray-500">
          {isDelete
            ? "This will permanently remove the plan from the system. This action cannot be undone."
            : "This will deactivate the plan and hide it from borrowers. You can view deactivated plans using the \"Inactive\" filter."}
        </p>
        <div className="mt-6 flex items-center justify-end gap-3">
          <button type="button" onClick={onCancel} className="rounded-xl px-4 py-2 text-sm font-medium text-gray-600 hover:bg-gray-100 transition">
            Cancel
          </button>
          <button type="button" onClick={onConfirm} className="rounded-xl bg-red-600 px-4 py-2 text-sm font-semibold text-white hover:bg-red-700 transition">
            {isDelete ? "Delete Forever" : "Deactivate"}
          </button>
        </div>
      </div>
    </div>
  )
}
