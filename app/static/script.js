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
    document.body.appendChild(clone);

    // Fade out landing and show chat
    landing.classList.add('hidden');
    firstName.style.opacity = '0';
    wrapper.classList.remove('blurred');

    // Animate move to top right
    clone.animate([
        { top: startRect.top + 'px', left: startRect.left + 'px', fontSize: '2.5rem' },
        { top: endRect.top + 'px', left: endRect.left + 'px', fontSize: '1.2rem' }
    ], {
        duration: 900,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        fill: 'forwards'
    }).onfinish = () => {
        headerTarget.style.opacity = '1';
        clone.remove();
        userInput.focus();
    };
});

// 2. Typewriter Effect (Fixed Wrapping)
async function typeWriter(element, text, speed = 10) {
    element.innerHTML = '';
    let i = 0;

    function type() {
        if (i < text.length) {
            const char = text.charAt(i);
            const span = document.createElement('span');
            span.classList.add('typing-char');
            span.innerText = char;
            element.appendChild(span);
            i++;
            chatbox.scrollTop = chatbox.scrollHeight;
            setTimeout(type, speed);
        } else {
            isThinking = false;
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