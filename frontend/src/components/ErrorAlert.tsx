/**
 * Error alert component
 */
interface ErrorAlertProps {
  message: string;
  onClose?: () => void;
}

export default function ErrorAlert({ message, onClose }: ErrorAlertProps) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
      <span className="block">{message}</span>
      {onClose && (
        <button
          onClick={onClose}
          className="absolute top-0 right-0 px-4 py-3 text-red-700"
        >
          ✕
        </button>
      )}
    </div>
  );
}
