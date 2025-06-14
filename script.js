// 雷达图数据
const radarData = {
    1: [4, 5, 3, 4, 3], // 元宇宙办公新趋势
    2: [5, 4, 4, 5, 4], // AI教育个性化
    3: [3, 5, 3, 3, 2], // 绿色能源突破
    4: [3, 3, 3, 3, 3]  // 用户自定义（初始值）
};

// 绘制雷达图
function drawRadarChart(canvas, data) {
    const ctx = canvas.getContext('2d');
    const centerX = canvas.width / 2;
    const centerY = canvas.height / 2;
    const radius = Math.min(centerX, centerY) - 10;
    
    // 清除画布
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    
    // 绘制背景网格
    ctx.strokeStyle = '#e0e0e0';
    ctx.lineWidth = 0.5;
    
    // 绘制同心圆
    for (let i = 1; i <= 5; i++) {
        const r = (radius * i) / 5;
        ctx.beginPath();
        for (let j = 0; j < 5; j++) {
            const angle = (Math.PI * 2 * j) / 5 - Math.PI / 2;
            const x = centerX + r * Math.cos(angle);
            const y = centerY + r * Math.sin(angle);
            if (j === 0) {
                ctx.moveTo(x, y);
            } else {
                ctx.lineTo(x, y);
            }
        }
        ctx.closePath();
        ctx.stroke();
    }
    
    // 绘制从中心到顶点的线
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        ctx.beginPath();
        ctx.moveTo(centerX, centerY);
        ctx.lineTo(
            centerX + radius * Math.cos(angle),
            centerY + radius * Math.sin(angle)
        );
        ctx.stroke();
    }
    
    // 绘制数据
    ctx.beginPath();
    ctx.strokeStyle = '#4CAF50';
    ctx.fillStyle = 'rgba(76, 175, 80, 0.2)';
    ctx.lineWidth = 2;
    
    for (let i = 0; i < 5; i++) {
        const angle = (Math.PI * 2 * i) / 5 - Math.PI / 2;
        const value = data[i] / 5; // 将1-5的值转换为0-1
        const r = radius * value;
        const x = centerX + r * Math.cos(angle);
        const y = centerY + r * Math.sin(angle);
        
        if (i === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    }
    
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// 初始化雷达图
function initRadarCharts() {
    // 直接使用 canvas ID 初始化
    for (let i = 1; i <= 4; i++) {
        const canvas = document.getElementById(`canvas${i}`);
        if (canvas && radarData[i]) {
            drawRadarChart(canvas, radarData[i]);
        }
    }
}

// 初始化雷达图拖拽交互
function initRadarDrag() {
    const canvas = document.getElementById('canvas4');
    if (!canvas) return;

    let isDragging = false;
    let currentPoint = null;

    // 计算点到中心的距离和角度
    function getPointInfo(x, y) {
        const rect = canvas.getBoundingClientRect();
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        const dx = x - rect.left - centerX;
        const dy = y - rect.top - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        return { distance, angle };
    }

    // 获取最近的维度索引
    function getNearestDimension(angle) {
        const baseAngle = -Math.PI / 2; // 顶部维度（时效性）的角度
        const angleDiff = (angle - baseAngle + Math.PI * 2) % (Math.PI * 2);
        return Math.round(angleDiff / (Math.PI * 2 / 5)) % 5;
    }

    // 更新数值显示
    function updateValueDisplay() {
        const dimensions = ['timeliness', 'importance', 'significance', 'interest', 'relevance'];
        dimensions.forEach((dim, index) => {
            const valueElement = document.getElementById(`${dim}Value`);
            if (valueElement) {
                valueElement.textContent = radarData[4][index];
            }
        });
    }

    // 鼠标按下事件
    canvas.addEventListener('mousedown', (e) => {
        const { distance, angle } = getPointInfo(e.clientX, e.clientY);
        const radius = canvas.width / 2 - 10;
        if (distance <= radius) {
            isDragging = true;
            currentPoint = getNearestDimension(angle);
        }
    });

    // 鼠标移动事件
    canvas.addEventListener('mousemove', (e) => {
        if (!isDragging || currentPoint === null) return;

        const { distance, angle } = getPointInfo(e.clientX, e.clientY);
        const radius = canvas.width / 2 - 10;
        const value = Math.min(5, Math.max(1, Math.round((distance / radius) * 5)));
        
        radarData[4][currentPoint] = value;
        drawRadarChart(canvas, radarData[4]);
        updateValueDisplay();
    });

    // 鼠标松开事件
    canvas.addEventListener('mouseup', () => {
        isDragging = false;
        currentPoint = null;
    });

    // 鼠标离开事件
    canvas.addEventListener('mouseleave', () => {
        isDragging = false;
        currentPoint = null;
    });
}

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 初始化雷达图
    initRadarCharts();
    
    // 初始化雷达图拖拽交互
    initRadarDrag();
    
    // 添加卡片按钮点击事件
    const addCardBtn = document.querySelector('.add-card');
    if (addCardBtn) {
        addCardBtn.addEventListener('click', () => {
            // 这里可以添加新卡片的逻辑
            console.log('Add new card');
        });
    }
    
    // 保存创作按钮点击事件
    const saveBtn = document.querySelector('.save-btn');
    if (saveBtn) {
        saveBtn.addEventListener('click', () => {
            // 这里可以添加保存创作的逻辑
            console.log('Save creation');
        });
    }
});

