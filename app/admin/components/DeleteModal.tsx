"use client";

type DeleteModalProps = {
  onConfirm: () => void;
  onCancel: () => void;
  title: string;
  message: string;
};

const DeleteModal = ({
  onConfirm,
  onCancel,
  title,
  message,
}: DeleteModalProps) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-900 rounded-lg p-6 w-full max-w-md border border-gray-800">
        <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
        <p className="text-gray-300 mb-6">{message}</p>
        <div className="flex gap-4">
          <button
            onClick={onConfirm}
            className="flex-1 bg-red-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Delete
          </button>
          <button
            onClick={onCancel}
            className="flex-1 bg-gray-700 text-white px-6 py-3 rounded-lg font-semibold hover:bg-gray-600 transition-colors"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteModal;

