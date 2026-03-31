// CORE SENTINEL CYBERPUNK - FRONTEND LOGIC

document.addEventListener('DOMContentLoaded', () => {
    const chatViewport = document.getElementById('chat-viewport');
    const promptInput = document.getElementById('prompt-input');
    const sendBtn = document.getElementById('send-btn');
    const riskScoreEl = document.getElementById('risk-score');
    const riskProgressEl = document.getElementById('risk-progress');
    const shieldStatusEl = document.getElementById('shield-status');
    const unitDPanel = document.getElementById('unit-d-panel');
    const terminalLogs = document.getElementById('terminal-logs');
    const clearBtn = document.getElementById('clear-btn');
    const uploadBtn = document.getElementById('upload-btn');
    const imageUploadInput = document.getElementById('image-upload');
    const imagePreviewContainer = document.getElementById('image-preview-container');
    const imagePreview = document.getElementById('image-preview');
    const micBtn = document.getElementById('mic-btn');

    let threadId = 'master_gui_' + Date.now();
    let pendingImageBase64 = null;
    let isRecording = false;
    let mediaRecorder = null;
    let audioChunks = [];

    uploadBtn.addEventListener('click', () => {
        imageUploadInput.click();
    });

    imageUploadInput.addEventListener('change', function(e) {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = function(event) {
                const result = event.target.result;
                imagePreview.src = result;
                imagePreviewContainer.style.display = 'block';
                // Remove the data:image/jpeg;base64, part
                pendingImageBase64 = result.split(',')[1];
                addLog(`Image buffer loaded [${file.name}]`, 'info');
            };
            reader.readAsDataURL(file);
        }
    });

    // Mic recording logic
    micBtn.addEventListener('click', async () => {
        if (!isRecording) {
            try {
                const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
                mediaRecorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
                audioChunks = [];
                
                mediaRecorder.ondataavailable = e => {
                    if (e.data.size > 0) audioChunks.push(e.data);
                };
                
                mediaRecorder.onstop = async () => {
                    const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
                    addLog("음성 캡처 완료. 융합의 연금술사(Whisper)로 전송 중...", "info");
                    
                    const formData = new FormData();
                    formData.append('file', audioBlob, 'voice.webm');
                    
                    try {
                        const res = await fetch('/v1/sentinel/transcribe', {
                            method: 'POST',
                            body: formData
                        });
                        const data = await res.json();
                        if (data.text) {
                            promptInput.value = data.text;
                            // 음성으로 입력한 경우 자동으로 TTS 응답 받기를 희망함.
                            window.ttsEnabledFlag = true;
                            sendQuery();
                        }
                    } catch (e) {
                        addLog(`음성 변환 오류: ${e.message}`, "error");
                    }
                    
                    stream.getTracks().forEach(track => track.stop());
                };
                
                mediaRecorder.start();
                isRecording = true;
                micBtn.style.color = "red";
                micBtn.textContent = "🛑 STOP";
                addLog("마스터의 음성을 도청... 아니, 경청 중입니다.", "info");
            } catch (err) {
                addLog("마이크 접근 권한이 없습니다.", "error");
            }
        } else {
            mediaRecorder.stop();
            isRecording = false;
            micBtn.style.color = "var(--neon-pink)";
            micBtn.textContent = "🎙️ VOICE";
        }
    });

    function addLog(msg, type='info') {
        const line = document.createElement('div');
        line.className = `log-line ${type}`;
        
        let prefix = '[INFO]';
        if(type==='error') prefix = '[ERR!]';
        if(type==='tool') prefix = '[EXEC]';
        
        const time = new Date().toISOString().substring(11,19);
        line.textContent = `${time} ${prefix} ${msg}`;
        terminalLogs.appendChild(line);
        terminalLogs.scrollTop = terminalLogs.scrollHeight;
    }

    function appendMessage(sender, text, isHtml=false, isBlocked=false) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `cyber-msg ${sender}`;
        if (isBlocked) msgDiv.classList.add('shield-blocked');
        
        const header = document.createElement('div');
        header.className = 'msg-header';
        header.textContent = sender === 'master' ? 'MASTER_COMMAND' : 'CORE_SENTINEL';
        
        const body = document.createElement('div');
        body.className = 'msg-body';
        if (isHtml) body.innerHTML = text;
        else body.textContent = text;
        
        msgDiv.appendChild(header);
        msgDiv.appendChild(body);
        
        chatViewport.appendChild(msgDiv);
        chatViewport.scrollTop = chatViewport.scrollHeight;
    }

    function processTraceBlocks(rawText) {
        // [논리 경로]... [보안 검증]... [활인적 인사이트]... 등 대괄호 구조를 파싱하여 스타일링
        // 단순 치환
        let htmlText = rawText.replace(/\n/g, '<br>');
        
        htmlText = htmlText.replace(/\[논리 경로\]/g, '<br><div class="trace-block"><span class="tag-reason">[논리 경로]</span>');
        htmlText = htmlText.replace(/\[보안 검증\]/g, '</div><div class="trace-block"><span class="tag-sec">[보안 검증]</span>');
        htmlText = htmlText.replace(/\[활인적 인사이트\]/g, '</div><div class="trace-block"><span class="tag-hw">[활인적 인사이트]</span>');
        
        // 치환된 횟수를 바탕으로 </div> 닫기를 조정해야 하지만
        // 단순화를 위해 뒷부분 텍스트가 모두 블록 안으로 들어가게 둠 (사이버펑크 감성)
        return htmlText;
    }

    function typeWriterEffect(element, htmlContent, speed=10) {
        // HTML이 포함되어 있으면 한 자씩 출력하기 어려우므로, 
        // 페이드인 애니메이션을 CSS로 대체하고 여기서는 즉시 삽입 후 스크롤만 진행
        element.innerHTML = htmlContent;
        chatViewport.scrollTop = chatViewport.scrollHeight;
    }

    async function sendQuery() {
        const query = promptInput.value.trim();
        if (!query && !pendingImageBase64) return;

        let sentMsg = query;
        if (pendingImageBase64 && !query) sentMsg = "[IMG_ATTACHMENT_ONLY]";
        appendMessage('master', sentMsg + (pendingImageBase64 ? " 📎" : ""));
        
        promptInput.value = '';
        addLog(`Transmitting payload [len:${query.length}]...`, 'info');

        const payload = { 
            query: query, 
            thread_id: threadId,
            tts_enabled: window.ttsEnabledFlag === true 
        };
        window.ttsEnabledFlag = false;

        if (pendingImageBase64) {
            payload.image_base64 = pendingImageBase64;
            // Clear pending image
            pendingImageBase64 = null;
            imagePreviewContainer.style.display = 'none';
            imageUploadInput.value = '';
        }

        // Loading state
        const loadDiv = document.createElement('div');
        loadDiv.className = 'cyber-msg system';
        loadDiv.innerHTML = '<div class="msg-body">AWAITING_RESPONSE<span class="status-pulse" style="display:inline-block; margin-left:10px;"></span></div>';
        chatViewport.appendChild(loadDiv);
        chatViewport.scrollTop = chatViewport.scrollHeight;

        try {
            const res = await fetch('/v1/sentinel/ask', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            const data = await res.json();
            
            // Remove load target
            chatViewport.removeChild(loadDiv);

            addLog(`Received packet [score:${data.security_risk_score || data.risk_score}]`, 'info');
            
            if (data.audio_base64) {
                try {
                    const audio = new Audio("data:audio/mp3;base64," + data.audio_base64);
                    audio.play();
                    addLog("TTS 스피커 가동 중...", "info");
                } catch(e) {
                    addLog("TTS 재생 실패", "error");
                }
            }

            // Unit D Update
            const score = data.security_risk_score || 0;
            riskScoreEl.textContent = score.toFixed(2);
            riskProgressEl.style.width = Math.min((score/10)*100, 100) + '%';
            
            if (data.is_blocked || score > 0.5) {
                unitDPanel.classList.add('danger');
                shieldStatusEl.className = 'shield-text blocked';
                shieldStatusEl.textContent = 'WARNING: SECURITY BREACH DETECTED';
                addLog('Unit D intercepted malicious payload', 'error');
            } else {
                unitDPanel.classList.remove('danger');
                shieldStatusEl.className = 'shield-text safe';
                shieldStatusEl.textContent = 'SAFE: NORMAL OPERATIONS';
            }

            // Msg Render
            if (data.is_blocked) {
                appendMessage('system', data.message, false, true);
            } else {
                const parsedHtml = processTraceBlocks(data.message);
                
                const msgDiv = document.createElement('div');
                msgDiv.className = `cyber-msg system`;
                const header = document.createElement('div');
                header.className = 'msg-header'; header.textContent = 'CORE_SENTINEL';
                const body = document.createElement('div');
                body.className = 'msg-body';
                msgDiv.appendChild(header); msgDiv.appendChild(body);
                chatViewport.appendChild(msgDiv);
                
                typeWriterEffect(body, parsedHtml);
            }

        } catch (e) {
            chatViewport.removeChild(loadDiv);
            addLog(`Connection Error: ${e.message}`, 'error');
            appendMessage('system', `CRITICAL ERROR: Connection refused by Core.`, false, true);
        }
    }

    sendBtn.addEventListener('click', sendQuery);
    promptInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') sendQuery();
    });
    
    clearBtn.addEventListener('click', () => {
        chatViewport.innerHTML = '';
        addLog('Terminal buffer cleared.', 'info');
    });

    // Boot sequence
    setTimeout(() => addLog('Establishing secure channel...', 'info'), 500);
    setTimeout(() => addLog('Handshake complete.', 'info'), 1200);
});
