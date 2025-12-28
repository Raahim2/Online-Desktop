<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Image Explorer</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <style>
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
        
        * {
            font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'SF Pro Text', 'Inter', sans-serif;
            -webkit-font-smoothing: antialiased;
            -moz-osx-font-smoothing: grayscale;
            letter-spacing: -0.01em;
        }

        body {
            background: #0a0a0a;
            background-image: 
                radial-gradient(at 20% 30%, rgba(120, 119, 198, 0.12) 0px, transparent 50%),
                radial-gradient(at 80% 70%, rgba(74, 222, 128, 0.08) 0px, transparent 50%),
                radial-gradient(at 50% 50%, rgba(167, 139, 250, 0.08) 0px, transparent 50%);
            background-attachment: fixed;
        }

        .window {
            background: rgba(30, 30, 30, 0.7);
            backdrop-filter: blur(80px) saturate(180%);
            -webkit-backdrop-filter: blur(80px) saturate(180%);
            border: 0.5px solid rgba(255, 255, 255, 0.12);
            box-shadow: 
                0 25px 50px -12px rgba(0, 0, 0, 0.5),
                0 0 0 1px rgba(255, 255, 255, 0.05) inset;
        }

        .titlebar {
            background: rgba(40, 40, 40, 0.5);
            backdrop-filter: blur(40px);
            border-bottom: 0.5px solid rgba(255, 255, 255, 0.08);
        }

        .traffic-lights {
            display: flex;
            gap: 8px;
            padding: 12px;
        }

        .traffic-light {
            width: 12px;
            height: 12px;
            border-radius: 50%;
            transition: all 0.2s ease;
        }

        .traffic-light.close { background: #ff5f57; }
        .traffic-light.minimize { background: #febc2e; }
        .traffic-light.maximize { background: #28c840; }

        .sidebar {
            background: rgba(20, 20, 20, 0.6);
            backdrop-filter: blur(40px);
            border-right: 0.5px solid rgba(255, 255, 255, 0.08);
        }

        .chat-container {
            background: rgba(18, 18, 18, 0.4);
        }

        .message {
            animation: messageSlide 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        @keyframes messageSlide {
            from {
                opacity: 0;
                transform: translateY(20px) scale(0.95);
            }
            to {
                opacity: 1;
                transform: translateY(0) scale(1);
            }
        }

        .user-message {
            background: linear-gradient(135deg, rgba(99, 102, 241, 0.85) 0%, rgba(139, 92, 246, 0.85) 100%);
            backdrop-filter: blur(20px);
            box-shadow: 
                0 8px 32px rgba(99, 102, 241, 0.25),
                0 0 0 0.5px rgba(255, 255, 255, 0.2) inset;
        }

        .ai-message {
            background: rgba(255, 255, 255, 0.07);
            backdrop-filter: blur(30px);
            border: 0.5px solid rgba(255, 255, 255, 0.12);
            box-shadow: 
                0 4px 24px rgba(0, 0, 0, 0.2),
                0 0 0 0.5px rgba(255, 255, 255, 0.05) inset;
        }

        .input-field {
            background: rgba(255, 255, 255, 0.06);
            backdrop-filter: blur(30px);
            border: 0.5px solid rgba(255, 255, 255, 0.12);
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
            box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.05) inset;
        }

        .input-field:focus {
            background: rgba(255, 255, 255, 0.08);
            border-color: rgba(99, 102, 241, 0.5);
            box-shadow: 
                0 0 0 3px rgba(99, 102, 241, 0.12),
                0 0 0 0.5px rgba(255, 255, 255, 0.08) inset;
        }

        .send-button {
            background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);
            box-shadow: 
                0 4px 24px rgba(99, 102, 241, 0.35),
                0 0 0 0.5px rgba(255, 255, 255, 0.2) inset;
            transition: all 0.3s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .send-button:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 
                0 8px 32px rgba(99, 102, 241, 0.45),
                0 0 0 0.5px rgba(255, 255, 255, 0.3) inset;
        }

        .send-button:active:not(:disabled) {
            transform: scale(0.97);
        }

        .image-drop-zone {
            background: rgba(255, 255, 255, 0.02);
            border: 1.5px dashed rgba(255, 255, 255, 0.15);
            transition: all 0.4s cubic-bezier(0.16, 1, 0.3, 1);
        }

        .image-drop-zone:hover {
            background: rgba(255, 255, 255, 0.04);
            border-color: rgba(99, 102, 241, 0.4);
            transform: scale(1.02);
        }

        .image-drop-zone.dragover {
            background: rgba(99, 102, 241, 0.08);
            border-color: rgba(99, 102, 241, 0.7);
            border-style: solid;
            transform: scale(1.02);
        }

        .image-preview-container {
            background: rgba(0, 0, 0, 0.4);
            border: 0.5px solid rgba(255, 255, 255, 0.1);
            box-shadow: 0 0 0 0.5px rgba(255, 255, 255, 0.05) inset;
        }

        .image-preview-container img {
            transition: all 0.5s cubic-bezier(0.16, 1, 0.3, 1);
        }

        ::-webkit-scrollbar {
            width: 10px;
        }

        ::-webkit-scrollbar-track {
            background: transparent;
        }

        ::-webkit-scrollbar-thumb {
            background: rgba(255, 255, 255, 0.15);
            border-radius: 10px;
            border: 2px solid transparent;
            background-clip: padding-box;
        }

        ::-webkit-scrollbar-thumb:hover {
            background: rgba(255, 255, 255, 0.25);
            background-clip: padding-box;
        }

        .empty-state {
            opacity: 0.4;
            transition: opacity 0.3s ease;
        }

        .toolbar-button {
            background: rgba(255, 255, 255, 0.05);
            border: 0.5px solid rgba(255, 255, 255, 0.1);
            transition: all 0.2s ease;
        }

        .toolbar-button:hover {
            background: rgba(255, 255, 255, 0.08);
            transform: translateY(-1px);
        }

        .toolbar-button:active {
            transform: scale(0.95);
        }
    </style>
</head>
<body class="min-h-screen text-white overflow-hidden">
    <script type="module">
        import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
        import { getAuth, signInAnonymously, signInWithCustomToken, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
        import { getFirestore, setLogLevel } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

        const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';
        const firebaseConfig = typeof __firebase_config !== 'undefined' ? JSON.parse(__firebase_config) : {};
        const initialAuthToken = typeof __initial_auth_token !== 'undefined' ? __initial_auth_token : null;

        try {
            const app = initializeApp(firebaseConfig);
            const db = getFirestore(app);
            const auth = getAuth(app);
            setLogLevel('debug');
            window.firebaseAuth = auth;

            onAuthStateChanged(auth, async (user) => {
                if (!user) {
                    if (initialAuthToken) {
                        await signInWithCustomToken(auth, initialAuthToken);
                    } else {
                        await signInAnonymously(auth);
                    }
                }
            });
        } catch (error) {
            console.error("Firebase Error:", error);
        }
    </script>

    <div class="h-screen p-8 flex items-center justify-center">
        <div class="window rounded-2xl w-full max-w-7xl h-[90vh] flex flex-col overflow-hidden">
            <div class="titlebar flex items-center justify-between">
                <div class="traffic-lights">
                    <div class="traffic-light close"></div>
                    <div class="traffic-light minimize"></div>
                    <div class="traffic-light maximize"></div>
                </div>
                <div class="flex-1 text-center">
                    <span class="text-xs font-medium text-gray-400">Image Explorer</span>
                </div>
                <div class="w-[68px]"></div>
            </div>

            <div class="flex-1 flex overflow-hidden">
                <div class="sidebar w-80 flex flex-col p-6">
                    <div class="mb-6">
                        <h2 class="text-sm font-semibold text-gray-400 uppercase tracking-wide mb-4">Image</h2>
                        
                        <input type="file" id="image-upload" accept="image/*" class="hidden" onchange="handleImageUpload(event)">
                        <div id="drop-zone" class="image-drop-zone rounded-xl p-6 text-center cursor-pointer mb-4" onclick="document.getElementById('image-upload').click()">
                            <svg class="w-12 h-12 mx-auto mb-3 opacity-40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"/>
                            </svg>
                            <p class="text-xs font-medium text-gray-300 mb-1">Drop image here</p>
                            <p class="text-xs text-gray-500">or click to upload</p>
                        </div>

                        <div id="preview-container" class="image-preview-container rounded-xl aspect-square flex items-center justify-center overflow-hidden">
                            <div id="empty-state" class="empty-state text-center p-6">
                                <svg class="w-16 h-16 mx-auto mb-3 opacity-20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"/>
                                </svg>
                                <p class="text-xs text-gray-500">No image</p>
                            </div>
                            <img id="image-preview" src="" alt="Preview" class="hidden w-full h-full object-cover">
                        </div>
                    </div>

                    <div class="mt-auto space-y-2">
                        <button id="clear-btn" onclick="clearChat()" class="toolbar-button w-full px-4 py-2.5 rounded-lg text-xs font-medium text-gray-300 flex items-center justify-center" disabled>
                            <svg class="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"/>
                            </svg>
                            Clear Conversation
                        </button>
                    </div>
                </div>

                <div class="flex-1 flex flex-col">
                    <div id="chat-messages" class="chat-container flex-1 overflow-y-auto p-8">
                        <div class="max-w-3xl mx-auto space-y-6">
                            <div class="message flex justify-start">
                                <div class="ai-message rounded-3xl rounded-tl-lg px-6 py-4 max-w-xl">
                                    <p class="text-sm leading-relaxed text-gray-100">
                                        Welcome! Upload an image using the sidebar, and I'll help you explore and understand what's in it.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="p-6 border-t border-white/5">
                        <div class="max-w-3xl mx-auto">
                            <div class="flex items-end gap-3">
                                <div class="flex-1">
                                    <input 
                                        type="text" 
                                        id="chat-input" 
                                        placeholder="Ask anything about the image..." 
                                        class="input-field w-full px-5 py-4 rounded-2xl text-sm outline-none text-white placeholder-gray-500"
                                        disabled
                                    >
                                </div>
                                <button 
                                    id="send-btn" 
                                    onclick="sendMessage()" 
                                    class="send-button p-4 rounded-2xl disabled:opacity-30 disabled:cursor-not-allowed"
                                    disabled
                                >
                                    <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8"/>
                                    </svg>
                                </button>
                                <div id="loading-indicator" class="hidden p-4">
                                    <svg class="animate-spin h-5 w-5 text-indigo-400" fill="none" viewBox="0 0 24 24">
                                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                    </svg>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>

    <script>
        const API_KEY = "bsdk";
        const API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-09-2025:generateContent?key=${API_KEY}`;
        const MAX_RETRIES = 5;

        let imageBase64 = null;
        let imageMimeType = null;
        let isProcessing = false;
        let chatHistory = [];

        function formatText(text) {
            if (!text) return '';
            let html = text.replace(/\*\*(.*?)\*\*/g, '<strong class="font-semibold">$1</strong>');
            html = html.replace(/\*(.*?)\*/g, '<em>$1</em>');
            html = html.replace(/\n/g, '<br>');
            return html;
        }

        function updateUI(processing) {
            isProcessing = processing;
            const input = document.getElementById('chat-input');
            const sendBtn = document.getElementById('send-btn');
            const clearBtn = document.getElementById('clear-btn');
            const loading = document.getElementById('loading-indicator');

            input.disabled = processing || !imageBase64;
            sendBtn.disabled = processing || !imageBase64;
            clearBtn.disabled = processing || !imageBase64;
            
            loading.classList.toggle('hidden', !processing);
            sendBtn.classList.toggle('hidden', processing);

            if (!processing) input.focus();
        }

        function addMessage(role, text, animate = false) {
            const container = document.getElementById('chat-messages');
            const messagesWrapper = container.querySelector('.max-w-3xl') || container;
            
            const isUser = role === 'user';
            const alignment = isUser ? 'justify-end' : 'justify-start';
            const messageClass = isUser ? 'user-message' : 'ai-message';
            const roundingClass = isUser ? 'rounded-tr-lg' : 'rounded-tl-lg';
            const content = animate ? '' : formatText(text);

            const messageId = 'msg-' + Date.now();
            const html = `
                <div class="message flex ${alignment}">
                    <div class="${messageClass} rounded-3xl ${roundingClass} px-6 py-4 max-w-xl">
                        <p id="${messageId}" class="text-sm leading-relaxed ${isUser ? 'text-white' : 'text-gray-100'}">${content}</p>
                    </div>
                </div>
            `;
            
            messagesWrapper.insertAdjacentHTML('beforeend', html);
            container.scrollTop = container.scrollHeight;

            if (animate) {
                const element = document.getElementById(messageId);
                return typeEffect(element, text);
            }
        }

        function showError(message) {
            addMessage('model', `⚠️ ${message}`);
        }

        async function callAPI(payload, retries = 0) {
            const delay = Math.pow(2, retries) * 1000 + Math.random() * 1000;

            try {
                const response = await fetch(API_URL, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(payload)
                });

                if (response.status === 429 && retries < MAX_RETRIES) {
                    await new Promise(res => setTimeout(res, delay));
                    return callAPI(payload, retries + 1);
                }

                if (!response.ok) throw new Error(`Request failed: ${response.status}`);

                const result = await response.json();
                const text = result.candidates?.[0]?.content?.parts?.[0]?.text;

                if (!text) {
                    if (result.candidates?.[0]?.finishReason === 'SAFETY') {
                        throw new Error('Response blocked by safety filters');
                    }
                    throw new Error('No response generated');
                }

                return text;
            } catch (error) {
                if (retries < MAX_RETRIES) {
                    await new Promise(res => setTimeout(res, delay));
                    return callAPI(payload, retries + 1);
                }
                throw error;
            }
        }

        async function typeEffect(element, text, speed = 15) {
            const formattedText = formatText(text);
            const tempDiv = document.createElement('div');
            tempDiv.innerHTML = formattedText;
            
            const textContent = tempDiv.textContent || tempDiv.innerText || '';
            element.textContent = '';
            
            for (let i = 0; i < textContent.length; i++) {
                element.textContent += textContent[i];
                if (i % 3 === 0) {
                    const container = document.getElementById('chat-messages');
                    container.scrollTop = container.scrollHeight;
                }
                await new Promise(resolve => setTimeout(resolve, speed));
            }
            
            element.innerHTML = formattedText;
            const container = document.getElementById('chat-messages');
            container.scrollTop = container.scrollHeight;
        }

        function fileToBase64(file) {
            return new Promise((resolve, reject) => {
                const reader = new FileReader();
                reader.onload = () => resolve(reader.result.split(',')[1]);
                reader.onerror = reject;
                reader.readAsDataURL(file);
            });
        }

        window.handleImageUpload = async function(event) {
            const file = event.target.files[0];
            if (!file || isProcessing) return;

            updateUI(true);

            try {
                imageBase64 = await fileToBase64(file);
                imageMimeType = file.type;

                // Update preview
                const reader = new FileReader();
                reader.onload = (e) => {
                    document.getElementById('image-preview').src = e.target.result;
                    document.getElementById('image-preview').classList.remove('hidden');
                    document.getElementById('empty-state').classList.add('hidden');
                };
                reader.readAsDataURL(file);

                // Clear chat
                const wrapper = document.querySelector('#chat-messages .max-w-3xl');
                wrapper.innerHTML = '';
                chatHistory = [];

                // Initial analysis
                const prompt = "What's in this image? Give me a brief, natural description.";
                
                const contents = [{
                    role: "user",
                    parts: [
                        { text: prompt },
                        { inlineData: { mimeType: imageMimeType, data: imageBase64 } }
                    ]
                }];

                const payload = {
                    contents,
                    systemInstruction: {
                        parts: [{ text: "You are a helpful, conversational AI assistant analyzing images. Be natural, concise, and friendly." }]
                    }
                };

                const response = await callAPI(payload);
                
                chatHistory = contents;
                chatHistory.push({ role: "model", parts: [{ text: response }] });
                
                await addMessage('model', response, true);

                document.getElementById('chat-input').placeholder = "Ask me anything about this image...";

            } catch (error) {
                console.error("Error:", error);
                showError(`Upload failed: ${error.message}`);
                imageBase64 = null;
            } finally {
                updateUI(false);
            }
        };

        window.sendMessage = async function() {
            const input = document.getElementById('chat-input');
            const text = input.value.trim();

            if (!text || isProcessing || !imageBase64) return;

            updateUI(true);
            input.value = '';

            try {
                const userMsg = { role: "user", parts: [{ text }] };
                chatHistory.push(userMsg);
                addMessage('user', text);

                const contents = JSON.parse(JSON.stringify(chatHistory));
                const lastMsg = contents[contents.length - 1];
                lastMsg.parts.push({
                    inlineData: { mimeType: imageMimeType, data: imageBase64 }
                });

                const payload = {
                    contents,
                    systemInstruction: {
                        parts: [{ text: "You are a helpful, conversational AI assistant analyzing images. Be natural, concise, and friendly." }]
                    }
                };

                const response = await callAPI(payload);
                chatHistory.push({ role: "model", parts: [{ text: response }] });
                
                // FIX APPLIED HERE: Added 'true' for animation and 'await'
                await addMessage('model', response, true);

            } catch (error) {
                console.error("Error:", error);
                chatHistory.pop();
                showError(`Failed to send: ${error.message}`);
            } finally {
                updateUI(false);
            }
        };

        window.clearChat = function() {
            if (isProcessing) return;
            
            const wrapper = document.querySelector('#chat-messages .max-w-3xl');
            wrapper.innerHTML = `
                <div class="message flex justify-start">
                    <div class="ai-message rounded-3xl rounded-tl-lg px-6 py-4 max-w-xl">
                        <p class="text-sm leading-relaxed text-gray-100">
                            Conversation cleared. Ask me anything about the current image!
                        </p>
                    </div>
                </div>
            `;
            
            chatHistory = [];
            document.getElementById('chat-input').value = '';
        };

        // Event listeners
        document.addEventListener('DOMContentLoaded', () => {
            const dropZone = document.getElementById('drop-zone');
            const input = document.getElementById('chat-input');

            // Drag and drop
            ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(event => {
                dropZone.addEventListener(event, e => {
                    e.preventDefault();
                    e.stopPropagation();
                });
            });

            dropZone.addEventListener('dragenter', () => dropZone.classList.add('dragover'));
            dropZone.addEventListener('dragleave', () => dropZone.classList.remove('dragover'));
            
            dropZone.addEventListener('drop', (e) => {
                dropZone.classList.remove('dragover');
                const files = e.dataTransfer.files;
                if (files.length) {
                    document.getElementById('image-upload').files = files;
                    handleImageUpload({ target: { files } });
                }
            });

            // Enter to send
            input.addEventListener('keypress', (e) => {
                if (e.key === 'Enter' && !document.getElementById('send-btn').disabled) {
                    e.preventDefault();
                    sendMessage();
                }
            });
        });
    </script>
</body>
</html>
