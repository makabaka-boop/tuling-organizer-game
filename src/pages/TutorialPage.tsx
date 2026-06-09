import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import {
  ChevronLeft,
  ChevronRight,
  Home,
  Play,
  Bell,
  ListOrdered,
  Archive,
  ShieldAlert,
  Clock,
  MousePointer2,
  CheckSquare,
  AlertTriangle,
  Ban,
  FileQuestion,
  Shuffle,
  TrendingUp,
  Target,
  Timer,
  Lightbulb,
} from 'lucide-react';
import { Button } from '../components/ui/Button';
import { Card, CardHeader, CardContent, CardFooter } from '../components/ui/Card';
import { cn } from '../lib/utils';

interface TutorialPoint {
  icon?: React.ElementType;
  label?: string;
  text: string;
}

interface TutorialStep {
  icon: React.ElementType;
  title: string;
  description: string;
  points: TutorialPoint[];
  color: string;
}

const tutorialSteps: TutorialStep[] = [
  {
    icon: Bell,
    title: '游戏目标',
    description: '欢迎来到土铃整理小游戏！',
    color: 'text-clay-600',
    points: [
      { text: '你是民艺展演现场的工作人员' },
      { text: '负责安排土铃的出场顺序' },
      { text: '处理返件归位工作' },
      { text: '及时隔离异常件' },
      { text: '在限定时间内完成所有任务获得高分' },
    ],
  },
  {
    icon: ListOrdered,
    title: '出场顺序排列',
    description: '将土铃按正确顺序排列到出场队列',
    color: 'text-gold-600',
    points: [
      { text: '拖拽土铃到「出场顺位队列」' },
      { text: '或者双击土铃快速添加' },
      { text: '在队列内拖拽调整顺序' },
      { text: '点击 × 按钮可从队列移除' },
      { text: '根据土铃编号越小，顺位越靠前' },
    ],
  },
  {
    icon: Archive,
    title: '返件归位',
    description: '将需要归位的土铃送回仓库',
    color: 'text-ink-600',
    points: [
      { text: '带有「待归位」标签的土铃需要归位' },
      { text: '勾选多个土铃后点击「批量归位」' },
      { text: '或点击「归位」按钮快速归位单件' },
      { text: '也可以「全选」一键勾选全部归位' },
      { text: '归位完整率占总分的 25%' },
    ],
  },
  {
    icon: ShieldAlert,
    title: '异常件隔离',
    description: '发现异常的土铃需要及时隔离',
    color: 'text-cinnabar-600',
    points: [
      { text: '带有红色「异常」标签的是异常件' },
      { text: '点击「隔离」按钮进行隔离' },
      { text: '3 秒内隔离得满分' },
      { text: '每延迟 1 秒扣 10%' },
      { text: '异常隔离及时性占总分的 25%' },
    ],
  },
  {
    icon: AlertTriangle,
    title: '随机事件',
    description: '游戏中会出现各种突发事件',
    color: 'text-gold-600',
    points: [
      { icon: Shuffle, label: '顺位打乱', text: '已排好的顺序被部分打乱，需要快速调整' },
      { icon: FileQuestion, label: '返件漏记', text: '部分返件未被记录，需要额外识别' },
      { icon: Ban, label: '临时停用', text: '某件土铃临时不能出场' },
      { icon: Clock, label: '串场延迟', text: '操作暂停但计时继续' },
    ],
  },
  {
    icon: MousePointer2,
    title: '操作技巧',
    description: '一些实用的操作技巧',
    color: 'text-ink-600',
    points: [
      { text: '空格键或 ESC 键：暂停/继续游戏' },
      { text: '拖拽比点击更高效' },
      { text: '优先处理异常件获得更高分数' },
      { text: '注意时间，时间越少扣分越多' },
      { text: '提前完成可获得时间效率加分' },
    ],
  },
  {
    icon: Play,
    title: '评分系统',
    description: '了解评分规则，挑战高分',
    color: 'text-gold-600',
    points: [
      { text: '顺位正确率：30%' },
      { text: '返件完整率：25%' },
      { text: '异常隔离及时性：25%' },
      { text: '整体耗时：20%' },
      { text: 'S 级需要 95 分以上' },
    ],
  },
  {
    icon: TrendingUp,
    title: '如何提升评分',
    description: '理解各维度含义，从复盘结果找到改进方向',
    color: 'text-clay-600',
    points: [
      { icon: Target, label: '顺位正确率', text: '衡量出场顺序排列的正确程度，编号越小越靠前，排列越准确分数越高' },
      { icon: Archive, label: '返件完整率', text: '衡量待归位土铃的处理完整度，遗漏越少分数越高' },
      { icon: ShieldAlert, label: '异常隔离及时性', text: '衡量异常件隔离的速度，3秒内操作得满分，延迟越多扣分越多' },
      { icon: Timer, label: '耗时效率', text: '衡量整体操作速度，提前完成剩余时间越多分数越高' },
      { icon: Lightbulb, label: '复盘建议', text: '每局结算后会生成短板分析和改进建议，主界面关卡卡片上的标签提示最近表现' },
    ],
  },
];

