import type { Level, Bell } from '../utils/types';

const categories = ['高音', '中音', '低音', '特殊音'];
const bellNames = [
  '青瓷铃', '黑陶铃', '白瓷铃', '褐陶铃', '红陶铃',
  '灰陶铃', '彩陶铃', '黑釉铃', '青釉铃', '酱釉铃',
  '蓝釉铃', '绿釉铃', '黄釉铃', '紫釉铃', '红釉铃',
];

function createBell(
  id: string,
  position: number,
  options: Partial<Bell> = {}
): Bell {
  return {
    id,
    name: bellNames[position - 1] || `土铃-${position}`,
    code: `TL-${String(position).padStart(3, '0')}`,
    category: categories[(position - 1) % categories.length],
    status: 'pending',
    isAbnormal: false,
    disabled: false,
    correctPosition: position,
    needReturn: position <= 4,
    ...options,
  };
}

export const levels: Level[] = [
  {
    id: 1,
    name: '初出茅庐',
    description: '学习基础操作：拖拽排序和快速归位。',
    difficulty: 1,
    totalTime: 90,
    targetReturnCount: 3,
    bells: [
      createBell('bell-1-1', 1, { needReturn: true }),
      createBell('bell-1-2', 2, { needReturn: true }),
      createBell('bell-1-3', 3, { needReturn: true }),
      createBell('bell-1-4', 4, { needReturn: false }),
      createBell('bell-1-5', 5, { needReturn: false }),
      createBell('bell-1-6', 6, { needReturn: false }),
    ],
    events: [],
  },
  {
    id: 2,
    name: '渐入佳境',
    description: '引入异常件隔离和顺位打乱事件。',
    difficulty: 2,
    totalTime: 120,
    targetReturnCount: 4,
    bells: [
      createBell('bell-2-1', 1, { needReturn: true }),
      createBell('bell-2-2', 2, { needReturn: true }),
      createBell('bell-2-3', 3, {
        isAbnormal: true,
        abnormalReason: '音色偏差',
        needReturn: false,
      }),
      createBell('bell-2-4', 4, { needReturn: true }),
      createBell('bell-2-5', 5, { needReturn: false }),
      createBell('bell-2-6', 6, { needReturn: true }),
      createBell('bell-2-7', 7, {
        isAbnormal: true,
        abnormalReason: '外观破损',
        needReturn: false,
      }),
      createBell('bell-2-8', 8, { needReturn: false }),
    ],
    events: [
      {
        id: 'event-2-1',
        type: 'shuffle',
        triggerTime: 40,
        targetBellIds: ['bell-2-1', 'bell-2-2', 'bell-2-4'],
        message: '紧急通知：部分出场顺序需要重新调整！',
      },
    ],
  },
  {
    id: 3,
    name: '游刃有余',
    description: '增加返件漏记和临时停用事件，考验应变能力。',
    difficulty: 3,
    totalTime: 150,
    targetReturnCount: 5,
    bells: [
      createBell('bell-3-1', 1, { needReturn: true }),
      createBell('bell-3-2', 2, { needReturn: true }),
      createBell('bell-3-3', 3, { needReturn: true }),
      createBell('bell-3-4', 4, {
        isAbnormal: true,
        abnormalReason: '裂纹瑕疵',
        needReturn: false,
      }),
      createBell('bell-3-5', 5, { needReturn: true }),
      createBell('bell-3-6', 6, { needReturn: true }),
      createBell('bell-3-7', 7, { needReturn: false }),
      createBell('bell-3-8', 8, { needReturn: false }),
      createBell('bell-3-9', 9, { needReturn: false }),
      createBell('bell-3-10', 10, {
        isAbnormal: true,
        abnormalReason: '音色失准',
        needReturn: false,
      }),
    ],
    events: [
      {
        id: 'event-3-1',
        type: 'disable',
        triggerTime: 25,
        targetBellIds: ['bell-3-5'],
        message: '注意：编号 005 的土铃临时停用，请从队列中移除！',
      },
      {
        id: 'event-3-2',
        type: 'missing',
        triggerTime: 55,
        targetBellIds: ['bell-3-2', 'bell-3-6'],
        message: '返件漏记：部分待归位土铃未被记录，请仔细检查！',
      },
      {
        id: 'event-3-3',
        type: 'delay',
        triggerTime: 85,
        duration: 5,
        message: '主持串场：操作暂停 5 秒，但计时继续！',
      },
    ],
  },
  {
    id: 4,
    name: '炉火纯青',
    description: '所有事件随机触发，时间更紧张，考验你的综合能力！',
    difficulty: 4,
    totalTime: 180,
    targetReturnCount: 6,
    bells: [
      createBell('bell-4-1', 1, { needReturn: true }),
      createBell('bell-4-2', 2, { needReturn: true }),
      createBell('bell-4-3', 3, { needReturn: true }),
      createBell('bell-4-4', 4, {
        isAbnormal: true,
        abnormalReason: '轻微变形',
        needReturn: false,
      }),
      createBell('bell-4-5', 5, { needReturn: true }),
      createBell('bell-4-6', 6, { needReturn: true }),
      createBell('bell-4-7', 7, { needReturn: true }),
      createBell('bell-4-8', 8, { needReturn: false }),
      createBell('bell-4-9', 9, {
        isAbnormal: true,
        abnormalReason: '釉面脱落',
        needReturn: false,
      }),
      createBell('bell-4-10', 10, { needReturn: false }),
      createBell('bell-4-11', 11, {
        isAbnormal: true,
        abnormalReason: '音质浑浊',
        needReturn: false,
      }),
      createBell('bell-4-12', 12, { needReturn: false }),
    ],
    events: [
      {
        id: 'event-4-1',
        type: 'shuffle',
        triggerTime: 30,
        targetBellIds: ['bell-4-2', 'bell-4-3', 'bell-4-5', 'bell-4-6'],
        message: '顺位打乱：出场顺序临时变动，请快速调整！',
      },
      {
        id: 'event-4-2',
        type: 'disable',
        triggerTime: 55,
        targetBellIds: ['bell-4-7'],
        message: '临时停用：编号 007 的土铃出现问题，请勿安排出场！',
      },
      {
        id: 'event-4-3',
        type: 'missing',
        triggerTime: 80,
        targetBellIds: ['bell-4-1', 'bell-4-5', 'bell-4-6'],
        message: '返件漏记：系统漏记了部分待归位土铃，请手动识别！',
      },
      {
        id: 'event-4-4',
        type: 'delay',
        triggerTime: 105,
        duration: 6,
        message: '主持串场：请稍作等待，主持人正在串场...',
      },
      {
        id: 'event-4-5',
        type: 'shuffle',
        triggerTime: 135,
        targetBellIds: ['bell-4-2', 'bell-4-6'],
        message: '最后调整：还有两处顺序需要确认！',
      },
    ],
  },
];

export function getLevelById(id: number): Level | undefined {
  return levels.find(l => l.id === id);
}

export function cloneLevel(level: Level): Level {
  return {
    ...level,
    bells: level.bells.map(b => ({ ...b })),
    events: level.events.map(e => ({ ...e })),
  };
}
