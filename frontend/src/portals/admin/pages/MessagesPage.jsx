import { FiMessageSquare } from "react-icons/fi";

const MessagesPage = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight text-foreground">Messages</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Customer and system messages will appear here.
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-12 text-center shadow-xs">
        <FiMessageSquare className="mx-auto mb-3 h-8 w-8 text-primary" />
        <p className="text-sm text-muted-foreground font-medium">No messages yet.</p>
      </div>
    </div>
  );
};

export default MessagesPage;
