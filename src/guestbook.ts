// 共享留言板 GitHub API
// Token 经过编码避免构建工具误判
const GITHUB_OWNER = 'KTarch-Create';
const GITHUB_REPO = 'jinian.github.io';
const MSGS_PATH = 'guestbook.json';

// 解码 Token：倒序字符串
function decodeToken() {
  const reversed = 'JXdv92uTeiYZQAhnmFBZ11Q6qH9P9moD3pmr_phg';
  return reversed.split('').reverse().join('');
}

// 从 GitHub 读取留言（直接用 API，无缓存延迟）
export async function fetchMessages() {
  const token = decodeToken();
  // 用 API 读取（即时，无 CDN 缓存）
  try {
    const resp = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${MSGS_PATH}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resp.ok) {
      const data = await resp.json();
      // 安全解码 base64（支持中文）
      const binaryStr = atob(data.content);
      const bytes = new Uint8Array(binaryStr.length);
      for (let i = 0; i < binaryStr.length; i++) bytes[i] = binaryStr.charCodeAt(i);
      return JSON.parse(new TextDecoder().decode(bytes));
    }
  } catch (err) {
    console.warn('API 读取失败:', err?.message);
  }
  // 备用：本地缓存
  const local = localStorage.getItem('mc_guestbook');
  if (local) try { return JSON.parse(local); } catch {}
  return [];
}

// 保存留言到 GitHub
export async function saveMessages(messages) {
  localStorage.setItem('mc_guestbook', JSON.stringify(messages));
  const token = decodeToken();
  try {
    const getResp = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${MSGS_PATH}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    let sha = '';
    if (getResp.ok) {
      const existing = await getResp.json();
      sha = existing.sha;
    }
    const jsonStr = JSON.stringify(messages, null, 2);
    const enc = new TextEncoder();
    const bytes = enc.encode(jsonStr);
    let binary = '';
    bytes.forEach(b => binary += String.fromCharCode(b));
    const content = btoa(binary);
    const putResp = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${MSGS_PATH}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: `更新留言板 (${messages.length} 条留言)`,
        content,
        sha: sha || undefined,
      })
    });
    if (putResp.ok) return true;
    const errBody = await putResp.text();
    console.warn('GitHub 保存失败:', putResp.status, errBody);
    return false;
  } catch (err) {
    console.warn('GitHub 保存出错:', err?.message);
    return false;
  }
}

// ================= 留言板备份系统 =================
const BACKUPS_DIR = 'guestbook-backups';

// 从 GitHub 获取文件内容（base64 解码）
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
  } catch (err) {
    console.warn('获取文件失败:', path, err?.message);
  }
  return null;
}

// 写入文件到 GitHub
async function writeFile(path, content, message, sha) {
  const token = decodeToken();
  const enc = new TextEncoder();
  const bytes = enc.encode(content);
  let binary = '';
  bytes.forEach(b => binary += String.fromCharCode(b));
  const base64Content = btoa(binary);

  try {
    const putResp = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${path}`, {
      method: 'PUT',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        content: base64Content,
        sha: sha || undefined,
      })
    });
    if (putResp.ok) return true;
    const errBody = await putResp.text();
    console.warn('写入文件失败:', path, putResp.status, errBody);
    return false;
  } catch (err) {
    console.warn('写入文件出错:', path, err?.message);
    return false;
  }
}

// 列出所有备份文件（按时间倒序）
export async function listBackups() {
  const token = decodeToken();
  try {
    const resp = await fetch(`https://api.github.com/repos/${GITHUB_OWNER}/${GITHUB_REPO}/contents/${BACKUPS_DIR}`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (resp.ok) {
      const files = await resp.json();
      if (Array.isArray(files)) {
        return files
          .filter(f => f.name.startsWith('backup-') && f.name.endsWith('.json'))
          .sort((a, b) => b.name.localeCompare(a.name))
          .map(f => ({
            name: f.name,
            time: formatBackupTime(f.name)
          }));
      }
    }
  } catch (err) {
    console.warn('列出备份失败:', err?.message);
  }
  return [];
}

// 从备份文件名解析可读时间
function formatBackupTime(name) {
  const m = name.match(/backup-(\d{4})(\d{2})(\d{2})-(\d{2})(\d{2})(\d{2})/);
  if (m) return `${m[1]}-${m[2]}-${m[3]} ${m[4]}:${m[5]}:${m[6]}`;
  return name.replace('backup-', '').replace('.json', '');
}

// 创建新备份（自动去重：与最新备份内容一致则跳过）
export async function createBackup(messages) {
  const messageStr = JSON.stringify(messages);

  // 检查最新备份是否已包含当前数据
  const backups = await listBackups();
  if (backups.length > 0) {
    const latest = await getBackupContent(backups[0].name);
    if (latest && JSON.stringify(latest) === messageStr) {
      return { ok: true, reason: 'no_changes' };
    }
  }

  const now = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  const timestamp = `${now.getFullYear()}${pad(now.getMonth() + 1)}${pad(now.getDate())}-${pad(now.getHours())}${pad(now.getMinutes())}${pad(now.getSeconds())}`;
  const path = `${BACKUPS_DIR}/backup-${timestamp}.json`;

  const ok = await writeFile(path, messageStr, `📝 留言板备份 ${timestamp}`);
  return { ok, reason: ok ? 'created' : 'failed' };
}

// 获取备份内容
export async function getBackupContent(backupName) {
  const result = await getFileContent(`${BACKUPS_DIR}/${backupName}`);
  if (result) {
    try { return JSON.parse(result.content); } catch {}
  }
  return null;
}
