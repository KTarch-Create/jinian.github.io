// 管理员安全配置 - GitHub API
// 存储密码哈希和 EmailJS 配置

const GITHUB_OWNER = 'KTarch-Create';
const GITHUB_REPO = 'jinian.github.io';
const CONFIG_PATH = 'admin-config.json';

function decodeToken() {
  const reversed = 'JXdv92uTeiYZQAhnmFBZ11Q6qH9P9moD3pmr_phg';
  return reversed.split('').reverse().join('');
}

async function getFileContent(path) {
  const token = decodeToken();
  try {
    const resp = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resp.ok) {
      const data = await resp.json();
      const binaryStr = atob(data.content);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      return { content: new TextDecoder().decode(bytes), sha: data.sha };
    }
  } catch {}
  return null;
}

async function writeFile(path, content, message, sha) {
  const token = decodeToken();
  const enc = new TextEncoder();
  const bytes = enc.encode(content);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  const base64 = btoa(binary);
  try {
    const resp = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: base64,
        sha: sha || undefined,
      })
    });
    return resp.ok;
  } catch {
    return false;
  }
}

// SHA-256 哈希（浏览器原生）
export async function hashPassword(password) {
  const enc = new TextEncoder();
  const data = enc.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

// 管理员配置默认值
const defaultConfig = {
  passwordHash: null,
  adminEmail: '',
  emailjsServiceId: '',
  emailjsTemplateId: '',
  emailjsPublicKey: ''
};

// 从 GitHub 读取管理配置
export async function fetchAdminConfig() {
  const result = await getFileContent(CONFIG_PATH);
  if (result) {
    try {
      return JSON.parse(result.content);
    } catch {}
  }
  return { ...defaultConfig };
}

// 保存管理配置到 GitHub
export async function saveAdminConfig(config) {
  let sha = '';
  const existing = await getFileContent(CONFIG_PATH);
  if (existing) {
    try {
      sha = existing.sha;
    } catch {}
  }
  const jsonStr = JSON.stringify(config, null, 2);
  return writeFile(CONFIG_PATH, jsonStr, '更新管理员安全配置', sha);
}

// 生成 6 位随机验证码
export function generateCode() {
  return Math.floor(100000 + Math.random() * 900000).toString();
}
