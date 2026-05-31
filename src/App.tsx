import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import { fetchMessages, saveMessages, listBackups, createBackup, getBackupContent } from './guestbook.ts';
import { fetchTexts, saveTexts, defaultTexts } from './siteTexts.ts';
import { hashPassword, fetchAdminConfig, saveAdminConfig, generateCode } from './adminConfig.ts';
import emailjs from '@emailjs/browser';

// 防御性注入：显式地将 React、ReactDOM 以及 tailwind 挂载到全局 window 对象上
// 这能彻底解决沙箱在延迟加载或编译测试脚本时，因找不到全局宿主对象而引发的 ReferenceError 报错
if (typeof window !== 'undefined') {
  window.React = React;
  window.ReactDOM = window.ReactDOM || ReactDOM;
  window.tailwind = window.tailwind || { config: {} };
}

// ================= 替代 lucide-react 的轻量级原生 SVG 图标组件 =================
const PlayIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polygon points="6 3 20 12 6 21 6 3" fill="currentColor" />
  </svg>
);

const PauseIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="6" y="4" width="4" height="16" fill="currentColor" />
    <rect x="14" y="4" width="4" height="16" fill="currentColor" />
  </svg>
);

const FilmIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect width="20" height="20" x="2" y="2" rx="2.18" ry="2.18" />
    <line x1="7" x2="7" y1="2" y2="22" />
    <line x1="17" x2="17" y1="2" y2="22" />
    <line x1="2" x2="22" y1="12" y2="12" />
    <line x1="2" x2="7" y1="7" y2="7" />
    <line x1="2" x2="7" y1="17" y2="17" />
    <line x1="17" x2="22" y1="7" y2="7" />
    <line x1="17" x2="22" y1="17" y2="17" />
  </svg>
);

const CameraIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

const CompassIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="10" />
    <polygon points="16.24 7.76 14.12 14.12 7.76 16.24 9.88 9.88 16.24 7.76" fill="currentColor" />
  </svg>
);

const ImageIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
    <circle cx="9" cy="9" r="2" />
    <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
  </svg>
);

const ChevronDownIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);

const MessageSquareIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="22" y1="2" x2="11" y2="13" />
    <polygon points="22 2 15 22 11 13 2 9 22 2" fill="currentColor" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const ArrowLeftIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="19" y1="12" x2="5" y2="12" />
    <polyline points="12 19 5 12 12 5" />
  </svg>
);

const ArrowRightIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="5" y1="12" x2="19" y2="12" />
    <polyline points="12 5 19 12 12 19" />
  </svg>
);

const SettingsIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <circle cx="12" cy="12" r="3" />
    <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z" />
  </svg>
);

const TrashIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="3 6 5 6 21 6" />
    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

const EditIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
    <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
  </svg>
);

const PlusIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <line x1="12" y1="5" x2="12" y2="19" />
    <line x1="5" y1="12" x2="19" y2="12" />
  </svg>
);

const LockIcon = ({ className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
    <path d="M7 11V7a5 5 0 0 1 10 0v4" />
  </svg>
);

// 拟真唱机唱针组件
const ToneArm = ({ isPlaying }) => (
  <svg
    className="absolute -top-1.5 -right-1.5 w-7 h-10 pointer-events-none transition-transform duration-[1500ms] ease-in-out z-20"
    style={{
      transformOrigin: '21px 5px',
      transform: isPlaying ? 'rotate(23deg)' : 'rotate(0deg)'
    }}
    viewBox="0 0 24 32"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
  >
    {/* 唱针枢轴底座 */}
    <circle cx="21" cy="5" r="3.5" fill="#4f46e5" />
    <circle cx="21" cy="5" r="1.5" fill="#ffffff" />
    {/* 唱针主金属杆 */}
    <path d="M21 5 L12 25 L8 27" stroke="#cbd5e1" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    {/* 唱头拾音器 */}
    <rect x="5" y="25" width="4" height="6" rx="0.5" transform="rotate(-15 7 28)" fill="#1e293b" stroke="#475569" strokeWidth="0.5" />
  </svg>
);

// ================= 轻量级、高性能 Canvas 雪花粒子组件 =================
function Snowfall() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let width = window.innerWidth;
    let height = window.innerHeight;

    canvas.width = width;
    canvas.height = height;

    // 根据屏幕面积动态计算雪花数量
    const numFlakes = Math.min(100, Math.floor((width * height) / 12000));
    const flakes = [];

    // 初始化雪花粒子属性
    for (let i = 0; i < numFlakes; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 0.6, // 半径，形成远近景深
        d: Math.random() * numFlakes, // 独特的摇摆相位因子
        opacity: Math.random() * 0.5 + 0.15, // 柔和的半透明
        speedY: Math.random() * 1.0 + 0.4, // 下落速度
        speedX: Math.random() * 0.4 - 0.2, // 初始微风偏向
      });
    }

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      ctx.beginPath();

      for (let i = 0; i < numFlakes; i++) {
        const f = flakes[i];
        ctx.fillStyle = `rgba(255, 255, 255, ${f.opacity})`;
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
      }
      ctx.fill();
      update();
    };

    const update = () => {
      for (let i = 0; i < numFlakes; i++) {
        const f = flakes[i];

        f.y += f.speedY;
        f.x += f.speedX + Math.sin(f.d) * 0.25;

        // 边界检测
        if (f.y > height) {
          flakes[i] = {
            x: Math.random() * width,
            y: -10,
            r: f.r,
            d: f.d,
            opacity: f.opacity,
            speedY: f.speedY,
            speedX: f.speedX
          };
        }

        // 左右边界穿透
        if (f.x > width) f.x = 0;
        else if (f.x < 0) f.x = width;

        f.d += 0.008;
      }
    };

    const loop = () => {
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    const handleResize = () => {
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width;
      canvas.height = height;
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-30"
      style={{ mixBlendMode: 'screen' }}
    />
  );
}

// ================= 高级 Canvas 粒子歌词转换发生器 =================
function ParticleLyrics({ text }) {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const particlesRef = useRef([]);
  const animationFrameRef = useRef(null);
  const prevTextRef = useRef("");

  useEffect(() => {
    if (text !== prevTextRef.current) {
      triggerTransitionBurst();
      prevTextRef.current = text;
    }
  }, [text]);

  const triggerTransitionBurst = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const rect = canvas.getBoundingClientRect();

    // 1. 旧歌词消散粒子：向下坠落并散开
    const disintegrateCount = 35;
    for (let i = 0; i < disintegrateCount; i++) {
      particlesRef.current.push({
        x: rect.width / 2 + (Math.random() - 0.5) * 180,
        y: rect.height / 2 + (Math.random() - 0.5) * 10,
        vx: (Math.random() - 0.5) * 5,
        vy: Math.random() * 2.5 + 1.0, // 主要朝下坠落
        size: Math.random() * 1.5 + 0.6,
        color: Math.random() > 0.4 ? 'rgba(165, 180, 252, ' : 'rgba(255, 255, 255, ', // 柔和星光色 / 闪白
        alpha: 1,
        decay: Math.random() * 0.04 + 0.02
      });
    }

    // 2. 新歌词凝聚粒子：向上飘散汇聚
    const condensationCount = 35;
    for (let i = 0; i < condensationCount; i++) {
      particlesRef.current.push({
        x: rect.width / 2 + (Math.random() - 0.5) * 220,
        y: rect.height / 2 + (Math.random() - 0.5) * 20 + 5,
        vx: (Math.random() - 0.5) * 2.5,
        vy: -Math.random() * 2.5 - 1.5, // 向上飘逸
        size: Math.random() * 2.2 + 1.0,
        color: Math.random() > 0.3 ? 'rgba(99, 102, 241, ' : 'rgba(199, 210, 254, ', // 纯靛蓝 / 柔冷光
        alpha: 1.0,
        decay: Math.random() * 0.03 + 0.012
      });
    }
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      canvas.width = rect.width;
      canvas.height = rect.height;
    };

    handleResize();
    window.addEventListener('resize', handleResize);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const particles = particlesRef.current;

      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.alpha -= p.decay;

        ctx.fillStyle = p.color + p.alpha + ')';
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();

        // 死亡检测
        if (p.alpha <= 0) {
          particles.splice(i, 1);
        }
      }
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', handleResize);
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, []);

  return (
    <div ref={containerRef} className="relative w-full text-center py-4 px-6 min-h-[4rem] flex items-center justify-center">
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none w-full h-full" />
      {/* 应用专属歌词艺术字体 font-lyrics */}
      <div key={text} className="font-lyrics text-sm md:text-base font-light tracking-[0.2em] text-indigo-100 drop-shadow-[0_2px_8px_rgba(99,102,241,0.3)] select-none transition-all duration-[900ms] animate-fade-in-blur">
        {text || "..."}
      </div>
    </div>
  );
}

// ================= 文本编辑器辅助组件 =================
function TextEditRow({ label, value, onChange, multiline }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[9px] text-white/40 tracking-wider">{label}</label>
      {multiline ? (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          rows="3"
          className="w-full bg-white/[0.04] border border-white/10 text-xs p-2.5 rounded text-white/90 outline-none focus:border-indigo-500/40 resize-none"
        />
      ) : (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          className="w-full bg-white/[0.04] border border-white/10 text-xs p-2.5 rounded text-white/90 outline-none focus:border-indigo-500/40"
        />
      )}
    </div>
  );
}

