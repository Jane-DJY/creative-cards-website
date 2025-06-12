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
            inspirationTitleElement.textContent = '灵感';
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
                    <h4 class="document-section-title" id="inspirationTitle">灵感</h4>
                    <div id="selectedOptionsDisplay">${currentSelectedOptionsHTML}</div>
                    <h4 class="document-section-title" id="outlineTitle">大纲</h4>
                    <div id="outlineDisplay" class="outline-container">${outlinesHTML}</div>
                `;

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
                            const index = e.target.dataset.outlineIndex;
                            const selectedOutline = outlines[index];
                            handleOutlineSelection(selectedOutline, index);
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
                        <h4 class="document-section-title" id="inspirationTitle">灵感</h4>
                        <div id="selectedOptionsDisplay">${currentSelectedOptionsHTML}</div>
                        <h4 class="document-section-title" id="outlineTitle">大纲</h4>
                        <div id="outlineDisplay" class="outline-container">${currentOutlineDisplayHTML}</div>
                        <h2 class="document-section-subtitle">被Hunk选中的大纲</h2>
                        <div class="chosen-outline-display">
                            <img src="${selectedOutline.image}" alt="${selectedOutline.title}" class="chosen-outline-image">
                            <h3 class="chosen-outline-title">${selectedOutline.title}</h3>
                            <div class="chosen-outline-content-wrapper">${selectedOutline.content}</div>
                        </div>
                    `;

                    // 发送新的机器人消息
                    addBotMessage(`好的，Hunk！我们已经为你采纳了方案"${selectedOutline.title}"。现在，我们进入创作的迭代环节。✨`);

                    // 显示用户输入框，用于后续对话 (如果之前隐藏了)
                    const userInputContainer = document.querySelector('.user-input-container');
                    userInputContainer.style.display = 'flex';

                    // 隐藏"开始创作"按钮区域（如果存在）
                    const creativeControls = document.getElementById('creativeControls');
                    if (creativeControls) {
                        creativeControls.style.display = 'none';
                    }

                    // 更新进度条到迭代环节
                    document.querySelector('.progress-step:nth-child(3)').classList.remove('active'); // 大纲
                    document.querySelector('.progress-step:nth-child(5)').classList.add('active'); // 迭代

                    // 延迟显示引导消息
                    const iterationMessages = [
                        '我将根据你选择的大纲，为你生成更多详细的内容。'
                    ];
                    displayBotMessagesSequentially(iterationMessages);
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