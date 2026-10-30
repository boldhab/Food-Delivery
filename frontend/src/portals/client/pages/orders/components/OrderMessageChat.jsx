import React, { useEffect, useRef } from 'react';
import { FiSend, FiMessageSquare } from 'react-icons/fi';
import { FaMotorcycle, FaUser } from 'react-icons/fa';

const OrderMessageChat = ({
    orderId,
    messages = [],
    messageInput = '',
    onMessageInputChange,
    onSendMessage,
    isSending = false
}) => {
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const safeMessages = Array.isArray(messages) ? messages : [];

    return (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm flex flex-col h-[400px]">
            {/* Header */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                    <div className="w-8 h-8 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center">
                        <FiMessageSquare className="w-4 h-4" />
                    </div>
                    <div>
                        <h4 className="text-sm font-semibold text-foreground">
                            Driver Chat
                        </h4>
                        <div className="flex items-center gap-1.5 text-2xs text-emerald-600 dark:text-emerald-400 font-medium">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Live WebSocket Connected
                        </div>
                    </div>
                </div>
            </div>

            {/* Messages Scroll Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
                {safeMessages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-center px-4 text-slate-400">
                        <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mb-2 text-slate-500">
                            <FaMotorcycle className="w-6 h-6" />
                        </div>
                        <p className="text-xs font-semibold text-foreground">
                            No messages yet
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5 max-w-[220px]">
                            Need gate codes or drop-off instructions? Message your driver here in real time.
                        </p>
                    </div>
                ) : (
                    safeMessages.map((entry, idx) => {
                        const isUser = entry.senderRole === 'user';
                        const messageKey = entry._id || entry.id || `msg-${idx}`;
                        return (
                            <div
                                key={messageKey}
                                className={`flex items-end gap-2 ${isUser ? 'justify-end' : 'justify-start'}`}
                            >
                                {!isUser && (
                                    <div className="w-7 h-7 rounded-full bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 mb-1">
                                        <FaMotorcycle className="w-3.5 h-3.5" />
                                    </div>
                                )}
                                <div
                                    className={`max-w-[80%] rounded-2xl px-3.5 py-2 text-xs shadow-sm ${
                                        isUser
                                            ? 'bg-gradient-to-r from-[var(--primary)] to-rose-600 text-white rounded-br-xs'
                                            : 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-bl-xs border border-slate-200/50 dark:border-slate-700/50'
                                    }`}
                                >
                                    <div className="font-semibold text-2xs opacity-80 mb-0.5">
                                        {isUser ? 'You' : entry.sender?.name || 'Driver'}
                                    </div>
                                    <p className="leading-relaxed break-words">{entry.message}</p>
                                    <div className={`text-2xs mt-1 text-right tabular-nums ${isUser ? 'text-rose-100' : 'text-slate-400 dark:text-slate-500'}`}>
                                        {entry.createdAt ? new Date(entry.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}
                                    </div>
                                </div>
                                {isUser && (
                                    <div className="w-7 h-7 rounded-full bg-[var(--primary)]/10 text-[var(--primary)] flex items-center justify-center shrink-0 mb-1">
                                        <FaUser className="w-3 h-3" />
                                    </div>
                                )}
                            </div>
                        );
                    })
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Bar */}
            <div className="p-3 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
                <form
                    onSubmit={(e) => {
                        e.preventDefault();
                        if (!isSending && (messageInput || '').trim()) {
                            onSendMessage(orderId);
                        }
                    }}
                    className="flex items-center gap-2"
                >
                    <input
                        type="text"
                        value={messageInput || ''}
                        onChange={(e) => onMessageInputChange(orderId, e.target.value)}
                        placeholder="Write message for driver..."
                        className="flex-1 px-3.5 py-2.5 border border-slate-200 dark:border-slate-700 rounded-xl bg-slate-50 dark:bg-slate-800/70 text-sm text-foreground placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--primary)]/30 focus:border-[var(--primary)] transition-all"
                    />
                    <button
                        type="submit"
                        disabled={isSending || !(messageInput || '').trim()}
                        className="w-9 h-9 flex items-center justify-center bg-[var(--primary)] hover:opacity-90 text-white rounded-xl shadow-sm hover:shadow transition-all disabled:opacity-40 disabled:hover:bg-[var(--primary)] shrink-0"
                    >
                        <FiSend className="w-4 h-4" />
                    </button>
                </form>
            </div>
        </div>
    );
};

export default OrderMessageChat;
