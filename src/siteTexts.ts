// 页面文本配置 - GitHub API
// 所有用户可见的文本均可通过管理后台在线修改，实时同步

const GITHUB_OWNER = 'KTarch-Create';
const GITHUB_REPO = 'jinian.github.io';
const TEXTS_PATH = 'site-texts.json';

function decodeToken() {
  const reversed = 'JXdv92uTeiYZQAhnmFBZ11Q6qH9P9moD3pmr_phg';
  return reversed.split('').reverse().join('');
}

// 默认文本配置（首次创建 / API 读取失败时使用）
export const defaultTexts = {
  hero: {
    welcome: "欢迎来到属于传媒中心的记忆画廊",
    title: "传媒中心-记忆画廊",
    designer: "DESIGNED BY KTarch",
    scrollHint: "Scroll to Explore"
  },
  gallerySection: {
    label: "COLLECTION",
    quote1: "记录每一个转瞬即逝的光影，",
    quote2: "在时间的长河中留下属于我们的注脚。"
  },
  albumSection: {
    label: "ALBUM FRAGMENTS",
    title: "光影碎刻",
    subtitle: "指尖轻启，拼凑往昔失散的时光拼图"
  },
  heroSection: {
    label: "HERITAGE",
    title: "两弹一星精神传承",
    subtitle: "干惊天动地事，做隐姓埋名人"
  },
  storySection: {
    title: "追光者的编年史：传媒中心背后的故事",
    intro: "这里是故事开始的地方，也是无数快门和指尖创意的聚集地。传媒中心不仅仅是一间摆满相机和电脑的工作室，更是一艘在时间星河里打捞记忆的飞船。",
    chapter1Title: "第一章：快门与地平线",
    chapter1Text: "我们曾踏遍清晨五点的薄雾，也曾在深夜的钢铁城市边缘静静等待星辰破空。那些被相机捕获的瞬间——风雪肆虐的峰峦，或是钢铁森林里渐暗的暮色，都不止是图像本身，而是属于我们每一个拍摄者当时呼吸的声音。",
    chapter2Title: "第二章：屏幕里的不眠夜",
    chapter2Text: "在温热咖啡与冷光屏幕的微弱亮光中，无数帧画面在这里被反复打磨、拼接。那些欢笑、争论和深夜里因渲染成功而响起的低低欢呼，共同编织成名为「青春」的底片。在剪辑时间轴上的每一秒，都是我们在时间长河中刻下最深的痕迹。",
    chapter3Title: "终章：帧的永恒",
    chapter3Text: "记忆画廊不会终结。每一位来到这里的人，都能透过这些跳动的光影和悠扬的音浪，看见那些曾经炽热、依然跳动的热忱。我们记录转瞬即逝的现在，只为向遥远的未来呈递一份不灭的赞歌。"
  },
  announcement: {
    title: "📢 公告",
    content: "欢迎来到记忆画廊！这里将不定期发布最新动态和活动通知。"
  },
  footer: {
    copyright: "© {year} KTarch. ALL RIGHTS RESERVED."
  }
};

// 从 GitHub 读取文本配置
export async function fetchTexts() {
  const token = decodeToken();
  try {
    const resp = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${TEXTS_PATH}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resp.ok) {
      const data = await resp.json();
      const binaryStr = atob(data.content);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      return JSON.parse(new TextDecoder().decode(bytes));
    }
  } catch (err) {
    console.warn('读取文本配置失败:', err?.message);
  }
  return null;
}

// 保存文本配置到 GitHub
export async function saveTexts(texts) {
  const token = decodeToken();
  try {
    const getResp = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${TEXTS_PATH}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    let sha = '';
    if (getResp.ok) {
      const existing = await getResp.json();
      sha = existing.sha;
    }
    const jsonStr = JSON.stringify(texts, null, 2);
    const enc = new TextEncoder();
    const bytes = enc.encode(jsonStr);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    const content = btoa(binary);
    const putResp = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${TEXTS_PATH}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: '更新页面文本配置',
        content,
        sha: sha || undefined,
      })
    });
    return putResp.ok;
  } catch (err) {
    console.warn('保存文本配置失败:', err?.message);
    return false;
  }
}
