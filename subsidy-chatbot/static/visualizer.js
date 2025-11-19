// 視覚化機能のヘルパー関数

function renderVisualData(visualData) {
    if (!visualData) return '';
    
    switch (visualData.type) {
        case 'summary_box':
            return renderSummaryBox(visualData);
        case 'requirements_list':
            return renderRequirementsList(visualData);
        case 'timeline':
            return renderTimeline(visualData);
        case 'table':
            return renderTable(visualData);
        case 'formula':
            return renderFormula(visualData);
        case 'checklist':
            return renderChecklist(visualData);
        case 'warning_box':
            return renderWarningBox(visualData);
        case 'calculation_methods':
            return renderCalculationMethods(visualData);
        case 'excluded_items':
            return renderExcludedItems(visualData);
        case 'matrix_table':
            return renderMatrixTable(visualData);
        case 'requirements_box':
            return renderRequirementsBox(visualData);
        case 'benefit_list':
            return renderBenefitList(visualData);
        case 'category_list':
            return renderCategoryList(visualData);
        case 'examples_list':
            return renderExamplesList(visualData);
        case 'rule_box':
            return renderRuleBox(visualData);
        case 'max_date':
            return renderMaxDate(visualData);
        case 'special_cases':
            return renderSpecialCases(visualData);
        case 'timeline_warning':
            return renderTimelineWarning(visualData);
        case 'maintenance_rule':
            return renderMaintenanceRule(visualData);
        default:
            return '';
    }
}

function renderSummaryBox(data) {
    return `
        <div class="visual-box summary-box">
            <table class="info-table">
                ${data.items.map(item => `
                    <tr>
                        <th>${item.label}</th>
                        <td>${item.value}</td>
                    </tr>
                `).join('')}
            </table>
        </div>
    `;
}

function renderRequirementsList(data) {
    return `
        <div class="visual-box requirements-list">
            <h4>${data.title}</h4>
            ${data.items.map(item => `
                <div class="requirement-item">
                    <div class="requirement-number">${item.number}</div>
                    <div class="requirement-content">
                        <div class="requirement-title">${item.title}</div>
                        <div class="requirement-desc">${item.description}</div>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderTimeline(data) {
    return `
        <div class="visual-box timeline-box">
            <table class="info-table">
                ${data.items.map(item => `
                    <tr>
                        <th>${item.label}</th>
                        <td>${item.value}</td>
                    </tr>
                `).join('')}
            </table>
        </div>
    `;
}

function renderTable(data) {
    return `
        <div class="visual-box table-box">
            <table class="data-table">
                <thead>
                    <tr>
                        ${data.headers.map(header => `<th>${header}</th>`).join('')}
                    </tr>
                </thead>
                <tbody>
                    ${data.rows.map(row => `
                        <tr>
                            ${row.map(cell => `<td>${cell}</td>`).join('')}
                        </tr>
                    `).join('')}
                </tbody>
            </table>
            ${data.note ? `<div class="table-note">${data.note}</div>` : ''}
        </div>
    `;
}

function renderFormula(data) {
    return `
        <div class="visual-box formula-box">
            <h4>${data.title}</h4>
            <div class="formula">${data.formula}</div>
            ${data.note ? `<div class="formula-note">${data.note}</div>` : ''}
            ${data.example ? `<div class="formula-example">例：${data.example}</div>` : ''}
        </div>
    `;
}

function renderChecklist(data) {
    return `
        <div class="visual-box checklist-box">
            <h4>${data.title}</h4>
            <ul class="checklist">
                ${data.items.map(item => `
                    <li class="checklist-item">
                        <span class="check-icon">✓</span>
                        <span>${item.text}</span>
                    </li>
                `).join('')}
            </ul>
        </div>
    `;
}

function renderWarningBox(data) {
    return `
        <div class="visual-box warning-box">
            <h4>⚠️ ${data.title}</h4>
            <p>${data.content}</p>
            ${data.example ? `<div class="warning-example">例：${data.example}</div>` : ''}
        </div>
    `;
}

function renderCalculationMethods(data) {
    return `
        <div class="visual-box calculation-box">
            <h4>${data.title}</h4>
            <table class="calc-table">
                ${data.methods.map(method => `
                    <tr>
                        <th>${method.type}</th>
                        <td><code>${method.formula}</code></td>
                    </tr>
                `).join('')}
            </table>
        </div>
    `;
}

function renderExcludedItems(data) {
    return `
        <div class="visual-box excluded-box">
            <h4>${data.title}</h4>
            <ul class="excluded-list">
                ${data.items.map(item => `
                    <li>❌ ${item}</li>
                `).join('')}
            </ul>
        </div>
    `;
}

function renderMatrixTable(data) {
    return `
        <div class="visual-box matrix-box">
            <h4>${data.title}</h4>
            <p class="matrix-note">${data.note}</p>
        </div>
    `;
}

function renderRequirementsBox(data) {
    return `
        <div class="visual-box requirements-box">
            <h4>${data.title}</h4>
            ${data.items.map(item => `
                <div class="req-item">
                    <div class="req-title">【${item.title}】</div>
                    <div class="req-content">${item.content}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderBenefitList(data) {
    return `
        <div class="visual-box benefit-box">
            <h4>${data.title}</h4>
            <table class="benefit-table">
                ${data.items.map(item => `
                    <tr>
                        <th>${item.condition}</th>
                        <td>→ ${item.benefit}</td>
                    </tr>
                `).join('')}
            </table>
        </div>
    `;
}

function renderCategoryList(data) {
    return `
        <div class="visual-box category-box">
            <h4>${data.title}</h4>
            <ul class="category-list-visual">
                ${data.items.map(item => `<li>• ${item}</li>`).join('')}
            </ul>
        </div>
    `;
}

function renderExamplesList(data) {
    return `
        <div class="visual-box examples-box">
            <h4>${data.title}</h4>
            ${data.items.map(item => `
                <div class="example-item">
                    <div class="example-title">✓ ${item.title}</div>
                    <div class="example-effect">効果：${item.effect}</div>
                </div>
            `).join('')}
        </div>
    `;
}

function renderRuleBox(data) {
    return `
        <div class="visual-box rule-box">
            <h4>${data.title}</h4>
            <p class="rule-content">${data.content}</p>
            ${data.note ? `<div class="rule-note">${data.note}</div>` : ''}
        </div>
    `;
}

function renderMaxDate(data) {
    return `
        <div class="visual-box max-date-box">
            <h4>${data.title}</h4>
            <ul class="date-list">
                ${data.items.map(item => `<li>• ${item}</li>`).join('')}
            </ul>
            <div class="max-note">📌 ${data.note}</div>
        </div>
    `;
}

function renderSpecialCases(data) {
    return `
        <div class="visual-box special-cases-box">
            <h4>${data.title}</h4>
            <ul class="special-list">
                ${data.items.map(item => `<li>✓ ${item}</li>`).join('')}
            </ul>
        </div>
    `;
}

function renderTimelineWarning(data) {
    return `
        <div class="visual-box timeline-warning-box">
            <h4>⚠️ ${data.title}</h4>
            <p>${data.content}</p>
            ${data.exception ? `<div class="exception-note">※ ${data.exception}</div>` : ''}
        </div>
    `;
}

function renderMaintenanceRule(data) {
    return `
        <div class="visual-box maintenance-box">
            <h4>📋 ${data.title}</h4>
            <p>${data.content}</p>
        </div>
    `;
}
