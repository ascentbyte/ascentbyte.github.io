// app.js - 优化默认收起版与平滑渲染

let mapData = null;
let moduleIndex = {};
let progressData = JSON.parse(localStorage.getItem('mapProgressV5')) || {};
// 【核心修复】不再从 localStorage 读取展开状态，每次刷新默认清空（全部收起）
let expandedData = {}; 
let currentDomainKey = null;
let currentRenderedIds = [];

document.addEventListener('DOMContentLoaded', async () => {
  try {
    const response = await fetch('./data.json');
    if (!response.ok) throw new Error(`HTTP 错误: ${response.status}`);
    mapData = await response.json();
    buildModuleIndex();
    initApp();
  } catch (error) {
    const errorContainer = document.getElementById('error-container');
    if (errorContainer) {
      errorContainer.innerHTML = `
        <div class="notice" style="background:#fee2e2;color:#991b1b;border-color:#f87171;margin-bottom:20px;">
          <strong>⚠️ 数据加载失败！</strong><br>
          1. 请确保 data.json 与 index.html 在同一目录<br>
          2. 本地测试推荐 VS Code Live Server 或 python -m http.server<br>
          3. 详细错误：${escapeHtml(error.message || String(error))}
        </div>`;
    }
  }
});

function initApp() {
  initNav();
  bindEvents();
  updateGlobalProgress();
  showOverview();
}

function bindEvents() {
  const searchInput = document.getElementById('searchInput');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      if (currentDomainKey) {
        renderCards(currentDomainKey, e.target.value.toLowerCase().trim());
      }
    });
  }

  const cardsContainer = document.getElementById('cards');
  if (cardsContainer) {
    cardsContainer.addEventListener('click', handleCardsClick);
    cardsContainer.addEventListener('change', handleCardsChange);
  }
}

function handleCardsClick(event) {
  const ignore = event.target.closest('a, button.complete-ignore, input.complete-ignore, label.complete-ignore, details');
  if (ignore) return;

  const expandBtn = event.target.closest('.expand-btn');
  if (expandBtn) {
    const card = expandBtn.closest('.card');
    if (card?.dataset.moduleId) {
      toggleCardDetail(card.dataset.moduleId);
    }
    return;
  }

  const header = event.target.closest('.card-header');
  if (header) {
    const card = header.closest('.card');
    if (card?.dataset.moduleId) {
      toggleCardDetail(card.dataset.moduleId);
    }
  }
}

function handleCardsChange(event) {
  const checkbox = event.target.closest('.complete-checkbox');
  if (!checkbox) return;
  const moduleId = checkbox.dataset.moduleId;
  if (moduleId) {
    toggleComplete(moduleId);
  }
}

function buildModuleIndex() {
  moduleIndex = {};
  if (!mapData?.domains) return;

  for (const [domainKey, domain] of Object.entries(mapData.domains)) {
    (domain.items || []).forEach((item) => {
      moduleIndex[item.id] = {
        ...item,
        __domainKey: domainKey,
        __domainTitle: domain.title
      };
    });
  }
}