// 评分数据
const ratingData = {
    1: [4, 5, 3, 4, 3], // 元宇宙办公新趋势
    2: [5, 4, 4, 5, 4], // AI教育个性化
    3: [3, 5, 3, 3, 2], // 绿色能源突破
    4: [3, 3, 3, 3, 3]  // 用户自定义（初始值）
};

// 初始化页面
document.addEventListener('DOMContentLoaded', function() {
    // 初始化第四个卡片的交互
    initializeAddCard();
    
    // 初始化评分滑块
    initializeRatingSliders();
    
    // 初始化灵感来源功能
    initializeSourcesInput();
});

// 初始化第四个卡片的交互
function initializeAddCard() {
    const addCard = document.getElementById('addCard');
    const addCardContent = document.getElementById('addCardContent');
    const expandedContent = document.getElementById('expandedContent');
    const startCreateBtn = document.getElementById('startCreateBtn');
    const saveBtn = document.getElementById('saveBtn');
    const cancelBtn = document.getElementById('cancelBtn');
    const titleInput = document.getElementById('titleInput');
    
    // 开始创作按钮点击事件
    startCreateBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        expandCard();
    });
    
    // 标题输入监听
    titleInput.addEventListener('input', function() {
        saveBtn.disabled = !this.value.trim();
    });
    
    // 保存按钮点击事件
    saveBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        saveCreation();
    });
    
    // 取消按钮点击事件
    cancelBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        collapseCard();
    });
    
    // 展开卡片
    function expandCard() {
        addCard.classList.add('expanded');
        addCardContent.style.display = 'none';
        expandedContent.style.display = 'block';
        saveBtn.disabled = true; // 重置按钮状态
    }
    
    // 收起卡片
    function collapseCard() {
        addCard.classList.remove('expanded');
        addCardContent.style.display = 'flex';
        expandedContent.style.display = 'none';
        
        // 重置表单
        resetForm();
    }
    
    // 重置表单
    function resetForm() {
        titleInput.value = '';
        document.getElementById('descriptionInput').value = '';
        saveBtn.disabled = true;
        
        // 重置评分
        radarData[4] = [3, 3, 3, 3, 3];
        const canvas = document.getElementById('canvas4');
        if (canvas) {
            drawRadarChart(canvas, radarData[4]);
        }
        updateValueDisplay();
    }
    
    // 保存创作
    function saveCreation() {
        const title = titleInput.value.trim();
        const description = document.getElementById('descriptionInput').value.trim();
        
        if (!title || !description) {
            alert('请填写完整的标题和描述');
            return;
        }
        
        // 将创作主题存储在localStorage中
        localStorage.setItem('creativeAngle', title);

        // 跳转到新的创作页面
        window.location.href = 'create.html';
    }
}