// ================= 主应用 =================
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false); // 故事弹窗控制状态


  // 管理员后台核心控制状态
  const [isAdminOpen, setIsAdminOpen] = useState(false);
  const [adminPassword, setAdminPassword] = useState('');
  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState(false);
  const [loginError, setLoginError] = useState(false);
  const [adminTab, setAdminTab] = useState('gallery'); // 'gallery' | 'collection' | 'guestbook' | 'playlist'

  // 编辑项目暂存状态
  const [editingItemId, setEditingItemId] = useState(null);
  const [editForm, setEditForm] = useState({ title: '', subtitle: '', image: '', desc: '', story: '', category: '' });

  // 歌单音乐管理状态 & 同步歌词播放进度状态
  const [activeSongIndex, setActiveSongIndex] = useState(0);
  const [showMiniPlaylist, setShowMiniPlaylist] = useState(false); // 控制主页面迷你播放列表面板显隐
  const [currentTime, setCurrentTime] = useState(0);
  const [isMusicVisible, setIsMusicVisible] = useState(true); // 音乐组件显隐控制

  // 歌词位置固定，不可拖动

  // 1. 核心大画廊数据 state (本地持久化)
  const [galleryItems, setGalleryItems] = useState(() => {
    const saved = localStorage.getItem('kt_gallery_items');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        title: "雪山之巅",
        subtitle: "SNOW MOUNTAINS",
        image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1200&q=80",
        desc: "在海拔五千米的地方，呼吸冰冷的空气。寂静如坚冰，唯有风雪在低吟荒野的赞歌."
      },
      {
        id: 2,
        title: "城市边缘",
        subtitle: "URBAN EDGE",
        image: "https://images.unsplash.com/photo-1477959858617-6c0859641db1?auto=format&fit=crop&w=1200&q=80",
        desc: "钢铁森林深处的暮色。余晖被切割成几何的切面，我们在白昼与黑夜的缝隙中寻找灵魂的落脚点."
      },
      {
        id: 3,
        title: "荒野回声",
        subtitle: "WILDERNESS ECHO",
        image: "https://images.unsplash.com/photo-1414441028751-2e650059c2bb?auto=format&fit=crop&w=1200&q=80",
        desc: "雾气升腾的林间。光线如丝绸般穿透松针，那一刻，自然本身正在进行一场无声的呼吸."
      },
      {
        id: 4,
        title: "星辰大海",
        subtitle: "STARRY OCEAN",
        image: "https://images.unsplash.com/photo-1506744626753-1fa28f67ea1c?auto=format&fit=crop&w=1200&q=80",
        desc: "黑夜的尽头，浪潮吞吐着星河的倒影。我们在无垠的宇宙与无尽的浪花中，见证永恒与刹那的重叠."
      }
    ];
  });

  // 2. 栅格图片集数据 state (本地持久化)
  const [collectionPhotos, setCollectionPhotos] = useState(() => {
    const saved = localStorage.getItem('kt_collection_photos');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: "photo-1",
        title: "光阴小径",
        category: "LANDSCAPE",
        image: "https://images.unsplash.com/photo-1511497584788-876760111969?auto=format&fit=crop&w=1000&q=85",
        subtitle: "WOODLAND PATHWAY",
        story: "林深时见雾，溪深时见鹿。踩着带有露水的松针前行，每一步都是一首大自然的散文诗."
      },
      {
        id: "photo-2",
        title: "冷光漫延",
        category: "CITY",
        image: "https://images.unsplash.com/photo-1514565131-fce0801e5785?auto=format&fit=crop&w=1000&q=85",
        subtitle: "BLUE NEON LIGHTS",
        story: "下雨后的城市霓虹，折射着孤寂的幽蓝。高架下的积水倒影，成了这个钢铁城市唯一的温床."
      },
      {
        id: "photo-3",
        title: "赤子微醺",
        category: "DREAM",
        image: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&w=1000&q=85",
        subtitle: "CRIMSON SUNSET",
        story: "天空倾洒了微醺的红葡萄酒。在那片绯红的虚无前，一叶扁舟仿佛已漂流了数个光纪."
      },
      {
        id: "photo-4",
        title: "凝止时钟",
        category: "DREAM",
        image: "https://images.unsplash.com/photo-1483168527879-c66136b56105?auto=format&fit=crop&w=1000&q=85",
        subtitle: "THE UNIVERSE WATCH",
        story: "繁星坠落成荒漠的极光。若将此刻写在明信片里，是否能永远拦截即将逝去的漫漫严寒？"
      },
      {
        id: "photo-5",
        title: "暮色回响",
        category: "LANDSCAPE",
        image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1000&q=85",
        subtitle: "GOLDEN BREAKWATER",
        story: "浪花在礁石上破灭成粉碎的白芒，那是夕阳沉入水底前，释放的最后一声回音."
      },
      {
        id: "photo-6",
        title: "交织星轨",
        category: "CITY",
        image: "https://images.unsplash.com/photo-1506318137071-a8e063b4bec0?auto=format&fit=crop&w=1000&q=85",
        subtitle: "COSMIC CONVERGENCE",
        story: "快门极慢的曝光，将永恒的时间压缩在了一帧里。我们在闪烁的繁星轨道下，拥抱着静静入眠."
      }
    ];
  });

  // 3. 音乐播放列表 state (本地持久化)
  const [songs, setSongs] = useState(() => {
    const saved = localStorage.getItem('kt_playlist_songs');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 1,
        title: "特别的人 (方大同)",
        url: "https://mytuchuang.oss-cn-chengdu.aliyuncs.com/%E9%9F%B3%E4%B9%90/%E7%89%B9%E5%88%AB%E7%9A%84%E4%BA%BA-%E6%96%B9%E5%A4%A7%E5%90%8C%231D7Ie.mp3"
      },
      {
        id: 2,
        title: "Sugar (Maroon 5)",
        url: "https://mytuchuang.oss-cn-chengdu.aliyuncs.com/%E9%9F%B3%E4%B9%90/Sugar-Maroon%205%23fAzGO.mp3"
      },
      {
        id: 3,
        title: "最佳损友 (陈奕迅)",
        url: "https://mytuchuang.oss-cn-chengdu.aliyuncs.com/%E9%9F%B3%E4%B9%90/%E6%9C%80%E4%BD%B3%E6%8D%9F%E5%8F%8B-%E9%99%88%E5%A5%95%E8%BF%85%238UDt.mp3"
      }
    ];
  });

  // 4. 定制化高精度直连歌词库 (精准对齐阿里云 OSS 音轨时间点)
  const songLyrics = {
    1: [ // 方大同 - 特别的人 (精准毫秒级换算)
      { time: 0.06, text: "特别的人 - 方大同" },
      { time: 15.47, text: "爱一个人或许要慷慨" },
      { time: 20.53, text: "若只想要被爱" },
      { time: 22.82, text: "最后没有了对白" },
      { time: 27.10, text: "必须有你我的情真" },
      { time: 31.96, text: "不求计分的平等" },
      { time: 34.77, text: "总有幸福有心疼" },
      { time: 38.16, text: "生命的起伏要认可" },
      { time: 42.88, text: "懂一个人也许要忍耐" },
      { time: 47.97, text: "要经过了意外" },
      { time: 50.18, text: "才了解所谓的爱" },
      { time: 54.55, text: "今后的岁月" },
      { time: 57.02, text: "让我们一起了解" },
      { time: 60.46, text: "多少天长地久" },
      { time: 63.45, text: "有几回细水长流" },
      { time: 68.26, text: "我们是对方 特别的人" },
      { time: 75.44, text: "奋不顾身 难舍难分" },
      { time: 78.93, text: "不是一般人的认真" },
      { time: 82.33, text: "若只有一天 爱一个人" },
      { time: 89.13, text: "让那时间每一刻在倒退" },
      { time: 93.40, text: "生命中有万事的可能" },
      { time: 98.51, text: "你就是我要遇见的 特别的人" },
      { time: 108.04, text: "懂一个人也许要忍耐" },
      { time: 113.03, text: "要经过了意外" },
      { time: 115.34, text: "才了解所谓的爱" },
      { time: 119.65, text: "今后的岁月" },
      { time: 122.18, text: "让我们一起了解" },
      { time: 125.65, text: "多少天长地久" },
      { time: 128.56, text: "有几回细水长流" },
      { time: 133.42, text: "我们是对方 特别的人" },
      { time: 140.58, text: "奋不顾身 难舍难分" },
      { time: 144.02, text: "不是一般人的认真" },
      { time: 147.42, text: "若只有一天 爱一个人" },
      { time: 154.12, text: "让那时间每一刻在倒退" },
      { time: 158.48, text: "生命中有万事的可能" },
      { time: 163.68, text: "你就是我要遇见的 特别的人" },
      { time: 170.61, text: "有时候我们都会寂寞" },
      { time: 174.90, text: "有时也会失败 怕被淘汰" },
      { time: 179.13, text: "想去找一个明白" },
      { time: 182.33, text: "而我曾经多次的等待未来" },
      { time: 188.78, text: "你何时会来" },
      { time: 191.02, text: "人山人海 总有你的存在" },
      { time: 196.36, text: "有你我的爱" },
      { time: 198.75, text: "我们是对方 特别的人" },
      { time: 205.73, text: "奋不顾身 难舍难分" },
      { time: 209.22, text: "不是一般人的认真" },
      { time: 212.60, text: "若只有一天 爱一个人" },
      { time: 219.43, text: "让那时间每一刻在倒退" },
      { time: 223.66, text: "生命中有万事的可能" },
      { time: 228.78, text: "你就是我要遇见的 特别的人" }
    ],
    2: [ // Maroon 5 - Sugar
      { time: 8.00, text: "I'm hurting baby, I'm broken down (我受伤了宝贝，我心碎了一地)" },
      { time: 12.00, text: "I need your loving, loving (我需要你的爱)" },
      { time: 14.00, text: "I need it now (我现在就要)" },
      { time: 16.00, text: "When I'm without you (当我失去了你)" },
      { time: 18.00, text: "I'm something weak (感觉像失去身体的一部分一样虚弱)" },
      { time: 20.00, text: "You got me begging, begging (你让我苦苦乞求)" },
      { time: 22.00, text: "I'm on my knees (我都给你跪了)" },
      { time: 24.00, text: "I don't wanna be needing your love (我不想只是需要你的爱)" },
      { time: 26.00, text: "I just wanna be deep in your love (我只想沉溺在你的爱中)" },
      { time: 28.00, text: "And it's killing me when you're away (当你不在身边简直让我想死)" },
      { time: 31.00, text: "Ooh baby,cause a bullet don't care where you are (因为你像子弹一样无情)" },
      { time: 34.00, text: "I just wanna be there where you are (我只想到达你的所在地)" },
      { time: 36.00, text: "And I gotta get one little taste (我要先浅尝一口)" },
      { time: 39.00, text: "Sugar (糖甜心)" },
      { time: 41.00, text: "Yes please (没错 请来吧)" },
      { time: 43.00, text: "Won't you come and put it down on me (你要不要来我身边)" },
      { time: 47.00, text: "Oh right here, cause I need (喔就是这里，因为我需要)" },
      { time: 51.00, text: "Little love and little sympathy (一点爱与一点同情)" },
      { time: 55.00, text: "Yeah you show me good loving (你就是爱的典范)" },
      { time: 57.00, text: "Make it alright (你让一切变得完美)" },
      { time: 59.00, text: "Need a little sweetness in my life (我的人生需要一点甜心)" },
      { time: 63.00, text: "Sugar (糖甜心)" },
      { time: 65.00, text: "Yes please (没错 请来吧)" },
      { time: 67.00, text: "Won't you come and put it down on me (将甜蜜倒在我的身上)" },
      { time: 72.00, text: "My broken pieces (我那破碎的心)" },
      { time: 74.00, text: "You put them up (你将那些碎片拾起)" },
      { time: 76.00, text: "Don't leave me hanging, hanging (别让我陷入迷惘之中)" },
      { time: 78.00, text: "Come get me some (过来给我点糖)" },
      { time: 80.00, text: "When I'm without ya (当你不在我身边)" },
      { time: 82.00, text: "So insecure (是如此不安)" },
      { time: 84.00, text: "You are the one thing, one thing (你是我唯一的执着)" },
      { time: 86.00, text: "I'm never full (我永远渴望不够)" },
      { time: 88.00, text: "I don't wanna be needing your love (我不想只是需要你的爱)" },
      { time: 90.00, text: "I just wanna be deep in your love (我只想沉溺在你的爱中)" },
      { time: 92.00, text: "And it's killing me when you're away (当你不在身边简直让我想死)" },
      { time: 95.00, text: "Ooh baby,cause a bullet don't care where you are" },
      { time: 98.00, text: "I just wanna be there where you are (我只想陪伴在你身边)" },
      { time: 100.00, text: "And I gotta get one little taste (我要先浅尝一口)" },
      { time: 103.00, text: "Sugar (糖甜心)" },
      { time: 105.00, text: "Yes please (没错 请来吧)" },
      { time: 107.00, text: "Won't you come and put it down on me (快来到我的身边)" },
      { time: 111.00, text: "Oh right here, cause I need (喔就是这里，因为我需要)" },
      { time: 115.00, text: "Little love and little sympathy (一点爱与一点同情)" },
      { time: 119.00, text: "Yeah you show me good loving (你就是爱的典范)" },
      { time: 121.00, text: "Make it alright (你让一切变得完美)" },
      { time: 123.00, text: "Need a little sweetness in my life (我的人生需要一点甜心)" },
      { time: 127.00, text: "Sugar (糖甜心)" },
      { time: 129.00, text: "Yes please (没错 请来吧)" },
      { time: 131.00, text: "Won't you come and put it down on me (将甜蜜倒在我的身上)" },
      { time: 135.00, text: "Yeah (是啊)" },
      { time: 136.00, text: "I want that red velvet (我想要那红丝绒蛋糕)" },
      { time: 138.00, text: "I want that sugar sweet (我想要那极致的甜蜜)" },
      { time: 140.00, text: "Don't let nobody touch it (不准任何人触碰)" },
      { time: 142.00, text: "Unless that somebody is me (除非那个某人是我)" },
      { time: 144.00, text: "I gotta be a man (我要变成男子汉)" },
      { time: 146.00, text: "There ain't no other way (已无其他办法)" },
      { time: 148.00, text: "Cause girl you're hotter than southern california bae (因为美眉你比南加州还要火辣)" },
      { time: 152.00, text: "I don't wanna play no games (我不想玩任何没有结果的游戏)" },
      { time: 154.00, text: "I don't gotta be afraid (我不想变得胆怯)" },
      { time: 156.00, text: "Don't give all that shy sh-t (别管那些脸红心跳)" },
      { time: 157.00, text: "No make up on, that's my... (没有任何伪妆，那就是我的...)" },
      { time: 159.00, text: "Sugar (糖甜心)" },
      { time: 161.00, text: "Yes please" },
      { time: 163.00, text: "Won't you come and put it down on me" },
      { time: 167.00, text: "Oh right here, cause I need" },
      { time: 171.00, text: "Little love and little sympathy" },
      { time: 175.00, text: "Yeah you show me good loving" },
      { time: 177.00, text: "Make it alright" },
      { time: 179.00, text: "Need a little sweetness in my life" },
      { time: 183.00, text: "Sugar (糖甜心)" },
      { time: 185.00, text: "Yes please" },
      { time: 187.00, text: "Won't you come and put it down on me" },
      { time: 191.00, text: "Sugar" },
      { time: 193.00, text: "Yes please" },
      { time: 195.00, text: "Won't you come and put it down on me" },
      { time: 199.00, text: "Oh right here, cause I need" },
      { time: 203.00, text: "Little love and little sympathy" },
      { time: 207.00, text: "Yeah you show me good loving" },
      { time: 209.00, text: "Make it alright" },
      { time: 211.00, text: "Need a little sweetness in my life" },
      { time: 215.00, text: "Sugar (糖甜心)" },
      { time: 217.00, text: "Yes please" },
      { time: 219.00, text: "Won't you come and put it down on me" }
    ],
    3: [ // 陈奕迅 - 最佳损友 (精准毫秒级换算)
      { time: 0.00, text: "最佳损友 - 陈奕迅 (Eason Chan)" },
      { time: 1.34, text: "朋友 我当你一秒朋友" },
      { time: 6.96, text: "朋友 我当你一世朋友" },
      { time: 13.58, text: "奇怪 过去再不堪回首" },
      { time: 20.32, text: "怀缅 时时其实还有" },
      { time: 26.98, text: "朋友 你试过将我营救" },
      { time: 34.03, text: "朋友 你试过把我批斗" },
      { time: 40.25, text: "无法 再与你交心联手" },
      { time: 46.10, text: "毕竟 难得有过最佳损友" },
      { time: 51.82, text: "从前共你 促膝把酒" },
      { time: 54.89, text: "倾通宵都不够" },
      { time: 56.54, text: "我有痛快过 你有没有" },
      { time: 60.74, text: "很多东西今生只可给你" },
      { time: 63.21, text: "保守至到永久" },
      { time: 64.81, text: "别人如何明白透" },
      { time: 67.23, text: "实实在在 踏入过我宇宙" },
      { time: 69.76, text: "即使相处到 有个裂口" },
      { time: 73.20, text: "命运决定了 以后再没法聚头" },
      { time: 76.67, text: "但说过去 却那样厚" },
      { time: 79.29, text: "问我有没有 确实也没有" },
      { time: 82.68, text: "一直躲避的藉口 非什么大仇" },
      { time: 86.04, text: "为何旧知己 在最后" },
      { time: 89.31, text: "变不到老友" },
      { time: 92.65, text: "不知你是我敌友 已没法望透" },
      { time: 96.47, text: "被推着走 跟着生活流" },
      { time: 99.42, text: "来年陌生的" },
      { time: 101.43, text: "是昨日最亲的某某" },
      { time: 110.63, text: "生死之交当天不知罕有" },
      { time: 113.09, text: "到你变节了 至觉未够" },
      { time: 117.21, text: "多想一天 彼此都不追究" },
      { time: 119.75, text: "相邀再次喝酒" },
      { time: 121.40, text: "待 葡萄成熟透" },
      { time: 123.87, text: "但是命运入面 每个邂逅" },
      { time: 126.46, text: "一起走到了 某个路口" },
      { time: 129.71, text: "是敌与是友 各自也没有自由" },
      { time: 133.31, text: "位置变了 各有队友" },
      { time: 136.00, text: "问我有没有 确实也没有" },
      { time: 139.37, text: "一直躲避的藉口 非什么大仇" },
      { time: 142.65, text: "为何旧知己 在最后" },
      { time: 145.96, text: "变不到老友" },
      { time: 149.31, text: "不知你是我敌友 已没法望透" },
      { time: 153.12, text: "被推着走 跟着生活流" },
      { time: 156.05, text: "来年陌生的" },
      { time: 157.93, text: "是昨日最亲的某某" },
      { time: 161.50, text: "早知解散后 各自有际遇作导游" },
      { time: 165.87, text: "奇就奇在 接受了 各自有路走" },
      { time: 169.28, text: "却没人像你 让我 眼泪背着流" },
      { time: 172.50, text: "严重似情侣 讲分手" },
      { time: 189.99, text: "有没有 确实也没有" },
      { time: 192.52, text: "一直躲避的藉口 非什么大仇" },
      { time: 195.84, text: "为何旧知己 在最后 变不到老友" },
      { time: 202.55, text: "不知你又有没有 挂念这旧友" },
      { time: 206.34, text: "或者自己 早就想通透" },
      { time: 209.20, text: "来年陌生的 是昨日 最亲的某某" },
      { time: 214.61, text: "总好于 那日我 没有" },
      { time: 219.65, text: "没有 遇过 某某" }
    ]
  };

  // 集中化管理灯箱状态
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    isActive: false,
    type: null,
    item: null,
    index: null
  });

  const [activePhotoCategory, setActivePhotoCategory] = useState('ALL');

  // 留言板状态
  const [messages, setMessages] = useState([]);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState({ name: false, text: false });

  // 留言板备份 & 回到顶部状态
  const [backups, setBackups] = useState([]);
  const [backupStatus, setBackupStatus] = useState(''); // '' | 'loading' | 'created' | 'no_changes' | 'failed'
  const [restoreConfirm, setRestoreConfirm] = useState(null); // { name, messages, time } | null
  const [showBackToTop, setShowBackToTop] = useState(false);

  // 页面文本配置 & 公告 & 文本编辑状态
  const [siteTexts, setSiteTexts] = useState(defaultTexts);
  const [textSaveStatus, setTextSaveStatus] = useState('');
  const [isAnnounceOpen, setIsAnnounceOpen] = useState(false);

  // 密码修改 & 邮箱验证状态
  const [storedPasswordHash, setStoredPasswordHash] = useState(null); // 从 GitHub 加载
  const [isLoadingConfig, setIsLoadingConfig] = useState(true);
  const [securityEmail, setSecurityEmail] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [sentCode, setSentCode] = useState('');
  const [codeSent, setCodeSent] = useState(false);
  const [codeVerified, setCodeVerified] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [securityStatus, setSecurityStatus] = useState(''); // '' | 'sending' | 'sent' | 'verified' | 'error' | 'saved'
  const [securityMessage, setSecurityMessage] = useState('');
  // EmailJS 配置
  const [emailjsServiceId, setEmailjsServiceId] = useState('');
  const [emailjsTemplateId, setEmailjsTemplateId] = useState('');
  const [emailjsPublicKey, setEmailjsPublicKey] = useState('');

  const revealRefs = useRef([]);
  const audioRef = useRef(null);

  // 安全且去重地将 DOM 节点添加到滚动监听队列
  const addToRefs = (el) => {
    if (el && !revealRefs.current.includes(el)) {
      revealRefs.current.push(el);
    }
  };

  // 初始化与持久化本地留言
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 150);

    // 智能检测并覆写更新旧测试音频路径
    const savedSongs = localStorage.getItem('kt_playlist_songs');
    if (savedSongs) {
      const parsed = JSON.parse(savedSongs);
      if (parsed.some(s => s.url.includes("pixabay.com") || s.title.includes("刘大同"))) {
        const updatedDefaultSongs = [
          {
            id: 1,
            title: "特别的人 (方大同)",
            url: "https://mytuchuang.oss-cn-chengdu.aliyuncs.com/%E9%9F%B3%E4%B9%90/%E7%89%B9%E5%88%AB%E7%9A%84%E4%BA%BA-%E6%96%B9%E5%A4%A7%E5%90%8C%231D7Ie.mp3"
          },
          {
            id: 2,
            title: "Sugar (Maroon 5)",
            url: "https://mytuchuang.oss-cn-chengdu.aliyuncs.com/%E9%9F%B3%E4%B9%90/Sugar-Maroon%205%23fAzGO.mp3"
          },
          {
            id: 3,
            title: "最佳损友 (陈奕迅)",
            url: "https://mytuchuang.oss-cn-chengdu.aliyuncs.com/%E9%9F%B3%E4%B9%90/%E6%9C%80%E4%BD%B3%E6%8D%9F%E5%8F%8B-%E9%99%88%E5%A5%95%E8%BF%85%238UDt.mp3"
          }
        ];
        setSongs(updatedDefaultSongs);
        localStorage.setItem('kt_playlist_songs', JSON.stringify(updatedDefaultSongs));
      }
    }

    // 从 GitHub 加载留言（所有用户共享）
    fetchMessages().then(msgs => {
      if (msgs.length > 0) {
        setMessages(msgs);
      } else {
        const defaultMsgs = [
          {
            id: 101,
            name: "季风过境",
            text: "静静地看着雪花在雪山之巅上飞舞，听着轻柔的音乐，那一刻时空好像完全凝固了。摄影和音乐果然是人类打捞记忆最温柔的网，KTarch，期待未来更多的闪光！",
            time: "2026-05-24 19:42"
          },
          {
            id: 102,
            name: "未完待续",
            text: "在钢铁森林里生活久了，总是忘记倾听自己灵魂深处的声音。谢谢这些细腻的镜头瞬间，在这个寒冷冬天里给我带来了一份难得的温暖。",
            time: "2026-05-28 09:15"
          }
        ];
        setMessages(defaultMsgs);
        saveMessages(defaultMsgs);
      }
    })

    // 每 30 秒自动刷新留言（其他用户新留言会自动出现）
    const refreshInterval = setInterval(() => {
      fetchMessages().then(msgs => {
        if (msgs.length > 0) setMessages(msgs);
      });
    }, 30000);

    // 从 GitHub 加载页面文本配置
    fetchTexts().then(texts => {
      if (texts) setSiteTexts(texts);
    });

    // 每 30 秒自动同步文本配置
    const textRefreshInterval = setInterval(() => {
      fetchTexts().then(texts => {
        if (texts) setSiteTexts(texts);
      });
    }, 30000);

    // 初始化滚动检测机制
    const observerOptions = {
      root: null,
      rootMargin: '0px',
      threshold: 0.12
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    }, observerOptions);

    const currentRefs = [...revealRefs.current];
    currentRefs.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => {
      observer.disconnect();
      clearTimeout(timer);
      clearInterval(refreshInterval);
      clearInterval(textRefreshInterval);
    };
  }, []);

  // 当切换背景音乐时，重新加载音频并清空播放秒数
  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.load();
      setCurrentTime(0);
      if (isPlaying) {
        audioRef.current.play().catch(err => {
          console.warn("Autoplay block:", err);
          setIsPlaying(false);
        });
      }
    }
  }, [activeSongIndex, songs]);

  // 监听键盘按键用于灯箱切换与退出
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightbox.isOpen) return;
      if (e.key === 'Escape') closeLightboxSilky();

      if (lightbox.type === 'collection') {
        if (e.key === 'ArrowLeft') handlePrevPhoto();
        if (e.key === 'ArrowRight') handleNextPhoto();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

  // 从 GitHub 加载管理员配置
  useEffect(() => {
    fetchAdminConfig().then(cfg => {
      setStoredPasswordHash(cfg.passwordHash);
      if (cfg.adminEmail) setSecurityEmail(cfg.adminEmail);
      if (cfg.emailjsServiceId) setEmailjsServiceId(cfg.emailjsServiceId);
      if (cfg.emailjsTemplateId) setEmailjsTemplateId(cfg.emailjsTemplateId);
      if (cfg.emailjsPublicKey) setEmailjsPublicKey(cfg.emailjsPublicKey);
      setIsLoadingConfig(false);
    });
  }, []);

  // 滚动监听：控制回到顶部按钮显隐
  useEffect(() => {
    const handleScroll = () => {
      setShowBackToTop(window.scrollY > 600);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // 进入留言审核标签时自动加载备份列表
  useEffect(() => {
    if (isAdminAuthenticated && adminTab === 'guestbook') {
      listBackups().then(setBackups);
    }
  }, [isAdminAuthenticated, adminTab]);

  // 计算当前正在播出的歌词内容
  const getActiveLyricText = () => {
    const currentSongId = songs[activeSongIndex]?.id;
    const lyricList = songLyrics[currentSongId] || [];
    let text = isPlaying ? "🎵 音乐已起奏..." : "BGM OFF - 留存指尖的温度";
    for (let i = 0; i < lyricList.length; i++) {
      if (currentTime >= lyricList[i].time) {
        text = lyricList[i].text;
      } else {
        break;
      }
    }
    return text;
  };

  // 控制背景音乐
  const togglePlay = () => {
    if (!audioRef.current) return;
    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play()
        .then(() => setIsPlaying(true))
        .catch((err) => {
          console.warn("Autoplay prevented:", err);
          setIsPlaying(false);
        });
    }
  };

  // 提交留言处理
  const handleMessageSubmit = (e) => {
    e.preventDefault();

    const hasNameError = !nickname.trim();
    const hasTextError = !content.trim();

    setFormError({ name: hasNameError, text: hasTextError });

    if (hasNameError || hasTextError) return;

    const formatTime = () => {
      const now = new Date();
      const pad = (num) => String(num).padStart(2, '0');
      return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}`;
    };

    const newMsg = {
      id: Date.now(),
      name: nickname.trim(),
      text: content.trim(),
      time: formatTime()
    };

    const updatedMsgs = [newMsg, ...messages];
    setMessages(updatedMsgs);
    // 异步保存到 GitHub，失败时不影响本地显示
    saveMessages(updatedMsgs).then(ok => {
      if (!ok) console.warn('留言已本地保存，但同步到 GitHub 失败');
    });

    setNickname('');
    setContent('');
    setFormError({ name: false, text: false });
  };

  // 过滤后的图片集
  const filteredPhotos = activePhotoCategory === 'ALL'
    ? collectionPhotos
    : collectionPhotos.filter(p => p.category === activePhotoCategory);

  const openLightboxSilky = (type, item = null, index = null) => {
    setLightbox({
      isOpen: true,
      isActive: false,
      type,
      item,
      index
    });
    setTimeout(() => {
      setLightbox(prev => ({ ...prev, isActive: true }));
    }, 50);
  };

  const closeLightboxSilky = () => {
    setLightbox(prev => ({ ...prev, isActive: false }));
    setTimeout(() => {
      setLightbox({
        isOpen: false,
        isActive: false,
        type: null,
        item: null,
        index: null
      });
    }, 900);
  };

  const handlePrevPhoto = () => {
    if (lightbox.type !== 'collection') return;
    const nextIndex = lightbox.index === 0 ? filteredPhotos.length - 1 : lightbox.index - 1;
    setLightbox(prev => ({ ...prev, index: nextIndex }));
  };

  const handleNextPhoto = () => {
    if (lightbox.type !== 'collection') return;
    const nextIndex = lightbox.index === filteredPhotos.length - 1 ? 0 : lightbox.index + 1;
    setLightbox(prev => ({ ...prev, index: nextIndex }));
  };

  const getActivePreviewData = () => {
    if (!lightbox.isOpen) return null;
    if (lightbox.type === 'gallery') {
      return lightbox.item;
    }
    return filteredPhotos[lightbox.index];
  };

  const previewData = getActivePreviewData();
  const handleAdminLogin = async (e) => {
    e.preventDefault();
    const hashed = await hashPassword(adminPassword);
    // 如果 GitHub 有存储的哈希就用它对比，否则默认 ktarch666
    const valid = storedPasswordHash
      ? hashed === storedPasswordHash
      : adminPassword === 'ktarch666';
    if (valid) {
      setIsAdminAuthenticated(true);
      setLoginError(false);
      setAdminPassword('');
    } else {
      setLoginError(true);
    }
  };

  const handleAdminLogout = () => {
    setIsAdminAuthenticated(false);
    setIsAdminOpen(false);
  };

  const startEditing = (item) => {
    setEditingItemId(item.id);
    setEditForm({
      title: item.title || '',
      subtitle: item.subtitle || '',
      image: item.image || '',
      desc: item.desc || '',
      story: item.story || '',
      category: item.category || ''
    });
  };

  const saveGalleryEdit = (id) => {
    const updated = galleryItems.map(item => {
      if (item.id === id) {
        return { ...item, ...editForm };
      }
      return item;
    });
    setGalleryItems(updated);
    localStorage.setItem('kt_gallery_items', JSON.stringify(updated));
    setEditingItemId(null);
  };

  const saveCollectionEdit = (id) => {
    const updated = collectionPhotos.map(item => {
      if (item.id === id) {
        return { ...item, ...editForm };
      }
      return item;
    });
    setCollectionPhotos(updated);
    localStorage.setItem('kt_collection_photos', JSON.stringify(updated));
    setEditingItemId(null);
  };

  const addNewCollectionPhoto = () => {
    const newPhoto = {
      id: 'photo-' + Date.now(),
      title: "未命名瞬间",
      subtitle: "NEW SPARK",
      category: "LANDSCAPE",
      image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?auto=format&fit=crop&w=1000&q=85",
      story: "在此编辑关于它的温热叙事..."
    };
    const updated = [...collectionPhotos, newPhoto];
    setCollectionPhotos(updated);
    localStorage.setItem('kt_collection_photos', JSON.stringify(updated));
    startEditing(newPhoto);
  };

  const deleteCollectionPhoto = (id) => {
    const updated = collectionPhotos.filter(item => item.id !== id);
    setCollectionPhotos(updated);
    localStorage.setItem('kt_collection_photos', JSON.stringify(updated));
  };

  const deleteGuestMessage = (id) => {
    const updated = messages.filter(item => item.id !== id);
    setMessages(updated);
    saveMessages(updated);
  };

  const [newSongTitle, setNewSongTitle] = useState('');
  const [newSongUrl, setNewSongUrl] = useState('');
  const addNewSong = (e) => {
    e.preventDefault();
    if (!newSongTitle.trim() || !newSongUrl.trim()) return;
    const newSong = {
      id: Date.now(),
      title: newSongTitle.trim(),
      url: newSongUrl.trim()
    };
    const updated = [...songs, newSong];
    setSongs(updated);
    localStorage.setItem('kt_playlist_songs', JSON.stringify(updated));
    setNewSongTitle('');
    setNewSongUrl('');
  };

  const deleteSong = (id) => {
    if (songs.length <= 1) return;
    const updated = songs.filter(item => item.id !== id);
    setSongs(updated);
    localStorage.setItem('kt_playlist_songs', JSON.stringify(updated));
    if (activeSongIndex >= updated.length) {
      setActiveSongIndex(0);
    }
  };

  return (
    <div className="min-h-screen bg-[#03050a] text-white selection:bg-indigo-900 selection:text-indigo-200 overflow-x-hidden">

      {/* 嵌入奢侈品画报宋体及手书歌词体 */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cinzel:wght@300;400;500;700&family=Noto+Serif+SC:wght@200;300;400;500;700&family=ZCOOL+XiaoWei&family=Inter:wght@100;200;300;400&display=swap');

        /* 1. 奢侈品画报体 (全站核心艺术字体) */
        .font-artistic {
          font-family: 'Cinzel', 'Noto Serif SC', 'STSong', 'Songti SC', serif;
        }

        /* 2. 空灵手书感歌词体 */
        .font-lyrics {
          font-family: 'ZCOOL XiaoWei', 'Noto Serif SC', 'STSong', serif;
        }

        /* 3. 干净易读 UI 界面辅助体 */
        .font-ui {
          font-family: 'Inter', 'PingFang SC', -apple-system, sans-serif;
        }

        /* 默认主页应用高级艺术字体 */
        body {
          font-family: 'Cinzel', 'Noto Serif SC', serif;
        }

        ::-webkit-scrollbar {
          width: 5px;
        }
        ::-webkit-scrollbar-track {
          background: #03050a;
        }
        ::-webkit-scrollbar-thumb {
          background: #121829;
          border-radius: 99px;
        }
        ::-webkit-scrollbar-thumb:hover {
          background: #222e4d;
        }

        .story-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .story-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.01);
        }
        .story-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(255, 255, 255, 0.15);
          border-radius: 99px;
        }
        .story-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(255, 255, 255, 0.3);
        }

        .fade-up-init {
          opacity: 0;
          transform: translateY(25px);
          transition: opacity 2.7s cubic-bezier(0.16, 1, 0.3, 1), transform 2.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fade-up-init.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        .reveal-section {
          opacity: 0;
          transform: translateY(50px);
          transition: opacity 2.1s cubic-bezier(0.16, 1, 0.3, 1),
                      transform 2.1s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .reveal-section.is-visible {
          opacity: 1;
          transform: translateY(0);
        }

        .hover-zoom-img {
          transition: transform 3s cubic-bezier(0.16, 1, 0.3, 1), filter 3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .img-container:hover .hover-zoom-img {
          transform: scale(1.04);
          filter: saturate(1.1) brightness(1.05);
        }

        .lightbox-overlay {
          opacity: 0;
          backdrop-filter: blur(0px);
          transition: opacity 900ms cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lightbox-overlay.active {
          opacity: 1;
          backdrop-filter: blur(24px);
        }

        .lightbox-content {
          opacity: 0;
          transform: scale(0.95);
          filter: blur(8px);
          transition: opacity 900ms cubic-bezier(0.16, 1, 0.3, 1),
                      transform 900ms cubic-bezier(0.16, 1, 0.3, 1),
                      filter 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lightbox-content.active {
          opacity: 1;
          transform: scale(1);
          filter: blur(0px);
        }

        .lightbox-card {
          opacity: 0;
          transform: translateY(25px);
          transition: opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1), transform 1200ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lightbox-card.active {
          opacity: 1;
          transform: translateY(0);
        }

        @keyframes fadeInBlur {
          0% { opacity: 0; filter: blur(6px); transform: scale(0.98); }
          100% { opacity: 1; filter: blur(0px); transform: scale(1); }
        }
        .animate-fade-in-blur {
          animation: fadeInBlur 0.8s cubic-bezier(0.16, 1, 0.3, 1) forwards;
        }

        @keyframes musicBounce {
          0%, 100% { height: 3px; }
          50% { height: 18px; }
        }
        .bar-1 { animation: musicBounce 1.2s ease-in-out infinite alternate; }
        .bar-2 { animation: musicBounce 1.6s ease-in-out infinite alternate; animation-delay: 0.22s; }
        .bar-3 { animation: musicBounce 1.35s ease-in-out infinite alternate; animation-delay: 0.45s; }
        .bar-4 { animation: musicBounce 1.8s ease-in-out infinite alternate; animation-delay: 0.08s; }
      `}</style>

      {/* ================= 全局雪花飘落图层 ================= */}
      <Snowfall />

      {/* ================= 1. 极致沉浸式电影感首屏 ================= */}
      <header className="relative w-full h-screen overflow-hidden flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=2000&q=85"
          alt="Media Center Core Memory"
          className="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-[1500ms]"
          style={{
            filter: "blur(10px) brightness(0.35) contrast(1.05) saturate(0.85)",
            transform: "scale(1.08)"
          }}
        />

        <div className="absolute inset-0 bg-[#03050a]/30 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#03050a]/10 via-[#03050a]/50 to-[#03050a] z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_30%,rgba(3,5,10,0.8)_95%)] z-15 pointer-events-none"></div>

        <nav className="absolute top-0 left-0 w-full px-6 py-6 md:px-12 flex justify-between items-center z-30 font-artistic">
          <div className="flex items-center gap-2 tracking-[0.3em] text-xs font-light text-white/70">
            <FilmIcon className="w-4 h-4 text-indigo-400" />
            <span>KT. MEMORY</span>
          </div>
          <div className="flex items-center z-30 font-ui gap-2">
            <button
              onClick={() => setIsAnnounceOpen(true)}
              className="px-5 py-2 bg-white/[0.04] backdrop-blur-md border border-white/10 hover:bg-white/[0.12] hover:border-white/25 active:scale-95 text-white/90 hover:text-white rounded-full transition-all duration-500 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-[10px] tracking-[0.2em] font-light select-none"
            >
              {siteTexts.announcement.title}
            </button>
            <button
              onClick={() => setIsStoryOpen(true)}
              className="px-5 py-2 bg-white/[0.04] backdrop-blur-md border border-white/10 hover:bg-white/[0.12] hover:border-white/25 active:scale-95 text-white/90 hover:text-white rounded-full transition-all duration-500 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-[10px] tracking-[0.2em] font-light select-none"
            >
              STORY
            </button>
          </div>
        </nav>

        <div className="relative z-20 flex flex-col items-center text-center w-full px-6 select-none font-artistic">
          <div className={`text-xs md:text-sm tracking-[0.45em] text-indigo-300/80 mb-5 font-light uppercase fade-up-init ${isLoaded ? 'loaded' : ''}`} style={{ transitionDelay: '100ms' }}>
                        {siteTexts.hero.welcome}
          </div>

          <div className={`flex flex-col items-center gap-5 fade-up-init ${isLoaded ? 'loaded' : ''}`} style={{ transitionDelay: '400ms' }}>
            <h1 className="text-4xl md:text-7xl font-light tracking-[0.25em] text-white drop-shadow-2xl">
              {siteTexts.hero.title}
            </h1>
            <div className="flex items-center gap-4 w-full justify-center">
              <div className="h-[1px] w-6 bg-white/20"></div>
              <span className="text-[10px] md:text-xs tracking-[0.5em] font-light text-white/50 uppercase">
                {siteTexts.hero.designer}
              </span>
              <div className="h-[1px] w-6 bg-white/20"></div>
            </div>
          </div>

          <div className={`absolute -bottom-24 md:-bottom-28 flex flex-col items-center gap-3 fade-up-init ${isLoaded ? 'loaded' : ''}`} style={{ transitionDelay: '900ms' }}>
            <span className="text-[9px] tracking-[0.3em] text-white/40 uppercase">{siteTexts.hero.scrollHint}</span>
            <ChevronDownIcon className="w-4 h-4 text-white/30 animate-bounce" />
          </div>
        </div>
      </header>

      {/* ================= 2. 经典作品画廊区 ================= */}
      <main className="relative z-20 bg-[#03050a] pt-24 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto font-artistic">
        <div className="text-center mb-32 reveal-section" ref={addToRefs}>
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <CameraIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[9px] tracking-[0.3em] text-white/60">{siteTexts.gallerySection.label}</span>
          </div>
          <p className="text-lg md:text-2xl font-extralight text-white/80 leading-relaxed max-w-2xl mx-auto tracking-wide">
                        "{siteTexts.gallerySection.quote1}<br/>
            <span className="text-indigo-200/90 font-light">{siteTexts.gallerySection.quote2}</span>"
          </p>
        </div>

        <div className="flex flex-col gap-32 md:gap-48">
          {galleryItems.map((item, index) => (
            <section
              key={item.id}
              ref={addToRefs}
              className={`reveal-section flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 lg:gap-20 w-full`}
            >
              <div
                onClick={() => openLightboxSilky('gallery', item)}
                className="w-full lg:w-[62%] img-container overflow-hidden relative rounded-lg group shadow-[0_25px_50px_-12px_rgba(0,0,0,0.8)] border border-white/5 cursor-zoom-in"
              >
                <div className="aspect-[16/10] w-full bg-[#070a14]">
                  <img
                    src={item.image}
                    alt={item.title}
                    className="w-full h-full object-cover hover-zoom-img opacity-85 group-hover:opacity-100 transition-opacity duration-1000"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent pointer-events-none"></div>
                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded text-[10px] tracking-widest text-white/70 font-ui">
                    <CompassIcon className="w-3.5 h-3.5 text-indigo-400 animate-[spin_8s_linear_infinite]" />
                    <span>CLICK TO ENLARGE</span>
                  </div>
                </div>
              </div>

              <div className="w-full lg:w-[38%] flex flex-col justify-center">
                <span className="text-[10px] tracking-[0.35em] text-indigo-400 font-medium mb-3 block uppercase">
                  {item.subtitle}
                </span>
                <h2 className="text-2xl md:text-4xl font-light tracking-widest mb-6 text-white/95">
                  {item.title}
                </h2>
                <div className="w-10 h-[1.5px] bg-indigo-500/40 mb-6"></div>
                <p className="text-xs md:text-sm text-white/60 font-light leading-relaxed tracking-wide">
                  {item.desc}
                </p>
              </div>
            </section>
          ))}
        </div>
      </main>

      {/* ================= 3. {siteTexts.albumSection.title}·图片集 ================= */}
      <section
        ref={addToRefs}
        className="relative z-20 bg-[#03050a] py-24 px-6 md:px-12 max-w-[1440px] mx-auto reveal-section font-artistic"
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[9px] tracking-[0.3em] text-white/60">{siteTexts.albumSection.label}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-light tracking-[0.2em] text-white/90">{siteTexts.albumSection.title}</h2>
          <p className="text-xs md:text-sm font-light text-white/40 mt-3 tracking-wider">{siteTexts.albumSection.subtitle}</p>

          <div className="flex justify-center gap-2 mt-8 md:mt-10 max-w-md mx-auto p-1 bg-white/[0.01] backdrop-blur-xl border border-white/5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)] font-ui">
            {['ALL', 'LANDSCAPE', 'CITY', 'DREAM'].map((cat) => (
              <button
                key={cat}
                onClick={() => setActivePhotoCategory(cat)}
                className={`flex-1 py-1.5 md:py-2 text-[9px] tracking-[0.15em] font-light rounded-full transition-all duration-500 select-none ${
                  activePhotoCategory === cat
                    ? 'bg-white/[0.08] border border-white/10 text-white shadow-sm'
                    : 'text-white/45 hover:text-white/80 border border-transparent'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => openLightboxSilky('collection', null, index)}
              className="group cursor-pointer bg-[#05070f] border border-white/5 rounded-xl overflow-hidden relative shadow-lg hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-[1000ms] hover:-translate-y-1.5 cursor-zoom-in"
            >
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2.7s] cubic-bezier(0.16, 1, 0.3, 1) opacity-80 group-hover:opacity-100"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#03050a]/95 via-transparent to-transparent opacity-90 transition-opacity duration-[1000ms]"></div>
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-[1200ms] pointer-events-none"></div>
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end transform translate-y-2 group-hover:translate-y-0 transition-transform duration-[1000ms]">
                  <span className="text-[8px] tracking-[0.25em] text-indigo-400 font-medium uppercase mb-1 block">
                    {photo.subtitle}
                  </span>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-base md:text-lg font-light tracking-widest text-white/95 text-ellipsis overflow-hidden">
                      {photo.title}
                    </h3>
                    <span className="text-[9px] tracking-widest font-extralight text-white/30 group-hover:text-white/60 transition-colors duration-[1000ms] font-ui shrink-0">
                      ZOOM IN →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 3.1 沉浸式 iOS 通用高阶模糊灯箱 ================= */}
      {lightbox.isOpen && previewData && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 md:p-8 select-none lightbox-overlay ${
            lightbox.isActive ? 'active' : ''
          } font-artistic`}
        >
          <div
            className="absolute inset-0 bg-[#03050a]/90 cursor-pointer"
            onClick={closeLightboxSilky}
          ></div>

          <button
            onClick={closeLightboxSilky}
            className="absolute top-6 right-6 md:top-8 md:right-8 z-50 p-2.5 bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 rounded-full text-white/70 hover:text-white transition-all duration-[750ms] shadow-xl active:scale-90 font-ui"
            title="关闭 (Esc)"
          >
            <CloseIcon className="w-5 h-5" />
          </button>

          <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-6 md:gap-8">
            <div className={`flex items-center gap-3 px-4 py-1.5 bg-white/[0.03] backdrop-blur-xl border border-white/5 rounded-full text-[10px] tracking-[0.2em] font-light text-white/50 shadow-sm lightbox-card ${
              lightbox.isActive ? 'active' : ''
            }`}>
              <span className="text-indigo-400">{lightbox.type === 'collection' ? previewData.category : 'CORE PORTFOLIO'}</span>
              {lightbox.type === 'collection' && (
                <>
                  <span className="opacity-30">|</span>
                  <span>{lightbox.index + 1} / {filteredPhotos.length}</span>
                </>
              )}
            </div>

            <div className="relative w-full flex items-center justify-center group/viewer max-h-[60vh]">
              {lightbox.type === 'collection' && (
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 md:-left-16 z-30 p-3 bg-black/40 hover:bg-white/[0.08] border border-white/5 hover:border-white/15 rounded-full text-white/50 hover:text-white opacity-0 group-hover/viewer:opacity-100 md:opacity-100 transition-all duration-[750ms] shadow-2xl active:scale-90 font-ui"
                  title="上一张 (←)"
                >
                  <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}

              <div
                className={`overflow-hidden rounded-xl border border-white/10 shadow-[0_32px_96px_rgba(0,0,0,0.85)] max-w-full max-h-[55vh] cursor-zoom-out lightbox-content ${
                  lightbox.isActive ? 'active' : ''
                }`}
                onClick={closeLightboxSilky}
              >
                <img
                  src={previewData.image}
                  alt={previewData.title}
                  className="max-w-full max-h-[55vh] object-contain pointer-events-none select-none"
                />
              </div>

              {lightbox.type === 'collection' && (
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 md:-right-16 z-30 p-3 bg-black/40 hover:bg-white/[0.08] border border-white/5 hover:border-white/15 rounded-full text-white/50 hover:text-white opacity-0 group-hover/viewer:opacity-100 md:opacity-100 transition-all duration-[750ms] shadow-2xl active:scale-90 font-ui"
                  title="下一张 (→)"
                >
                  <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}
            </div>

            <div
              className={`w-full max-w-2xl bg-white/[0.02] backdrop-blur-2xl border border-white/10 p-5 md:p-6 rounded-2xl shadow-2xl text-center select-text lightbox-card ${
                lightbox.isActive ? 'active' : ''
              }`}
            >
              <span className="text-[9px] tracking-[0.3em] text-indigo-400/80 font-medium mb-1 block uppercase">
                {previewData.subtitle}
              </span>
              <h3 className="text-lg md:text-xl font-light tracking-widest text-white/95 mb-3">
                {previewData.title}
              </h3>
              <p className="text-xs md:text-sm text-white/60 font-light leading-relaxed tracking-wider max-w-lg mx-auto italic">
                "{lightbox.type === 'collection' ? (previewData.story || '写给风雪的一行散文诗') : (previewData.desc || '定格的光影瞬间')}"
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ================= 4. {siteTexts.guestbookSection.title}区 ================= */}
      <section
        ref={addToRefs}
        className="relative z-20 bg-[#03050a] py-24 px-6 md:px-12 max-w-[1000px] mx-auto reveal-section font-artistic"
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <MessageSquareIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[9px] tracking-[0.3em] text-white/60">{siteTexts.guestbookSection.label}</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-light tracking-[0.2em] text-white/90">{siteTexts.guestbookSection.title}</h2>
          <p className="text-xs md:text-sm font-light text-white/40 mt-3 tracking-wider">{siteTexts.guestbookSection.subtitle}</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          <form
            onSubmit={handleMessageSubmit}
            className="lg:col-span-5 bg-white/[0.015] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col gap-5 font-ui"
          >
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] font-light text-white/50 uppercase font-artistic">署名 SIGNATURE</label>
              <input
                type="text"
                maxLength="12"
                value={nickname}
                onChange={(e) => {
                  setNickname(e.target.value);
                  if (e.target.value.trim()) setFormError(prev => ({ ...prev, name: false }));
                }}
                placeholder="在此填入名字..."
                className={`w-full bg-white/[0.03] text-sm text-white/90 placeholder:text-white/20 font-light border rounded-lg py-2.5 px-4 outline-none transition-all duration-[750ms] focus:bg-white/[0.06] ${
                  formError.name ? 'border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.15)]' : 'border-white/10 focus:border-indigo-500/40'
                }`}
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] font-light text-white/50 uppercase font-artistic">话语 SPARKS</label>
              <textarea
                rows="4"
                maxLength="200"
                value={content}
                onChange={(e) => {
                  setContent(e.target.value);
                  if (e.target.value.trim()) setFormError(prev => ({ ...prev, text: false }));
                }}
                placeholder="留下此时此刻你的心境..."
                className={`w-full bg-white/[0.03] text-sm text-white/90 placeholder:text-white/20 font-light border rounded-lg py-2.5 px-4 outline-none transition-all duration-[750ms] resize-none focus:bg-white/[0.06] ${
                  formError.text ? 'border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.15)]' : 'border-white/10 focus:border-indigo-500/40'
                }`}
              />
            </div>

            <button
              type="submit"
              className="mt-2 w-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/25 active:scale-98 transition-all duration-300 text-[10px] tracking-[0.3em] font-light text-indigo-200 hover:text-white py-3.5 rounded-lg flex items-center justify-center gap-2 select-none"
            >
              <SendIcon className="w-3.5 h-3.5" />
              <span>递交光影</span>
            </button>
          </form>

          <div className="lg:col-span-7 space-y-4 max-h-[420px] overflow-y-auto pr-2 story-scrollbar">
            {messages.length === 0 ? (
              <div className="h-full flex items-center justify-center py-20 text-xs font-light text-white/30 tracking-widest border border-dashed border-white/5 rounded-2xl bg-white/[0.01]">
                暂无光影印记，期待你的首条留言
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className="bg-white/[0.01] backdrop-blur-md border border-white/5 hover:border-white/12 p-5 rounded-xl transition-all duration-[750ms] flex flex-col gap-2 shadow-sm animate-ai-card"
                >
                  <div className="flex justify-between items-center border-b border-white/[0.03] pb-2 font-ui">
                    <span className="text-xs font-light tracking-widest text-indigo-300 font-artistic">{msg.name}</span>
                    <span className="text-[9px] font-light text-white/20">{msg.time}</span>
                  </div>
                  <p className="text-xs md:text-sm font-light text-white/60 leading-relaxed tracking-wide">
                    {msg.text}
                  </p>
                </div>
              ))
            )}
          </div>
        </div>
      </section>

      {/* ================= 4.1 歌词同步律动面板 ================= */}
      <div
        className={`fixed bottom-32 left-1/2 z-40 w-[92%] max-w-xl text-center select-none transition-all duration-[800ms] ease-out -translate-x-1/2 ${
          isMusicVisible
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-8 pointer-events-none'
        }`}
      >
        <div className="w-full flex items-center justify-center">
          <div className="w-full bg-[#05070f]/40 backdrop-blur-xl border border-white/10 rounded-2xl px-2 shadow-[0_20px_50px_rgba(0,0,0,0.6)] hover:border-white/15 hover:bg-white/[0.02] transition-all duration-500">
            <ParticleLyrics text={getActiveLyricText()} />
          </div>
        </div>
      </div>

      {/* ================= 5. 黑胶音乐盒 ================= */}
      {/* 隐藏时仅显示恢复按钮 */}
      <div
        onClick={() => setIsMusicVisible(true)}
        className={`fixed bottom-8 right-6 md:right-12 z-50 flex items-center justify-center w-12 h-12 rounded-full bg-gradient-to-br from-zinc-800/80 to-zinc-950/90 border border-white/10 hover:border-indigo-500/30 cursor-pointer select-none transition-all duration-500 shadow-[0_16px_40px_rgba(0,0,0,0.7)] hover:scale-[1.05] ${
          isMusicVisible
            ? 'opacity-0 scale-0 pointer-events-none'
            : 'opacity-100 scale-100 pointer-events-auto'
        }`}
        title="显示音乐组件"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-400">
          <path d="M9 18V5l12-2v13" />
          <circle cx="6" cy="18" r="3" />
          <circle cx="18" cy="16" r="3" />
        </svg>
      </div>

      {/* 完整音乐组件（歌词 + 黑胶音乐盒 + 提示气泡） */}
      <div
        className={`fixed bottom-8 right-6 md:right-12 z-50 transition-all duration-[800ms] ease-out ${
          isMusicVisible
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-12 pointer-events-none'
        }`}
      >
      <div className="flex flex-col items-end font-ui">

        {showMiniPlaylist && (
          <div className="mb-3 bg-black/80 backdrop-blur-xl border border-white/10 rounded-2xl p-4 w-52 shadow-2xl animate-fade-in text-[10px] select-none text-left">
            <div className="flex justify-between items-center mb-2.5 pb-1.5 border-b border-white/5 text-white/50 uppercase tracking-[0.2em] font-light font-artistic">
              <span>选择音轨</span>
              <button
                onClick={() => setShowMiniPlaylist(false)}
                className="text-white/40 hover:text-white p-1"
              >
                ✕
              </button>
            </div>
            <div className="space-y-1.5 max-h-36 overflow-y-auto pr-1 story-scrollbar">
              {songs.map((song, idx) => (
                <button
                  key={song.id}
                  onClick={() => {
                    setActiveSongIndex(idx);
                    setIsPlaying(true);
                  }}
                  className={`w-full text-left p-2 rounded-lg transition-all truncate tracking-wider font-light flex items-center justify-between ${
                    activeSongIndex === idx
                      ? 'bg-indigo-600/25 text-indigo-200 border-l-2 border-indigo-500 font-medium shadow-inner'
                      : 'text-white/60 hover:text-white hover:bg-white/5'
                  }`}
                >
                  <span className="truncate">{idx + 1}. {song.title}</span>
                  {activeSongIndex === idx && <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse shrink-0 ml-1"></span>}
                </button>
              ))}
            </div>
          </div>
        )}

        <audio
          ref={audioRef}
          loop
          src={songs[activeSongIndex]?.url}
          onTimeUpdate={() => {
            if (audioRef.current) {
              setCurrentTime(audioRef.current.currentTime);
            }
          }}
        />

        <div
          className={`flex flex-col items-end gap-1 select-none transition-all duration-[1000ms] ease-out mt-2 mr-1.5 ${
            isPlaying
              ? 'opacity-0 translate-y-3 pointer-events-none'
              : 'opacity-100 translate-y-0'
          }`}
        >
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full border border-white/5 bg-black/60 backdrop-blur-md text-[8px] tracking-wider text-white/60 shadow-[0_6px_16px_rgba(0,0,0,0.5)] animate-pulse">
            <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping"></span>
            <span>点击播放背景音乐</span>
          </div>
          {songs[activeSongIndex] && (
            <span className="text-[7px] text-white/30 tracking-widest uppercase mr-1 mt-0.5 max-w-[120px] truncate font-artistic">
              {songs[activeSongIndex].title}
            </span>
          )}
        </div>

        <div className="origin-bottom-right transform scale-[0.7] flex items-center gap-3">

          {/* 隐藏按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsMusicVisible(false);
            }}
            className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-950/90 border border-white/10 hover:border-red-500/30 flex items-center justify-center cursor-pointer select-none transition-all duration-300 shadow-[0_16px_40px_rgba(0,0,0,0.7)] hover:scale-[1.05]"
            title="隐藏音乐面板"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white/60 hover:text-red-400">
              <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94" />
              <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19" />
              <line x1="1" y1="1" x2="23" y2="23" />
              <path d="M14.12 14.12a3 3 0 1 1-4.24-4.24" />
            </svg>
          </button>

          {/* 歌单列表按钮 */}
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowMiniPlaylist(!showMiniPlaylist);
            }}
            className="w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-950/90 border border-white/10 hover:border-indigo-500/30 flex items-center justify-center cursor-pointer select-none transition-all duration-300 shadow-[0_16px_40px_rgba(0,0,0,0.7)] hover:scale-[1.05]"
            title="曲目列表"
          >
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 text-white/60 hover:text-indigo-400">
              <line x1="8" y1="6" x2="21" y2="6"></line>
              <line x1="8" y1="12" x2="21" y2="12"></line>
              <line x1="8" y1="18" x2="21" y2="18"></line>
              <line x1="3" y1="6" x2="3.01" y2="6"></line>
              <line x1="3" y1="12" x2="3.01" y2="12"></line>
              <line x1="3" y1="18" x2="3.01" y2="18"></line>
            </svg>
          </button>

          <div
            onClick={togglePlay}
            className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-950/90 border border-white/10 hover:border-indigo-500/30 flex items-center justify-center cursor-pointer select-none transition-all duration-500 shadow-[0_16px_40px_rgba(0,0,0,0.7)] group hover:scale-[1.05]"
            title={isPlaying ? "点击暂停" : "点击播放背景音乐"}
          >
            <div className="w-13 h-13 rounded-full bg-neutral-900 border border-black flex items-center justify-center shadow-inner relative overflow-hidden">
              <div
                className={`w-11 h-11 rounded-full bg-neutral-950 flex items-center justify-center relative shadow-[0_2px_8px_rgba(0,0,0,0.8)] border border-neutral-800/50 ${
                  isPlaying ? 'animate-[spin_6s_linear_infinite]' : 'transition-transform duration-1000'
                }`}
              >
                <div className="absolute inset-1 rounded-full border border-neutral-900/60 opacity-80"></div>
                <div className="absolute inset-2 rounded-full border border-neutral-900/40 opacity-65"></div>
                <div className="absolute inset-3 rounded-full border border-neutral-900/30 opacity-50"></div>
                <div className="w-4.5 h-4.5 rounded-full bg-indigo-600/90 border border-neutral-950 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 shadow"></div>
                </div>
              </div>
            </div>

            <ToneArm isPlaying={isPlaying} />

            <div className="absolute inset-0 bg-black/40 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center z-10 backdrop-blur-[1px]">
              {isPlaying ? (
                <PauseIcon className="w-5 h-5 text-indigo-400" />
              ) : (
                <PlayIcon className="w-5 h-5 text-indigo-400 ml-0.5" />
              )}
            </div>
          </div>

        </div>
      </div>
      </div>

      {/* ================= 6. 故事弹窗 ================= */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 transition-all duration-[1000ms] ${
          isStoryOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } font-artistic`}
      >
        <div
          className="absolute inset-0 bg-[#03050a]/85 backdrop-blur-2xl"
          onClick={() => setIsStoryOpen(false)}
        ></div>

        <div
          className={`relative w-full max-w-3xl bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-[0_32px_120px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-[1000ms] transform ${
            isStoryOpen ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'
          }`}
        >
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 text-white/40 text-[9px] md:text-[10px] tracking-[0.3em] font-light">
              <FilmIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>THE STORIES WE HOLD</span>
            </div>
            <button
              onClick={() => setIsStoryOpen(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 active:scale-95 transition-all duration-300 text-[10px] tracking-[0.25em] text-white/80 hover:text-white font-light select-none font-ui"
            >
              <span>← RETURN</span>
            </button>
          </div>

          <div className="max-h-[60vh] md:max-h-[50vh] overflow-y-auto pr-4 space-y-6 md:space-y-8 story-scrollbar text-white/80">
            <h3 className="text-xl md:text-3xl font-light tracking-[0.15em] text-white/95 leading-normal">
              {siteTexts.storySection.title}
            </h3>
            <p className="text-xs md:text-sm font-light leading-relaxed tracking-wider text-white/70">
              {siteTexts.storySection.intro}
            </p>
            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-medium tracking-widest text-indigo-300/90 uppercase">{siteTexts.storySection.chapter1Title}</h4>
              <p className="text-xs md:text-sm font-light leading-relaxed tracking-wider text-white/60">
                {siteTexts.storySection.chapter1Text}
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-medium tracking-widest text-indigo-300/90 uppercase">{siteTexts.storySection.chapter2Title}</h4>
              <p className="text-xs md:text-sm font-light leading-relaxed tracking-wider text-white/60">
                {siteTexts.storySection.chapter2Text}
              </p>
            </div>
            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-medium tracking-widest text-indigo-300/90 uppercase">{siteTexts.storySection.chapter3Title}</h4>
              <p className="text-xs md:text-sm font-light leading-relaxed tracking-wider text-white/60">
                {siteTexts.storySection.chapter3Text}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 6.1 公告弹窗 ================= */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 transition-all duration-[1000ms] ${
          isAnnounceOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        } font-artistic`}
      >
        <div
          className="absolute inset-0 bg-[#03050a]/85 backdrop-blur-2xl"
          onClick={() => setIsAnnounceOpen(false)}
        ></div>

        <div
          className={`relative w-full max-w-2xl bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-10 shadow-[0_32px_120px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-[1000ms] transform ${
            isAnnounceOpen ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'
          }`}
        >
          <div className="flex justify-between items-center mb-6 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 text-white/40 text-[9px] md:text-[10px] tracking-[0.3em] font-light">
              <span className="text-indigo-400">📢</span>
              <span>ANNOUNCEMENT</span>
            </div>
            <button
              onClick={() => setIsAnnounceOpen(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 active:scale-95 transition-all duration-300 text-[10px] tracking-[0.25em] text-white/80 hover:text-white font-light select-none font-ui"
            >
              <span>← CLOSE</span>
            </button>
          </div>

          <div className="max-h-[55vh] md:max-h-[45vh] overflow-y-auto pr-4 story-scrollbar text-white/80">
            <div className="text-lg md:text-2xl font-light tracking-[0.1em] text-white/95 mb-6">
              {siteTexts.announcement.title}
            </div>
            <div className="text-xs md:text-sm font-light leading-relaxed tracking-wider text-white/70 whitespace-pre-wrap">
              {siteTexts.announcement.content}
            </div>
          </div>
        </div>
      </div>

      {/* ================= 7. 管理员后台 ================= */}
      {isAdminOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 select-none animate-fade-in font-ui">
          <div
            className="absolute inset-0 bg-[#03050a]/90 backdrop-blur-2xl cursor-pointer"
            onClick={() => setIsAdminOpen(false)}
          ></div>

          <div className="relative z-10 w-full max-w-4xl bg-white/[0.02] border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_32px_120px_rgba(0,0,0,0.85)] max-h-[85vh] overflow-hidden flex flex-col backdrop-blur-2xl">

            {!isAdminAuthenticated ? (
              <form onSubmit={handleAdminLogin} className="flex flex-col items-center justify-center py-16 max-w-sm mx-auto w-full text-center">
                <LockIcon className="w-12 h-12 text-indigo-400 mb-6 animate-pulse" />
                <h3 className="text-lg md:text-xl font-light tracking-widest text-white/95 mb-1 font-artistic">
                  CORE MANAGEMENT SYSTEM
                </h3>
                <p className="text-[10px] tracking-[0.2em] text-white/30 uppercase mb-8 font-artistic">
                  请输入管理员密码以进入画廊总控
                </p>
                <div className="w-full space-y-4 mb-6">
                  <input
                    type="password"
                    value={adminPassword}
                    onChange={(e) => {
                      setAdminPassword(e.target.value);
                      setLoginError(false);
                    }}
                    placeholder="输入管理员密码"
                    className={`w-full bg-white/[0.04] text-center text-sm text-white border rounded-lg py-3 px-4 outline-none transition-all duration-[600ms] ${
                      loginError ? 'border-red-500/50 shadow-[0_0_12px_rgba(239,68,68,0.15)]' : 'border-white/10 focus:border-indigo-500/40'
                    }`}
                  />
                  {loginError && <p className="text-[9px] tracking-widest text-red-400/80 uppercase">密码错误，身份无法识别</p>}
                </div>
                <div className="flex gap-4 w-full">
                  <button type="button" onClick={() => setIsAdminOpen(false)} className="flex-1 bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] hover:border-white/15 active:scale-95 text-[10px] tracking-widest py-3 rounded-lg font-light transition-all">取消</button>
                  <button type="submit" className="flex-1 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-[10px] tracking-widest py-3 rounded-lg font-light transition-all text-white">认证</button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col h-full overflow-hidden select-text">
                <div className="flex justify-between items-center border-b border-white/5 pb-4 mb-6 flex-shrink-0">
                  <div>
                    <h3 className="text-base md:text-lg font-light tracking-widest text-white font-artistic">画廊多维控制台 (KTarch)</h3>
                    <p className="text-[9px] tracking-widest text-white/30 uppercase font-artistic">PERSISTENCE CLOUD CONFIGURATION</p>
                  </div>
                  <button onClick={handleAdminLogout} className="px-4 py-1.5 bg-red-950/40 hover:bg-red-950/80 border border-red-500/20 rounded-full text-[9px] tracking-widest text-red-300 font-light transition-all shrink-0">退出登录</button>
                </div>

                <div className="flex gap-2 mb-6 border-b border-white/5 pb-3 overflow-x-auto select-none flex-shrink-0">
                  {[
                    { id: 'gallery', label: '核心相册 (Core Gallery)' },
                    { id: 'collection', label: '碎刻相册 (Fragments)' },
                    { id: 'guestbook', label: '留言审核 (Guestbook)' },
                    { id: 'playlist', label: '乐轨列表 (BGM Tracks)' },
                    { id: 'texts', label: '页面文本 (Text Editor)' },
                    { id: 'security', label: '安全设置 (Security)' }
                  ].map(tab => (
                    <button key={tab.id} onClick={() => { setAdminTab(tab.id); setEditingItemId(null); }}
                      className={`px-4 py-1.5 rounded-full text-[9px] tracking-widest font-light transition-all shrink-0 border ${
                        adminTab === tab.id ? 'bg-indigo-600/20 border-indigo-500/50 text-white shadow-lg' : 'border-transparent text-white/50 hover:text-white/85'
                      }`}>
                      {tab.label}
                    </button>
                  ))}
                </div>

                <div className="flex-1 overflow-y-auto pr-2 story-scrollbar space-y-6">
                  {adminTab === 'gallery' && (
                    <div className="space-y-4 font-ui">
                      {galleryItems.map(item => (
                        <div key={item.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start">
                          <img src={item.image} className="w-24 aspect-[16/10] object-cover rounded border border-white/10" alt="" />
                          <div className="flex-1 w-full">
                            {editingItemId === item.id ? (
                              <div className="space-y-3">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                  <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="主标题" className="bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white" />
                                  <input type="text" value={editForm.subtitle} onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })} placeholder="副标题" className="bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white" />
                                </div>
                                <input type="text" value={editForm.image} onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} placeholder="图片链接 URL (粘贴你的摄影作品链接)" className="w-full bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white" />
                                <textarea value={editForm.desc} onChange={(e) => setEditForm({ ...editForm, desc: e.target.value })} placeholder="细节描述" rows="2" className="w-full bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white resize-none" />
                                <div className="flex gap-2 justify-end">
                                  <button onClick={() => setEditingItemId(null)} className="px-3 py-1 bg-white/5 text-[9px] rounded text-white/70 hover:bg-white/10">取消</button>
                                  <button onClick={() => saveGalleryEdit(item.id)} className="px-3 py-1 bg-indigo-600 text-[9px] rounded text-white hover:bg-indigo-500">保存修改</button>
                                </div>
                              </div>
                            ) : (
                              <div>
                                <div className="flex justify-between items-start mb-2">
                                  <div>
                                    <h4 className="text-sm font-light text-white font-artistic">{item.title} <span className="text-[10px] text-white/30 ml-2 font-ui">#{item.id}</span></h4>
                                    <span className="text-[8px] text-indigo-400 tracking-wider font-light uppercase font-artistic">{item.subtitle}</span>
                                  </div>
                                  <button onClick={() => startEditing(item)} className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center gap-1 text-[9px] text-white/70 hover:text-white select-none">
                                    <EditIcon className="w-3 h-3" /><span>编辑</span>
                                  </button>
                                </div>
                                <p className="text-xs text-white/55 font-light line-clamp-2 mb-1">{item.desc}</p>
                                <span className="text-[8px] text-white/20 select-all font-mono break-all">{item.image}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}

                  {adminTab === 'collection' && (
                    <div className="space-y-4">
                      <div className="flex justify-end select-none">
                        <button onClick={addNewCollectionPhoto} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:scale-95 text-[9px] tracking-widest rounded-lg flex items-center gap-1.5 transition-all text-white">
                          <PlusIcon className="w-3.5 h-3.5" /><span>新增相片瞬间</span>
                        </button>
                      </div>
                      <div className="space-y-4">
                        {collectionPhotos.map(photo => (
                          <div key={photo.id} className="bg-white/[0.02] border border-white/5 rounded-xl p-4 flex flex-col md:flex-row gap-4 items-start font-ui">
                            <img src={photo.image} className="w-24 aspect-[4/3] object-cover rounded border border-white/10" alt="" />
                            <div className="flex-1 w-full">
                              {editingItemId === photo.id ? (
                                <div className="space-y-3">
                                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                                    <input type="text" value={editForm.title} onChange={(e) => setEditForm({ ...editForm, title: e.target.value })} placeholder="主标题" className="bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white" />
                                    <input type="text" value={editForm.subtitle} onChange={(e) => setEditForm({ ...editForm, subtitle: e.target.value })} placeholder="副标题" className="bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white" />
                                    <select value={editForm.category} onChange={(e) => setEditForm({ ...editForm, category: e.target.value })} className="bg-zinc-900 border border-white/10 text-xs p-2 rounded text-white outline-none">
                                      <option value="LANDSCAPE">LANDSCAPE (风景)</option>
                                      <option value="CITY">CITY (都市)</option>
                                      <option value="DREAM">DREAM (梦境)</option>
                                    </select>
                                  </div>
                                  <input type="text" value={editForm.image} onChange={(e) => setEditForm({ ...editForm, image: e.target.value })} placeholder="图片链接 URL" className="w-full bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white" />
                                  <textarea value={editForm.story} onChange={(e) => setEditForm({ ...editForm, story: e.target.value })} placeholder="关于这幅图的微叙事" rows="2" className="w-full bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white resize-none" />
                                  <div className="flex gap-2 justify-end">
                                    <button onClick={() => setEditingItemId(null)} className="px-3 py-1 bg-white/5 text-[9px] rounded text-white/70 hover:bg-white/10">取消</button>
                                    <button onClick={() => saveCollectionEdit(photo.id)} className="px-3 py-1 bg-indigo-600 text-[9px] rounded text-white hover:bg-indigo-500">保存修改</button>
                                  </div>
                                </div>
                              ) : (
                                <div>
                                  <div className="flex justify-between items-start mb-2">
                                    <div>
                                      <h4 className="text-sm font-light text-white font-artistic">{photo.title} <span className="text-[10px] text-white/30 ml-2 font-ui font-light">#{photo.id}</span></h4>
                                      <span className="inline-block px-2 py-0.5 bg-indigo-950/40 text-[8px] border border-indigo-500/20 text-indigo-300 rounded uppercase tracking-wider font-light mt-1 font-artistic">{photo.category} · {photo.subtitle}</span>
                                    </div>
                                    <div className="flex gap-2 select-none">
                                      <button onClick={() => startEditing(photo)} className="p-1.5 bg-white/5 hover:bg-white/10 border border-white/10 rounded flex items-center gap-1 text-[9px] text-white/70 hover:text-white"><EditIcon className="w-3 h-3" /><span>编辑</span></button>
                                      <button onClick={() => deleteCollectionPhoto(photo.id)} className="p-1.5 bg-red-950/30 hover:bg-red-950/60 border border-red-500/20 rounded flex items-center gap-1 text-[9px] text-red-300/80 hover:text-red-300"><TrashIcon className="w-3 h-3" /></button>
                                    </div>
                                  </div>
                                  <p className="text-xs text-white/55 font-light line-clamp-2 mb-1 italic">"{photo.story}"</p>
                                  <span className="text-[8px] text-white/20 select-all font-mono break-all">{photo.image}</span>
                                </div>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {adminTab === 'guestbook' && (
                    <div className="space-y-4">
                      {/* 备份操作区 */}
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-4 font-ui">
                        <div className="flex items-center justify-between mb-3">
                          <span className="text-[10px] tracking-widest text-indigo-400 font-light uppercase font-artistic">
                            留言板备份
                          </span>
                          <button
                            onClick={async () => {
                              setBackupStatus('loading');
                              const result = await createBackup(messages);
                              setBackupStatus(result.reason);
                              if (result.ok) listBackups().then(setBackups);
                              setTimeout(() => setBackupStatus(''), 3000);
                            }}
                            disabled={backupStatus === 'loading'}
                            className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-[9px] tracking-widest rounded-lg transition-all text-white select-none"
                          >
                            {backupStatus === 'loading' ? '备份中...' : '创建新备份'}
                          </button>
                        </div>
                        {backupStatus === 'created' && (
                          <p className="text-[9px] text-green-400 tracking-wide">✓ 备份已保存到 GitHub 仓库</p>
                        )}
                        {backupStatus === 'no_changes' && (
                          <p className="text-[9px] text-amber-400 tracking-wide">→ 当前数据与最新备份一致，自动跳过重复备份</p>
                        )}
                        {backupStatus === 'failed' && (
                          <p className="text-[9px] text-red-400 tracking-wide">✗ 备份创建失败，请重试</p>
                        )}
                      </div>

                      {/* 恢复确认面板 */}
                      {restoreConfirm && (
                        <div className="border border-indigo-500/30 bg-indigo-950/20 rounded-xl p-4 space-y-3 font-ui">
                          <div className="flex justify-between items-start">
                            <div>
                              <h4 className="text-xs font-light text-indigo-200 font-artistic">从备份恢复留言</h4>
                              <p className="text-[9px] text-white/40 mt-0.5">
                                备份时间: {restoreConfirm.time} · 共 {restoreConfirm.messages.length} 条留言
                              </p>
                            </div>
                            <button onClick={() => setRestoreConfirm(null)} className="text-white/40 hover:text-white p-1">
                              <CloseIcon className="w-3.5 h-3.5" />
                            </button>
                          </div>

                          {/* 对比预览：当前 vs 备份 */}
                          <div className="grid grid-cols-2 gap-3 text-[10px]">
                            <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                              <span className="text-white/40 block mb-1 tracking-wide">当前 ({messages.length} 条)</span>
                              <div className="text-white/60 max-h-24 overflow-y-auto space-y-1 story-scrollbar">
                                {messages.slice(0, 8).map(m => (
                                  <div key={m.id} className="truncate text-[9px]">{m.name}: {m.text}</div>
                                ))}
                                {messages.length > 8 && <div className="text-white/20 text-[8px]">...还有 {messages.length - 8} 条</div>}
                              </div>
                            </div>
                            <div className="bg-white/[0.03] rounded-lg p-3 border border-white/5">
                              <span className="text-white/40 block mb-1 tracking-wide">备份 ({restoreConfirm.messages.length} 条)</span>
                              <div className="text-white/60 max-h-24 overflow-y-auto space-y-1 story-scrollbar">
                                {restoreConfirm.messages.slice(0, 8).map((m, i) => (
                                  <div key={i} className="truncate text-[9px]">{m.name}: {m.text}</div>
                                ))}
                                {restoreConfirm.messages.length > 8 && <div className="text-white/20 text-[8px]">...还有 {restoreConfirm.messages.length - 8} 条</div>}
                              </div>
                            </div>
                          </div>

                          <div className="flex gap-2 justify-end">
                            <button onClick={() => setRestoreConfirm(null)} className="px-3 py-1.5 bg-white/5 hover:bg-white/10 text-[9px] rounded text-white/70 select-none">取消</button>
                            <button onClick={async () => {
                              setMessages(restoreConfirm.messages);
                              await saveMessages(restoreConfirm.messages);
                              setRestoreConfirm(null);
                            }} className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-[9px] rounded text-white select-none">确认恢复</button>
                          </div>
                        </div>
                      )}

                      {/* 历史备份列表 */}
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-4 font-ui">
                        <span className="text-[10px] tracking-widest text-white/40 font-light uppercase font-artistic block mb-3">
                          历史备份 ({backups.length})
                        </span>
                        {backups.length === 0 ? (
                          <div className="text-center py-6 text-[9px] text-white/20 tracking-wide">暂无备份记录，点击上方按钮创建</div>
                        ) : (
                          <div className="space-y-2 max-h-40 overflow-y-auto story-scrollbar">
                            {backups.map(bak => (
                              <div key={bak.name} className="flex items-center justify-between bg-white/[0.02] hover:bg-white/[0.04] border border-white/5 rounded-lg px-3 py-2 transition-all">
                                <span className="text-[10px] text-white/60 tracking-wide font-mono">{bak.time}</span>
                                <button onClick={async () => {
                                  const msgs = await getBackupContent(bak.name);
                                  if (msgs) setRestoreConfirm({ name: bak.name, messages: msgs, time: bak.time });
                                }} className="px-2 py-1 bg-white/5 hover:bg-white/10 text-[8px] rounded text-white/50 hover:text-white transition-all select-none">
                                  查看对比
                                </button>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 现有留言审核 */}
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-4 text-xs font-light tracking-wide text-white/40 mb-2 select-none">以下是所有历史{siteTexts.guestbookSection.title}，您可以直接管理不合规留言。</div>
                      {messages.length === 0 ? (
                        <div className="text-center py-12 text-xs font-light text-white/20 tracking-wider">暂无留言可以审核</div>
                      ) : (
                        messages.map(msg => (
                          <div key={msg.id} className="bg-white/[0.02] border border-white/5 p-4 rounded-xl flex items-start justify-between gap-4 font-ui">
                            <div className="flex-1">
                              <div className="flex gap-3 items-center mb-1">
                                <span className="text-xs font-light text-indigo-300 font-artistic">{msg.name}</span>
                                <span className="text-[8px] text-white/20 font-mono">{msg.time}</span>
                              </div>
                              <p className="text-xs font-light text-white/75">{msg.text}</p>
                            </div>
                            <button onClick={() => deleteGuestMessage(msg.id)} className="p-2 bg-red-950/20 hover:bg-red-950/50 border border-red-500/10 hover:border-red-500/30 rounded text-red-300 hover:text-red-200 transition-all select-none" title="删除此言论"><TrashIcon className="w-3.5 h-3.5" /></button>
                          </div>
                        ))
                      )}
                    </div>
                  )}

                  {adminTab === 'texts' && (
                    <div className="space-y-4 font-ui">
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-4 text-[10px] font-light tracking-wide text-white/40">
                        <p className="mb-3">编辑页面上的文本内容，修改后点击保存，所有用户将在 30 秒内同步看到更新。</p>
                        <button
                          onClick={async () => {
                            setTextSaveStatus('saving');
                            const ok = await saveTexts(siteTexts);
                            setTextSaveStatus(ok ? 'saved' : 'failed');
                            setTimeout(() => setTextSaveStatus(''), 3000);
                          }}
                          disabled={textSaveStatus === 'saving'}
                          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-[9px] tracking-widest rounded-lg transition-all text-white select-none"
                        >
                          {textSaveStatus === 'saving' ? '保存中...' : '保存到 GitHub'}
                        </button>
                        {textSaveStatus === 'saved' && <span className="ml-3 text-[9px] text-green-400">✓ 已同步保存</span>}
                        {textSaveStatus === 'failed' && <span className="ml-3 text-[9px] text-red-400">✗ 保存失败，请重试</span>}
                      </div>

                      {/* 首屏文本 */}
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-4">
                        <h4 className="text-[10px] tracking-widest text-indigo-400 uppercase font-artistic mb-3">🏠 首屏 Hero</h4>
                        <div className="space-y-3">
                          <TextEditRow label="欢迎语" value={siteTexts.hero.welcome} onChange={v => setSiteTexts(s => ({ ...s, hero: { ...s.hero, welcome: v } }))} />
                          <TextEditRow label="主标题" value={siteTexts.hero.title} onChange={v => setSiteTexts(s => ({ ...s, hero: { ...s.hero, title: v } }))} />
                          <TextEditRow label="设计师标注" value={siteTexts.hero.designer} onChange={v => setSiteTexts(s => ({ ...s, hero: { ...s.hero, designer: v } }))} />
                          <TextEditRow label="滚动提示" value={siteTexts.hero.scrollHint} onChange={v => setSiteTexts(s => ({ ...s, hero: { ...s.hero, scrollHint: v } }))} />
                        </div>
                      </div>

                      {/* 画廊区文本 */}
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-4">
                        <h4 className="text-[10px] tracking-widest text-indigo-400 uppercase font-artistic mb-3">🖼️ 画廊区 Gallery</h4>
                        <div className="space-y-3">
                          <TextEditRow label="区域标签" value={siteTexts.gallerySection.label} onChange={v => setSiteTexts(s => ({ ...s, gallerySection: { ...s.gallerySection, label: v } }))} />
                          <TextEditRow label="引文第一行" value={siteTexts.gallerySection.quote1} onChange={v => setSiteTexts(s => ({ ...s, gallerySection: { ...s.gallerySection, quote1: v } }))} />
                          <TextEditRow label="引文第二行" value={siteTexts.gallerySection.quote2} onChange={v => setSiteTexts(s => ({ ...s, gallerySection: { ...s.gallerySection, quote2: v } }))} />
                        </div>
                      </div>

                      {/* 碎刻相册文本 */}
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-4">
                        <h4 className="text-[10px] tracking-widest text-indigo-400 uppercase font-artistic mb-3">📸 碎刻相册 Album</h4>
                        <div className="space-y-3">
                          <TextEditRow label="区域标签" value={siteTexts.albumSection.label} onChange={v => setSiteTexts(s => ({ ...s, albumSection: { ...s.albumSection, label: v } }))} />
                          <TextEditRow label="区域标题" value={siteTexts.albumSection.title} onChange={v => setSiteTexts(s => ({ ...s, albumSection: { ...s.albumSection, title: v } }))} />
                          <TextEditRow label="区域副标题" value={siteTexts.albumSection.subtitle} onChange={v => setSiteTexts(s => ({ ...s, albumSection: { ...s.albumSection, subtitle: v } }))} />
                        </div>
                      </div>

                      {/* 留言板文本 */}
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-4">
                        <h4 className="text-[10px] tracking-widest text-indigo-400 uppercase font-artistic mb-3">💬 留言板 Guestbook</h4>
                        <div className="space-y-3">
                          <TextEditRow label="区域标签" value={siteTexts.guestbookSection.label} onChange={v => setSiteTexts(s => ({ ...s, guestbookSection: { ...s.guestbookSection, label: v } }))} />
                          <TextEditRow label="区域标题" value={siteTexts.guestbookSection.title} onChange={v => setSiteTexts(s => ({ ...s, guestbookSection: { ...s.guestbookSection, title: v } }))} />
                          <TextEditRow label="区域副标题" value={siteTexts.guestbookSection.subtitle} onChange={v => setSiteTexts(s => ({ ...s, guestbookSection: { ...s.guestbookSection, subtitle: v } }))} />
                        </div>
                      </div>

                      {/* STORY 文本 */}
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-4">
                        <h4 className="text-[10px] tracking-widest text-indigo-400 uppercase font-artistic mb-3">📖 故事 STORY</h4>
                        <div className="space-y-3">
                          <TextEditRow label="故事标题" value={siteTexts.storySection.title} onChange={v => setSiteTexts(s => ({ ...s, storySection: { ...s.storySection, title: v } }))} />
                          <TextEditRow label="引言" value={siteTexts.storySection.intro} onChange={v => setSiteTexts(s => ({ ...s, storySection: { ...s.storySection, intro: v } }))} multiline />
                          <TextEditRow label="第一章标题" value={siteTexts.storySection.chapter1Title} onChange={v => setSiteTexts(s => ({ ...s, storySection: { ...s.storySection, chapter1Title: v } }))} />
                          <TextEditRow label="第一章内容" value={siteTexts.storySection.chapter1Text} onChange={v => setSiteTexts(s => ({ ...s, storySection: { ...s.storySection, chapter1Text: v } }))} multiline />
                          <TextEditRow label="第二章标题" value={siteTexts.storySection.chapter2Title} onChange={v => setSiteTexts(s => ({ ...s, storySection: { ...s.storySection, chapter2Title: v } }))} />
                          <TextEditRow label="第二章内容" value={siteTexts.storySection.chapter2Text} onChange={v => setSiteTexts(s => ({ ...s, storySection: { ...s.storySection, chapter2Text: v } }))} multiline />
                          <TextEditRow label="第三章标题" value={siteTexts.storySection.chapter3Title} onChange={v => setSiteTexts(s => ({ ...s, storySection: { ...s.storySection, chapter3Title: v } }))} />
                          <TextEditRow label="第三章内容" value={siteTexts.storySection.chapter3Text} onChange={v => setSiteTexts(s => ({ ...s, storySection: { ...s.storySection, chapter3Text: v } }))} multiline />
                        </div>
                      </div>

                      {/* 公告文本 */}
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-4">
                        <h4 className="text-[10px] tracking-widest text-indigo-400 uppercase font-artistic mb-3">📢 公告 Announcement</h4>
                        <div className="space-y-3">
                          <TextEditRow label="公告标题" value={siteTexts.announcement.title} onChange={v => setSiteTexts(s => ({ ...s, announcement: { ...s.announcement, title: v } }))} />
                          <TextEditRow label="公告内容" value={siteTexts.announcement.content} onChange={v => setSiteTexts(s => ({ ...s, announcement: { ...s.announcement, content: v } }))} multiline />
                        </div>
                      </div>

                      {/* 页脚文本 */}
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-4">
                        <h4 className="text-[10px] tracking-widest text-indigo-400 uppercase font-artistic mb-3">📄 页脚 Footer</h4>
                        <div className="space-y-3">
                          <TextEditRow label="版权文字" value={siteTexts.footer.copyright} onChange={v => setSiteTexts(s => ({ ...s, footer: { ...s.footer, copyright: v } }))} />
                        </div>
                      </div>
                    </div>
                  )}

                  {adminTab === 'security' && (
                    <div className="space-y-4 font-ui">
                      {/* 使用说明 */}
                      {!emailjsPublicKey && (
                        <div className="border border-amber-500/30 bg-amber-950/10 rounded-xl p-4">
                          <p className="text-[10px] text-amber-200/80 tracking-wide mb-2">
                            需要配置 EmailJS 才能发送邮箱验证码。免费注册后链接你的 QQ 邮箱，三步完成：
                          </p>
                          <ol className="text-[9px] text-white/50 space-y-1 mt-2 pl-4 list-decimal">
                            <li>打开 <a href="https://www.emailjs.com" target="_blank" rel="noopener noreferrer" className="text-indigo-400 underline">emailjs.com</a> 免费注册</li>
                            <li>添加 Email Service → 选 QQ 邮箱 → 填入你的 QQ 邮箱地址和 SMTP 授权码</li>
                            <li>添加 Email Template → 创建变量 <code className="text-indigo-300 bg-white/5 px-1 rounded">{'{{verification_code}}'}</code></li>
                          </ol>
                          <details className="text-[9px] text-white/40 mt-3">
                            <summary className="cursor-pointer text-indigo-400 hover:text-indigo-300">如何获取 QQ 邮箱 SMTP 授权码？</summary>
                            <div className="mt-2 space-y-1 pl-2 border-l border-white/10">
                              <p>1. QQ 邮箱 → 设置 → 帐户</p>
                              <p>2. 开启 "POP3/SMTP服务"</p>
                              <p>3. 发送短信获取 16 位授权码</p>
                            </div>
                          </details>
                        </div>
                      )}

                      {/* EmailJS 配置 */}
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-[10px] tracking-widest text-indigo-400 uppercase font-artistic">📧 EmailJS 配置</h4>
                          <button onClick={async () => {
                            const cfg = await fetchAdminConfig();
                            const updated = { ...cfg, emailjsServiceId, emailjsTemplateId, emailjsPublicKey, adminEmail: securityEmail };
                            const ok = await saveAdminConfig(updated);
                            setSecurityStatus(ok ? 'saved' : 'error');
                            setSecurityMessage(ok ? '✓ 配置已保存' : '✗ 保存失败');
                            setTimeout(() => setSecurityStatus(''), 3000);
                          }} className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-[9px] tracking-widest rounded-lg text-white select-none">
                            保存配置
                          </button>
                        </div>
                        <div className="space-y-2">
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-white/40">Service ID</label>
                            <input type="text" value={emailjsServiceId} onChange={e => setEmailjsServiceId(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white/90 outline-none focus:border-indigo-500/40" placeholder="service_xxx" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-white/40">Template ID</label>
                            <input type="text" value={emailjsTemplateId} onChange={e => setEmailjsTemplateId(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white/90 outline-none focus:border-indigo-500/40" placeholder="template_xxx" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-white/40">Public Key (User ID)</label>
                            <input type="text" value={emailjsPublicKey} onChange={e => setEmailjsPublicKey(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white/90 outline-none focus:border-indigo-500/40" placeholder="xxx" />
                          </div>
                          <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-white/40">管理员邮箱（接收验证码）</label>
                            <input type="email" value={securityEmail} onChange={e => setSecurityEmail(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white/90 outline-none focus:border-indigo-500/40" placeholder="yourname@qq.com" />
                          </div>
                        </div>
                      </div>

                      {/* 修改密码区域 */}
                      <div className="border border-white/5 rounded-xl bg-white/[0.01] p-4">
                        <h4 className="text-[10px] tracking-widest text-indigo-400 uppercase font-artistic mb-3">🔑 修改管理员密码</h4>

                        {/* 步骤1: 发送验证码 */}
                        {!codeSent && !codeVerified && (
                          <div className="space-y-3">
                            <p className="text-[9px] text-white/40">验证码将发送到：{securityEmail || '请先配置管理员邮箱'}</p>
                            <button
                              onClick={async () => {
                                if (!securityEmail || !emailjsServiceId || !emailjsTemplateId || !emailjsPublicKey) {
                                  setSecurityStatus('error');
                                  setSecurityMessage('✗ 请先完善 EmailJS 配置和管理员邮箱');
                                  setTimeout(() => setSecurityStatus(''), 3000);
                                  return;
                                }
                                setSecurityStatus('sending');
                                const code = generateCode();
                                try {
                                  await emailjs.send(emailjsServiceId, emailjsTemplateId, {
                                    to_email: securityEmail,
                                    verification_code: code,
                                  }, emailjsPublicKey);
                                  setSentCode(code);
                                  setCodeSent(true);
                                  setSecurityStatus('sent');
                                  setSecurityMessage('✓ 验证码已发送到邮箱，请查收');
                                  setTimeout(() => setSecurityStatus(''), 3000);
                                } catch (err) {
                                  setSecurityStatus('error');
                                  setSecurityMessage('✗ 发送失败：' + (err?.text || '请检查配置'));
                                }
                              }}
                              disabled={securityStatus === 'sending'}
                              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-[9px] tracking-widest rounded-lg transition-all text-white select-none"
                            >
                              {securityStatus === 'sending' ? '发送中...' : '发送验证码'}
                            </button>
                          </div>
                        )}

                        {/* 步骤2: 输入验证码 */}
                        {codeSent && !codeVerified && (
                          <div className="space-y-3">
                            <p className="text-[9px] text-green-400">✓ 验证码已发送至 {securityEmail}</p>
                            <div className="flex gap-2 items-end">
                              <div className="flex-1 flex flex-col gap-1">
                                <label className="text-[9px] text-white/40">输入 6 位验证码</label>
                                <input type="text" maxLength="6" value={verificationCode} onChange={e => setVerificationCode(e.target.value.replace(/\D/g, ''))} className="w-full bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white/90 outline-none focus:border-indigo-500/40 text-center tracking-[0.5em]" placeholder="000000" />
                              </div>
                              <button onClick={() => { setCodeSent(false); setVerificationCode(''); }} className="px-3 py-2 bg-white/5 hover:bg-white/10 text-[9px] rounded text-white/60 select-none">重新发送</button>
                            </div>
                            <button onClick={() => {
                              if (verificationCode === sentCode) { setCodeVerified(true); setSecurityStatus('verified'); setSecurityMessage('✓ 验证通过，请设置新密码'); setTimeout(() => setSecurityStatus(''), 3000); }
                              else { setSecurityStatus('error'); setSecurityMessage('✗ 验证码错误'); }
                            }} disabled={verificationCode.length < 6} className="px-4 py-2 bg-green-600 hover:bg-green-500 disabled:opacity-50 text-[9px] tracking-widest rounded-lg transition-all text-white select-none">验证</button>
                          </div>
                        )}

                        {/* 步骤3: 设置新密码 */}
                        {codeVerified && (
                          <div className="space-y-3 border-t border-white/5 pt-4">
                            <p className="text-[9px] text-green-400">✓ 邮箱验证通过，请输入新密码</p>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-white/40">新密码</label>
                              <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white/90 outline-none focus:border-indigo-500/40" placeholder="输入新密码" />
                            </div>
                            <div className="flex flex-col gap-1">
                              <label className="text-[9px] text-white/40">确认新密码</label>
                              <input type="password" value={newPasswordConfirm} onChange={e => setNewPasswordConfirm(e.target.value)} className="w-full bg-white/[0.04] border border-white/10 text-xs p-2 rounded text-white/90 outline-none focus:border-indigo-500/40" placeholder="再次输入新密码" />
                            </div>
                            {newPassword && newPasswordConfirm && newPassword !== newPasswordConfirm && (
                              <p className="text-[9px] text-red-400">✗ 两次密码不一致</p>
                            )}
                            <button onClick={async () => {
                              if (newPassword.length < 4) { setSecurityStatus('error'); setSecurityMessage('✗ 密码至少 4 位'); return; }
                              if (newPassword !== newPasswordConfirm) { setSecurityStatus('error'); setSecurityMessage('✗ 两次密码不一致'); return; }
                              setSecurityStatus('sending');
                              const hash = await hashPassword(newPassword);
                              const cfg = await fetchAdminConfig();
                              const updated = { ...cfg, passwordHash: hash, emailjsServiceId, emailjsTemplateId, emailjsPublicKey, adminEmail: securityEmail };
                              const ok = await saveAdminConfig(updated);
                              if (ok) {
                                setStoredPasswordHash(hash);
                                setSecurityStatus('saved');
                                setSecurityMessage('✓ 密码已成功修改！');
                                setNewPassword(''); setNewPasswordConfirm(''); setVerificationCode(''); setSentCode(''); setCodeSent(false); setCodeVerified(false);
                              } else { setSecurityStatus('error'); setSecurityMessage('✗ 保存失败'); }
                              setTimeout(() => setSecurityStatus(''), 4000);
                            }} disabled={!newPassword || !newPasswordConfirm || newPassword !== newPasswordConfirm || securityStatus === 'sending'} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-[9px] tracking-widest rounded-lg transition-all text-white select-none">
                              {securityStatus === 'sending' ? '保存中...' : '确认修改密码'}
                            </button>
                          </div>
                        )}

                        {securityMessage && (
                          <p className={`mt-3 text-[9px] tracking-wide ${securityStatus === 'error' ? 'text-red-400' : 'text-green-400'}`}>{securityMessage}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {adminTab === 'playlist' && (
                    <div className="space-y-6">
                      <form onSubmit={addNewSong} className="bg-white/[0.015] border border-white/5 rounded-xl p-4 space-y-4">
                        <span className="text-[10px] tracking-widest text-indigo-400 font-light block uppercase font-artistic">新增自选音轨</span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <input type="text" value={newSongTitle} onChange={(e) => setNewSongTitle(e.target.value)} placeholder="乐轨显示名称" className="bg-white/[0.03] border border-white/10 text-xs p-2.5 rounded text-white outline-none focus:border-indigo-500/40" />
                          <input type="text" value={newSongUrl} onChange={(e) => setNewSongUrl(e.target.value)} placeholder="音频源 Mp3 链接地址" className="bg-white/[0.03] border border-white/10 text-xs p-2.5 rounded text-white outline-none focus:border-indigo-500/40" />
                        </div>
                        <div className="flex justify-end select-none">
                          <button type="submit" className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-[9px] tracking-widest rounded-lg flex items-center gap-1.5 transition-all text-white"><PlusIcon className="w-3.5 h-3.5" /><span>载入播放队列</span></button>
                        </div>
                      </form>
                      <div className="space-y-3 font-ui">
                        <span className="text-[10px] tracking-widest text-white/40 font-light block uppercase font-artistic font-light">乐轨队列 ({songs.length} 首)</span>
                        {songs.map((song, idx) => (
                          <div key={song.id} className={`p-4 rounded-xl border flex items-center justify-between gap-4 transition-all ${activeSongIndex === idx ? 'bg-indigo-600/[0.08] border-indigo-500/30' : 'bg-white/[0.01] border-white/5 hover:border-white/10'}`}>
                            <div className="flex-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-light text-white font-artistic">{song.title}</span>
                                {activeSongIndex === idx && <span className="text-[7px] bg-indigo-600 text-white border border-indigo-500 px-1.5 py-0.5 rounded-full uppercase tracking-wider font-light animate-pulse">ON AIR</span>}
                              </div>
                              <span className="text-[8px] text-white/20 select-all font-mono break-all">{song.url}</span>
                            </div>
                            <div className="flex items-center gap-2 select-none">
                              <button onClick={() => setActiveSongIndex(idx)} className={`px-3 py-1 text-[9px] tracking-wider rounded font-light border transition-all ${activeSongIndex === idx ? 'bg-transparent border-indigo-400 text-indigo-300' : 'bg-white/5 border-white/10 hover:bg-white/10 text-white/80'}`}>
                                {activeSongIndex === idx ? '正在播出' : '点播这首'}
                              </button>
                              <button onClick={() => deleteSong(song.id)} disabled={songs.length <= 1} className="p-1.5 bg-red-950/20 hover:bg-red-950/50 border border-red-500/10 hover:border-red-500/30 rounded text-red-300 disabled:opacity-30 disabled:cursor-not-allowed"><TrashIcon className="w-3.5 h-3.5" /></button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ================= 回到顶部按钮 ================= */}
      <button
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
        className={`fixed bottom-8 left-6 md:left-12 z-50 flex items-center justify-center w-11 h-11 rounded-full bg-gradient-to-br from-zinc-800/80 to-zinc-950/90 border border-white/10 hover:border-indigo-500/30 cursor-pointer select-none transition-all duration-500 shadow-[0_16px_40px_rgba(0,0,0,0.7)] hover:scale-[1.05] ${
          showBackToTop
            ? 'opacity-100 translate-y-0 pointer-events-auto'
            : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
        title="回到顶部"
      >
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 text-indigo-400">
          <polyline points="18 15 12 9 6 15" />
        </svg>
      </button>

      {/* ================= 8. 页脚 ================= */}
      <footer className="bg-[#03050a] py-16 border-t border-white/[0.03] text-center font-artistic" ref={addToRefs}>
        <div className="flex justify-center gap-6 mb-4 text-white/30 text-xs">
          <ImageIcon className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
          <FilmIcon className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
          <CameraIcon className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
        </div>
        <div className="mb-4 font-ui">
          <button onClick={() => setIsAdminOpen(true)} className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/[0.02] border border-white/5 hover:bg-white/[0.08] hover:border-white/10 text-[8px] text-white/40 hover:text-white/80 rounded transition-all tracking-widest uppercase select-none">
            <SettingsIcon className="w-2.5 h-2.5" />
            <span>ADMIN PORTAL (管理中心)</span>
          </button>
        </div>
        <div className="text-[9px] tracking-[0.3em] text-white/30 uppercase">
          © {siteTexts.footer.copyright.replace('{year}', new Date().getFullYear())}
        </div>
      </footer>
    </div>
  );
}
