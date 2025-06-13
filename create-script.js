// create-script.js

// 百炼大模型 API 配置
const API_KEY = "sk-20684afc32be4ddc890a1fc5eea3faca";
const BASE_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1";

// 对话消息历史
let messages = [];

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
        emotion: false,
    };
    let confirmationMessageSent = false; // 标记确认消息是否已发送

    // 动态添加初始机器人消息
    const initialMessage1 = '你好！我是Jane，你的创作伙伴✨';
    const initialMessage2 = `我看到你想探讨"${creativeAngle}"这个话题，这个角度很有意思！让我们一起深入挖掘，帮你打造一篇精彩的报道。<br><br>首先，这篇报道主要面向哪些读者呢？了解目标受众能帮助我们确定最合适的表达方式📝`;
    
    addBotMessage(initialMessage1); // 仅添加到 UI
    messages.push({ role: "assistant", content: initialMessage1.replace(/<br>/g, '\n') }); // 添加到消息历史（纯文本）

    addBotMessage(initialMessage2); // 仅添加到 UI
    messages.push({ role: "assistant", content: initialMessage2.replace(/<br>/g, '\n') }); // 添加到消息历史（纯文本）

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
            <h4>4. 报道想传递什么情绪？</h4>
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
            'emotion': '4. 传递情绪：',
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
                questionGroup === 'emotion' ? 4 :
                0 // 默认为 0 以防万一
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
                    divGroup === 'emotion' ? 4 :
                    0
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

        // 动态添加"灵感"标题，如果它不存在的话
        const documentContent = document.querySelector('.document-content');
        let inspirationTitleElement = documentContent.querySelector('#inspirationTitle');
        if (!inspirationTitleElement) {
            inspirationTitleElement = document.createElement('h4');
            inspirationTitleElement.className = 'document-section-title';
            inspirationTitleElement.id = 'inspirationTitle';
            inspirationTitleElement.textContent = '1. 灵感';
            documentContent.insertBefore(inspirationTitleElement, selectedOptionsDisplay); // 插入在 selectedOptionsDisplay 之前
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
                
                // chatMessages.innerHTML = ''; // 移除这行，保留聊天历史
                // selectedOptionsDisplay.innerHTML = ''; // 移除这行，保留已选答案

                // 更新进度条状态
                document.querySelector('.progress-step:nth-child(1)').classList.remove('active'); // 灵感
                document.querySelector('.progress-step:nth-child(3)').classList.add('active'); // 大纲

                // 动态生成三个大纲
                const outlines = [
                    {
                        image: 'Images/Structure1.jpg',
                        title: '把"情绪连接"纳入未来现金流预测——情绪牌能否带来品牌溢价和定价权？',
                        content: `
                            <ul class="outline-list">
                                <li>
                                    <h4>引子（Exposition）</h4>
                                    <ul class="nested-list">
                                        <li><p class="outline-description">中国消费市场中的"情绪需求"开始崛起，年轻人为何为"空虚寂寞冷"买单？<br>泡泡玛特作为情绪载体的角色被确立。</p></li>
                                        <li><p class="outline-question">核心问题：情绪消费的风口出现了，泡泡玛特在其中扮演了怎样的先驱角色？</p></li>
                                    </ul>
                                </li>
                                <li>
                                    <h4>上升动作（Rising Action）</h4>
                                    <ul class="nested-list">
                                        <li><p class="outline-description">泡泡玛特从盲盒生意升级为"情绪IP制造商"。联名、展会、AI角色持续强化用户共鸣。<br>打造了Molly等情绪共鸣IP。</p></li>
                                        <li><p class="outline-question">核心问题：泡泡玛特的"情感牌"是如何一步步打动Z世代的？它的增长逻辑是什么？</p></li>
                                    </ul>
                                </li>
                                <li>
                                    <h4>高潮（Climax）</h4>
                                    <ul class="nested-list">
                                        <li><p class="outline-description">二级市场估值飙升、媒体热捧、年轻人集体"为情绪氪金"。<br>情绪连接转化为投资热情，资本市场给予高估值。</p></li>
                                        <li><p class="outline-question">核心问题：泡泡玛特的情绪价值，能转化为怎样的商业价值？估值是否合理？</p></li>
                                    </ul>
                                </li>
                                <li>
                                    <h4>下降动作（Falling Action）</h4>
                                    <ul class="nested-list">
                                        <li><p class="outline-description">疲劳袭来：产品同质化、审美倦怠、用户流失、财务增速放缓。<br>情感IP更新周期成为最大挑战。</p></li>
                                        <li><p class="outline-question">核心问题："情感牌"还能打多久？当潮水退去，估值将回归哪里？</p></li>
                                    </ul>
                                </li>
                                <li>
                                    <h4>结局（Denouement）</h4>
                                    <ul class="nested-list">
                                        <li><p class="outline-description">企业转型——从"IP+零售"向"情绪共创平台"升级。是否能像迪士尼那样持续构建"情绪帝国"？</p></li>
                                        <li><p class="outline-question">核心问题：情感牌是否具备长期壁垒，泡泡玛特的估值能否真正撑起"情绪消费第一股"？</p></li>
                                    </ul>
                                </li>
                            </ul>`
                    },
                    {
                        image: 'Images/Structure2.jpg',
                        title: '用于拆解泡泡玛特如何"唤起情感"，激发消费 → 转化为估值的增长',
                        content: `
                            <ul class="outline-list">
                                <li>
                                    <h4>Attention 关注</h4>
                                    <ul class="nested-list">
                                        <li><p class="outline-description">泡泡玛特用盲盒、"开箱"机制打造情绪波动体验，引爆社交平台<br>引发大众注意：是什么让成年人为"娃娃"疯狂？</p></li>
                                        <li><p class="outline-question">关键提问：泡泡玛特为何能获得如此高的社交声量？</p></li>
                                    </ul>
                                </li>
                                <li>
                                    <h4>Interest 兴趣</h4>
                                    <ul class="nested-list">
                                        <li><p class="outline-description">角色背后故事、品牌联名、孤独感应对。<br>AI人物设定、人格投射，增强"情绪共鸣"。</p></li>
                                        <li><p class="outline-question">关键提问：消费者被什么打动？这些IP如何切中现代孤独情绪？</p></li>
                                    </ul>
                                </li>
                                <li>
                                    <h4>Desire 渴望</h4>
                                    <ul class="nested-list">
                                        <li><p class="outline-description">限量发售、收藏增值、情绪寄托，"我不是买产品，我是找寄托"。<br>IP成为情绪投资品。</p></li>
                                        <li><p class="outline-question">关键提问：泡泡玛特是否正在成为"情绪奢侈品"？</p></li>
                                    </ul>
                                </li>
                                <li>
                                    <h4>Action 行动</h4>
                                    <ul class="nested-list">
                                        <li><p class="outline-description">消费决策、社群参与、品牌忠诚，估值提升背后的真实购买与沉淀。<br>资本持续下注。</p></li>
                                        <li><p class="outline-question">关键提问：用户真金白银地投入，这种模式是否可持续？</p></li>
                                    </ul>
                                </li>
                            </ul>`
                    },
                    {
                        image: 'Images/Structure3.jpg',
                        title: '以泡泡玛特为"主角"，讲述其如何踏上情绪消费之旅、陷入瓶颈、再探索出路。',
                        content: `
                            <ul class="outline-list">
                                <li>
                                    <h4>第一幕（设定）</h4>
                                    <ul class="nested-list">
                                        <li><p class="outline-description">泡泡玛特从潮玩公司转型为"情绪捕手"<br>介绍中国年轻人精神孤岛背景与盲盒文化崛起</p></li>
                                        <li><p class="outline-question">报道重点问题："孤独经济"催生泡泡玛特式的文化现象？</p></li>
                                    </ul>
                                </li>
                                <li>
                                    <h4>第二幕（冲突）</h4>
                                    <ul class="nested-list">
                                        <li><p class="outline-description">情绪共鸣带来爆发式估值，但用户疲劳、审美重复、创作瓶颈陆续出现<br>资本与用户双向质疑开始</p></li>
                                        <li><p class="outline-question">报道重点问题：泡泡玛特还能讲出新的"情绪故事"吗？</p></li>
                                    </ul>
                                </li>
                                <li>
                                    <h4>第三幕（转变）</h4>
                                    <ul class="nested-list">
                                        <li><p class="outline-description">开始探索"用户共创"、IP人格AI化、国际化扩展、数字藏品化路径以重启增长曲线<br>新估值逻辑出现</p></li>
                                        <li><p class="outline-question">报道重点问题：泡泡玛特能否转型为"东方的迪士尼"？估值模型是否合理？</p></li>
                                    </ul>
                                </li>
                            </ul>`
                    }
                ];

                let outlinesHTML = '';
                outlines.forEach((outline, index) => {
                    outlinesHTML += `
                        <div class="outline-item" data-outline-index="${index}">
                            <img src="${outline.image}" alt="${outline.title}" class="outline-image">
                            <h3 class="outline-title">${outline.title}</h3>
                            <p class="outline-content-text">${outline.content}</p>
                            <button class="outline-confirm-button" data-outline-index="${index}">选择此大纲</button>
                        </div>
                    `;
                });

                // 在文档区域显示选定大纲的详细内容
                const documentContent = document.querySelector('.document-content');
                const userCreativeAngleElement = document.getElementById('userCreativeAngle');
                const selectedOptionsDisplayElement = document.getElementById('selectedOptionsDisplay');

                // 确保获取到 selectedOptionsDisplay 的当前 HTML 内容，因为它可能会被重新渲染
                const currentSelectedOptionsHTML = selectedOptionsDisplayElement.innerHTML;

                // 重新构建 documentContent，包含所有部分
                documentContent.innerHTML = `
                    <p class="document-angle">创作角度：<span id="userCreativeAngle">${localStorage.getItem('creativeAngle')}</span></p>
                    <h4 class="document-section-title" id="inspirationTitle">1. 灵感</h4>
                    <div id="selectedOptionsDisplay">${currentSelectedOptionsHTML}</div>
                    <h4 class="document-section-title" id="outlineTitle">2. 大纲</h4>
                    <div id="outlineDisplay" class="outline-container">${outlinesHTML}</div>
                `;

                // Initialize Sortable.js for the chosen outline's content
                const chosenOutlineList = document.querySelector('.chosen-outline-display .outline-list');
                if (chosenOutlineList) {
                    new Sortable(chosenOutlineList, {
                        animation: 150,
                        ghostClass: 'sortable-ghost',
                        chosenClass: 'sortable-chosen',
                        dragClass: 'sortable-drag',
                    });
                }

                // 重新获取 outlineDisplay 元素，因为它已被重新创建
                const newOutlineDisplay = document.getElementById('outlineDisplay');

                // 发送新的机器人消息
                addBotMessage('很好！这是我们为你准备的三个大纲初稿，请选择一个你最喜欢的大纲，或者告诉我们你的修改意见✨');

                // 为每个大纲项添加点击事件监听器
                newOutlineDisplay.querySelectorAll('.outline-item').forEach(item => {
                    item.addEventListener('click', (e) => {
                        // 如果点击的是确认按钮，则阻止事件冒泡
                        if (e.target.classList.contains('outline-confirm-button')) {
                            e.stopPropagation();
                            // const index = e.target.dataset.outlineIndex;
                            // const selectedOutline = outlines[index];
                            // handleOutlineSelection(selectedOutline, index);
                        }
                    });
                });

                // 为确认按钮添加事件监听器
                newOutlineDisplay.querySelectorAll('.outline-confirm-button').forEach(button => {
                    button.addEventListener('click', (e) => {
                        const index = e.target.dataset.outlineIndex;
                        const selectedOutline = outlines[index];
                        handleOutlineSelection(selectedOutline, index);
                    });
                });

                // 提取大纲选择的处理逻辑到单独的函数
                function handleOutlineSelection(selectedOutline, index) {
                    // 获取当前 outlineDisplay 的 HTML 内容，确保包含三个大纲
                    const currentOutlineDisplayHTML = document.getElementById('outlineDisplay').innerHTML;

                    // 重新构建 documentContent，在原有大纲下方追加选中的大纲
                    documentContent.innerHTML = `
                        <p class="document-angle">创作角度：<span id="userCreativeAngle">${localStorage.getItem('creativeAngle')}</span></p>
                        <h4 class="document-section-title" id="inspirationTitle">1. 灵感</h4>
                        <div id="selectedOptionsDisplay">${currentSelectedOptionsHTML}</div>
                        <h4 class="document-section-title" id="outlineTitle">2. 大纲</h4>
                        <div id="outlineDisplay" class="outline-container">${currentOutlineDisplayHTML}</div>
                        <h2 class="document-section-subtitle">2.1 被Hunk选中的大纲</h2>
                        <div class="chosen-outline-display">
                            <img src="${selectedOutline.image}" alt="${selectedOutline.title}" class="chosen-outline-image">
                            <h3 class="chosen-outline-title">${selectedOutline.title}</h3>
                            <div class="chosen-outline-content-wrapper">${selectedOutline.content}</div>
                        </div>
                    `;

                    // 滚动到新添加的内容
                    const chosenOutlineSection = document.querySelector('.chosen-outline-display');
                    if (chosenOutlineSection) {
                        chosenOutlineSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }

                    // Initialize Sortable.js for the chosen outline's content
                    const chosenOutlineList = document.querySelector('.chosen-outline-display .outline-list');
                    if (chosenOutlineList) {
                        new Sortable(chosenOutlineList, {
                            animation: 150,
                            ghostClass: 'sortable-ghost',
                            chosenClass: 'sortable-chosen',
                            dragClass: 'sortable-drag',
                        });
                    }

                    // 发送新的机器人消息
                    addBotMessage(`好的，Hunk！我们已经为你采纳了方案"${selectedOutline.title}"。现在，我们可以打磨一下大纲✨ `);

                    const reviewButtonsHTML = `
                        <div style="display: flex; gap: 10px; margin-top: 10px;">
                            <button id="refineOutlineButton" class="send-button" style="border-radius: 8px; width: auto; padding: 8px 15px; background: rgba(34, 197, 94, 0.8);">好的，我想打磨</button>
                            <button id="continueButton" class="send-button" style="border-radius: 8px; width: auto; padding: 8px 15px; background: rgba(59, 130, 246, 0.8);">不用了，继续吧</button>
                        </div>
                    `;
                    addBotMessage(reviewButtonsHTML);

                    // 为新添加的按钮添加事件监听器
                    document.getElementById('refineOutlineButton').addEventListener('click', () => {
                        handleOutlineOptimization(); // 直接弹出多选优化选项
                    });

                    document.getElementById('continueButton').addEventListener('click', () => {
                        // 更新进度条到迭代环节
                        document.querySelector('.progress-step:nth-child(3)').classList.remove('active'); // 大纲
                        document.querySelector('.progress-step:nth-child(5)').classList.add('active'); // 迭代
                        addBotMessage('好的，我们现在进入创作的迭代环节。我将根据你选择的大纲，为你生成更多详细的内容。');
                    });

                    // 显示用户输入框，用于后续对话 (如果之前隐藏了)
                    const userInputContainer = document.querySelector('.user-input-container');
                    userInputContainer.style.display = 'flex';

                    // 隐藏"开始创作"按钮区域（如果存在）
                    const creativeControls = document.getElementById('creativeControls');
                    if (creativeControls) {
                        creativeControls.style.display = 'none';
                    }

                    // 滚动到底部
                    chatMessages.scrollTop = chatMessages.scrollHeight;
                }
            });
        }
    }

    // 左右面板拖动调整宽度功能
    const documentSection = document.querySelector('.document-section');
    const chatSection = document.querySelector('.chat-section');
    const resizer = document.getElementById('resizer');
    const creativeControls = document.getElementById('creativeControls'); // 获取创作控制区
    const creativeButton = document.getElementById('creativeButton');     // 获取开始创作按钮

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