// 初始化评分滑块
function initializeRatingSliders() {
    const sliders = document.querySelectorAll('.rating-slider');
    
    sliders.forEach(slider => {
        // 滑块值变化事件
        slider.addEventListener('input', function() {
            const value = parseInt(this.value);
            const valueSpan = this.parentNode.querySelector('.rating-value');
            valueSpan.textContent = value;
            
            // 更新雷达图数据
            const dimension = this.dataset.dimension;
            const dimensions = ['timeliness', 'importance', 'significance', 'interest', 'relevance'];
            const index = dimensions.indexOf(dimension);
            
            if (index !== -1) {
                radarData[4][index] = value;
                const canvas = document.getElementById('canvas4');
                if (canvas) {
                    drawRadarChart(canvas, radarData[4]);
                }
            }
        });
    });
}

// 更新评分条
function updateRatingBar(slider) {
    const value = slider.value;
    const progressFill = slider.parentNode.querySelector('.rating-progress-fill');
    progressFill.style.width = `${value * 20}%`;
}

// 初始化灵感来源输入功能
function initializeSourcesInput() {
    const sourceInput = document.getElementById('sourceInput');
    const addSourceBtn = document.getElementById('addSourceBtn');
    const sourcesList = document.getElementById('sourcesList');
    
    // 添加来源按钮点击事件
    addSourceBtn.addEventListener('click', function() {
        addSource();
    });
    
    // 输入框回车事件
    sourceInput.addEventListener('keypress', function(e) {
        if (e.key === 'Enter') {
            addSource();
        }
    });
    
    // 添加来源
    function addSource() {
        const sourceText = sourceInput.value.trim();
        if (!sourceText) return;
        
        const li = document.createElement('li');
        li.textContent = sourceText;
        
        // 添加删除按钮
        const deleteBtn = document.createElement('span');
        deleteBtn.textContent = ' ×';
        deleteBtn.style.cursor = 'pointer';
        deleteBtn.style.marginLeft = '10px';
        deleteBtn.style.color = 'rgba(255, 255, 255, 0.6)';
        deleteBtn.style.fontWeight = 'bold';
        
        deleteBtn.addEventListener('click', function() {
            li.remove();
        });
        
        li.appendChild(deleteBtn);
        sourcesList.appendChild(li);
        
        // 清空输入框
        sourceInput.value = '';
    }
}

// 卡片点击效果
document.addEventListener('DOMContentLoaded', function() {
    const cards = document.querySelectorAll('.card:not(.add-card)');
    
    cards.forEach(card => {
        card.addEventListener('click', function() {
            // 添加点击效果
            this.style.transform = 'scale(0.98)';
            setTimeout(() => {
                this.style.transform = '';
            }, 150);
        });
    });
});

// 键盘快捷键
document.addEventListener('keydown', function(e) {
    // ESC键收起展开的卡片
    if (e.key === 'Escape') {
        const addCard = document.getElementById('addCard');
        if (addCard.classList.contains('expanded')) {
            document.getElementById('cancelBtn').click();
        }
    }
    
    // Ctrl+S 保存创作
    if (e.ctrlKey && e.key === 's') {
        e.preventDefault();
        const addCard = document.getElementById('addCard');
        if (addCard.classList.contains('expanded')) {
            document.getElementById('saveBtn').click();
        }
    }
});

