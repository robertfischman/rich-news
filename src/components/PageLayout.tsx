// 服务器组件
import ClientPageWrapper from './ClientPageWrapper';

export default function PageLayout() {
  return (
    <div className="min-h-screen bg-[#1e1e1e]">
      <ClientPageWrapper>
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 bg-gradient-to-r from-[#ffa07a] to-[#ff7f50] bg-clip-text text-transparent">
            Web3 News Explorer
          </h1>
          <p className="text-[#9ca3af] max-w-2xl mx-auto">
            Your one-stop destination for the latest cryptocurrency and blockchain news, 
            curated from trusted sources.
          </p>
        </div>
      </ClientPageWrapper>
      
      <footer className="mt-auto py-6 text-center text-[#71717a] text-sm">
        <p>© 2024 MushNews. All rights reserved.</p>
      </footer>
    </div>
  );
} 