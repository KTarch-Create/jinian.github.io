import React, { useState, useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';

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

    // 根据屏幕面积动态计算雪花数量，避免移动端过载
    const numFlakes = Math.min(100, Math.floor((width * height) / 12000));
    const flakes = [];

    // 初始化雪花粒子属性
    for (let i = 0; i < numFlakes; i++) {
      flakes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        r: Math.random() * 2 + 0.6, // 半径 0.6px 到 2.6px，形成远近景深
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

        // 更新垂直和水平坐标（结合正弦波实现自然摇曳飘落）
        f.y += f.speedY;
        f.x += f.speedX + Math.sin(f.d) * 0.25;

        // 边界检测：当雪花飘落出底部时，从顶部重新生成
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
        if (f.x > width) {
          f.x = 0;
        } else if (f.x < 0) {
          f.x = width;
        }

        // 持续微调水平波动相位
        f.d += 0.008;
      }
    };

    const loop = () => {
      draw();
      animationFrameId = requestAnimationFrame(loop);
    };

    loop();

    // 监听窗口大小变化
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

// ================= 主应用 =================
export default function App() {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [bgImageError, setBgImageError] = useState(false);
  const [isStoryOpen, setIsStoryOpen] = useState(false); // 故事弹窗控制状态

  // 集中化管理灯箱状态，支持缓慢淡出关闭的双重阶段控制
  const [lightbox, setLightbox] = useState({
    isOpen: false,
    isActive: false,   // 控制入场类，支持缓动 transition
    type: null,        // 'gallery' | 'collection'
    item: null,
    index: null
  });

  const [activePhotoCategory, setActivePhotoCategory] = useState('ALL'); // 筛选分类

  // 留言板状态
  const [messages, setMessages] = useState([]);
  const [nickname, setNickname] = useState('');
  const [content, setContent] = useState('');
  const [formError, setFormError] = useState({ name: false, text: false });

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

    // 加载本地存储的留言，如果为空则初始化经典文艺预设留言
    const localMsgs = localStorage.getItem('mc_gallery_messages');
    if (localMsgs) {
      setMessages(JSON.parse(localMsgs));
    } else {
      const defaultMsgs = [
        {
          id: 101,
          name: "季风过境",
          text: "静静地看着雪花在雪山之巅上飞舞，听着轻柔的音乐，那一刻时空好像完全凝固了。摄影和音乐果然是人类打捞记忆最温柔的网，JINIAN，期待未来更多的闪光！",
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
      localStorage.setItem('mc_gallery_messages', JSON.stringify(defaultMsgs));
    }

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
          observer.unobserve(entry.target); // 触发后解绑以提升滚动性能
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
    };
  }, []);

  // 监听键盘按键用于灯箱切换与退出
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!lightbox.isOpen) return;
      if (e.key === 'Escape') closeLightboxSilky();

      // 只有在浏览 collection 图片集时才启用左右键切换
      if (lightbox.type === 'collection') {
        if (e.key === 'ArrowLeft') handlePrevPhoto();
        if (e.key === 'ArrowRight') handleNextPhoto();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [lightbox]);

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
          console.warn("Autoplay was prevented. Click again to play.", err);
          setIsPlaying(false);
        });
    }
  };

  // 提交留言处理
  const handleMessageSubmit = (e) => {
    e.preventDefault();

    const hasNameError = !nickname.trim();
    const hasTextError = !content.trim();

    // 触发边框红色反馈
    setFormError({ name: hasNameError, text: hasTextError });

    if (hasNameError || hasTextError) {
      return;
    }

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
    localStorage.setItem('mc_gallery_messages', JSON.stringify(updatedMsgs));

    setNickname('');
    setContent('');
    setFormError({ name: false, text: false });
  };

  // 高画质流式画廊数据
  const galleryItems = [
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

  // 极具质感的多分类图片集数据 (3x2 栅格)
  const collectionPhotos = [
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

  // 过滤后的图片集
  const filteredPhotos = activePhotoCategory === 'ALL'
    ? collectionPhotos
    : collectionPhotos.filter(p => p.category === activePhotoCategory);

  // 开启大图预览：双阶段渲染以支持入场 transition 动画（调慢 50%，动画执行时间 900ms，原为 600ms）
  const openLightboxSilky = (type, item = null, index = null) => {
    setLightbox({
      isOpen: true,
      isActive: false,
      type,
      item,
      index
    });
    // 微秒级延迟激活入场过渡
    setTimeout(() => {
      setLightbox(prev => ({ ...prev, isActive: true }));
    }, 50);
  };

  // 关闭大图预览：双阶段退场（先执行折叠褪色动画，900ms 后销毁 DOM）
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
    }, 900); // 慢放 50%：出场物理动效时间设为 900ms
  };

  // 灯箱切换：前一张
  const handlePrevPhoto = () => {
    if (lightbox.type !== 'collection') return;
    const nextIndex = lightbox.index === 0 ? filteredPhotos.length - 1 : lightbox.index - 1;
    setLightbox(prev => ({ ...prev, index: nextIndex }));
  };

  // 灯箱切换：后一张
  const handleNextPhoto = () => {
    if (lightbox.type !== 'collection') return;
    const nextIndex = lightbox.index === filteredPhotos.length - 1 ? 0 : lightbox.index + 1;
    setLightbox(prev => ({ ...prev, index: nextIndex }));
  };

  // 根据当前灯箱状态获取正在预览的相片
  const getActivePreviewData = () => {
    if (!lightbox.isOpen) return null;
    if (lightbox.type === 'gallery') {
      return lightbox.item;
    }
    return filteredPhotos[lightbox.index];
  };

  const previewData = getActivePreviewData();

  return (
    <div className="min-h-screen bg-[#03050a] text-white selection:bg-indigo-900 selection:text-indigo-200 overflow-x-hidden">

      {/* 慢速过渡和动画样式（调慢 50%，确保极其深邃幽雅的沉浸式体验） */}
      <style>{`
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

        /* 故事/留言/灯箱专用高级轻量滚动条 */
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

        /* 首屏加载动效（调慢 50%，从原 1.8s 改为 2.7s） */
        .fade-up-init {
          opacity: 0;
          transform: translateY(25px);
          transition: opacity 2.7s cubic-bezier(0.16, 1, 0.3, 1), transform 2.7s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .fade-up-init.loaded {
          opacity: 1;
          transform: translateY(0);
        }

        /* 滚动渐入动效（调慢 50%，从原 1.4s 改为 2.1s） */
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

        /* 悬浮微调图片（调慢 50%，从原 2s 改为 3s） */
        .hover-zoom-img {
          transition: transform 3s cubic-bezier(0.16, 1, 0.3, 1), filter 3s cubic-bezier(0.16, 1, 0.3, 1);
        }
        .img-container:hover .hover-zoom-img {
          transform: scale(1.04);
          filter: saturate(1.1) brightness(1.05);
        }

        /* ================== Apple-Style iOS 极其高级和慢速的过渡 ================== */
        /* 灯箱遮罩层过渡动画（调慢 50%，延至 900ms，原为 600ms） */
        .lightbox-overlay {
          opacity: 0;
          backdrop-filter: blur(0px);
          transition: opacity 900ms cubic-bezier(0.16, 1, 0.3, 1), backdrop-filter 900ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lightbox-overlay.active {
          opacity: 1;
          backdrop-filter: blur(24px);
        }

        /* 灯箱内容放大与模糊淡出（调慢 50%，延至 900ms，原为 600ms） */
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

        /* 灯箱文本底座平滑滑上（调慢 50%，延至 1200ms，原为 800ms） */
        .lightbox-card {
          opacity: 0;
          transform: translateY(25px);
          transition: opacity 1200ms cubic-bezier(0.16, 1, 0.3, 1), transform 1200ms cubic-bezier(0.16, 1, 0.3, 1);
        }
        .lightbox-card.active {
          opacity: 1;
          transform: translateY(0);
        }

        /* 音乐盒粒子轻微律动 */
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
          src={bgImageError ? "https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?auto=format&fit=crop&w=2000&q=85" : "db05a088f45ab1cd9cf81bec617acf8d.jpg"}
          alt="Media Center Core Memory"
          onError={() => setBgImageError(true)}
          className="absolute inset-0 w-full h-full object-cover z-0 transition-all duration-[1500ms]"
          style={{
            filter: "blur(10px) brightness(0.35) contrast(1.05) saturate(0.85)",
            transform: "scale(1.08)"
          }}
        />

        {/* 渐进式遮罩层 */}
        <div className="absolute inset-0 bg-[#03050a]/30 z-10"></div>
        <div className="absolute inset-0 bg-gradient-to-b from-[#03050a]/10 via-[#03050a]/50 to-[#03050a] z-10"></div>
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(0,0,0,0)_30%,rgba(3,5,10,0.8)_95%)] z-15 pointer-events-none"></div>

        {/* 极简顶栏 */}
        <nav className="absolute top-0 left-0 w-full px-6 py-6 md:px-12 flex justify-between items-center z-30">
          <div className="flex items-center gap-2 tracking-[0.3em] text-xs font-light text-white/70">
            <FilmIcon className="w-4 h-4 text-indigo-400" />
            <span>M.C. MEMORY</span>
          </div>
          {/* 右上角高感知 iOS STORY 按钮 */}
          <div className="flex items-center z-30">
            <button
              onClick={() => setIsStoryOpen(true)}
              className="px-5 py-2 bg-white/[0.04] backdrop-blur-md border border-white/10 hover:bg-white/[0.12] hover:border-white/25 active:scale-95 text-white/90 hover:text-white rounded-full transition-all duration-500 shadow-[0_8px_32px_0_rgba(0,0,0,0.3)] text-[10px] tracking-[0.2em] font-light select-none"
            >
              STORY
            </button>
          </div>
        </nav>

        {/* 核心排版 */}
        <div className="relative z-20 flex flex-col items-center text-center w-full px-6 select-none">
          <div className={`text-xs md:text-sm tracking-[0.45em] text-indigo-300/80 mb-5 font-light uppercase fade-up-init ${isLoaded ? 'loaded' : ''}`} style={{ transitionDelay: '100ms' }}>
            欢迎来到属于传媒中心的记忆画廊
          </div>

          <div className={`flex flex-col items-center gap-5 fade-up-init ${isLoaded ? 'loaded' : ''}`} style={{ transitionDelay: '400ms' }}>
            <h1 className="text-4xl md:text-7xl font-light tracking-[0.25em] text-white drop-shadow-2xl">
              传媒中心-记忆画廊
            </h1>
            <div className="flex items-center gap-4 w-full justify-center">
              <div className="h-[1px] w-6 bg-white/20"></div>
              <span className="text-[10px] md:text-xs tracking-[0.5em] font-light text-white/50 uppercase">
                DESIGNED BY JINIAN
              </span>
              <div className="h-[1px] w-6 bg-white/20"></div>
            </div>
          </div>

          {/* 下滑引导提示 */}
          <div className={`absolute -bottom-24 md:-bottom-28 flex flex-col items-center gap-3 fade-up-init ${isLoaded ? 'loaded' : ''}`} style={{ transitionDelay: '900ms' }}>
            <span className="text-[9px] tracking-[0.3em] text-white/40 uppercase">Scroll to Explore</span>
            <ChevronDownIcon className="w-4 h-4 text-white/30 animate-bounce" />
          </div>
        </div>
      </header>

      {/* ================= 2. 经典作品画廊区 ================= */}
      <main className="relative z-20 bg-[#03050a] pt-24 pb-20 px-6 md:px-12 max-w-[1440px] mx-auto">
        <div className="text-center mb-32 reveal-section" ref={addToRefs}>
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <CameraIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[9px] tracking-[0.3em] text-white/60">COLLECTION</span>
          </div>
          <p className="text-lg md:text-2xl font-extralight text-white/80 leading-relaxed max-w-2xl mx-auto tracking-wide">
            "记录每一个转瞬即逝的光影，<br/>
            <span className="text-indigo-200/90 font-light">在时间的长河中留下属于我们的注脚。</span>"
          </p>
        </div>

        {/* 画廊大图列表 */}
        <div className="flex flex-col gap-32 md:gap-48">
          {galleryItems.map((item, index) => (
            <section
              key={item.id}
              ref={addToRefs}
              className={`reveal-section flex flex-col ${index % 2 !== 0 ? 'lg:flex-row-reverse' : 'lg:flex-row'} items-center gap-10 lg:gap-20 w-full`}
            >
              {/* 精美画幅展示 - 已添加点击放大效果 */}
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

                  <div className="absolute bottom-4 left-4 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded text-[10px] tracking-widest text-white/70">
                    <CompassIcon className="w-3.5 h-3.5 text-indigo-400 animate-[spin_8s_linear_infinite]" />
                    <span>CLICK TO ENLARGE</span>
                  </div>
                </div>
              </div>

              {/* 艺术文案与意境区 */}
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

      {/* ================= 3. 光影碎刻·图片集 ================= */}
      <section
        ref={addToRefs}
        className="relative z-20 bg-[#03050a] py-24 px-6 md:px-12 max-w-[1440px] mx-auto reveal-section"
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <ImageIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[9px] tracking-[0.3em] text-white/60">ALBUM FRAGMENTS</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-light tracking-[0.2em] text-white/90">光影碎刻</h2>
          <p className="text-xs md:text-sm font-light text-white/40 mt-3 tracking-wider">指尖轻启，拼凑往昔失散的时光拼图</p>

          {/* iOS 玻璃质感分类控制阀 */}
          <div className="flex justify-center gap-2 mt-8 md:mt-10 max-w-md mx-auto p-1 bg-white/[0.01] backdrop-blur-xl border border-white/5 rounded-full shadow-[0_8px_32px_rgba(0,0,0,0.4)]">
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

        {/* 3x2 高响应度精美栅格图片集 - 已添加点击放大效果 */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
          {filteredPhotos.map((photo, index) => (
            <div
              key={photo.id}
              onClick={() => openLightboxSilky('collection', null, index)}
              className="group cursor-pointer bg-[#05070f] border border-white/5 rounded-xl overflow-hidden relative shadow-lg hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-[1000ms] hover:-translate-y-1.5 cursor-zoom-in"
            >
              {/* 高画质摄影画面 */}
              <div className="aspect-[4/3] w-full overflow-hidden relative">
                <img
                  src={photo.image}
                  alt={photo.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-[2.7s] cubic-bezier(0.16, 1, 0.3, 1) opacity-80 group-hover:opacity-100"
                />

                {/* 悬停微高光遮罩 */}
                <div className="absolute inset-0 bg-gradient-to-t from-[#03050a]/95 via-transparent to-transparent opacity-90 transition-opacity duration-[1000ms]"></div>
                <div className="absolute inset-0 bg-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-[1200ms] pointer-events-none"></div>

                {/* 核心排版信息 */}
                <div className="absolute inset-x-0 bottom-0 p-5 flex flex-col justify-end transform translate-y-2 group-hover:translate-y-0 transition-transform duration-[1000ms]">
                  <span className="text-[8px] tracking-[0.25em] text-indigo-400 font-medium uppercase mb-1 block">
                    {photo.subtitle}
                  </span>
                  <div className="flex justify-between items-baseline">
                    <h3 className="text-base md:text-lg font-light tracking-widest text-white/95">
                      {photo.title}
                    </h3>
                    <span className="text-[9px] tracking-widest font-extralight text-white/30 group-hover:text-white/60 transition-colors duration-[1000ms]">
                      ZOOM IN →
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ================= 3.1 沉浸式 iOS 通用高阶模糊灯箱 (Universal Lightbox Modal) ================= */}
      {lightbox.isOpen && previewData && (
        <div
          className={`fixed inset-0 z-50 flex flex-col items-center justify-center p-4 md:p-8 select-none lightbox-overlay ${
            lightbox.isActive ? 'active' : ''
          }`}
        >
          {/* 超重度毛玻璃暗化遮罩（点击即可返回画廊） */}
          <div
            className="absolute inset-0 bg-[#03050a]/90 cursor-pointer"
            onClick={closeLightboxSilky}
          ></div>

          {/* 主关闭按钮（右上角 iOS 磨砂悬浮） */}
          <button
            onClick={closeLightboxSilky}
            className="absolute top-6 right-6 md:top-8 md:right-8 z-50 p-2.5 bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 rounded-full text-white/70 hover:text-white transition-all duration-[750ms] shadow-xl active:scale-90"
            title="关闭 (Esc)"
          >
            <CloseIcon className="w-5 h-5" />
          </button>

          {/* 核心内容容器 */}
          <div className="relative z-10 w-full max-w-4xl flex flex-col items-center gap-6 md:gap-8">

            {/* 顶栏：如果是图片集则显示相片序列，主画廊则只显示画廊标记 */}
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

            {/* 相片主体交互区 */}
            <div className="relative w-full flex items-center justify-center group/viewer max-h-[60vh]">

              {/* 左切图按钮（仅对 collection 类型生效） */}
              {lightbox.type === 'collection' && (
                <button
                  onClick={handlePrevPhoto}
                  className="absolute left-2 md:-left-16 z-30 p-3 bg-black/40 hover:bg-white/[0.08] border border-white/5 hover:border-white/15 rounded-full text-white/50 hover:text-white opacity-0 group-hover/viewer:opacity-100 md:opacity-100 transition-all duration-[750ms] shadow-2xl active:scale-90"
                  title="上一张 (←)"
                >
                  <ArrowLeftIcon className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}

              {/* 大图展示：iOS 软渲染边框与深渊阴影 */}
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

              {/* 右切图按钮（仅对 collection 类型生效） */}
              {lightbox.type === 'collection' && (
                <button
                  onClick={handleNextPhoto}
                  className="absolute right-2 md:-right-16 z-30 p-3 bg-black/40 hover:bg-white/[0.08] border border-white/5 hover:border-white/15 rounded-full text-white/50 hover:text-white opacity-0 group-hover/viewer:opacity-100 md:opacity-100 transition-all duration-[750ms] shadow-2xl active:scale-90"
                  title="下一张 (→)"
                >
                  <ArrowRightIcon className="w-4 h-4 md:w-5 md:h-5" />
                </button>
              )}

            </div>

            {/* 底栏：iOS 磨砂玻璃叙事卡片 */}
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

      {/* ================= 4. 极具 iOS 玻璃质感的留言印记区 ================= */}
      <section
        ref={addToRefs}
        className="relative z-20 bg-[#03050a] py-24 px-6 md:px-12 max-w-[1000px] mx-auto reveal-section"
      >
        <div className="text-center mb-16">
          <div className="inline-flex items-center gap-2 mb-4 px-3 py-1 rounded-full bg-white/5 border border-white/5">
            <MessageSquareIcon className="w-3.5 h-3.5 text-indigo-400" />
            <span className="text-[9px] tracking-[0.3em] text-white/60">GUESTBOOK</span>
          </div>
          <h2 className="text-2xl md:text-4xl font-light tracking-[0.2em] text-white/90">留言印记</h2>
          <p className="text-xs md:text-sm font-light text-white/40 mt-3 tracking-wider">在光的尽头，留下属于你的那一帧温度</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* 左侧：留言表单 */}
          <form
            onSubmit={handleMessageSubmit}
            className="lg:col-span-5 bg-white/[0.015] backdrop-blur-xl border border-white/10 rounded-2xl p-6 md:p-8 shadow-[0_16px_48px_rgba(0,0,0,0.5)] flex flex-col gap-5"
          >
            <div className="flex flex-col gap-2">
              <label className="text-[10px] tracking-[0.2em] font-light text-white/50 uppercase">署名 SIGNATURE</label>
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
              <label className="text-[10px] tracking-[0.2em] font-light text-white/50 uppercase">话语 SPARKS</label>
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

          {/* 右侧：留言列表 */}
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
                  <div className="flex justify-between items-center border-b border-white/[0.03] pb-2">
                    <span className="text-xs font-light tracking-widest text-indigo-300">{msg.name}</span>
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

      {/* ================= 5. 沉浸式微缩黑胶音乐盒 (唱机样式) ================= */}
      <div className="fixed bottom-8 right-6 md:right-12 z-50 flex flex-col items-end">
        <audio
          ref={audioRef}
          loop
          src="/最佳损友-陈奕迅#8UDt.mp3"
        />

        {/* 上方微型发光提示气泡 */}
        <div
          className={`flex items-center gap-1 px-2.5 py-1 rounded-full border border-white/5 bg-black/60 backdrop-blur-md text-[8px] tracking-wider text-white/70 transition-all duration-[1000ms] ease-out select-none shadow-[0_6px_16px_rgba(0,0,0,0.5)] mb-1.5 mr-1.5 ${
            isPlaying
              ? 'opacity-0 translate-y-3 pointer-events-none'
              : 'opacity-100 translate-y-0 animate-pulse'
          }`}
        >
          <span className="w-1 h-1 rounded-full bg-indigo-400 animate-ping"></span>
          <span>点击播放音乐</span>
        </div>

        {/* 拟真黑胶质感唱片音乐盒 - 缩放 70% 包裹层 */}
        <div className="origin-bottom-right transform scale-[0.7]">
          <div
            onClick={togglePlay}
            className="relative w-16 h-16 rounded-xl bg-gradient-to-br from-zinc-800/80 to-zinc-950/90 border border-white/10 hover:border-indigo-500/30 flex items-center justify-center cursor-pointer select-none transition-all duration-500 shadow-[0_16px_40px_rgba(0,0,0,0.7)] group hover:scale-[1.05]"
            title={isPlaying ? "点击暂停" : "点击播放背景音乐"}
          >
            {/* 唱片槽圆腔底盘 */}
            <div className="w-13 h-13 rounded-full bg-neutral-900 border border-black flex items-center justify-center shadow-inner relative overflow-hidden">

              {/* 黑胶唱片 (Vinyl Disc) */}
              <div
                className={`w-11 h-11 rounded-full bg-neutral-950 flex items-center justify-center relative shadow-[0_2px_8px_rgba(0,0,0,0.8)] border border-neutral-800/50 ${
                  isPlaying ? 'animate-[spin_6s_linear_infinite]' : 'transition-transform duration-1000'
                }`}
              >
                {/* 同心凹槽声道线 */}
                <div className="absolute inset-1 rounded-full border border-neutral-900/60 opacity-80"></div>
                <div className="absolute inset-2 rounded-full border border-neutral-900/40 opacity-65"></div>
                <div className="absolute inset-3 rounded-full border border-neutral-900/30 opacity-50"></div>

                {/* 唱片贴纸 */}
                <div className="w-4.5 h-4.5 rounded-full bg-indigo-600/90 border border-neutral-950 flex items-center justify-center">
                  <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 shadow"></div>
                </div>
              </div>
            </div>

            {/* 动态唱针 */}
            <ToneArm isPlaying={isPlaying} />

            {/* 悬停状态指示 */}
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

      {/* ================= 6. 沉浸式磨砂微光 iOS 风格故事弹窗 ================= */}
      <div
        className={`fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8 transition-all duration-[1000ms] ${
          isStoryOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      >
        {/* 背景超重度模糊暗化遮罩（点击即可退回画廊） */}
        <div
          className="absolute inset-0 bg-[#03050a]/85 backdrop-blur-2xl"
          onClick={() => setIsStoryOpen(false)}
        ></div>

        {/* 故事主卡片：纯正 iOS 玻璃质感面板 */}
        <div
          className={`relative w-full max-w-3xl bg-white/[0.03] border border-white/10 rounded-2xl md:rounded-3xl p-6 md:p-12 shadow-[0_32px_120px_rgba(0,0,0,0.8)] backdrop-blur-2xl transition-all duration-[1000ms] transform ${
            isStoryOpen ? 'translate-y-0 scale-100' : 'translate-y-12 scale-95'
          }`}
        >
          {/* 顶栏 */}
          <div className="flex justify-between items-center mb-8 border-b border-white/5 pb-4">
            <div className="flex items-center gap-2 text-white/40 text-[9px] md:text-[10px] tracking-[0.3em] font-light">
              <FilmIcon className="w-3.5 h-3.5 text-indigo-400" />
              <span>THE STORIES WE HOLD</span>
            </div>

            {/* iOS 返回按钮 */}
            <button
              onClick={() => setIsStoryOpen(false)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-white/[0.05] hover:bg-white/[0.12] border border-white/10 hover:border-white/20 active:scale-95 transition-all duration-300 text-[10px] tracking-[0.25em] text-white/80 hover:text-white font-light select-none"
            >
              <span>← RETURN</span>
            </button>
          </div>

          {/* 滚动文章区域 */}
          <div className="max-h-[60vh] md:max-h-[50vh] overflow-y-auto pr-4 space-y-6 md:space-y-8 story-scrollbar text-white/80">
            <h3 className="text-xl md:text-3xl font-light tracking-[0.15em] text-white/95 leading-normal">
              追光者的编年史：传媒中心背后的故事
            </h3>

            <p className="text-xs md:text-sm font-light leading-relaxed tracking-wider text-white/70">
              这里是故事开始的地方，也是无数快门和指尖创意的聚集地。传媒中心不仅仅是一间摆满相机和电脑的工作室，更是一艘在时间星河里打捞记忆的飞船。
            </p>

            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-medium tracking-widest text-indigo-300/90 uppercase">
                第一章：快门与地平线
              </h4>
              <p className="text-xs md:text-sm font-light leading-relaxed tracking-wider text-white/60">
                我们曾踏遍清晨五点的薄雾，也曾在深夜的钢铁城市边缘静静等待星辰破空。那些被相机捕获的瞬间——风雪肆虐的峰峦，或是钢铁森林里渐暗的暮色，都不止是图像本身，而是属于我们每一个拍摄者当时呼吸的声音。
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-medium tracking-widest text-indigo-300/90 uppercase">
                第二章：屏幕里的不眠夜
              </h4>
              <p className="text-xs md:text-sm font-light leading-relaxed tracking-wider text-white/60">
                在温热咖啡与冷光屏幕的微弱亮光中，无数帧画面在这里被反复打磨、拼接。那些欢笑、争论和深夜里因渲染成功而响起的低低欢呼，共同编织成名为「青春」的底片。在剪辑时间轴上的每一秒，都是我们在时间长河中刻下最深的痕迹。
              </p>
            </div>

            <div className="space-y-4">
              <h4 className="text-xs md:text-sm font-medium tracking-widest text-indigo-300/90 uppercase">
                终章：帧的永恒
              </h4>
              <p className="text-xs md:text-sm font-light leading-relaxed tracking-wider text-white/60">
                记忆画廊不会终结。每一位来到这里的人，都能透过这些跳动的光影和悠扬的音浪，看见那些曾经炽热、依然跳动的热忱。我们记录转瞬即逝的现在，只为向遥远的未来呈递一份不灭的赞歌。
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* ================= 7. 极简艺术页脚 ================= */}
      <footer className="bg-[#03050a] py-16 border-t border-white/[0.03] text-center" ref={addToRefs}>
        <div className="flex justify-center gap-6 mb-4 text-white/30 text-xs">
          <ImageIcon className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
          <FilmIcon className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
          <CameraIcon className="w-4 h-4 hover:text-white transition-colors cursor-pointer" />
        </div>
        <div className="text-[9px] tracking-[0.3em] text-white/30 uppercase">
          © {new Date().getFullYear()} JINIAN. ALL RIGHTS RESERVED.
        </div>
      </footer>
    </div>
  );
}
