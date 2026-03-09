IR / DFIR / RE Capability Map V6.2 🛡️

🇨🇳 简体中文 | 🇬🇧 English

🇬🇧 English

📖 Introduction

The IR / DFIR / RE / Malware Capability Map is a structured, interactive learning roadmap and knowledge base designed for Incident Response, Digital Forensics, and Malware Analysis professionals.

Moving away from static documents, this project utilizes a data-driven approach (data.json) rendered through a responsive, distraction-free web interface. It integrates systematic theoretical lectures, practical lab guides, and milestone assessments, providing a standardized and actionable growth framework from beginners to capable security engineers.

✨ Key Features

Structured Study View: Breaks down complex topics into multi-dimensional perspectives, including What to Learn, Why it Matters, Attacker Usage (Red), and Defender View (Blue).

Interactive Progress Tracking: Mark modules as completed. Progress is saved locally in your browser (localStorage), keeping your learning journey private and persistent.

Global Lightning Search: Instantly search across module names, mechanisms, MITRE ATT&CK tags, and deep content without navigating away.

Minimalist Flat UI: A distraction-free, modern SaaS-like interface. Fully responsive for desktop, tablet, and mobile viewing.

Extensible Architecture: 100% data-driven. Simply edit the data.json file to add new domains, modules, or update existing playbooks.

🚀 Quick Start

Due to modern browser security policies (CORS), the application needs to be run via a local web server to successfully fetch the data.json file.

Clone or Download the repository to your local machine.

Serve the directory using any local web server:

Python 3: Run python -m http.server 8000 in the terminal, then visit http://localhost:8000.

VS Code: Install the "Live Server" extension, right-click index.html, and select "Open with Live Server".

Node.js: Run npx serve .

📂 Directory Structure

├── index.html   # Main application interface (Responsive UI)
├── app.js       # Core logic (Rendering, Search, Progress tracking)
└── data.json    # The brain of the map (All content, domains, and modules)


🛠 How to Contribute / Customize

All content is managed within data.json. To add a new module, simply append a JSON object to the items array under the respective domain. Ensure you maintain the structure of the study_view, labs, and self_test fields for optimal rendering.

🇨🇳 简体中文

📖 项目简介

应急响应与恶意代码分析专业能力框架 (Capability Map) 是一个基于结构化数据模型构建的互动式学习路线图与知识库。

本项目摒弃了传统的静态文档，采用纯数据驱动 (data.json) 与响应式前端结合的方式。通过融合系统化的理论讲义、实战实验指引与阶段性考核指标，旨在为安全从业者提供一套标准化、可落地的专业成长框架（从新手到应急响应/恶意代码分析工程师）。

✨ 核心特性

深度结构化讲义 (Study View)：将庞杂的知识点降维拆解。包含 必须掌握、攻击者怎么用（红队视角）、防守者怎么看（蓝队视角） 等多维战术板块。

沉浸式进度追踪：支持勾选完成状态，进度数据安全地存储在浏览器本地 (localStorage)，构建属于你的个人技术大脑。

全局毫秒级检索：支持跨领域搜索，无论是模块名称、底层机制，还是 MITRE ATT&CK 标签，输入即所得。

极简扁平化 UI：去除了所有干扰阅读的渐变与光影，采用极客最爱的纯净扁平化设计，完美自适应 PC、平板与手机端。

高可扩展性：完全前后端分离的静态架构。只需修改 data.json，即可轻松为团队定制专属的安全能力字典与响应剧本。

🚀 快速上手

由于现代浏览器的安全策略 (CORS) 限制，直接双击 HTML 文件将无法读取 JSON 数据。请务必使用本地服务器运行：

下载或克隆 本项目到本地文件夹。

启动本地 Web 服务器：

Python 3 用户： 在当前目录打开终端，运行 python -m http.server 8000，然后浏览器访问 http://localhost:8000。

VS Code 用户： 安装 "Live Server" 插件，右键点击 index.html 选择 "Open with Live Server" 即可一键启动。

Node.js 用户： 运行 npx serve .

📂 核心文件结构

├── index.html   # 前端主页面（包含极简扁平化 CSS 样式）
├── app.js       # 核心渲染引擎（负责数据解析、搜索过滤与状态持久化）
└── data.json    # 数据底座（承载所有的领域、模块、测试题与 ATT&CK 映射）


🛠 如何自定义与二次开发

所有的图谱内容均维护在 data.json 中。如果您想为团队新增一个技术模块，只需在对应能力域（Domain）的 items 数组中追加一个 JSON 对象即可。前端引擎会自动解析 study_view、labs 等字段并渲染出优雅的折叠面板。