// 辅助函数：按顺序显示多条机器人消息
async function displayBotMessagesSequentially(messagesArray) {
    const chatMessages = document.querySelector('.chat-messages');
    for (let i = 0; i < messagesArray.length; i++) {
        await new Promise(resolve => setTimeout(resolve, 500)); // 间隔 0.5 秒
        addBotMessage(messagesArray[i]);
        chatMessages.scrollTop = chatMessages.scrollHeight; // 每次添加后滚动到底部
    }
}

// 发送消息功能 (将替换原有逻辑)
async function sendMessage() {
    const input = document.querySelector('.user-input');
    const userInput = input.value.trim();
    input.value = ''; // 立即清空输入框

    if (!userInput) return;

    // 添加用户消息到聊天框和消息历史
    addBotMessage(userInput, false, 'user'); // 使用 addBotMessage 来添加用户消息
    messages.push({ role: "user", content: userInput });

    // 添加思考提示
    const thinkingMessageDiv = document.createElement('div');
    thinkingMessageDiv.className = 'chat-bubble bot-message';
    thinkingMessageDiv.innerHTML = '<p>Jane 正在思考...</p>';
    chatMessages.appendChild(thinkingMessageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;

    try {
        const response = await fetch(`${BASE_URL}/chat/completions`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${API_KEY}`
            },
            body: JSON.stringify({
                model: "deepseek-r1",
                messages: messages
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(`API Error: ${response.status} ${response.statusText} - ${errorData.message || 'Unknown error'}`);
        }

        const data = await response.json();
        // 根据实际API响应结构调整
        const aiResponse = data.choices[0].message.content; 

        // 移除思考提示
        chatMessages.removeChild(thinkingMessageDiv);

        // 添加 AI 消息到聊天框和消息历史
        addBotMessage(aiResponse, false, 'bot'); // 使用 addBotMessage 来添加机器人消息
        messages.push({ role: "assistant", content: aiResponse });

    } catch (error) {
        console.error('发生错误：', error);
        // 移除思考提示
        if (chatMessages.contains(thinkingMessageDiv)) {
            chatMessages.removeChild(thinkingMessageDiv);
        }
        addBotMessage('抱歉，与模型通信时发生错误。请稍后再试。', false, 'bot');
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

// 添加机器人消息功能 (修改 addBotMessage 以支持角色)
function addBotMessage(message, isQuestionBlock = false, role = 'bot') {
    const chatMessages = document.querySelector('.chat-messages');
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-bubble ${role}-message`;
    if (isQuestionBlock) {
        messageDiv.classList.add('question-block');
    }
    
    // 确保消息内容是纯文本，如果包含 HTML 标签，应该用 innerHTML
    if (role === 'user' || !isQuestionBlock) {
        messageDiv.innerHTML = `<p>${message}</p>`;
    } else {
        messageDiv.innerHTML = message; // questionBlockHTML 已经是完整的 HTML 结构
    }
    
    chatMessages.appendChild(messageDiv);
    
    // 滚动到底部
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

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
            text: '其他：'
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

        // 为选项F添加输入框
        if (option.id === 'F') {
            const input = document.createElement('input');
            input.type = 'text';
            input.className = 'other-input';
            input.placeholder = '请填写你的想法...';
            input.style.display = 'none';
            optionDiv.appendChild(input);

            // 监听复选框状态变化
            checkbox.addEventListener('change', function() {
                input.style.display = this.checked ? 'inline-block' : 'none';
                if (this.checked) {
                    input.focus();
                }
            });
        }
        
        optionsList.appendChild(optionDiv);
    });

    optionsContainer.appendChild(optionsList);

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

    // 监听确认按钮点击
    confirmButton.addEventListener('click', function() {
        const selectedOptions = Array.from(document.querySelectorAll('.optimization-option input[type="checkbox"]:checked'))
            .map(checkbox => {
                if (checkbox.value === 'F') {
                    const input = checkbox.parentElement.querySelector('.other-input');
                    return input.value.trim() || '用户未输入具体想法';
                }
                return checkbox.nextElementSibling.textContent;
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

        // 如果用户选择了B选项，显示后续问题
        if (selectedOptions.some(option => option.includes('问题设置不够锋利'))) {
            setTimeout(() => {
                const followUpOptions = [
                    {
                        id: 'A',
                        text: '太"安全"，像是在问一个所有人都已经知道的问题，没有颠覆性角度'
                    },
                    {
                        id: 'B',
                        text: '不够具体，像"情绪故事""估值模型"这些概念没贴合真实场景'
                    },
                    {
                        id: 'C',
                        text: '缺少矛盾或冲突感，像是泡泡玛特自己在反思，但没人在和它"对话"'
                    },
                    {
                        id: 'D',
                        text: '这些问题像是"总结陈词"，不是"追问"或"挑战"'
                    },
                    {
                        id: 'E',
                        text: '其他：'
                    }
                ];

                // 创建新的选项容器
                const followUpContainer = document.createElement('div');
                followUpContainer.className = 'optimization-options';
                
                // 创建标题
                const followUpTitle = document.createElement('h4');
                followUpTitle.textContent = '好眼光！你选择了 B：问题设置不够锋利 ——这其实是最能提升一篇稿子深度和穿透力的关键。那你觉得这些"报道重点问题"为什么不够有力？';
                followUpTitle.className = 'optimization-title';
                followUpContainer.appendChild(followUpTitle);

                // 创建选项列表
                const followUpList = document.createElement('div');
                followUpList.className = 'options-list';

                // 添加选项
                followUpOptions.forEach(option => {
                    const optionDiv = document.createElement('div');
                    optionDiv.className = 'optimization-option';
                    
                    const checkbox = document.createElement('input');
                    checkbox.type = 'checkbox';
                    checkbox.id = `followup-${option.id}`;
                    checkbox.value = option.id;
                    
                    const label = document.createElement('label');
                    label.htmlFor = `followup-${option.id}`;
                    label.textContent = option.text;
                    
                    optionDiv.appendChild(checkbox);
                    optionDiv.appendChild(label);

                    // 为选项E添加输入框
                    if (option.id === 'E') {
                        const input = document.createElement('input');
                        input.type = 'text';
                        input.className = 'other-input';
                        input.placeholder = '请填写你的想法...';
                        input.style.display = 'none';
                        optionDiv.appendChild(input);

                        // 监听复选框状态变化
                        checkbox.addEventListener('change', function() {
                            input.style.display = this.checked ? 'inline-block' : 'none';
                            if (this.checked) {
                                input.focus();
                            }
                        });
                    }
                    
                    followUpList.appendChild(optionDiv);
                });

                followUpContainer.appendChild(followUpList);

                // 添加确认按钮
                const followUpConfirmButton = document.createElement('button');
                followUpConfirmButton.className = 'confirm-optimization-btn';
                followUpConfirmButton.textContent = '确认';
                followUpContainer.appendChild(followUpConfirmButton);

                // 添加到聊天区域
                const followUpMessageDiv = document.createElement('div');
                followUpMessageDiv.className = 'chat-bubble bot-message';
                followUpMessageDiv.appendChild(followUpContainer);
                chatMessages.appendChild(followUpMessageDiv);

                // 滚动到底部
                chatMessages.scrollTop = chatMessages.scrollHeight;

                // 监听确认按钮点击
                followUpConfirmButton.addEventListener('click', function() {
                    const selectedFollowUpOptions = Array.from(document.querySelectorAll('.optimization-option input[type="checkbox"]:checked'))
                        .map(checkbox => {
                            if (checkbox.value === 'E') {
                                const input = checkbox.parentElement.querySelector('.other-input');
                                return input.value.trim() || '用户未输入具体想法';
                            }
                            return checkbox.nextElementSibling.textContent;
                        });

                    if (selectedFollowUpOptions.length === 0) {
                        alert('请至少选择一个选项');
                        return;
                    }

                    // 创建用户回复消息
                    const followUpUserMessageDiv = document.createElement('div');
                    followUpUserMessageDiv.className = 'chat-bubble user-message';
                    const followUpUserMessageContent = document.createElement('p');
                    followUpUserMessageContent.textContent = selectedFollowUpOptions.join('\n');
                    followUpUserMessageDiv.appendChild(followUpUserMessageContent);
                    chatMessages.appendChild(followUpUserMessageDiv);

                    // 移除选项容器
                    followUpMessageDiv.remove();

                    // 滚动到底部
                    chatMessages.scrollTop = chatMessages.scrollHeight;

                    // 添加新的回复消息
                    setTimeout(() => {
                        addBotMessage('好的，我开始修改大纲，请稍等哦，你可以先去倒个咖啡。');
                        
                        // 在左侧文档区域添加修改后的大纲
                        const documentContent = document.querySelector('.document-content');
                        const modifiedOutlineHTML = `
                            <h2 class="document-section-subtitle">2.2 大纲修改第一版</h2>
                            <div class="outline-comparison">
                                <table class="comparison-table">
                                    <thead>
                                        <tr>
                                            <th>🧱 原始大纲</th>
                                            <th>✨ 修改后内容 + 方法说明</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        <tr>
                                            <td>
                                                <strong>第一部分：泡泡玛特从潮玩公司转型为"情绪捕手"</strong><br>
                                                介绍中国年轻人精神孤岛背景与盲盒文化崛起<br>
                                                🟡报道重点问题：孤独经济催生泡泡玛特式文化现象？
                                            </td>
                                            <td>
                                                <strong>第一部分：情绪制造机的崛起——谁在消费孤独？</strong><br>
                                                泡泡玛特如何成为"情绪捕手"？盲盒如何变为"微情绪的投射容器"？<br>
                                                🔺<strong>问题升级</strong>：是谁在制造孤独，又是谁在贩卖安慰？<br>
                                                🛠️方法：<br>
                                                ‣ 问题反转 @苏格拉底型提问者<br>
                                                ‣ 概念具象化（"盲盒=投射情绪"）<br>
                                                ‣ 文化现象定位 @猎奇型旁观者
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>第二部分：情绪共鸣带来爆发式估值，但用户疲劳、审美重复、创作瓶颈陆续出现</strong><br>
                                                资本与用户双向质疑开始<br>
                                                🟡报道重点问题：还能讲出新的"情绪故事"吗？
                                            </td>
                                            <td>
                                                <strong>第二部分：当情绪配方失灵——神话开始裂缝</strong><br>
                                                叙事疲劳、角色审美同质、估值回撤，用户厌倦，资本失望<br>
                                                🔺<strong>问题升级</strong>：情绪故事失灵后，泡泡玛特还有灵魂吗？它和一个塑料工厂的区别是什么？<br>
                                                🛠️方法：<br>
                                                ‣ 矛盾聚焦 @辩论型读者<br>
                                                ‣ 舆论对话模拟（"社区吐槽 vs CEO发言"）<br>
                                                ‣ 数据补刀（用户流失率、财报下滑）
                                            </td>
                                        </tr>
                                        <tr>
                                            <td>
                                                <strong>第三部分：开始探索用户共创、IP人格AI化、国际化扩展、数字藏品路径</strong><br>
                                                新估值逻辑出现<br>
                                                🟡报道重点问题：泡泡玛特能否转型为东方迪士尼？估值模型是否合理？
                                            </td>
                                            <td>
                                                <strong>第三部分：转型中的困兽与赌徒——谁能再造东方迪士尼？</strong><br>
                                                尝试共创、AI人格、元宇宙、国际化，但陷入文化失语与模式焦虑<br>
                                                🔺<strong>问题升级</strong>：这是通向迪士尼的路，还是走向技术伪装的空壳？<br>
                                                🛠️方法：<br>
                                                ‣ 前提质疑 @精算型分析师<br>
                                                ‣ 国际扩张质疑 @文化冷感型旁观者<br>
                                                ‣ 多路径镜像：共创 vs 控制、AI赋能 vs 空洞人格
                                            </td>
                                        </tr>
                                    </tbody>
                                </table>
                            </div>
                        `;
                        
                        // 将修改后的大纲添加到文档内容中
                        documentContent.insertAdjacentHTML('beforeend', modifiedOutlineHTML);
                        
                        // 滚动到新添加的内容
                        const modifiedOutlineSection = document.querySelector('.outline-comparison');
                        if (modifiedOutlineSection) {
                            modifiedOutlineSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                    }, 500);
                });
            }, 500);
        }
    });
} 