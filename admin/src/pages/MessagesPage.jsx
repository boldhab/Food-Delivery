import { FiMessageSquare } from "react-icons/fi";

const MessagesPage = () => {
  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Messages</h1>
        <p className="text-sm text-slate-600 dark:text-slate-400">
          Customer and system messages will appear here.
        </p>
      </div>

      <div className="rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 p-8 text-center">
        <FiMessageSquare className="mx-auto mb-3 h-8 w-8 text-orange-500" />
        <p className="text-sm text-slate-600 dark:text-slate-300">No messages yet.</p>
      </div>
    </div>
  );
};

export default MessagesPage;
