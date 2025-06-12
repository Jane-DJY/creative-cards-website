// create-script.js

document.addEventListener('DOMContentLoaded', () => {
    const userCreativeAngleSpan = document.getElementById('userCreativeAngle');
    const janeCreativeAngleSpan = document.getElementById('janeCreativeAngle');
    const chatMessages = document.getElementById('chatMessages');
    const selectedOptionsDisplay = document.getElementById('selectedOptionsDisplay');

    // 获取并显示创作角度
    const creativeAngle = localStorage.getItem('creativeAngle');
    if (userCreativeAngleSpan) {
        userCreativeAngleSpan.textContent = creativeAngle;
    }
    if (janeCreativeAngleSpan) {
        janeCreativeAngleSpan.textContent = creativeAngle;
    }

    // 用于跟踪已回答的问题
    const answeredQuestions = {
        contentType: false,
        length: false,
        audience: false,
        angle: false,
        emotion: false,
        coreQuestion: false
    };
    let confirmationMessageSent = false; // 标记确认消息是否已发送

    // 动态添加初始机器人消息
    addBotMessage('你好！我是Jane，你的创作伙伴✨');
    addBotMessage(`我看到你想探讨"${creativeAngle}"这个话题，这个角度很有意思！让我们一起深入挖掘，帮你打造一篇精彩的报道。<br><br>首先，这篇报道主要面向哪些读者呢？了解目标受众能帮助我们确定最合适的表达方式📝`);

    // 动态添加问题块
    const questionBlockHTML = `
        <p>请选择以下问题：</p>
        <div class="question-group">
            <h4>1. 你想创作什么形态的内容？</h4>
            <div class="options-container">
                <label><input type="radio" name="contentType" value="视频"> 视频</label>
                <label><input type="radio" name="contentType" value="图文"> 图文</label>
                <label><input type="radio" name="contentType" value="网页"> 网页</label>
                <label><input type="radio" name="contentType" value="PPT"> PPT</label>
                <label class="other-option">
                    <input type="radio" name="contentType" value="其他">
                    其他：<input type="text" class="other-input" data-target="contentType-other" placeholder="请填写">
                </label>
            </div>
        </div>
        <div class="question-group">
            <h4>2. 你希望长度是：</h4>
            <div class="options-container">
                <label><input type="radio" name="length" value="短"> 短</label>
                <label><input type="radio" name="length" value="中"> 中</label>
                <label><input type="radio" name="length" value="长"> 长</label>
                <label class="other-option">
                    <input type="radio" name="length" value="其他">
                    其他：<input type="text" class="other-input" data-target="length-other" placeholder="请填写">
                </label>
            </div>
        </div>
        <div class="question-group">
            <h4>3. 这个报道面向的对象是谁？</h4>
            <div class="options-container">
                <label><input type="radio" name="audience" value="投资小白"> 投资小白</label>
                <label><input type="radio" name="audience" value="90s"> 90s</label>
                <label><input type="radio" name="audience" value="泡泡玛特关注者"> 泡泡玛特关注者</label>
                <label class="other-option">
                    <input type="radio" name="audience" value="其他">
                    其他：<input type="text" class="other-input" data-target="audience-other" placeholder="请填写">
                </label>
            </div>
        </div>
        <div class="question-group">
            <h4>4. 从哪个角度切入？</h4>
            <div class="options-container">
                <label><input type="radio" name="angle" value="人物驱动"> 人物驱动</label>
                <label><input type="radio" name="angle" value="数据分析"> 数据分析</label>
                <label><input type="radio" name="angle" value="历史溯源"> 历史溯源</label>
                <label class="other-option">
                    <input type="radio" name="angle" value="其他">
                    其他：<input type="text" class="other-input" data-target="angle-other" placeholder="请填写">
                </label>
            </div>
        </div>
        <div class="question-group">
            <h4>5. 报道想传递什么情绪？</h4>
            <div class="options-container">
                <label><input type="radio" name="emotion" value="反思"> 反思</label>
                <label><input type="radio" name="emotion" value="温情"> 温情</label>
                <label><input type="radio" name="emotion" value="震撼"> 震撼</label>
                <label><input type="radio" name="emotion" value="开心"> 开心</label>
                <label><input type="radio" name="emotion" value="质疑"> 质疑</label>
                <label><input type="radio" name="emotion" value="批判"> 批判</label>
                <label class="other-option">
                    <input type="radio" name="emotion" value="其他">
                    其他：<input type="text" class="other-input" data-target="emotion-other" placeholder="请填写">
                </label>
            </div>
        </div>
        <div class="question-group">
            <h4>6. 报道核心问题？</h4>
            <div class="options-container">
                <label><input type="radio" name="coreQuestion" value="泡泡玛特现状如何？"> 泡泡玛特现状如何？</label>
                <label><input type="radio" name="coreQuestion" value="泡泡玛特面临哪些挑战？"> 泡泡玛特面临哪些挑战？</label>
                <label><input type="radio" name="coreQuestion" value="泡泡玛特的市场价值与发展潜力？"> 泡泡玛特的市场价值与发展潜力？</label>
                <label class="other-option">
                    <input type="radio" name="coreQuestion" value="其他">
                    其他：<input type="text" class="other-input" data-target="coreQuestion-other" placeholder="请填写">
                </label>
            </div>
        </div>
    `;
    addBotMessage(questionBlockHTML, true);

    // 将 radioButtons 和 otherInputs 的获取及事件绑定移到这里，确保元素已存在
    const radioButtons = document.querySelectorAll('input[type="radio"]');
    const otherInputs = document.querySelectorAll('.other-input');

    // 初始化时禁用所有"其他"输入框
    otherInputs.forEach(input => {
        input.disabled = true;
    });

    radioButtons.forEach(radio => {
        radio.addEventListener('change', (event) => {
            const questionGroup = event.target.name;
            let selectedValue = event.target.value;
            const otherInput = document.querySelector(`.other-input[data-target="${questionGroup}-other"]`);

            // 禁用并清空所有同组的"其他"输入框
            document.querySelectorAll(`input[name="${questionGroup}"]`).forEach(item => {
                if (item.value === '其他' && otherInput) {
                    otherInput.disabled = true;
                    otherInput.value = '';
                }
            });

            // 如果选择了"其他"选项，则启用对应的输入框
            if (selectedValue === '其他') {
                if (otherInput) {
                    otherInput.disabled = false;
                    otherInput.focus();
                }
                selectedValue = ''; // 初始值为空，等待用户输入
            }

            updateDocumentDisplay(questionGroup, selectedValue);
        });
    });

    // 监听"其他"输入框的输入事件
    otherInputs.forEach(input => {
        input.addEventListener('input', (event) => {
            const questionGroup = event.target.dataset.target.replace('-other', '');
            const selectedValue = event.target.value.trim();
            updateDocumentDisplay(questionGroup, selectedValue);
        });
    });

    function updateDocumentDisplay(questionGroup, selectedValue) {
        const questionMap = {
            'contentType': '1. 内容形态：',
            'length': '2. 长度：',
            'audience': '3. 面向对象：',
            'angle': '4. 切入角度：',
            'emotion': '5. 传递情绪：',
            'coreQuestion': '6. 核心问题：'
        };

        let displayHtml = `<h4>${questionMap[questionGroup]}</h4><p>${selectedValue}</p>`;
        
        // 更新已回答问题的状态
        if (selectedValue && selectedValue !== '其他') {
            answeredQuestions[questionGroup] = true;
        } else if (selectedValue === '其他' && document.querySelector(`.other-input[data-target="${questionGroup}-other"]`).value.trim() !== '') {
            answeredQuestions[questionGroup] = true;
        } else {
            answeredQuestions[questionGroup] = false;
        }

        const existingDiv = selectedOptionsDisplay.querySelector(`[data-group="${questionGroup}"]`);
        if (existingDiv) {
            existingDiv.innerHTML = displayHtml;
        } else {
            const newDiv = document.createElement('div');
            newDiv.setAttribute('data-group', questionGroup);
            newDiv.innerHTML = displayHtml;
            
            // 获取当前问题的序号
            const currentOrder = (
                questionGroup === 'contentType' ? 1 :
                questionGroup === 'length' ? 2 :
                questionGroup === 'audience' ? 3 :
                questionGroup === 'angle' ? 4 :
                questionGroup === 'emotion' ? 5 :
                questionGroup === 'coreQuestion' ? 6 : 0 // 默认为 0 以防万一
            );
            
            // 找到应该插入的位置
            const allDivs = selectedOptionsDisplay.querySelectorAll('div[data-group]');
            let insertBefore = null;
            
            for (const div of allDivs) {
                const divGroup = div.getAttribute('data-group');
                const divOrder = (
                    divGroup === 'contentType' ? 1 :
                    divGroup === 'length' ? 2 :
                    divGroup === 'audience' ? 3 :
                    divGroup === 'angle' ? 4 :
                    divGroup === 'emotion' ? 5 :
                    divGroup === 'coreQuestion' ? 6 : 0
                );
                
                if (currentOrder < divOrder) {
                    insertBefore = div;
                    break;
                }
            }
            
            if (insertBefore) {
                selectedOptionsDisplay.insertBefore(newDiv, insertBefore);
            } else {
                selectedOptionsDisplay.appendChild(newDiv);
            }
        }

        // 检查所有问题是否都已回答
        const allAnswered = Object.values(answeredQuestions).every(status => status === true);

        if (allAnswered && !confirmationMessageSent) {
            const confirmationMessageHTML = `
                <p>Hunk, 你是否还有其他问题需要补充？如果没有，我们进入大纲环节？</p>
                <button id="confirmOutlineButton" class="send-button" style="border-radius: 8px; width: auto; padding: 8px 15px; margin-top: 10px; background: rgba(34, 197, 94, 0.8);">确认</button>
            `;
            addBotMessage(confirmationMessageHTML);
            confirmationMessageSent = true;

            // 为确认按钮添加事件监听器
            document.getElementById('confirmOutlineButton').addEventListener('click', () => {
                console.log('进入大纲环节');
                // 播放音乐
                const audio = new Audio('Music/Music1.mp3');
                audio.play();
                
                // 清空聊天区域的旧消息和问题
                chatMessages.innerHTML = '';
                selectedOptionsDisplay.innerHTML = '';

                // 动态生成三个大纲
                const outlineDisplay = document.getElementById('outlineDisplay');
                const outlines = [
                    {
                        image: 'Images/Outline1.png',
                        title: '大纲方案一：深度剖析',
                        content: '大纲框架：<br>1. 泡泡玛特现状与市场地位：当前市场表现，行业影响力。<br>2. 挑战与机遇并存：面临的竞争、消费者喜好变化，以及新的增长点。<br>3. 未来发展潜力：IP合作、国际市场拓展、数字化转型等。'
                    },
                    {
                        image: 'Images/Outline2.png',
                        title: '大纲方案二：情感共鸣',
                        content: '大纲框架：<br>1. 情感连接：用户与泡泡玛特盲盒的情感羁绊，收藏背后的故事。<br>2. 社交属性：盲盒如何成为年轻人社交的媒介，社群文化。<br>3. 品牌温度：泡泡玛特在用户心中的形象，文化符号。'
                    },
                    {
                        image: 'Images/Outline3.png',
                        title: '大纲方案三：商业模式创新',
                        content: '大纲框架：<br>1. 盲盒经济解析：独特的销售模式，消费心理洞察。<br>2. IP孵化与运营：如何打造爆款IP，IP生态圈的构建。<br>3. 线上线下融合：新零售模式探索，全渠道布局。'
                    }
                ];

                let outlinesHTML = '';
                outlines.forEach((outline, index) => {
                    outlinesHTML += `
                        <div class="outline-item" data-outline-index="${index}">
                            <img src="${outline.image}" alt="${outline.title}" class="outline-image">
                            <h3 class="outline-title">${outline.title}</h3>
                            <p class="outline-content-text">${outline.content}</p>
                        </div>
                    `;
                });
                outlineDisplay.innerHTML = outlinesHTML;

                // 发送新的机器人消息
                addBotMessage('很好！这是我们为你准备的三个大纲初稿，请选择一个你最喜欢的大纲，或者告诉我们你的修改意见✨');

                // 为每个大纲项添加点击事件监听器
                document.querySelectorAll('.outline-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        const index = e.currentTarget.dataset.outlineIndex;
                        const selectedOutline = outlines[index];

                        // 清空已选选项显示区域和大纲显示区域
                        selectedOptionsDisplay.innerHTML = '';
                        outlineDisplay.innerHTML = '';

                        // 在文档区域显示选定大纲的详细内容
                        const documentContent = document.querySelector('.document-content');
                        documentContent.innerHTML = `
                            <div class="chosen-outline-display">
                                <img src="${selectedOutline.image}" alt="${selectedOutline.title}" class="chosen-outline-image">
                                <h3 class="chosen-outline-title">${selectedOutline.title}</h3>
                                <p class="chosen-outline-content-text">${selectedOutline.content}</p>
                            </div>
                        `;

                        // 发送新的机器人消息
                        addBotMessage(`好的，Hunk！我们已经为你采纳了方案"${selectedOutline.title}"。现在，你可以开始你的创作了。完成后请点击"完成！"按钮✨`);

                        // 隐藏用户输入框并显示"完成！"按钮
                        const userInputContainer = document.querySelector('.user-input-container');
                        userInputContainer.innerHTML = `
                            <div class="complete-button-container">
                                <button id="completeCreativeButton" class="send-button" style="border-radius: 8px; width: auto; padding: 8px 15px; margin-top: 0; background: rgba(34, 197, 94, 0.8);">完成！</button>
                            </div>
                        `;

                        // 为"完成！"按钮添加事件监听器
                        document.getElementById('completeCreativeButton').addEventListener('click', () => {
                            console.log('创作完成！');
                            // TODO: 在此处添加创作完成后的逻辑
                        });
                    });
                });
            });
        }
    }

    // 左右面板拖动调整宽度功能
    const documentSection = document.querySelector('.document-section');
    const chatSection = document.querySelector('.chat-section');
    const resizer = document.getElementById('resizer');

    let isResizing = false;

    resizer.addEventListener('mousedown', (e) => {
        isResizing = true;
        document.body.style.cursor = 'ew-resize'; // 改变光标样式
        document.body.style.userSelect = 'none'; // 防止文本选择
        resizer.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'; // 拖动时显示颜色
    });

    document.addEventListener('mousemove', (e) => {
        if (!isResizing) return;

        const container = document.querySelector('.creative-page-container');
        const containerRect = container.getBoundingClientRect();
        const totalWidth = containerRect.width;

        // 计算鼠标相对于容器左边缘的位置
        const mouseX = e.clientX - containerRect.left;

        // 计算新的文档区域宽度 (假设分隔条宽度为 8px)
        let newDocumentWidth = mouseX - (resizer.offsetWidth / 2);

        // 计算新的聊天区域宽度
        let newChatWidth = totalWidth - newDocumentWidth - resizer.offsetWidth;

        // 获取最小宽度 (与CSS中设置的min-width保持一致)
        const minDocumentWidth = 200;
        const minChatWidth = 300;

        // 应用最小宽度限制
        if (newDocumentWidth < minDocumentWidth) {
            newDocumentWidth = minDocumentWidth;
            newChatWidth = totalWidth - newDocumentWidth - resizer.offsetWidth;
        }

        if (newChatWidth < minChatWidth) {
            newChatWidth = minChatWidth;
            newDocumentWidth = totalWidth - newChatWidth - resizer.offsetWidth;
        }

        // 更新 flex-basis 属性来调整宽度
        documentSection.style.flexBasis = `${newDocumentWidth}px`;
        chatSection.style.flexBasis = `${newChatWidth}px`;
    });

    document.addEventListener('mouseup', () => {
        isResizing = false;
        document.body.style.cursor = 'default';
        document.body.style.userSelect = '';
        resizer.style.backgroundColor = 'transparent'; // 拖动结束时恢复透明
    });

    // 用户个人创作中心点击功能
    const userProfile = document.querySelector('.user-profile');
    if (userProfile) {
        userProfile.addEventListener('click', () => {
            console.log('进入个人创作中心');
            // TODO: 在此处添加导航到个人创作中心的逻辑
        });
    }
});