// ====================== 通用工具 ======================
function escapeHtml(value) {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function formatText(value) {
  return escapeHtml(value).replace(/\n/g, '<br>');
}

function uniqueStrings(list) {
  return [...new Set((list || []).filter(Boolean).map(v => String(v)))];
}

function toListHtml(list) {
  const items = uniqueStrings(list);
  if (!items.length) return '<div class="muted">暂无</div>';
  return `<ul>${items.map(item => `<li>${formatText(item)}</li>`).join('')}</ul>`;
}

function joinSafe(list, sep = '、') {
  const items = uniqueStrings(list);
  return items.length ? escapeHtml(items.join(sep)) : '暂无';
}

function countModules() {
  return Object.values(mapData.domains || {}).reduce((sum, domain) => sum + (domain.items?.length || 0), 0);
}

function getSearchableText(item) {
  const parts = [
    item.id, item.module, item.summary, item.lecture_desc,
    ...(item.mechanisms || []), ...(item.commands || []), ...(item.tools || []),
    ...(item.detection || []), ...(item.attack_tags || []), ...(item.tags?.topic || []),
    ...(item.study_view ? Object.values(item.study_view).flat() : [])
  ];
  return parts.filter(Boolean).join(' ').toLowerCase();
}

function renderRelationList(ids, emptyText = '暂无') {
  const list = uniqueStrings(ids);
  if (!list.length) return `<div class="muted">${emptyText}</div>`;
  return `<div class="chips">${list.map(id => {
        const item = moduleIndex[id];
        const label = item ? `${item.module}` : id;
        return `<span class="chip chip-small">${escapeHtml(label)}</span>`;
      }).join('')}</div>`;
}

function renderMaturityWeights(weights) {
  const entries = Object.entries(weights || {});
  if (!entries.length) return '<div class="muted">暂无</div>';
  return `<div class="chips">${entries.map(([key, value]) => `<span class="chip chip-weight">${escapeHtml(key)}：${escapeHtml(value)}</span>`).join('')}</div>`;
}

function renderResources(resources) {
  if (!resources?.length) return '<div class="muted">暂无资源</div>';
  return `<div class="resource-list">${resources.map(res => `
        <div class="resource-item">
          <div><a href="${escapeHtml(res.url || '#')}" target="_blank">📘 ${escapeHtml(res.title || '资源')}</a></div>
          <div class="resource-meta">${res.type ? `类型：${escapeHtml(res.type)} ` : ''}${res.why ? `| 用途：${escapeHtml(res.why)}` : ''}</div>
        </div>`).join('')}</div>`;
}

function renderLabs(labs) {
  if (!labs?.length) return '<div class="muted">暂无实验</div>';
  return `<div class="lab-list">${labs.map(lab => `
        <div class="lab-item">
          <div class="lab-title">${escapeHtml(lab.title || '实验')}</div>
          <div class="lab-meta">${lab.env?.length ? `环境：${escapeHtml(lab.env.join('、'))} ` : ''}| 耗时：${escapeHtml(lab.duration || '?')}</div>
        </div>`).join('')}</div>`;
}

function renderSelfTests(questions, answers) {
  if (!questions?.length) return '<div class="muted">暂无自测题</div>';
  const aMap = new Map((answers || []).map(a => [a.q, a]));
  return `<div class="qa-list">${questions.map(q => {
        const qCode = String(q).match(/^(Q\d+)\s*[:：]/i)?.[1].toUpperCase();
        const ans = qCode ? aMap.get(qCode) : null;
        return `<details class="qa-item"><summary>${escapeHtml(q)}</summary><div class="qa-answer">
              ${ans ? `<p><strong>要点：</strong></p>${toListHtml(ans.key_points)}<p><strong>评分：</strong> ${escapeHtml(ans.score_rubric)}</p>` : '<p class="muted">暂无答案</p>'}
            </div></details>`;
      }).join('')}</div>`;
}

function renderQuickBox(label, value) {
  return `<div class="quick-box"><span class="label">${escapeHtml(label)}</span><div class="value">${value}</div></div>`;
}

function renderStudyView(item) {
  const sv = item.study_view || {};
  return `
    <section class="detail-box" style="grid-column:1/-1;background:#fff7ed;border-color:#fed7aa;">
      <h5>你要学什么</h5><p>${formatText(sv.what_to_learn || item.summary || '暂无')}</p>
    </section>
    <section class="detail-box" style="grid-column:1/-1;">
      <h5>为什么重要</h5><p>${formatText(sv.why_it_matters || item.summary || '暂无')}</p>
    </section>
    <section class="detail-box mechanisms"><h5>必须掌握</h5>${toListHtml(sv.must_master || item.mechanisms)}</section>
    <section class="detail-box"><h5>必须认识</h5>${toListHtml(sv.must_recognize)}</section>
    <section class="detail-box warn"><h5>攻击者怎么用</h5>${toListHtml(sv.attacker_usage)}</section>
    <section class="detail-box detect"><h5>防守者怎么看</h5>${toListHtml(sv.defender_view || item.detection)}</section>
    <section class="detail-box"><h5>开发技能</h5>${toListHtml(sv.developer_skills)}</section>
    <section class="detail-box labs"><h5>推荐实验</h5>${renderLabs(item.labs)}</section>
    <section class="detail-box" style="grid-column:1/-1;"><h5>专家级自测</h5>${renderSelfTests(item.self_test, item.self_test_answers)}</section>
    <section class="detail-box" style="grid-column:1/-1;"><h5>资源清单</h5>${renderResources(item.resources)}</section>
  `;
}

// ====================== 视图切换 ======================
function hideAllViews() {
  document.getElementById('view-overview').classList.add('hidden');
  document.getElementById('view-domain').classList.add('hidden');
  document.getElementById('view-notes').classList.add('hidden');
}

function initNav() {
  const navContainer = document.getElementById('nav');
  navContainer.innerHTML = '';
  for (const [key, domain] of Object.entries(mapData.domains || {})) {
    const btn = document.createElement('button');
    btn.id = `nav-${key}`;
    btn.innerHTML = `<span class="nav-btn-inner"><span class="nav-label">${escapeHtml(domain.title)}</span><span class="nav-count">${domain.items?.length || 0}</span></span>`;
    btn.onclick = () => showDomain(key);
    navContainer.appendChild(btn);
  }
}

function clearNavActive() {
  document.querySelectorAll('.nav button, .nav-notes-btn').forEach(btn => btn.classList.remove('active'));
}

window.showOverview = function() {
  currentDomainKey = null;
  clearNavActive();
  hideAllViews();
  document.getElementById('view-overview').classList.remove('hidden');
  if (mapData.overview) {
    document.getElementById('hero-title').textContent = mapData.overview.hero_title || '能力地图';
    document.getElementById('hero-desc').textContent = mapData.overview.hero_desc || '';
  }
};

function showDomain(domainKey) {
  currentDomainKey = domainKey;
  const domain = mapData.domains[domainKey];
  clearNavActive();
  document.getElementById(`nav-${domainKey}`)?.classList.add('active');
  hideAllViews();
  document.getElementById('view-domain').classList.remove('hidden');
  document.getElementById('domain-title').textContent = domain.title;
  document.getElementById('domain-desc').textContent = domain.desc || '';
  
  if (document.getElementById('searchInput')) document.getElementById('searchInput').value = '';
  
  // 切换领域时，默认清空展开状态
  expandedData = {}; 
  renderCards(domainKey, '');
  document.getElementById('scroll-container').scrollTo({ top: 0, behavior: 'instant' });
}

// ====================== 展开 / 收起 控制 ======================
function isExpanded(moduleId) {
  return Boolean(expandedData[moduleId]);
}

window.toggleCardDetail = function(moduleId) {
  expandedData[moduleId] = !isExpanded(moduleId);
  if (currentDomainKey) {
    renderCards(currentDomainKey, document.getElementById('searchInput')?.value.toLowerCase().trim() || '');
  }
};

window.expandAllVisible = function() {
  currentRenderedIds.forEach(id => expandedData[id] = true);
  if (currentDomainKey) renderCards(currentDomainKey, document.getElementById('searchInput')?.value.toLowerCase().trim() || '');
};

window.collapseAllVisible = function() {
  currentRenderedIds.forEach(id => expandedData[id] = false);
  if (currentDomainKey) renderCards(currentDomainKey, document.getElementById('searchInput')?.value.toLowerCase().trim() || '');
};

// ====================== 核心渲染 ======================
function renderCards(domainKey, filterText) {
  const cardsContainer = document.getElementById('cards');
  const countContainer = document.getElementById('domain-count');
  const items = mapData.domains[domainKey]?.items || [];
  let html = '';
  let matched = 0;
  currentRenderedIds = [];

  items.forEach(item => {
    const searchable = getSearchableText(item);
    if (filterText && !searchable.includes(filterText)) return;

    matched += 1;
    currentRenderedIds.push(item.id);

    const completed = Boolean(progressData[item.id]);
    const expanded = isExpanded(item.id);

    const tagsHtml = `
      <span class="chip chip-platform">平台: ${joinSafe(item.tags?.platform)}</span>
      <span class="chip chip-level">等级: ${escapeHtml(item.level || 'L1')}</span>
    `;

    const attackHtml = (item.attack_tags || []).map(tag => `<span class="chip chip-attack">${escapeHtml(tag)}</span>`).join('');

    html += `
      <article class="card ${completed ? 'done' : ''}" data-module-id="${escapeHtml(item.id)}">
        <div class="card-header" tabindex="0" role="button" aria-expanded="${expanded ? 'true' : 'false'}">
          <div class="title-row">
            <div class="title-main">
              <h4>
                <span>${escapeHtml(item.module)}</span>
                <span class="module-id">${escapeHtml(item.id)}</span>
              </h4>
              <p class="summary">${formatText(item.summary || '')}</p>
            </div>
            <div class="title-actions">
              <label class="donebox complete-ignore">
                <input type="checkbox" class="complete-checkbox complete-ignore" data-module-id="${escapeHtml(item.id)}" ${completed ? 'checked' : ''}/>
                <span>${completed ? '已完成' : '标记完成'}</span>
              </label>
              <button type="button" class="expand-btn">
                ${expanded ? '收起讲义 ▲' : '展开讲义 ▼'}
              </button>
            </div>
          </div>

          <div class="chips">${tagsHtml}${attackHtml}</div>
        </div>

        <div id="detail-${escapeHtml(item.id)}" class="card-detail ${expanded ? 'show' : 'hidden'}">
          <div class="detail-grid">
            ${renderStudyView(item)}
          </div>
        </div>
      </article>`;
  });

  cardsContainer.innerHTML = html || '<div class="notice">没有匹配的模块</div>';
  if (countContainer) {
    countContainer.textContent = `共 ${items.length} 个模块，匹配 ${matched} 个。`;
  }
}

function updateGlobalProgress() {
  const totalModules = countModules();
  const completed = Object.keys(progressData).length;
  const footerProgress = document.getElementById('footer-progress');
  if (footerProgress) footerProgress.textContent = `进度：${completed}/${totalModules} 模块已完成`;
}

window.toggleComplete = function(moduleId) {
  if (progressData[moduleId]) delete progressData[moduleId];
  else progressData[moduleId] = true;
  localStorage.setItem('mapProgressV5', JSON.stringify(progressData));
  updateGlobalProgress();
  if (currentDomainKey) renderCards(currentDomainKey, document.getElementById('searchInput')?.value.toLowerCase().trim() || '');
};