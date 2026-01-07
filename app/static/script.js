const chatbox = document.getElementById('chatbox');
const userInput = document.getElementById('userInput');
const sendBtn = document.getElementById('sendBtn');
const landing = document.getElementById('landing');
const firstName = document.getElementById('first-name');
const lastName = document.getElementById('last-name');
const headerTarget = document.getElementById('header-name-target');
const wrapper = document.querySelector('.chat-wrapper');

let isThinking = false;

// 1. Name Transition Animation
landing.addEventListener('click', () => {
    const startRect = firstName.getBoundingClientRect();

    // Set target and get end position
    headerTarget.innerText = "Amirali";
    headerTarget.style.opacity = '0';
    const endRect = headerTarget.getBoundingClientRect();

    // Blur out last name
    lastName.classList.add('blur-out');

    // Create moving clone for first name
    const clone = firstName.cloneNode(true);
    clone.style.position = 'fixed';
    clone.style.top = startRect.top + 'px';
    clone.style.left = startRect.left + 'px';
    clone.style.margin = '0';
    clone.style.zIndex = '1000';
    clone.style.color = '#ffffff';
    clone.style.textShadow = '0 0 10px rgba(255, 255, 255, 0.8), 0 0 20px rgba(255, 255, 255, 0.6), 0 0 30px rgba(255, 255, 255, 0.4)';
    document.body.appendChild(clone);

    // Fade out landing and show chat
    landing.classList.add('hidden');
    firstName.style.opacity = '0';
    wrapper.classList.remove('blurred');

    // Animate move to top right with smooth easing
    const animation = clone.animate([
        { 
            top: startRect.top + 'px', 
            left: startRect.left + 'px', 
            fontSize: '3rem',
            opacity: 1
        },
        { 
            top: endRect.top + 'px', 
            left: endRect.left + 'px', 
            fontSize: '1.2rem',
            opacity: 0
        }
    ], {
        duration: 850,
        easing: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
        fill: 'forwards'
    });

    // Start fading in target near the end of animation for seamless transition
    setTimeout(() => {
        headerTarget.classList.add('visible');
        headerTarget.style.opacity = '1';
    }, 700);

    // Clean up after animation completes
    animation.onfinish = () => {
        clone.remove();
        userInput.focus();
    };
});

// 2. Markdown Parser
function parseMarkdown(text) {
    // Split by lines to handle headers properly
    const lines = text.split('\n');
    const processedLines = [];
    
    for (let i = 0; i < lines.length; i++) {
        let line = lines[i];
        
        // Headers: # Header, ## Subheader, ### Sub-subheader
        if (line.match(/^###\s+(.+)$/)) {
            line = line.replace(/^###\s+(.+)$/, '<h3>$1</h3>');
            processedLines.push(line);
        } else if (line.match(/^##\s+(.+)$/)) {
            line = line.replace(/^##\s+(.+)$/, '<h2>$1</h2>');
            processedLines.push(line);
        } else if (line.match(/^#\s+(.+)$/)) {
            line = line.replace(/^#\s+(.+)$/, '<h1>$1</h1>');
            processedLines.push(line);
        } else if (line.trim() === '') {
            // Empty lines become line breaks (but skip if previous was header)
            if (i > 0 && !processedLines[processedLines.length - 1].match(/^<h[1-3]>/)) {
                processedLines.push('<br>');
            }
        } else {
            processedLines.push(line);
        }
    }
    
    let html = processedLines.join('\n');
    
    // Bold: **text** or __text__ (process bold first to avoid conflicts)
    html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/__(.+?)__/g, '<strong>$1</strong>');
    
    // Italic: *text* or _text_ (process after bold)
    // Match single asterisks/underscores that aren't part of HTML tags or double markdown
    html = html.replace(/([^*]|^)\*([^*\n<]+?)\*([^*]|$)/g, '$1<em>$2</em>$3');
    html = html.replace(/([^_]|^)_([^_\n<]+?)_([^_]|$)/g, '$1<em>$2</em>$3');
    
    // Convert remaining line breaks to <br>
    html = html.replace(/\n/g, '<br>');
    
    return html;
}

// 3. Typewriter Effect with Markdown Support
async function typeWriter(element, text, speed = 10) {
    element.innerHTML = '';
    
    // Parse markdown to HTML first
    const htmlContent = parseMarkdown(text);
    
    // Create a temporary container to work with
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;
    
    // Extract all text content with structure
    function getTextNodes(node) {
        const result = [];
        
        function traverse(n) {
            if (n.nodeType === Node.TEXT_NODE) {
                const text = n.textContent;
                for (let i = 0; i < text.length; i++) {
                    result.push({ type: 'char', char: text[i] });
                }
            } else if (n.nodeType === Node.ELEMENT_NODE) {
                result.push({ type: 'open', tag: n.tagName.toLowerCase() });
                for (let child of n.childNodes) {
                    traverse(child);
                }
                result.push({ type: 'close', tag: n.tagName.toLowerCase() });
            }
        }
        
        traverse(node);
        return result;
    }
    
    const tokens = getTextNodes(tempDiv);
    let tokenIndex = 0;
    const elementStack = [element];
    
    function type() {
        if (tokenIndex >= tokens.length) {
            isThinking = false;
            return;
        }
        
        const token = tokens[tokenIndex];
        const currentElement = elementStack[elementStack.length - 1];
        
        if (token.type === 'open') {
            const newElement = document.createElement(token.tag);
            currentElement.appendChild(newElement);
            elementStack.push(newElement);
            tokenIndex++;
            type();
        } else if (token.type === 'close') {
            elementStack.pop();
            tokenIndex++;
            type();
        } else if (token.type === 'char') {
            const span = document.createElement('span');
            span.classList.add('typing-char');
            span.textContent = token.char;
            currentElement.appendChild(span);
            tokenIndex++;
            chatbox.scrollTop = chatbox.scrollHeight;
            setTimeout(type, speed);
        }
    }
    
    type();
}

// 3. ChatGPT Style Message Rendering
function appendChatGPTMessage(sender, content) {
    const id = 'msg-' + Date.now();
    const row = document.createElement('div');
    row.classList.add('chat-row', sender);

    if (sender === 'bot') {
        row.innerHTML = `
            <div class="avatar">AI</div>
            <div class="content" id="${id}">${content}</div>
        `;
    } else {
        row.innerHTML = `<div class="content">${content}</div>`;
    }

    chatbox.appendChild(row);
    chatbox.scrollTop = chatbox.scrollHeight;
    return id;
}

// 4. Send Message Logic
async function askAI() {
    const text = userInput.value.trim();
    if (!text || isThinking) return;

    isThinking = true;
    appendChatGPTMessage('user', text);
    userInput.value = '';

    const botMsgId = appendChatGPTMessage('bot', '<div class="typing-dots"><span></span><span></span><span></span></div>');
    const botMsgElement = document.getElementById(botMsgId);

    try {
        const res = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ question: text })
        });
        const data = await res.json();
        typeWriter(botMsgElement, data.answer);
    } catch (error) {
        botMsgElement.innerText = "Error connecting to AI.";
        isThinking = false;
    }
}

sendBtn.addEventListener('click', askAI);
userInput.addEventListener('keypress', (e) => { if (e.key === 'Enter') askAI(); });