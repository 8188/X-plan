/**
 * 平台图标映射
 * 使用本地 static/logos/ 目录中的图标文件
 * 空字符串 '' 表示使用首字母徽标作为后备
 */
const iconMap: Record<string, string> = {
  // ===== API 平台 (有本地 PNG 的) =====
  'tencent-cloud': 'tencentcloud.png',
  'volcengine': 'volcengine.png',
  'huawei-cloud': 'huawei.png',
  'xfyun-spark': 'xfyun.png',
  'zhipu-ai': 'bigmodel.png',
  'minimax': 'minimax.png',
  'kimi': 'kimi.png',
  'sensenova': 'sensenova.png',
  // ===== API 平台 (有本地图标) =====
  'aliyun-bailian': 'bailian.webp',
  'baidu-cloud': 'baidu.ico',
  'jd-cloud': 'jdcloud.png',
  'xiaomi': 'mimo.webp',
  'unicom-cloud': 'cucloud.png',
  'infini-ai': 'infini.png',
  'kuaishou': 'kuaishou.ico',
  'mthreads': 'mthreads.png',
  'ucloud': 'ucloud.ico',
  'z-ai': 'z.ai.webp',
  'opencode': 'opencode.ico',
  // ===== IDE 平台 (有本地 PNG) =====
  'cursor': 'cursor.png',
  'qoder-cn': 'qwen.png',
  'qoder': 'qwen.png',
  // ===== IDE 平台 (有本地图标) =====
  'windsurf': 'windsurf.ico',
  'augment-code': 'augment-code.png',
  'trae': 'trae.webp',
  'codebuddy': 'codebuddy-color.svg',
  'github-copilot': 'GitHub-Copilot.png',
  'claude-code': 'cc.png',
  // ===== 旧 slug 兼容 =====
  'doubao': 'volcengine.png',
  'zhipu-qingyan': 'bigmodel.png',
  'cursor-cn': 'cursor.png',
  'tongyi-lingma': 'qwen.png',
};

export function getPlatformIcon(slug: string): string {
  const file = iconMap[slug];
  if (file) {
    return `/logos/${file}`;
  }
  return '';
}

export function getPlatformInitial(name: string): string {
  return name.charAt(0);
}