// 添加机器人消息功能
function addBotMessage(message, isQuestionBlock = false) {
    const chatMessages = document.querySelector('.chat-messages');
    const botMessage = document.createElement('div');
    botMessage.className = 'chat-bubble bot-message';
    if (isQuestionBlock) {
        botMessage.classList.add('question-block');
    }
    
    botMessage.innerHTML = `<p>${message}</p>`;
    chatMessages.appendChild(botMessage);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

// 发送消息功能
function sendMessage() {
    const input = document.querySelector('.user-input');
    const message = input.value.trim();
    
    if (message) {
        // 添加用户消息到聊天框
        const chatMessages = document.querySelector('.chat-messages');
        const userMessage = document.createElement('div');
        userMessage.className = 'chat-bubble user-message';
        userMessage.textContent = message;
        chatMessages.appendChild(userMessage);
        
        // 清空输入框
        input.value = '';
        
        // 滚动到底部
        chatMessages.scrollTop = chatMessages.scrollHeight;
        
        // TODO: 这里可以添加与后端的通信逻辑
    }
}

// 绑定发送按钮点击事件
document.querySelector('.send-button').addEventListener('click', sendMessage);

// 绑定回车键发送
document.querySelector('.user-input').addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
        e.preventDefault();
        sendMessage();
    }
});

// 自动调整输入框高度
document.querySelector('.user-input').addEventListener('input', function() {
    this.style.height = 'auto';
    this.style.height = (this.scrollHeight) + 'px';
}); 