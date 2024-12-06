const GameArea = ({ children }: { children: React.ReactNode }) => {
    return (
      <div className="min-h-screen w-full overflow-y-auto bg-slate-50 px-4 py-8">
        <div className="mx-auto max-w-4xl">
          <div className="relative min-h-[calc(100vh-4rem)] rounded-lg bg-white p-4 shadow-md sm:p-6">
            {children}
          </div>
        </div>
      </div>
    )
  }
  
  export default GameArea