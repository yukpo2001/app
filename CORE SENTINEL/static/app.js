const queryInput = document.getElementById('query-input');
const sendBtn = document.getElementById('send-btn');
const chatDisplay = document.getElementById('chat-display');
const riskScoreEl = document.getElementById('risk-score');
const riskProgressEl = document.getElementById('risk-progress');
const shieldStatusEl = document.getElementById('shield-status');
const systemLogs = document.getElementById('system-logs');

function addLog(msg, isError = false) {
    const time = new Date().toISOString().split('T')[1].slice(0, 8);
    const div = document.createElement('div');
    div.className = `log-entry ${isError ? 'error' : ''}`;
    div.textContent = `[${time}] ${msg}`;
    systemLogs.appendChild(div);
    systemLogs.scrollTop = systemLogs.scrollHeight;
}

function updateMetrics(score, isBlocked) {
    riskScoreEl.textContent = score.toFixed(2);
    const percent = Math.min(score * 100, 100);
    riskProgressEl.style.width = `${percent}%`;
    
    if (isBlocked) {
        riskScoreEl.classList.add('danger');
        riskProgressEl.classList.add('danger');
        shieldStatusEl.textContent = 'BLOCKED / THREAT';
        shieldStatusEl.className = 'status-text blocked';
    } else {
        riskScoreEl.classList.remove('danger');
        riskProgressEl.classList.remove('danger');
        shieldStatusEl.textContent = 'SAFE / MONITORING';
        shieldStatusEl.className = 'status-text safe';
    }
}

function appendMessage(role, text) {
    const div = document.createElement('div');
    div.className = `msg ${role}`;
    
    // Parse Trace Mode formatting roughly for better UI
    if (role === 'sentinel' && text.includes('[CORE SENTINEL: Trace Mode Activated]')) {
        const lines = text.split('\n');
        let html = '';
        lines.forEach(line => {
            if (line.trim() === '[CORE SENTINEL: Trace Mode Activated]') {
                html += `<div style="color: var(--neon-blue); font-weight: bold; margin-bottom: 12px; font-size: 1.1em;">${line}</div>`;
            } else if (line.includes('논리 경로') || line.includes('보안 무결성') || line.includes('활인적 인사이트')) {
                html += `<div style="color: var(--text-muted); font-size: 0.9em; margin-bottom: 6px; padding-left: 10px; border-left: 2px solid var(--neon-blue-dim);">${line}</div>`;
            } else if (line.trim() === '---') {
                html += `<hr style="border-color: rgba(255,255,255,0.05); margin: 16px 0;">`;
            } else {
                html += `<div style="margin-bottom: 8px;">${line.replace(/\n/g, '<br>')}</div>`;
            }
        });
        div.innerHTML = html;
    } else {
        div.textContent = text;
    }
    
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function showLoading() {
    const div = document.createElement('div');
    div.className = `chat-message sentinel`;
    div.id = 'sentinel-loading';
    div.innerHTML = `<span style="color: var(--neon-blue); opacity: 0.8;">🛡️ 외부 지식망 동기화 및 통찰 연산 중... (수 초 소요)</span>`;
    chatDisplay.appendChild(div);
    chatDisplay.scrollTop = chatDisplay.scrollHeight;
}

function hideLoading() {
    const loadingEl = document.getElementById('sentinel-loading');
    if (loadingEl) loadingEl.remove();
}


async function sendQuery() {
    const text = queryInput.value.trim();
    if (!text) return;
    
    queryInput.value = '';
    appendMessage('user', text);
    addLog(`Transmitting: ${text.substring(0, 15)}...`);
    
    queryInput.disabled = true;
    sendBtn.disabled = true;
    showLoading();
    
    try {
        const response = await fetch('/v1/sentinel/ask', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ text })
        });
        
        hideLoading();
        
        if (!response.ok) {
            const errData = await response.json().catch(()=>({}));
            throw new Error(errData.detail || `HTTP ${response.status}`);
        }
        
        const data = await response.json();
        addLog(`Response received. Risk Score: ${data.risk_score}`);
        updateMetrics(data.risk_score, data.is_blocked);
        
        if (data.is_blocked) {
            appendMessage('system-alert', data.response);
        } else {
            appendMessage('sentinel', data.response);
        }
        
        
    } catch (err) {
        hideLoading();
        addLog(`Exception: ${err.message}`, true);
        appendMessage('system-alert', `[SYS_ERROR] 통신 모듈 오류: ${err.message}`);
        
        if (err.message.includes('quota') || err.message.includes('429')) {
            updateMetrics(0, true);
            shieldStatusEl.textContent = 'API QUOTA EXCEEDED';
        }
    } finally {
        queryInput.disabled = false;
        sendBtn.disabled = false;
        queryInput.focus();
    }
}

sendBtn.addEventListener('click', sendQuery);
queryInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') sendQuery();
});
