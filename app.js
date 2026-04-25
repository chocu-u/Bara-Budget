document.addEventListener('DOMContentLoaded', () => {
    // Elements
    const sendBtn = document.getElementById('send-btn');
    const chatMessages = document.getElementById('chat-messages');
    
    // Inputs
    const apiKeyInput = document.getElementById('api-key');
    const itemNameInput = document.getElementById('item-name');
    const itemCostInput = document.getElementById('item-cost');
    const budgetInput = document.getElementById('weekly-budget');
    const modeSelect = document.getElementById('roast-mode');

    // Values for calculation
    const goods = [
        { name: 'Jeepney Rides', cost: 15, icon: '🚙' },
        { name: 'Silog Meals', cost: 100, icon: '🍳' },
        { name: 'Milkteas', cost: 150, icon: '🧋' }
    ];

    function scrollToBottom() {
        chatMessages.scrollTop = chatMessages.scrollHeight;
    }

    function appendUserMessage(itemName, itemCost) {
        const text = `I want to buy ${itemName} for ${itemCost} PHP.`;
        const html = `
            <div class="message-wrapper sent">
                <div class="message-bubble text-only">
                    ${text}
                </div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', html);
        scrollToBottom();
    }

    function appendTypingIndicator() {
        const id = 'typing-' + Date.now();
        const html = `
            <div class="message-wrapper received" id="${id}">
                <div class="message-bubble text-only typing-indicator">
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                    <div class="typing-dot"></div>
                </div>
            </div>
        `;
        chatMessages.insertAdjacentHTML('beforeend', html);
        scrollToBottom();
        return id;
    }

    function removeTypingIndicator(id) {
        const el = document.getElementById(id);
        if (el) {
            el.remove();
        }
    }

    function appendAIMessage(roastText, itemCost, budget) {
        // Calculate Gauge
        const ratio = itemCost / budget;
        const percentage = Math.min(ratio * 100, 100);
        let statusText = "Sana All";
        let statusColor = "#34c759";
        
        if (percentage >= 20 && percentage < 50) {
            statusText = "Delikado";
            statusColor = "#ffcc00";
        } else if (percentage >= 50 && percentage < 90) {
            statusText = "GCash Zero";
            statusColor = "#ff9500";
        } else if (percentage >= 90) {
            statusText = "Mangungutang na";
            statusColor = "#ff3b30";
        }

        // Calculate Sacrifice items HTML
        let sacrificeHtml = '';
        goods.forEach(good => {
            const count = (itemCost / good.cost).toFixed(1);
            const visualPercentage = Math.min((count / 20) * 100, 100);
            
            sacrificeHtml += `
                <div class="sacrifice-item">
                    <div class="sac-icon">${good.icon}</div>
                    <div class="sac-details">
                        <div class="sac-row">
                            <span>${good.name}</span>
                            <span style="color: #8e8e93">${count}x</span>
                        </div>
                        <div class="sac-bar-container">
                            <div class="sac-bar" style="width: 0%" data-target="${visualPercentage}%"></div>
                        </div>
                    </div>
                </div>
            `;
        });

        // Bubble ID to animate bars after insertion
        const bubbleId = 'bubble-' + Date.now();

        const html = `
            <div class="message-wrapper received" id="${bubbleId}">
                <div class="message-bubble">
                    <p>${roastText.replace(/\n/g, '<br>')}</p>
                    
                    <div class="bubble-widget">
                        <div class="widget-title">Brokenness-O-Meter</div>
                        <div class="gauge-container">
                            <div class="gauge-fill" style="width: 0%" data-target="${percentage}%"></div>
                        </div>
                        <div class="gauge-status" style="color: ${statusColor}">${statusText}</div>
                    </div>

                    <div class="bubble-widget">
                        <div class="widget-title">Sacrifice Chart</div>
                        <div class="sacrifice-items">
                            ${sacrificeHtml}
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        chatMessages.insertAdjacentHTML('beforeend', html);
        scrollToBottom();

        // Trigger animations
        setTimeout(() => {
            const container = document.getElementById(bubbleId);
            if(container) {
                const gaugeFill = container.querySelector('.gauge-fill');
                if(gaugeFill) gaugeFill.style.width = gaugeFill.getAttribute('data-target');
                
                const sacBars = container.querySelectorAll('.sac-bar');
                sacBars.forEach(bar => {
                    bar.style.width = bar.getAttribute('data-target');
                });
            }
        }, 50);
    }

    async function handleSend() {
        const apiKey = apiKeyInput.value.trim();
        const itemName = itemNameInput.value.trim();
        const itemCost = parseFloat(itemCostInput.value);
        const budget = parseFloat(budgetInput.value);
        const mode = modeSelect.value;

        if (!apiKey) {
            alert("Please enter your Gemini API Key in the header.");
            return;
        }

        if (!itemName || isNaN(itemCost) || itemCost <= 0) {
            alert("Please enter a valid item name and cost.");
            return;
        }

        if (isNaN(budget) || budget <= 0) {
            alert("Please set a valid weekly budget in the header.");
            return;
        }

        // 1. Show user message
        appendUserMessage(itemName, itemCost);

        // 2. Clear inputs
        itemNameInput.value = '';
        itemCostInput.value = '';

        // 3. Show typing indicator
        const typingId = appendTypingIndicator();

        try {
            // 4. Fetch roast
            const roastMessage = await window.GeminiAPI.getRoast(apiKey, budget, itemName, itemCost, mode);
            
            // 5. Remove typing
            removeTypingIndicator(typingId);

            // 6. Append AI response with widgets
            appendAIMessage(roastMessage, itemCost, budget);

        } catch (error) {
            removeTypingIndicator(typingId);
            
            const errorHtml = `
                <div class="message-wrapper received">
                    <div class="message-bubble text-only" style="color: red;">
                        Error: ${error.message}
                    </div>
                </div>
            `;
            chatMessages.insertAdjacentHTML('beforeend', errorHtml);
            scrollToBottom();
        }
    }

    sendBtn.addEventListener('click', handleSend);
    itemCostInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleSend();
    });
    itemNameInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') itemCostInput.focus();
    });
});
