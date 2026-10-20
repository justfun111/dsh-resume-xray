window.__ModuleLoader__.load({
  id: 'dsh-resume-xray',
  factory(require) {
    const React = require('react')
    const h = React.createElement

    const LABELS = {
      no_metric_baseline: '数字无口径',
      unclear_ownership: '职责不清',
      team_vs_individual: '团队/个人混淆',
      causal_gap: '因果缺口',
      unsupported_claim: '结论无依据',
    }

    const styles = {
      card: {
        width: '100%',
        boxSizing: 'border-box',
        border: '1px solid var(--dsw-alias-border-l1, rgba(127, 127, 127, 0.25))',
        borderRadius: 10,
        background: 'var(--dsw-alias-bg-layer-1, transparent)',
        padding: '10px 12px',
        color: 'var(--dsw-alias-label-primary, inherit)',
        fontFamily: 'inherit',
        fontSize: 13,
        lineHeight: 1.5,
      },
      header: {
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        minWidth: 0,
      },
      title: { fontSize: 13, fontWeight: 600, flexShrink: 0 },
      badge: {
        marginLeft: 'auto',
        flexShrink: 0,
        fontSize: 11,
        lineHeight: '18px',
        padding: '0 7px',
        borderRadius: 999,
        border: '1px solid var(--dsw-alias-border-l1, rgba(127, 127, 127, 0.25))',
        background: 'var(--dsw-alias-bg-layer-2, transparent)',
        color: 'var(--dsw-alias-label-secondary, #888)',
      },
      subtitle: {
        margin: '2px 0 6px',
        fontSize: 11,
        color: 'var(--dsw-alias-label-secondary, #888)',
      },
      list: {
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 380,
        overflowY: 'auto',
        paddingRight: 2,
      },
      risk: {
        borderTop: '1px solid var(--dsw-alias-border-l1, rgba(127, 127, 127, 0.18))',
        padding: '3px 0',
      },
      summary: { cursor: 'pointer', padding: '3px 0' },
      summaryRow: { display: 'flex', alignItems: 'flex-start', gap: 9 },
      bar: { width: 4, height: 30, borderRadius: 2, flexShrink: 0, marginTop: 2 },
      riskText: { flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column', gap: 2 },
      sentence: { fontSize: 13, fontWeight: 550, overflowWrap: 'anywhere' },
      typeLine: {
        fontSize: 11,
        color: 'var(--dsw-alias-label-secondary, #888)',
        overflowWrap: 'anywhere',
      },
      score: {
        flexShrink: 0,
        fontSize: 12,
        fontWeight: 600,
        fontVariantNumeric: 'tabular-nums',
        color: 'var(--dsw-alias-label-secondary, #888)',
      },
      detail: { padding: '2px 0 9px 14px' },
      why: {
        margin: '2px 0 8px',
        fontSize: 12,
        color: 'var(--dsw-alias-label-secondary, #888)',
        lineHeight: 1.55,
      },
      signals: {
        margin: '0 0 8px',
        fontSize: 10,
        lineHeight: 1.5,
        color: 'var(--dsw-alias-label-secondary, #888)',
        opacity: 0.85,
        overflowWrap: 'anywhere',
      },
      chain: {
        margin: 0,
        paddingLeft: 18,
        fontSize: 12,
        lineHeight: 1.6,
      },
      chainItem: { marginBottom: 4 },
      footer: {
        marginTop: 8,
        paddingTop: 7,
        borderTop: '1px solid var(--dsw-alias-border-l1, rgba(127, 127, 127, 0.18))',
        fontSize: 11,
        color: 'var(--dsw-alias-label-secondary, #888)',
        lineHeight: 1.5,
      },
      muted: {
        margin: '6px 0 0',
        fontSize: 12,
        color: 'var(--dsw-alias-label-secondary, #888)',
      },
      error: {
        margin: '6px 0 0',
        fontSize: 12,
        color: 'var(--dsw-alias-state-error-primary, #e5484d)',
        overflowWrap: 'anywhere',
      },
      pre: {
        margin: '6px 0 0',
        padding: 8,
        borderRadius: 6,
        background: 'var(--dsw-alias-bg-layer-2, rgba(127, 127, 127, 0.08))',
        fontSize: 11,
        lineHeight: 1.5,
        whiteSpace: 'pre-wrap',
        overflowWrap: 'anywhere',
        maxHeight: 220,
        overflowY: 'auto',
      },
    }

    function isRecord(value) {
      return typeof value === 'object' && value !== null && !Array.isArray(value)
    }

    function scoreOf(value) {
      return typeof value === 'number' && Number.isFinite(value)
        ? Math.max(1, Math.min(10, Math.round(value)))
        : 0
    }

    function colorOf(score) {
      if (score >= 8) return 'var(--dsw-alias-state-error-primary, #e5484d)'
      if (score >= 6) return 'var(--dsw-alias-state-warn-primary, #f5a623)'
      return 'var(--dsw-alias-state-success-primary, #46a758)'
    }

    function textContent(block) {
      if (!Array.isArray(block.content)) return ''
      return block.content
        .filter((item) => item && item.type === 'text' && typeof item.text === 'string')
        .map((item) => item.text)
        .join('\n')
    }

    function Header(props) {
      const score = props.score
      return h(
        'div',
        { style: styles.header },
        h(
          'svg',
          {
            width: 16,
            height: 16,
            viewBox: '0 0 24 24',
            'aria-hidden': true,
            style: { flexShrink: 0 },
          },
          h('rect', {
            x: 4,
            y: 3,
            width: 12,
            height: 16,
            rx: 2,
            fill: 'none',
            stroke: 'currentColor',
            strokeWidth: 1.6,
          }),
          h('path', {
            d: 'M7 7h6M7 10h6M7 13h4',
            stroke: 'currentColor',
            strokeWidth: 1.4,
            strokeLinecap: 'round',
          }),
          h('path', {
            d: 'M2 15h20',
            stroke: 'var(--dsw-alias-brand-primary, #247bbf)',
            strokeWidth: 1.8,
            strokeLinecap: 'round',
          }),
          h('circle', {
            cx: 18,
            cy: 18,
            r: 2.6,
            fill: 'var(--dsw-alias-state-error-primary, #e5484d)',
          }),
        ),
        h('span', { style: styles.title }, '简历 X 光'),
        h(
          'span',
          {
            style: {
              ...styles.badge,
              ...(props.tone === 'error'
                ? { color: 'var(--dsw-alias-state-error-primary, #e5484d)' }
                : {}),
            },
          },
          props.label,
        ),
        props.score > 0
          ? h('span', { style: { ...styles.score, marginLeft: 2 } }, `最高 ${score}/10`)
          : null,
      )
    }

    function RiskRow(props) {
      const risk = props.risk
      const score = scoreOf(risk.collapseRisk)
      const chain = Array.isArray(risk.followUpChain) ? risk.followUpChain : []
      return h(
        'details',
        { style: styles.risk },
        h(
          'summary',
          { style: styles.summary },
          h(
            'span',
            { style: styles.summaryRow },
            h('span', {
              style: { ...styles.bar, background: colorOf(score) },
              'aria-hidden': true,
            }),
            h(
              'span',
              { style: styles.riskText },
              h('span', { style: styles.sentence }, String(risk.sentence || '')),
              h(
                'span',
                { style: styles.typeLine },
                `${LABELS[risk.riskType] || risk.riskType || '未分类'} · 风险 ${score}/10`,
              ),
            ),
          ),
        ),
        h(
          'div',
          { style: styles.detail },
          risk.why
            ? h('p', { style: styles.why }, String(risk.why))
            : null,
          Array.isArray(risk.signals) && risk.signals.length > 0
            ? h(
                'div',
                { style: styles.signals },
                `触发：${risk.signals.join(' · ')}`,
              )
            : null,
          chain.length > 0
            ? h(
                'ol',
                { style: styles.chain },
                chain.map((question, index) =>
                  h('li', { key: String(index), style: styles.chainItem }, String(question)),
                ),
              )
            : h('p', { style: styles.muted }, '这条风险没有追问链。'),
        ),
      )
    }

    function RiskCard(props) {
      const block = props.block || {}
      const phase = props.phase
      const isResult = phase === 'result'
      const failed = isResult && block.isError === true
      const meta = isResult && isRecord(block.meta) ? block.meta : undefined
      const risks = meta && Array.isArray(meta.risks) ? meta.risks.filter(isRecord) : []
      const summary = meta && typeof meta.summary === 'string' ? meta.summary : ''
      const fallbackText = isResult ? textContent(block) : ''
      const topScore = risks.reduce(
        (best, risk) => Math.max(best, scoreOf(risk.collapseRisk)),
        0,
      )

      if (failed) {
        const reason =
          (block.error && (block.error.reason || block.error.code || block.error.name)) ||
          '扫描失败'
        return h(
          'div',
          { style: styles.card },
          h(Header, { label: '扫描失败', tone: 'error', score: 0 }),
          h('p', { style: styles.error }, String(reason)),
        )
      }

      if (!isResult) {
        return h(
          'div',
          { style: styles.card },
          h(Header, { label: '扫描中…' }),
          h('p', { style: styles.muted }, '正在扫描简历，找出容易被追问崩的句子…'),
        )
      }

      if (risks.length === 0) {
        return h(
          'div',
          { style: styles.card },
          h(Header, { label: '0 处风险' }),
          h('p', { style: styles.muted }, '未发现明显的高风险表述。'),
          summary ? h('div', { style: styles.footer }, summary) : null,
          !summary && fallbackText ? h('pre', { style: styles.pre }, fallbackText) : null,
        )
      }

      return h(
        'div',
        { style: styles.card },
        h(Header, {
          label: `${risks.length} 处风险`,
          score: topScore,
        }),
        h(
          'p',
          { style: styles.subtitle },
          '按追问崩溃风险排序；点开每条看追问链。红色优先处理。',
        ),
        h(
          'div',
          { style: styles.list },
          risks.map((risk, index) =>
            h(RiskRow, { key: `${index}-${risk.sentence}`, risk }),
          ),
        ),
        summary ? h('div', { style: styles.footer }, summary) : null,
      )
    }

    return {
      inject: ['slots'],
      apply(ctx) {
        ctx.slots.inject('tool.call.toolview', () =>
          ctx.slots.register(
            {
              name: 'tool.call.toolview',
              key: 'resume_xray_scan',
            },
            RiskCard,
          ),
        )
      },
    }
  },
})