// 处理大纲优化选项
function handleOutlineOptimization() {
    const optimizationOptions = [
        {
            id: 'A',
            text: '结构还不够有节奏感，三部分像是"并列事件"，没有明显的情绪或逻辑推进'
        },
        {
            id: 'B',
            text: '问题设置不够锋利，没有提出能刺中时代或读者痛点的"尖锐问题"'
        },
        {
            id: 'C',
            text: '每部分缺少"关键细节"，像是没有人物、数据或具体事例来撑起观点'
        },
        {
            id: 'D',
            text: '概念和说法有点空，比如"情绪故事""估值逻辑"说了但没解释是什么'
        },
        {
            id: 'E',
            text: '没问题！我觉得这大纲已经很清晰，只是还没开始写细节而已'
        },
        {
            id: 'F',
            text: '不如自己填一下？'
        }
    ];

    // 创建选项容器
    const optionsContainer = document.createElement('div');
    optionsContainer.className = 'optimization-options';
    
    // 创建标题
    const title = document.createElement('h4');
    title.textContent = '你觉得这个大纲最需要优化的地方是？可多选哦';
    title.className = 'optimization-title';
    optionsContainer.appendChild(title);

    // 创建选项列表
    const optionsList = document.createElement('div');
    optionsList.className = 'options-list';

    // 添加选项
    optimizationOptions.forEach(option => {
        const optionDiv = document.createElement('div');
        optionDiv.className = 'optimization-option';
        
        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = `option-${option.id}`;
        checkbox.value = option.id;
        
        const label = document.createElement('label');
        label.htmlFor = `option-${option.id}`;
        label.textContent = option.text;
        
        optionDiv.appendChild(checkbox);
        optionDiv.appendChild(label);
        optionsList.appendChild(optionDiv);
    });

    optionsContainer.appendChild(optionsList);

    // 添加自定义输入框（当选择F选项时显示）
    const customInputContainer = document.createElement('div');
    customInputContainer.className = 'custom-input-container';
    customInputContainer.style.display = 'none';
    
    const customInput = document.createElement('input');
    customInput.type = 'text';
    customInput.className = 'custom-optimization-input';
    customInput.placeholder = '请输入你的想法...';
    
    customInputContainer.appendChild(customInput);
    optionsContainer.appendChild(customInputContainer);

    // 添加确认按钮
    const confirmButton = document.createElement('button');
    confirmButton.className = 'confirm-optimization-btn';
    confirmButton.textContent = '确认';
    optionsContainer.appendChild(confirmButton);

    // 添加到聊天区域
    const chatMessages = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = 'chat-bubble bot-message';
    messageDiv.appendChild(optionsContainer);
    chatMessages.appendChild(messageDiv);

    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;

    // 监听F选项的选中状态
    const optionF = document.getElementById('option-F');
    optionF.addEventListener('change', function() {
        customInputContainer.style.display = this.checked ? 'block' : 'none';
    });

    // 监听确认按钮点击
    confirmButton.addEventListener('click', function() {
        const selectedOptions = Array.from(document.querySelectorAll('.optimization-option input:checked'))
            .map(input => {
                if (input.value === 'F') {
                    return customInput.value.trim() || '用户未输入具体想法';
                }
                return input.nextElementSibling.textContent;
            });

        if (selectedOptions.length === 0) {
            alert('请至少选择一个选项');
            return;
        }

        // 创建用户回复消息
        const userMessageDiv = document.createElement('div');
        userMessageDiv.className = 'chat-bubble user-message';
        const userMessageContent = document.createElement('p');
        userMessageContent.textContent = selectedOptions.join('\n');
        userMessageDiv.appendChild(userMessageContent);
        chatMessages.appendChild(userMessageDiv);

        // 移除选项容器
        messageDiv.remove();

        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;

        // 这里可以添加后续的处理逻辑
        // 比如根据用户的选择生成相应的优化建议
    });
}

// 监听"好的，我想打磨"按钮点击
document.addEventListener('DOMContentLoaded', function() {
    const polishButton = document.querySelector('.polish-button'); // 需要确保HTML中有这个按钮
    if (polishButton) {
        polishButton.addEventListener('click', handleOutlineOptimization);
    }
});

