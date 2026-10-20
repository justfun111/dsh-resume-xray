# dsh-resume-xray

简历 X 光机：找出简历里“读起来很顺、但一被追问就答不上来”的高风险表述，再用定向追问链逐条暴露盲区。

它不做模拟面试，也不给简历打分。它只做两件事：

1. **扫描**：按规则 + 面试官追问信号找出高风险句，按追问崩溃风险排序，并为每句生成 3–4 步追问链。
2. **练习**：针对其中一条风险，按顺序逐条追问；追问顺序由工具持有，模型不能跳步或改写。

## 和模拟面试的区别

- 模拟面试：出题 → 你答 → 评分 → 给建议。
- 简历 X 光机：扫描 → 标记高风险句 → 生成追问链 → 逐条练。它先帮你**找**，再逼你**答**。

建议先用 `resume_xray_scan` 诊断，再用 `resume_xray_practice` 针对最危险的那条练。

## 版本

- **0.3.0（当前）**：9 个行业画像 + `industry` 参数 + 行业证据提示
- 0.2.0：面试官信号 + `signals[]` + 后端证据提示
- 0.1.0：五类风险 + 练习闭环 + Web 卡片

## 工具

### `resume_xray_scan`

```text
resume_xray_scan(resumeText, targetRole?, industry?)
```

- 确定性规则扫描，**不调用模型**，不需要 API key。
- 输出 `risks[]`（按 `collapseRisk` 降序）+ 一段 `summary`。
- 每条风险带 `signals[]`，说明触发了哪条面试官/行业信号，例如 `metric:数字无基线`、`backend:架构标签无规模/取舍`、`industry:ai:标签无规模/评测`。
- `targetRole` 可选：命中岗位关键词的句子会加 1 点权重，并写入摘要；后端岗位还会追加“证据缺口”提示。
- `industry` 可选：启用对应行业的追问画像（AI/大模型、智能驾驶、芯片、机器人、金融科技、跨境电商、游戏、数据/产品、咨询），最多同时启用 2 个；不传时从 `targetRole` 推断。

### `resume_xray_practice`

```text
resume_xray_practice({ sentence })      // 第一次：开始一轮
resume_xray_practice({ advance: true }) // 用户回答后：下一条
```

- `sentence` 必须与扫描结果里的原句一致（也接受唯一的子串匹配）。
- 工具自己保存游标；没有 `questionIndex` 参数，模型无法跳步。
- 最后一条追问回答完后，返回 `{ done: true }`，本轮结束。
- 只追问，不评分。

典型对话：

```text
你：帮我扫描这份简历：[粘贴简历]
模型：调用 resume_xray_scan → 返回 5 条风险
你：从第一条开始练
模型：调用 resume_xray_practice({ sentence: "负责用户增长项目，提升转化率 300%" })
模型：追问 1/4：这个数字的统计口径是什么？……
你：……（回答）
模型：调用 resume_xray_practice({ advance: true })
模型：追问 2/4：……
```

## 五类风险

| riskType | 含义 | 典型句子 |
|---|---|---|
| `no_metric_baseline` | 有数字，但没有基线、口径或统计范围 | “提升转化率 300%” |
| `unclear_ownership` | 写了“负责”，但没说决策权边界和个人产物 | “负责用户增长项目” |
| `team_vs_individual` | 写了“参与/协助”，但分不清个人与团队贡献 | “参与完成推荐系统重构” |
| `causal_gap` | 写了动作或结果，但没说手段、也没说为什么有效 | “优化了推荐策略” |
| `unsupported_claim` | 用了“显著/好评/领先”，但没有可验证参照物 | “获得领导一致好评” |

规则会优先报更具体的那一类：例如“负责用户增长项目，提升转化率 300%”会先报 `no_metric_baseline`，因为这是面试官第一层就会追问的点。

## 面试官信号（v0.2）

在五类风险之上，扫描器还会用这些信号决定“值不值得追问”。它们来自公开的面试指南、面经和招聘方文章，完整映射见 [docs/interview-signals.md](docs/interview-signals.md)。

| signal | 触发条件 | 典型追问 |
|---|---|---|
| `metric:性能数字无测试条件` | QPS/P95/P99/延迟等数字，没有测试环境、机器、数据量或并发 | 在哪测的？平均还是 P99？ |
| `backend:架构标签无规模/取舍` | 高并发/高可用/微服务/Redis 等标签，没有规模、选型理由或故障处理 | 规模多大？为什么选它？挂了怎么办？ |
| `claim:技能等级无证据` | 精通/熟练掌握，但没有项目、比赛、上线或产物 | 最近一次用它解决什么？现场写一个？ |
| `claim:强结论无数字` | 显著/大幅 + 变化，但整句没有数字 | 具体多少？怎么衡量？ |
| `ownership:角色升级无边界` | 主导/独立负责/从 0 到 1，但没有团队、权限或决策证据 | 哪些是你拍板的？团队几个人？ |

这些信号不会取代五个 `riskType`；它们会归入对应的类型，并在 `signals[]` 里保留。

## 行业信号（v0.3）

除了通用和后端信号，传 `industry` 会启用行业画像。每个画像有自己的标签、证据、追问链和覆盖提示；来源与映射见 [docs/industry-signals.md](docs/industry-signals.md)。

