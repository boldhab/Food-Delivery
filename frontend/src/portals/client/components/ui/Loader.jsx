import React from 'react';

const Loader = ({ message = 'Loading...' }) => {
  return (
    <div className="min-h-[40vh] flex flex-col items-center justify-center p-8 gap-4 text-center">
      <div className="relative flex items-center justify-center">
        <div className="w-16 h-16 rounded-full border-4 border-[var(--primary)]/20 border-t-[var(--primary)] animate-spin" />
        <img 
          src="/LOGO.png" 
          alt="Food Hub" 
          className="w-8 h-8 object-contain absolute" 
        />
      </div>
      <p className="text-sm font-medium text-[var(--muted-foreground)] animate-pulse">
        {message}
      </p>
    </div>
  );
};

export default Loader;