export const TutorialPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const step = params.get('step');
    if (step === 'improve') {
      const improveIndex = tutorialSteps.findIndex(s => s.title === '如何提升评分');
      if (improveIndex >= 0) {
        setCurrentStep(improveIndex);
      }
    }
  }, [location.search]);

  const step = tutorialSteps[currentStep];
  const Icon = step.icon;

  const nextStep = () => {
    if (currentStep < tutorialSteps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      navigate('/');
    }
  };

  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="min-h-screen bg-paper paper-texture flex items-center justify-center p-4">
      <Card className="max-w-2xl w-full animate-fade-in">
        <CardHeader className="text-center">
          <div className="flex items-center justify-center gap-2 mb-2">
            {tutorialSteps.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentStep(index)}
                className={cn(
                  'w-2.5 h-2.5 rounded-full transition-all',
                  index === currentStep
                    ? 'bg-clay-600 w-8'
                    : 'bg-clay-200 hover:bg-clay-300'
                )}
              />
            ))}
          </div>
          <p className="text-sm text-clay-500">
            {currentStep + 1} / {tutorialSteps.length}
          </p>
        </CardHeader>

        <CardContent className="text-center py-8">
          <div
            className={cn(
              'w-20 h-20 mx-auto mb-6 rounded-2xl flex items-center justify-center',
              'bg-clay-50',
              step.color
            )}
          >
            <Icon className="w-10 h-10" />
          </div>

          <h2
            className={cn(
              'text-3xl font-bold font-serif mb-4',
              step.color
            )}
          >
            {step.title}
          </h2>

          <p className="text-clay-600 mb-8 text-lg">
            {step.description}
          </p>

          <div className="decorative-line mb-6" />

          <ul className="space-y-3 max-w-md mx-auto">
            {step.points.map((point, index) => {
              const PointIcon = point.icon;
              return (
                <li
                  key={index}
                  className="flex items-start gap-3 text-left"
                >
                  <span className="flex-shrink-0 w-6 h-6 bg-clay-100 rounded-full flex items-center justify-center text-clay-600 font-bold text-sm">
                    {index + 1}
                  </span>
                  <span className="text-clay-700 flex-1">
                    {PointIcon && (
                      <>
                        <PointIcon className="inline w-4 h-4 mr-1.5 text-clay-500" />
                        {point.label && (
                          <b className="text-clay-800">{point.label}：</b>
                        )}
                      </>
                    )}
                    {point.text}
                  </span>
                </li>
              );
            })}
          </ul>
        </CardContent>

        <CardFooter className="flex justify-between">
          <Button
            variant="secondary"
            onClick={prevStep}
            disabled={currentStep === 0}
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            上一步
          </Button>

          <Button variant="ghost" onClick={() => navigate('/')}>
            <Home className="w-4 h-4 mr-1" />
            跳过
          </Button>

          <Button variant="primary" onClick={nextStep}>
            {currentStep === tutorialSteps.length - 1 ? (
              <>
                开始游戏
                <Play className="w-4 h-4 ml-1" />
              </>
            ) : (
              <>
                下一步
                <ChevronRight className="w-4 h-4 ml-1" />
              </>
            )}
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
};