| 行业 | 典型追问 |
|---|---|
| AI/大模型 | 模型规模、数据量、评测基线、推理成本、幻觉兜底 |
| 智能驾驶/新能源 | 场景/里程、mAP/接管率、实时性、功能安全、量产 |
| 半导体/芯片 | 工艺节点、覆盖率、PPA、流片/回片、良率 |
| 机器人/智能制造 | 负载/精度/节拍、MTBF、实时安全、量产验收 |
| 金融科技/风控 | 交易量/TPS、欺诈率/误杀率、合规审计、资金安全 |
| 跨境电商/出海 | GMV、转化/复购、CAC/LTV、本地化、支付/物流 |
| 游戏 | DAU/留存、帧率/包体、玩法/数值、上线/合规 |
| 数据分析/产品/运营 | 指标口径、A/B 样本、漏斗/分群、归因 |
| 咨询/战略 | 问题拆解、数据来源、方案取舍、客户落地 |

行业信号不会改变五个 `riskType`；它要么单独成条，要么并入 `signals[]`。

## 配置

```yaml
- insert:
    - id: resume-xray
      name: 'dsh-resume-xray'
      config:
        maxRisks: 10                  # 最多返回多少条，1–50
        includeValidationChain: true  # false 时追问链只保留 3 条
```

## 安装

### 当前 Desktop / Web profile

把整个 `dsh-resume-xray` 目录作为本地 bundle 安装：

```text
plugin_manager install_bundle  target: <绝对路径>/dsh-resume-xray
```

或者用 CLI：

```bash
dsh plugin --profile web add <绝对路径>/dsh-resume-xray
```

安装后建议重启一次 Web profile，然后确认：

- 工具列表里出现 `resume_xray_scan` 和 `resume_xray_practice`；
- 对话里调用 `resume_xray_scan` 后，工具卡显示风险热度条，而不是通用 JSON 卡片。

### 从源码 checkout 开发

```bash
dsh web --patch ./dsh-resume-xray/cordis.patch.yml
```

## 开发与测试

v0.2 是纯 JavaScript，没有 TypeScript/TSX 构建步骤。这样 Host 半和 Client 半都能直接从包目录加载，避免“`tsc` 能过、client bundle 却不是模块加载器格式”的问题。

```bash
npm test
node --check lib/scan.js
node --check lib/practice.js
node --check lib/format.js
node --check lib/index.js
node --check client.js
```

测试覆盖：

- 五类风险的识别与优先级；
- 新增信号：后端标签、性能数字口径、技能等级、强结论、角色升级；
- 9 个行业画像的启用、标签/证据与覆盖提示；
- PDF 硬换行合并、项目描述/技能 summary/奖项行不被误报；
- `includeValidationChain`、`maxRisks`、`targetRole` 与后端证据提示；
- 深冻结结果下的 `formatScanText`（防止原地 `sort` 冻结数组）；
- 练习游标逐条推进、结束、拒绝跳步、按 Agent 隔离；
- Web 卡片的元数据渲染、空态、错误态和文本回退。

## 文件结构

```text
dsh-resume-xray/
├── package.json
├── cordis.patch.yml
├── client.js              # window.__ModuleLoader__ 卡片
├── icon.svg
├── locale/
│   ├── en.json
│   └── zh.json
├── lib/
│   ├── index.js           # 两个工具的 defineTool + apply
│   ├── scan.js            # 确定性扫描规则 + 面试官信号
│   ├── industries.js      # 9 个热门行业的追问画像
│   ├── practice.js        # 会话级练习游标
│   └── format.js          # 模型可见文本
├── docs/
│   ├── interview-signals.md  # 通用/后端信号的来源与映射
│   └── industry-signals.md   # 行业画像的来源与映射
└── test/
    ├── scan.test.js
    └── client.test.mjs
```

## 当前限制

- **规则扫描，不是语义理解**。它能稳定找出“数字无口径、负责无边界、参与无个人贡献、结果无手段、结论无证据”这几类模式，但会误报，也会漏掉写得很完整但实际很虚的句子。公开面经是经验性材料，不是验证过的评分标准；v0.4 可以在规则候选之上加一层模型重排。
- **追问链按信号分了模板**（数字口径、职责边界、团队/个人、因果、强结论、后端规模、技能等级、角色升级，以及 9 个行业画像），但没有覆盖所有岗位；`targetRole` 只做关键词加权和后端证据提示，不改变整份简历的岗位匹配判断。
- **9 个行业有独立画像**（AI/大模型、智能驾驶/新能源、半导体/芯片、机器人/智能制造、金融科技/风控、跨境电商/出海、游戏、数据分析/产品/运营、咨询/战略）；前端、测试、运维等仍主要复用通用五类。行业画像之间可能重叠（如“SLAM 算法”会同时匹配 AI、自动驾驶、机器人），最多取 2 个。
- **简历全文会进入 session log**。这是 DSH 工具调用持久化的结果，不是插件另外存了一份。敏感简历请自行评估。
- **卡片只在 Web Client 生效**。TUI / headless 仍然能用两个工具，只是没有热度条。
- **工具名带 `resume_xray_` 前缀**，避免和别的面试插件重名。

## License

MIT
