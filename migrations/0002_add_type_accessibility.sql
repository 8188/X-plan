-- 添加 platform_type 字段区分 API 平台和 IDE/Agent 工具
ALTER TABLE platforms ADD COLUMN platform_type TEXT NOT NULL DEFAULT 'api';
-- 'api': API/Token 平台（如腾讯云、DeepSeek）
-- 'ide': IDE/Agent 工具（如 Cursor、Cline、Windsurf）

-- 添加 accessibility 字段区分可访问性
ALTER TABLE platforms ADD COLUMN accessibility TEXT NOT NULL DEFAULT 'domestic';
-- 'domestic': 国内平台（如腾讯云、阿里云）
-- 'foreign_accessible': 国外平台，国内可访问（如 Cursor 中国镜像）
-- 'foreign_blocked': 国外平台，国内无法直接访问（如 OpenRouter、Claude Code）
