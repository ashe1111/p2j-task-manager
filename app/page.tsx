'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sparkles, Brain, Target, TrendingUp, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

export default function Home() {
  const [task, setTask] = useState('');
  const router = useRouter();

  const handleStart = () => {
    if (task.trim()) {
      localStorage.setItem('initialTask', task);
      router.push('/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFBEA]" style={{ fontFamily: 'Helvetica, Arial, sans-serif' }}>
      <div className="absolute top-0 left-0 w-full h-2 bg-gradient-to-r from-[#FFB366] via-[#FFA347] to-[#FF9028]"></div>

      <header className="max-w-6xl mx-auto px-4 py-6 flex justify-end">
        <div className="flex gap-4">
          <Button
            onClick={() => router.push('/auth/signin')}
            variant="outline"
            className="rounded-full border-2 border-black px-6"
          >
            <LogIn className="w-4 h-4 mr-2" />
            登录
          </Button>
          <Button
            onClick={() => router.push('/auth/signup')}
            className="rounded-full bg-[#FF9028] hover:bg-[#FF8500] border-2 border-black px-6"
          >
            注册
          </Button>
        </div>
      </header>

      <div className="max-w-6xl mx-auto px-4 py-12 md:py-16">
        <div className="text-center mb-16">
          <div className="inline-block mb-6">
            <div className="flex items-center gap-3 px-6 py-3 bg-white rounded-full shadow-lg border-3 border-black">
              <Sparkles className="w-5 h-5 text-[#FF9028]" />
              <span className="text-sm font-medium text-gray-800">AI 驱动的任务规划</span>
            </div>
          </div>

          <h1 className="text-5xl md:text-7xl font-bold mb-6 text-gray-900 leading-tight">
            从拖延到高效
          </h1>

          <p className="text-xl md:text-2xl text-gray-700 mb-4 max-w-3xl mx-auto">
            将您的拖延转化为生产力
          </p>

          <p className="text-base md:text-lg text-gray-600 max-w-2xl mx-auto">
            借助 AI 助手，从拖延者转变为高效能人士。让 AI 帮助您规划时间、分解任务并温和地激励您。
          </p>
        </div>

        <div className="max-w-2xl mx-auto mb-20">
          <div className="bg-white rounded-3xl shadow-2xl p-8 border-3 border-black">
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-800 mb-3">
                告诉我您想要完成什么 ✨
              </label>
              <Input
                type="text"
                placeholder="例如：在3天内完成我的论文..."
                value={task}
                onChange={(e) => setTask(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleStart()}
                className="h-14 text-lg rounded-2xl border-3 border-gray-300 focus:border-[#FF9028] bg-white text-[#B3A07F]"
              />
            </div>

            <Button
              onClick={handleStart}
              disabled={!task.trim()}
              className="w-full h-14 text-lg rounded-2xl bg-gradient-to-r from-[#FFB366] to-[#FF9028] hover:from-[#FFA347] hover:to-[#FF8500] text-white font-semibold shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] border-3 border-black"
            >
              <Brain className="w-5 h-5 mr-2" />
              开始规划我的日程
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 mb-20">
          <div className="bg-white rounded-3xl p-8 shadow-lg border-3 border-black hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#62D5E1] flex items-center justify-center mb-6 shadow-lg border-3 border-black">
              <Brain className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">AI 智能规划</h3>
            <p className="text-gray-600 leading-relaxed">
              自动分解任务、分配时间并设置优先级。让 AI 成为您的个人时间管理教练。
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border-3 border-black hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#FFA59E] flex items-center justify-center mb-6 shadow-lg border-3 border-black">
              <Target className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">游戏化激励</h3>
            <p className="text-gray-600 leading-relaxed">
              通过完成任务获得经验值。从"青铜拖延者"升级到"黄金成就者"，让自律变得有趣。
            </p>
          </div>

          <div className="bg-white rounded-3xl p-8 shadow-lg border-3 border-black hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
            <div className="w-14 h-14 rounded-2xl bg-[#FFD966] flex items-center justify-center mb-6 shadow-lg border-3 border-black">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
            <h3 className="text-xl font-bold mb-3 text-gray-900">智能周报</h3>
            <p className="text-gray-600 leading-relaxed">
              每周自动生成完成情况报告。可视化您的成长曲线，见证您的转变。
            </p>
          </div>
        </div>

        <div className="text-center">
          <div className="inline-block bg-white rounded-3xl px-8 py-6 border-3 border-black shadow-lg">
            <p className="text-sm text-gray-700 mb-2">✨ 注册账户以保存您的进度 • 数据安全存储</p>
            <p className="text-xs text-gray-600">AI 驱动 • 为拖延者打造</p>
          </div>
        </div>
      </div>
    </div>
  );
}