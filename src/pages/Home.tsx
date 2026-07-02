import { useState, useEffect } from 'react';
import { ArrowRight, SkipForward, CheckCircle2 } from 'lucide-react';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';
import MessageRenderer from '../components/MessageRenderer';

function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

interface QuestionData {
  source: string;
  content: string;
  response: string;
  product_cards: any[];
}

interface Question {
  id: string;
  dataA: QuestionData;
  dataB: QuestionData;
}

export default function Home() {
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [loading, setLoading] = useState(true);
  const [order, setOrder] = useState<'AB' | 'BA'>('AB');
  
  const [selectedSide, setSelectedSide] = useState<'left' | 'right' | 'tie' | null>(null);
  const [reason, setReason] = useState('');
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    // Switch to fetch static JSON for GitHub Pages compatibility
    const dataUrl = import.meta.env.DEV ? '/api/questions' : `${import.meta.env.BASE_URL}questions.json`;

    fetch(dataUrl)
      .then(res => {
        if (!res.ok) throw new Error('Network response was not ok');
        return res.json();
      })
      .then(data => {
        setQuestions(data);
        setLoading(false);
        randomizeOrder();
      })
      .catch(err => {
        console.error(err);
        setLoading(false);
      });
  }, []);

  const randomizeOrder = () => {
    setOrder(Math.random() > 0.5 ? 'AB' : 'BA');
  };

  const handleNext = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(prev => prev + 1);
      setSelectedSide(null);
      setReason('');
      randomizeOrder();
    }
  };

  const handleSubmit = async () => {
    if (!selectedSide) return;
    
    setSubmitting(true);
    const question = questions[currentIndex];
    
    let selectedSource = '';
    if (selectedSide === 'left') {
      selectedSource = order === 'AB' ? question.dataA.source : question.dataB.source;
    } else if (selectedSide === 'right') {
      selectedSource = order === 'AB' ? question.dataB.source : question.dataA.source;
    } else if (selectedSide === 'tie') {
      selectedSource = 'tie';
    }

    try {
      // In static deployment, we can't save to local file system
      // For GitHub pages, we'll just log it and show success to user
      // or you could connect this to a real backend later
      console.log('Would save:', {
        id: question.id,
        selectedSource,
        reason,
        selectedSide
      });
      
      // Still try to call local API in case we are running locally
      fetch('/api/save', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: question.id,
          selectedSource,
          reason,
          selectedSide
        })
      }).catch(() => {
        // Ignore error if endpoint doesn't exist (like on GH Pages)
        console.log('Running in static mode, results are only logged to console.');
      });
      
      handleNext();
    } catch (err) {
      console.error(err);
      alert('保存失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSkip = () => {
    handleNext();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F3F5] text-[#64666B]">
        加载题目中...
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F2F3F5] text-[#64666B]">
        没有找到需要评测的题目。请检查文件夹路径和文件是否对应。
      </div>
    );
  }

  if (currentIndex >= questions.length) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#F2F3F5] text-[#161823]">
        <CheckCircle2 className="w-16 h-16 text-[#00836F] mb-4" />
        <h2 className="text-[24px] font-bold">评测完成</h2>
        <p className="text-[#64666B] mt-2">感谢您的参与！所有结果已保存。</p>
      </div>
    );
  }

  const question = questions[currentIndex];
  const leftData = order === 'AB' ? question.dataA : question.dataB;
  const rightData = order === 'AB' ? question.dataB : question.dataA;

  return (
    <div className="min-h-screen flex bg-[#F2F3F5] text-[#161823] font-sans">
      {/* 左侧：评测数据展示区 */}
      <div className="flex-1 flex flex-col h-screen overflow-hidden">
        <header className="bg-white border-b border-[#E5E6E8] px-6 py-4 flex items-center justify-between shrink-0">
          <h1 className="text-[16px] font-bold text-[#161823] tracking-tight">请按要求完成任务</h1>
          <div className="text-[14px] text-[#64666B] font-mono">ID: {question.id.replace('.json', '')}</div>
        </header>

        <main className="flex-1 flex overflow-hidden p-6 gap-6 bg-[#F2F3F5]">
          {/* 左侧候选 */}
          <div className="flex-1 flex flex-col bg-zinc-50 rounded-[32px] shadow-sm border-[4px] border-zinc-900 overflow-hidden relative max-w-[400px] mx-auto w-full">
            {/* 手机刘海/灵动岛区域 */}
            <div className="absolute top-0 inset-x-0 h-6 bg-transparent z-20 flex justify-center">
              <div className="w-32 h-6 bg-zinc-900 rounded-b-2xl"></div>
            </div>
            
            {/* 状态栏模拟 */}
            <div className="h-10 bg-white flex items-center justify-between px-5 text-[11px] font-medium text-zinc-800 z-10 shrink-0 pt-2">
              <span>09:41</span>
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-3 rounded-[2px] border border-zinc-800 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-[-2px] w-[1px] h-1 bg-zinc-800"></div>
                  <div className="absolute inset-[1px] bg-zinc-800 w-[70%]"></div>
                </div>
              </div>
            </div>

            {/* 导航栏模拟 */}
            <div className="h-12 bg-white flex items-center justify-between px-4 shrink-0 border-b border-zinc-100">
              <span className="text-zinc-600">&lt;</span>
              <span className="font-semibold text-zinc-800 text-sm">左侧候选</span>
              <span className="text-zinc-600">...</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-white scrollbar-hide">
              <div className="space-y-6 pb-10">
                {/* User Query Bubble */}
                <div className="flex justify-end mb-6">
                  <div className="bg-[#f2ebfa] rounded-[20px] rounded-tr-[4px] px-4 py-3 text-[15px] text-zinc-800 max-w-[85%] leading-relaxed shadow-sm">
                    <span className="mr-1.5">🧹</span>
                    {leftData.content || <span className="text-zinc-400 italic">无内容</span>}
                  </div>
                </div>

                {/* Response Container */}
                <div className="text-zinc-800 text-[15px]">
                  <div className="text-[13px] text-zinc-500 mb-4 flex items-center hover:text-zinc-700 cursor-pointer w-fit">
                    已查找和筛选的商品 <span className="ml-1 text-[10px]">&gt;</span>
                  </div>
                  
                  <MessageRenderer 
                    content={leftData.response} 
                    productCards={leftData.product_cards || []} 
                  />
                </div>
              </div>
            </div>
          </div>

          {/* 右侧候选 */}
          <div className="flex-1 flex flex-col bg-zinc-50 rounded-[32px] shadow-sm border-[4px] border-zinc-900 overflow-hidden relative max-w-[400px] mx-auto w-full">
            {/* 手机刘海/灵动岛区域 */}
            <div className="absolute top-0 inset-x-0 h-6 bg-transparent z-20 flex justify-center">
              <div className="w-32 h-6 bg-zinc-900 rounded-b-2xl"></div>
            </div>
            
            {/* 状态栏模拟 */}
            <div className="h-10 bg-white flex items-center justify-between px-5 text-[11px] font-medium text-zinc-800 z-10 shrink-0 pt-2">
              <span>09:41</span>
              <div className="flex items-center space-x-1.5">
                <div className="w-4 h-3 rounded-[2px] border border-zinc-800 relative">
                  <div className="absolute right-0 top-1/2 -translate-y-1/2 -translate-x-[-2px] w-[1px] h-1 bg-zinc-800"></div>
                  <div className="absolute inset-[1px] bg-zinc-800 w-[70%]"></div>
                </div>
              </div>
            </div>

            {/* 导航栏模拟 */}
            <div className="h-12 bg-white flex items-center justify-between px-4 shrink-0 border-b border-zinc-100">
              <span className="text-zinc-600">&lt;</span>
              <span className="font-semibold text-zinc-800 text-sm">右侧候选</span>
              <span className="text-zinc-600">...</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 bg-white scrollbar-hide">
              <div className="space-y-6 pb-10">
                {/* User Query Bubble */}
                <div className="flex justify-end mb-6">
                  <div className="bg-[#f2ebfa] rounded-[20px] rounded-tr-[4px] px-4 py-3 text-[15px] text-zinc-800 max-w-[85%] leading-relaxed shadow-sm">
                    <span className="mr-1.5">🧹</span>
                    {rightData.content || <span className="text-zinc-400 italic">无内容</span>}
                  </div>
                </div>

                {/* Response Container */}
                <div className="text-zinc-800 text-[15px]">
                  <div className="text-[13px] text-zinc-500 mb-4 flex items-center hover:text-zinc-700 cursor-pointer w-fit">
                    已查找和筛选的商品 <span className="ml-1 text-[10px]">&gt;</span>
                  </div>
                  
                  <MessageRenderer 
                    content={rightData.response} 
                    productCards={rightData.product_cards || []} 
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* 右侧：评测表单区 */}
      <div className="w-80 bg-white border-l border-[#E5E6E8] h-screen shrink-0 flex flex-col shadow-[-4px_0_24px_rgba(0,0,0,0.02)] relative z-10">
        <div className="p-6 flex-1 flex flex-col overflow-y-auto">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-[16px] font-bold text-[#161823]">评测结果</h2>
            <div className="bg-[#F2F3F5] px-3 py-1 rounded-[4px] text-[12px] font-medium text-[#64666B]">
              {currentIndex + 1} / {questions.length}
            </div>
          </div>

          <div className="space-y-6 flex-1">
            {/* 选择项 */}
            <div>
              <label className="block text-[14px] font-semibold text-[#31343B] mb-3">
                哪侧结果更好？<span className="text-[#00836F] ml-1">*</span>
              </label>
              <div className="space-y-3">
                <button
                  onClick={() => setSelectedSide('left')}
                  className={cn(
                    "w-full flex items-center p-4 rounded-[8px] border-[1px] transition-all duration-200 text-left",
                    selectedSide === 'left' 
                      ? "border-[#00836F] bg-[#E5F2F0]" 
                      : "border-[#E5E6E8] hover:border-[#00836F]/50 hover:bg-[#F8F9FA]"
                  )}
                >
                  <div className={cn(
                    "w-[16px] h-[16px] rounded-full border-[1.5px] mr-3 flex items-center justify-center shrink-0",
                    selectedSide === 'left' ? "border-[#00836F]" : "border-[#C9CDD4]"
                  )}>
                    {selectedSide === 'left' && <div className="w-[8px] h-[8px] bg-[#00836F] rounded-full" />}
                  </div>
                  <span className={cn(
                    "font-medium text-[14px]",
                    selectedSide === 'left' ? "text-[#00836F]" : "text-[#161823]"
                  )}>左侧更好</span>
                </button>

                <button
                  onClick={() => setSelectedSide('right')}
                  className={cn(
                    "w-full flex items-center p-4 rounded-[8px] border-[1px] transition-all duration-200 text-left",
                    selectedSide === 'right' 
                      ? "border-[#00836F] bg-[#E5F2F0]" 
                      : "border-[#E5E6E8] hover:border-[#00836F]/50 hover:bg-[#F8F9FA]"
                  )}
                >
                  <div className={cn(
                    "w-[16px] h-[16px] rounded-full border-[1.5px] mr-3 flex items-center justify-center shrink-0",
                    selectedSide === 'right' ? "border-[#00836F]" : "border-[#C9CDD4]"
                  )}>
                    {selectedSide === 'right' && <div className="w-[8px] h-[8px] bg-[#00836F] rounded-full" />}
                  </div>
                  <span className={cn(
                    "font-medium text-[14px]",
                    selectedSide === 'right' ? "text-[#00836F]" : "text-[#161823]"
                  )}>右侧更好</span>
                </button>

                <button
                  onClick={() => setSelectedSide('tie')}
                  className={cn(
                    "w-full flex items-center p-4 rounded-[8px] border-[1px] transition-all duration-200 text-left",
                    selectedSide === 'tie' 
                      ? "border-[#00836F] bg-[#E5F2F0]" 
                      : "border-[#E5E6E8] hover:border-[#00836F]/50 hover:bg-[#F8F9FA]"
                  )}
                >
                  <div className={cn(
                    "w-[16px] h-[16px] rounded-full border-[1.5px] mr-3 flex items-center justify-center shrink-0",
                    selectedSide === 'tie' ? "border-[#00836F]" : "border-[#C9CDD4]"
                  )}>
                    {selectedSide === 'tie' && <div className="w-[8px] h-[8px] bg-[#00836F] rounded-full" />}
                  </div>
                  <span className={cn(
                    "font-medium text-[14px]",
                    selectedSide === 'tie' ? "text-[#00836F]" : "text-[#161823]"
                  )}>无法判断</span>
                </button>
              </div>
            </div>

            {/* 原因输入 */}
            <div>
              <label className="block text-[14px] font-semibold text-[#31343B] mb-2">
                评测原因 <span className="text-[#93969D] font-normal text-[12px] ml-1">(选填)</span>
              </label>
              <textarea
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                placeholder="请简述选择该侧结果的原因..."
                className="w-full p-3 rounded-[8px] border-[1px] border-[#E5E6E8] bg-white focus:ring-[2px] focus:ring-[#00836F]/20 focus:border-[#00836F] transition-all duration-200 outline-none resize-none h-32 text-[14px] text-[#161823] placeholder:text-[#93969D]"
              />
            </div>
          </div>

          {/* 底部按钮 */}
          <div className="mt-8 pt-6 border-t border-[#E5E6E8] space-y-3">
            <button
              onClick={handleSubmit}
              disabled={!selectedSide || submitting}
              className={cn(
                "w-full flex items-center justify-center py-2 px-4 rounded-[4px] font-medium text-[14px] transition-all duration-200",
                !selectedSide || submitting
                  ? "bg-[#F2F3F5] text-[#C9CDD4] cursor-not-allowed"
                  : "bg-[#00836F] hover:bg-[#006e5d] text-white active:scale-[0.98]"
              )}
            >
              {submitting ? "提交中..." : "提交并进入下一题"}
              {!submitting && <ArrowRight className="w-4 h-4 ml-2" />}
            </button>
            
            <button
              onClick={handleSkip}
              className="w-full flex items-center justify-center py-2 px-4 rounded-[4px] font-medium text-[14px] text-[#64666B] hover:text-[#161823] hover:bg-[#F2F3F5] transition-colors duration-200"
            >
              跳过本题
              <SkipForward className="w-4 h-4 ml-2 opacity-70" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}