// // script.js

// // --- CONFIGURATION ---
// const BASE_API_URL = 'http://127.0.0.1:8000/api'; 

// // --- APPLICATION STATE ---
// let appState = {
//     currentUserRole: null, 
//     questions: [], 
//     modules: [], 
//     questionTypes: [], 
//     levels: [], 
//     editingQuestionId: null, 
//     currentStudentLevelId: null, 
//     currentTest: { 
//         questions: [], userAnswers: [], currentQuestionIndex: 0, mode: 'Training', moduleName: '', levelId: null, 
//         startTime: null, endTime: null, timeLimit: 3000, totalTimeAllowedForDisplay: "00:50:00", 
//         timerInterval: null, markedForReview: [], remainingTime: undefined,
//         testTakerId: "User" + Date.now().toString().slice(-4), 
//         testTitleString: "", minPassingScoreRaw: 0.7,
//         calculatedModuleScores: {}, calculatedModuleTotals: {},
//         checkedInTraining: [] 
//     },
//     savedTests: [] 
// };

// // --- DOM ELEMENTS ---
// const Views = { 
//     roleSelection: document.getElementById('roleSelectionView'), 
//     admin: document.getElementById('adminView'), 
//     student: document.getElementById('studentView'), 
//     levelSelectionStudent: document.getElementById('levelSelectionStudentView'), 
//     testSelection: document.getElementById('testSelectionView'), 
//     testTaking: document.getElementById('testTakingView'), 
//     results: document.getElementById('resultsViewStudent'), 
//     confirmEndTestModal: document.getElementById('confirmEndTestModal') 
// };
// const AdminElements = {
//     formTitle: document.getElementById('adminFormTitle'), 
//     editingQuestionIdInput: document.getElementById('editingQuestionIdAdmin'), 
//     saveOrUpdateBtn: document.getElementById('saveOrUpdateQuestionBtn'), 
//     cancelEditBtn: document.getElementById('cancelEditBtnAdmin'), 
//     questionModule: document.getElementById('questionModuleAdmin'), 
//     questionType: document.getElementById('questionTypeAdmin'), 
//     questionLevel: document.getElementById('questionLevelAdmin'), 
//     questionText: document.getElementById('questionTextAdmin'),
//     questionImageInput: document.getElementById('questionImageAdmin'), 
//     questionImagePreview: document.getElementById('questionImagePreviewAdmin'), 
//     mcFields: document.getElementById('mcFieldsAdmin'), optionsContainer: document.getElementById('optionsContainerAdmin'), correctAnswerMC: document.getElementById('correctAnswerAdminMC'),
//     tfFields: document.getElementById('tfFieldsAdmin'), correctAnswerTF: document.getElementById('correctAnswerAdminTF'),
//     tfTableFields: document.getElementById('tfTableFieldsAdmin'), statementsAdminTFTable: document.getElementById('statementsAdminTFTable'), correctAnswersAdminTFTable: document.getElementById('correctAnswersAdminTFTable'), 
//     ddMatchFields: document.getElementById('ddMatchFieldsAdmin'), draggableItems: document.getElementById('draggableItemsAdmin'), dropZoneTargets: document.getElementById('dropZoneTargetsAdmin'),
//     explanationText: document.getElementById('explanationTextAdmin'), questionListContainer: document.getElementById('questionListAdminContainer'), questionList: document.getElementById('questionListAdmin'),
//     fileUpload: document.getElementById('fileUploadAdmin'), uploadStatus: document.getElementById('uploadStatusAdmin') 
// };
// const StudentElements = {
//     levelSelectionButtons: document.getElementById('levelSelectionButtons'), 
//     testModuleButtons: document.getElementById('testModuleButtons'), 
//     testTitle: document.getElementById('testTitleStudent'), testModeInfo: document.getElementById('testModeInfoStudent'), timer: document.getElementById('timer'),
//     questionArea: document.getElementById('questionAreaStudent'), currentQuestionNumber: document.getElementById('currentQuestionNumberStudent'), totalQuestions: document.getElementById('totalQuestionsStudent'),
//     questionImageDisplay: document.getElementById('questionImageDisplayStudent'), 
//     questionTextDisplay: document.getElementById('questionTextDisplayStudent'), optionsArea: document.getElementById('optionsAreaStudent'), trueFalseTableArea: document.getElementById('trueFalseTableAreaStudent'), 
//     dragDropArea: document.getElementById('dragDropAreaStudent'), dragSourceContainer: document.getElementById('dragSourceContainer'), dropZoneContainer: document.getElementById('dropZoneContainer'),
//     explanationArea: document.getElementById('explanationAreaStudent'), explanationTextDisplay: document.getElementById('explanationTextDisplayStudent'),
//     prevBtn: document.getElementById('prevBtnStudent'), nextBtn: document.getElementById('nextBtnStudent'), 
//     checkAnswerBtn: document.getElementById('checkAnswerBtnStudent'), 
//     markReviewBtn: document.getElementById('markReviewBtnStudent'), saveProgressBtn: document.getElementById('saveProgressBtnStudent'),
//     questionNavigator: document.getElementById('questionNavigatorStudent'), savedTestsList: document.getElementById('savedTestsListStudent'),
//     resultViewTestTakerId: document.getElementById('resultViewTestTakerId'), resultViewTestTitle: document.getElementById('resultViewTestTitle'), resultViewCategory: document.getElementById('resultViewCategory'), resultViewTimeUsed: document.getElementById('resultViewTimeUsed'), resultViewTotalTimeAllowed: document.getElementById('resultViewTotalTimeAllowed'), resultViewProduct: document.getElementById('resultViewProduct'), resultViewScore: document.getElementById('resultViewScore'), resultViewMode: document.getElementById('resultViewMode'), resultViewMinPassingScore: document.getElementById('resultViewMinPassingScore'), resultViewDateFinished: document.getElementById('resultViewDateFinished'), resultViewPlaceholderId: document.getElementById('resultViewPlaceholderId'), resultViewOverallStatus: document.getElementById('resultViewOverallStatus'), resultViewMotivationalMessage: document.getElementById('resultViewMotivationalMessage'), resultViewBreakdown: document.getElementById('resultViewBreakdown'), resultViewQuestionReviewList: document.getElementById('resultViewQuestionReviewList')
// };
// let draggedItemElement = null; 
// let draggedItemData = {}; 

// // --- CSRF Token Helper ---
// function getCookie(name) { let cookieValue = null; if (document.cookie && document.cookie !== '') { const cookies = document.cookie.split(';'); for (let i = 0; i < cookies.length; i++) { const cookie = cookies[i].trim(); if (cookie.substring(0, name.length + 1) === (name + '=')) { cookieValue = decodeURIComponent(cookie.substring(name.length + 1)); break; } } } return cookieValue; }
// const csrftoken = getCookie('csrftoken');

// // --- API HELPER ---
// async function fetchAPI(endpoint, options = {}) { 
//     const defaultHeaders = {}; 
//     if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(options.method?.toUpperCase())) { 
//         if (csrftoken) { 
//             defaultHeaders['X-CSRFToken'] = csrftoken; 
//         } else { 
//             console.warn('CSRF token not found. Make sure Django sets it or this is not a cross-origin request without proper CORS.'); 
//         } 
//     } 
//     if (!(options.body instanceof FormData)) { 
//         defaultHeaders['Content-Type'] = 'application/json'; 
//     } 
//     options.headers = { ...defaultHeaders, ...options.headers }; 
//     try { 
//         const response = await fetch(`${BASE_API_URL}${endpoint}`, options); 
//         if (!response.ok) { 
//             let errorData;
//             let responseText = await response.text(); 
//             try {
//                 errorData = JSON.parse(responseText); 
//             } catch (e) {
//                 errorData = { detail: `Lỗi HTTP ${response.status}: ${response.statusText}. Phản hồi từ server: ${responseText}` };
//             }
//             console.error(`API Error ${response.status}: ${endpoint}`, errorData); 
            
//             let detailedMessage = `Lỗi ${response.status} khi gọi API.`;
//             if (errorData && typeof errorData === 'object') {
//                 if (errorData.detail) { 
//                     detailedMessage = errorData.detail;
//                 } else if (errorData.error) { 
//                      detailedMessage = errorData.error;
//                 } else if (Array.isArray(errorData.errors)) { 
//                     detailedMessage = `${errorData.message || 'Có lỗi với các dòng trong file'}:\n`;
//                     errorData.errors.forEach(err => {
//                         detailedMessage += `- Dòng ${err.row || 'không rõ'}: ${ (typeof err.error === 'string' ? err.error : JSON.stringify(err.error)) }\n`;
//                     });
//                 } else { 
//                     const fieldErrors = Object.entries(errorData)
//                         .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
//                         .join('; \n');
//                     if (fieldErrors) detailedMessage = fieldErrors;
//                 }
//             }
//             throw new Error(detailedMessage); 
//         } 
//         if (response.status === 204) return null; 
//         return await response.json(); 
//     } catch (error) { 
//         console.error('Lỗi Fetch API:', error); 
//         throw error; 
//     } 
// }

// // --- INITIALIZATION & DATA LOADING ---
// async function initializeApp() { 
//     console.log("Initializing application..."); 
//     showView(Views.roleSelection); 
//     loadSavedTests(); 
//     try { 
//         await loadInitialAdminData(); 
//     } catch (error) { 
//         console.error("Không thể tải dữ liệu ban đầu:", error); 
//     } 
//     if (AdminElements.questionImageInput) { 
//         AdminElements.questionImageInput.addEventListener('change', previewQuestionImageAdmin); 
//     }
//     addOptionFieldAdmin(); 
//     addOptionFieldAdmin(); 
//     toggleQuestionTypeFields(); 
//     console.log("Application initialized."); 
// }
// async function loadInitialAdminData() { 
//     try { 
//         const [modules, questionTypes, levels] = await Promise.all([ 
//             fetchAPI('/modules/'), 
//             fetchAPI('/question-types/'),
//             fetchAPI('/levels/') 
//         ]); 
//         appState.modules = modules || []; 
//         appState.questionTypes = questionTypes || []; 
//         appState.levels = levels || []; 

//         populateAdminDropdown(AdminElements.questionModule, appState.modules, 'id', 'module_name'); 
//         populateAdminDropdown(AdminElements.questionType, appState.questionTypes, 'id', 'type_code', 'type_description');
//         populateAdminDropdown(AdminElements.questionLevel, appState.levels, 'id', 'level_name', 'level_number'); 

//         console.log("Admin initial data (modules, types, levels) loaded."); 
//     } catch (error) { 
//         console.error("Lỗi khi tải dữ liệu ban đầu cho admin:", error); 
//         if (AdminElements.uploadStatus) { 
//             AdminElements.uploadStatus.textContent = "Lỗi tải dữ liệu cần thiết cho trang quản trị."; 
//             AdminElements.uploadStatus.className = "mt-3 text-sm text-red-600"; 
//         }
//     } 
// }
// function populateAdminDropdown(selectElement, data, valueField, textField, descriptionField = null) { 
//     if (!selectElement) { console.warn("Dropdown element not found for", textField); return; }
//     selectElement.innerHTML = ''; 
//     const defaultOption = document.createElement('option');
//     defaultOption.value = "";
//     defaultOption.textContent = `--- Chọn ${textField.includes('module') ? 'Chủ đề' : (textField.includes('type') ? 'Loại câu hỏi' : 'Cấp độ')} ---`;
//     defaultOption.disabled = true;
//     defaultOption.selected = true;
//     selectElement.appendChild(defaultOption);

//     (data || []).forEach(item => { 
//         const option = document.createElement('option'); 
//         option.value = item[valueField]; 
//         option.textContent = descriptionField ? `${item[textField]} (Cấp ${item[descriptionField]})` : item[textField]; 
//         selectElement.appendChild(option); 
//     }); 
// }

// function renderLevelSelectionButtons() { 
//     if (!StudentElements.levelSelectionButtons) return;
//     StudentElements.levelSelectionButtons.innerHTML = '';
//     if (!appState.levels || appState.levels.length === 0) {
//         StudentElements.levelSelectionButtons.innerHTML = '<p class="text-gray-500 text-center col-span-full">Không có cấp độ nào được định nghĩa.</p>';
//         return;
//     }
//     appState.levels.forEach(level => {
//         const levelBtn = document.createElement('button');
//         levelBtn.onclick = () => selectLevelForStudent(level.id);
//         levelBtn.className = "btn btn-primary p-6 text-lg"; 
//         levelBtn.textContent = level.level_name || `Cấp độ ${level.level_number}`;
//         StudentElements.levelSelectionButtons.appendChild(levelBtn);
//     });
// }

// function selectLevelForStudent(levelId) { 
//     appState.currentStudentLevelId = levelId;
//     const selectedLevel = appState.levels.find(l => l.id === levelId);
//     console.log(`Student selected Level: ${selectedLevel?.level_name} (ID: ${levelId})`);
    
//     if(Views.levelSelectionStudent) Views.levelSelectionStudent.classList.add('hidden');
//     if(Views.testSelection) Views.testSelection.classList.remove('hidden'); 
//     renderTestModuleButtons(levelId); 
// }


// function renderTestModuleButtons(levelId) { 
//     if (!StudentElements.testModuleButtons) return;
//     StudentElements.testModuleButtons.innerHTML = ''; 
//     (appState.modules || []).forEach(module => { 
//         const trainingBtn = document.createElement('button'); 
//         trainingBtn.onclick = () => startTest(levelId, module.id, module.module_name, 'Training'); 
//         trainingBtn.className = "btn bg-yellow-500 hover:bg-yellow-600 text-white p-6 text-lg"; 
//         trainingBtn.textContent = `Luyện tập: ${module.module_name}`; 
//         StudentElements.testModuleButtons.appendChild(trainingBtn); 
//         const testingBtn = document.createElement('button'); 
//         testingBtn.onclick = () => startTest(levelId, module.id, module.module_name, 'Testing'); 
//         testingBtn.className = "btn btn-primary p-6 text-lg"; 
//         testingBtn.textContent = `Thi thử: ${module.module_name}`; 
//         StudentElements.testModuleButtons.appendChild(testingBtn); 
//     }); 
//     const comprehensiveTrainingBtn = document.createElement('button'); 
//     comprehensiveTrainingBtn.onclick = () => startTest(levelId, null, 'Tổng hợp', 'Training'); 
//     comprehensiveTrainingBtn.className = "btn bg-purple-500 hover:bg-purple-600 text-white p-6 text-lg"; 
//     comprehensiveTrainingBtn.textContent = "Luyện tập: Tổng hợp"; 
//     StudentElements.testModuleButtons.appendChild(comprehensiveTrainingBtn); 
//     const comprehensiveTestingBtn = document.createElement('button'); 
//     comprehensiveTestingBtn.onclick = () => startTest(levelId, null, 'Tổng hợp', 'Testing'); 
//     comprehensiveTestingBtn.className = "btn btn-purple-700 hover:bg-purple-800 text-white p-6 text-lg"; 
//     comprehensiveTestingBtn.textContent = "Thi thử: Tổng hợp"; 
//     StudentElements.testModuleButtons.appendChild(comprehensiveTestingBtn); 
// }
// function loadSavedTests() { const stored = localStorage.getItem('ic3SparkSavedTests_v4_detailedResults'); if (stored) appState.savedTests = JSON.parse(stored); }
// function saveTestsToStorage() { localStorage.setItem('ic3SparkSavedTests_v4_detailedResults', JSON.stringify(appState.savedTests)); }

// // --- VIEW MANAGEMENT ---
// function showView(viewToShow) { 
//     [Views.roleSelection, Views.admin, Views.student, Views.confirmEndTestModal, Views.levelSelectionStudent, Views.testSelection, Views.testTaking, Views.results].forEach(v => {
//         if(v) v.classList.add('hidden'); 
//     }); 
//     if (viewToShow) viewToShow.classList.remove('hidden'); 
//     if (viewToShow !== Views.testTaking && appState.currentTest.timerInterval) { 
//         clearInterval(appState.currentTest.timerInterval); 
//         appState.currentTest.timerInterval = null; 
//     } 
// }
// async function selectRole(role) { 
//     appState.currentUserRole = role; 
//     if (role === 'admin') { 
//         showView(Views.admin); 
//         if(appState.modules.length === 0 || appState.questionTypes.length === 0 || appState.levels.length === 0) await loadInitialAdminData(); 
//         await renderQuestionListAdmin(); 
//     } else { // student
//         showView(Views.student); 
//         if(appState.levels.length === 0) await loadInitialAdminData(); 
//         if(Views.levelSelectionStudent) Views.levelSelectionStudent.classList.remove('hidden'); 
//         if(Views.testSelection) Views.testSelection.classList.add('hidden'); 
//         renderLevelSelectionButtons(); 
//     } 
// }
// function showRoleSelection() { showView(Views.roleSelection); }
// function showStudentLevelSelection() { // NEW: Go back to level selection from module selection
//     if(Views.testSelection) Views.testSelection.classList.add('hidden');
//     if(Views.levelSelectionStudent) Views.levelSelectionStudent.classList.remove('hidden');
//     renderLevelSelectionButtons();
// }
// function showTestSelection() { 
//     if(Views.levelSelectionStudent) Views.levelSelectionStudent.classList.add('hidden'); 
//     if(Views.testSelection) Views.testSelection.classList.remove('hidden'); 
//     if(Views.testTaking) Views.testTaking.classList.add('hidden'); 
//     if(Views.results) Views.results.classList.add('hidden'); 
//     renderSavedTestsStudent(); 
// }

// // --- ADMIN FUNCTIONALITY ---
// function toggleQuestionTypeFields() { const typeId = AdminElements.questionType.value; const typeObj = appState.questionTypes.find(t => t.id == typeId); const typeCode = typeObj ? typeObj.type_code : ''; if(AdminElements.mcFields) AdminElements.mcFields.classList.toggle('hidden', typeCode !== 'multiple-choice-single' && typeCode !== 'multiple-choice-multiple'); if(AdminElements.tfFields) AdminElements.tfFields.classList.toggle('hidden', typeCode !== 'true-false'); if(AdminElements.tfTableFields) AdminElements.tfTableFields.classList.toggle('hidden', typeCode !== 'true-false-table'); if(AdminElements.ddMatchFields) AdminElements.ddMatchFields.classList.toggle('hidden', typeCode !== 'drag-drop-match'); }
// function addOptionFieldAdmin(optionData = { text: '', image_url: null }) { 
//     const optionIndex = AdminElements.optionsContainer.children.length; 
//     const div = document.createElement('div'); 
//     div.classList.add('option-entry', 'flex', 'flex-col', 'sm:flex-row', 'items-start', 'space-y-2', 'sm:space-y-0', 'sm:space-x-2', 'mt-2', 'p-3', 'border', 'rounded-md', 'bg-gray-50'); 
//     div.innerHTML = `
//         <div class="option-text-input-group flex-grow">
//             <label for="optionAdminText${optionIndex}" class="text-xs font-medium text-gray-600">Lựa chọn ${optionIndex + 1} - Văn bản:</label>
//             <input type="text" id="optionAdminText${optionIndex}" name="optionsAdminText" class="w-full p-2 border border-gray-300 rounded-md shadow-sm" value="${optionData.text || ''}">
//         </div>
//         <div class="option-image-upload-group w-full sm:w-1/3">
//             <label for="optionAdminImage${optionIndex}" class="text-xs font-medium text-gray-600">Ảnh Lựa chọn ${optionIndex + 1} (tùy chọn):</label>
//             <input type="file" id="optionAdminImage${optionIndex}" name="option_image_${optionIndex}" accept="image/*" class="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
//             <img id="optionImagePreviewAdmin${optionIndex}" src="${optionData.image_url || '#'}" alt="Xem trước" class="mt-1 option-image-preview-admin ${optionData.image_url ? '' : 'hidden'}"/>
//         </div>
//         <div class="remove-option-btn-container">
//             ${optionIndex > 0 ? `<button type="button" onclick="removeOptionFieldAdmin(this)" class="btn btn-red btn-sm py-1 px-2 text-xs self-center sm:self-end">Xóa</button>` : '<div class="w-16 h-8"></div>'} 
//         </div>
//     `; 
//     AdminElements.optionsContainer.appendChild(div); 
//     const imageInput = div.querySelector(`#optionAdminImage${optionIndex}`);
//     const imagePreview = div.querySelector(`#optionImagePreviewAdmin${optionIndex}`);
//     if (imageInput && imagePreview) {
//         imageInput.addEventListener('change', (event) => {
//             const reader = new FileReader();
//             reader.onload = function() { imagePreview.src = reader.result; imagePreview.classList.remove('hidden'); };
//             if (event.target.files[0]) { reader.readAsDataURL(event.target.files[0]); } 
//             else { imagePreview.src = optionData.image_url || '#'; if (!optionData.image_url) { imagePreview.classList.add('hidden'); } }
//         });
//     }
// }
// function removeOptionFieldAdmin(button) { if (AdminElements.optionsContainer.children.length > 1) { button.closest('.option-entry').remove(); Array.from(AdminElements.optionsContainer.children).forEach((child, index) => { child.querySelector('label[for^="optionAdminText"]').textContent = `Lựa chọn ${index + 1} - Văn bản:`; child.querySelector('label[for^="optionAdminText"]').htmlFor = `optionAdminText${index}`; child.querySelector('input[name="optionsAdminText"]').id = `optionAdminText${index}`; child.querySelector('label[for^="optionAdminImage"]').textContent = `Ảnh Lựa chọn ${index + 1} (tùy chọn):`; child.querySelector('label[for^="optionAdminImage"]').htmlFor = `optionAdminImage${index}`; child.querySelector('input[name^="option_image_"]').id = `optionAdminImage${index}`; child.querySelector('input[name^="option_image_"]').name = `option_image_${index}`; child.querySelector('img[id^="optionImagePreviewAdmin"]').id = `optionImagePreviewAdmin${index}`; }); } else { alert("Câu hỏi trắc nghiệm phải có ít nhất 1 lựa chọn."); } }
// function previewQuestionImageAdmin(event) { const reader = new FileReader(); reader.onload = function(){ AdminElements.questionImagePreview.src = reader.result; AdminElements.questionImagePreview.classList.remove('hidden'); }; if (event.target.files[0]) { reader.readAsDataURL(event.target.files[0]); } else { AdminElements.questionImagePreview.src = "#"; AdminElements.questionImagePreview.classList.add('hidden'); } }
        
// function getQuestionPayloadAsObject() { 
//     const moduleId = AdminElements.questionModule.value;
//     const questionTypeId = AdminElements.questionType.value;
//     const levelId = AdminElements.questionLevel.value; 
//     const questionText = AdminElements.questionText.value.trim();
//     const explanation = AdminElements.explanationText.value.trim();
    
//     if (!moduleId) { alert("Vui lòng chọn Chủ đề."); return null; }
//     if (!questionTypeId) { alert("Vui lòng chọn Loại câu hỏi."); return null; }
//     // Level có thể là tùy chọn (null) nếu không chọn
//     if (!questionText) { alert("Vui lòng nhập nội dung câu hỏi."); return null; }


//     let questionData = { 
//         module: parseInt(moduleId), 
//         question_type: parseInt(questionTypeId), 
//         level: levelId ? parseInt(levelId) : null, 
//         question_text: questionText, 
//         explanation: explanation, 
//         is_active: true 
//     };

//     const typeObj = appState.questionTypes.find(t => t.id == questionTypeId);
//     if (!typeObj) { alert("Loại câu hỏi không hợp lệ (không tìm thấy typeObj)."); return null; }
//     const typeCode = typeObj.type_code;

//     if (typeCode === 'multiple-choice-single' || typeCode === 'multiple-choice-multiple' || typeCode === 'true-false') {
//         const optionEntries = AdminElements.optionsContainer.querySelectorAll('.option-entry');
//         let optionsMcData = [];
//         optionEntries.forEach((entry) => {
//             const textInput = entry.querySelector('input[name="optionsAdminText"]');
//             // Hiện tại chỉ hỗ trợ text cho options. Ảnh cho options cần xử lý phức tạp hơn.
//             optionsMcData.push({ text: textInput.value.trim() }); 
//         });

//         if (typeCode !== 'true-false' && optionsMcData.filter(opt => opt.text !== "").length < 2) { 
//             alert('Trắc nghiệm cần ít nhất 2 lựa chọn có nội dung.'); return null; 
//         }
//         if (typeCode === 'true-false') {
//             optionsMcData = [{text:"Đúng"}, {text:"Sai"}]; 
//         }
//         questionData.options_mc = optionsMcData; 

//         const correctAnsStr = AdminElements.correctAnswerMC.value.trim();
//          if (typeCode !== 'true-false' && !correctAnsStr) { alert('Nhập đáp án đúng.'); return null; }
        
//         if (typeCode === 'multiple-choice-single') {
//             const ansIndex = parseInt(correctAnsStr) - 1;
//             if (isNaN(ansIndex) || ansIndex < 0 || ansIndex >= optionsMcData.length) { alert('Đáp án (chọn 1) không hợp lệ.'); return null; }
//             questionData.correct_answer_mc_single = ansIndex;
//         } else if (typeCode === 'multiple-choice-multiple') {
//             questionData.correct_answers_mc_multiple = correctAnsStr.split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < optionsMcData.length).sort((a,b) => a-b);
//             if (questionData.correct_answers_mc_multiple.length === 0) { alert('Đáp án (chọn nhiều) không hợp lệ.'); return null; }
//         } else if (typeCode === 'true-false') {
//             questionData.correct_answer_mc_single = parseInt(AdminElements.correctAnswerTF.value);
//         }
//     } else if (typeCode === 'true-false-table') {
//         questionData.statements_tf_table = AdminElements.statementsAdminTFTable.value.trim().split('\n').map(s => s.trim()).filter(s => s !== "");
//         if (questionData.statements_tf_table.length === 0) { alert("Nhập ít nhất một khẳng định."); return null; }
//         questionData.correct_answers_tf_table = AdminElements.correctAnswersAdminTFTable.value.trim().split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && (n === 0 || n === 1));
//         if (questionData.statements_tf_table.length !== questionData.correct_answers_tf_table.length) { alert("Số lượng khẳng định và đáp án không khớp."); return null; }
//     } else if (typeCode === 'drag-drop-match') {
//         questionData.draggable_items_dd = AdminElements.draggableItems.value.trim().split('\n').map(s=>s.trim()).filter(s => s !== "");
//         questionData.drop_zone_labels_dd = AdminElements.dropZoneTargets.value.trim().split('\n').map(s=>s.trim()).filter(s => s !== "");
//         if (questionData.draggable_items_dd.length === 0 || questionData.draggable_items_dd.length !== questionData.drop_zone_labels_dd.length) { alert('Mục kéo và mục tiêu thả phải bằng nhau và không rỗng.'); return null; }
//     }
//     return questionData; 
// }


// async function saveOrUpdateQuestion() {
//     const questionObject = getQuestionPayloadAsObject();
//     if (!questionObject) return;

//     const editingId = AdminElements.editingQuestionIdInput.value;
//     let url = '/questions/';
//     let method = 'POST';
    
//     const formData = new FormData();
    
//     for (const key in questionObject) {
//         if (questionObject.hasOwnProperty(key)) {
//             if (['options_mc', 'correct_answers_mc_multiple', 'statements_tf_table', 'correct_answers_tf_table', 'draggable_items_dd', 'drop_zone_labels_dd'].includes(key)) {
//                 if (questionObject[key] !== null && questionObject[key] !== undefined) {
//                     formData.append(key, JSON.stringify(questionObject[key]));
//                 }
//             } else if (questionObject[key] !== null && questionObject[key] !== undefined) {
//                 formData.append(key, questionObject[key]);
//             }
//         }
//     }

//     const questionImageFile = AdminElements.questionImageInput.files[0];
//     if (questionImageFile) {
//         formData.append('question_image', questionImageFile);
//     } else if (editingId && AdminElements.questionImagePreview.src && !AdminElements.questionImagePreview.classList.contains('hidden') && AdminElements.questionImagePreview.src.startsWith(BASE_API_URL.split('/api')[0])) {
//         // Editing, existing server image, no new file. Backend should keep existing image.
//     } else if (editingId && (!AdminElements.questionImagePreview.src || AdminElements.questionImagePreview.src === '#' || AdminElements.questionImagePreview.classList.contains('hidden'))) {
//         // Editing, and image preview is empty/hidden (or placeholder), signal to clear.
//         formData.append('question_image', ''); // Backend needs to handle empty string to clear.
//     }


//     if (editingId) {
//         url = `/questions/${editingId}/`;
//         method = 'PUT'; 
//     }
    
//     try {
//         await fetchAPI(url, { method: method, body: formData }); 
//         alert(`Câu hỏi đã được ${editingId ? 'cập nhật' : 'lưu'} thành công!`);
//         cancelEditQuestion(); 
//         await renderQuestionListAdmin(); 
//     } catch (error) {
//         let detail = error.message;
//         alert(`Lỗi khi ${editingId ? 'cập nhật' : 'lưu'} câu hỏi: ${detail}`);
//         console.error("Full error object from saveOrUpdateQuestion:", error);
//     }
// }
        
// function resetAdminForm() { 
//     appState.editingQuestionId = null; 
//     AdminElements.editingQuestionIdInput.value = ''; 
//     AdminElements.formTitle.textContent = 'Thêm Câu hỏi Mới (Thủ công)';
//     AdminElements.saveOrUpdateBtn.textContent = 'Lưu Câu hỏi';
//     AdminElements.saveOrUpdateBtn.classList.replace('btn-blue', 'btn-green');
//     AdminElements.cancelEditBtn.classList.add('hidden');

//     AdminElements.questionText.value = ''; 
//     AdminElements.explanationText.value = ''; 
//     AdminElements.questionImageInput.value = ''; 
//     AdminElements.questionImagePreview.src = '#';
//     AdminElements.questionImagePreview.classList.add('hidden');

//     AdminElements.optionsContainer.innerHTML = ''; 
//     addOptionFieldAdmin(); addOptionFieldAdmin(); 
//     AdminElements.correctAnswerMC.value = ''; 
//     AdminElements.statementsAdminTFTable.value = ''; 
//     AdminElements.correctAnswersAdminTFTable.value = ''; 
//     AdminElements.draggableItems.value = ''; 
//     AdminElements.dropZoneTargets.value = ''; 
//     if(AdminElements.questionModule.options.length > 0) AdminElements.questionModule.selectedIndex = 0; 
//     if(AdminElements.questionType.options.length > 0) AdminElements.questionType.selectedIndex = 0; 
//     if(AdminElements.questionLevel && AdminElements.questionLevel.options.length > 0) AdminElements.questionLevel.selectedIndex = 0; 
//     toggleQuestionTypeFields(); 
//     AdminElements.uploadStatus.textContent = ''; 
// }

// async function populateFormForEdit(questionId) {
//     AdminElements.uploadStatus.textContent = "Đang tải dữ liệu câu hỏi để sửa...";
//     AdminElements.uploadStatus.className = "mt-3 text-sm text-blue-600";
//     let question;
//     try {
//         question = await fetchAPI(`/questions/${questionId}/`); 
//         if (!question) {
//             alert("Không tìm thấy câu hỏi để sửa hoặc có lỗi khi tải.");
//             AdminElements.uploadStatus.textContent = "Lỗi tải dữ liệu câu hỏi.";
//             AdminElements.uploadStatus.className = "mt-3 text-sm text-red-600";
//             return;
//         }
//     } catch (error) {
//          alert(`Lỗi khi tải dữ liệu câu hỏi: ${error.message}`);
//          AdminElements.uploadStatus.textContent = "Lỗi tải dữ liệu câu hỏi.";
//          AdminElements.uploadStatus.className = "mt-3 text-sm text-red-600";
//          return;
//     }
    
//     resetAdminForm(); 
//     appState.editingQuestionId = question.id; 
//     AdminElements.editingQuestionIdInput.value = question.id;
//     AdminElements.formTitle.textContent = `Sửa Câu hỏi #${question.id}`;
//     AdminElements.saveOrUpdateBtn.textContent = 'Cập nhật Câu hỏi';
//     AdminElements.saveOrUpdateBtn.classList.replace('btn-green', 'btn-blue');
//     AdminElements.cancelEditBtn.classList.remove('hidden');

//     AdminElements.questionModule.value = question.module; 
//     AdminElements.questionType.value = question.question_type; 
//     AdminElements.questionLevel.value = question.level || ""; 
//     toggleQuestionTypeFields(); 

//     AdminElements.questionText.value = question.question_text;
//     AdminElements.explanationText.value = question.explanation || '';

//     if (question.question_image) {
//         AdminElements.questionImagePreview.src = question.question_image; 
//         AdminElements.questionImagePreview.classList.remove('hidden');
//     } else {
//         AdminElements.questionImagePreview.src = '#';
//         AdminElements.questionImagePreview.classList.add('hidden');
//     }
//     AdminElements.questionImageInput.value = ''; 

//     const typeCode = question.question_type_code; 

//     if (typeCode === 'multiple-choice-single' || typeCode === 'multiple-choice-multiple') {
//         AdminElements.optionsContainer.innerHTML = ''; 
//         (question.options_mc || []).forEach(opt => {
//             const optText = typeof opt === 'string' ? opt : (opt.text || '');
//             const optImageUrl = typeof opt === 'object' ? opt.image_url : null;
//             addOptionFieldAdmin({text: optText, image_url: optImageUrl }); 
//         });
//         if (typeCode === 'multiple-choice-single') {
//             AdminElements.correctAnswerMC.value = question.correct_answer_mc_single !== null ? question.correct_answer_mc_single + 1 : '';
//         } else {
//             AdminElements.correctAnswerMC.value = (question.correct_answers_mc_multiple || []).map(idx => idx + 1).join(',');
//         }
//     } else if (typeCode === 'true-false') {
//         AdminElements.correctAnswerAdminTF.value = question.correct_answer_mc_single !== null ? String(question.correct_answer_mc_single) : '0';
//     } else if (typeCode === 'true-false-table') {
//         AdminElements.statementsAdminTFTable.value = (question.statements_tf_table || []).join('\n');
//         AdminElements.correctAnswersAdminTFTable.value = (question.correct_answers_tf_table || []).join(',');
//     } else if (typeCode === 'drag-drop-match') {
//         AdminElements.draggableItemsAdmin.value = (question.draggable_items_dd || []).join('\n');
//         AdminElements.dropZoneTargetsAdmin.value = (question.drop_zone_labels_dd || []).join('\n');
//     }
//     AdminElements.uploadStatus.textContent = ""; 
//     window.scrollTo({ top: AdminElements.formTitle.offsetTop - 20, behavior: 'smooth' });
// }
        
// function cancelEditQuestion() { resetAdminForm(); }
// async function renderQuestionListAdmin() { 
//     if (!AdminElements.questionList) { console.error("AdminElements.questionList is null"); return; }
//     AdminElements.questionList.innerHTML = '<p class="text-gray-500">Đang tải...</p>'; 
//     try { 
//         const questionsFromAPI = await fetchAPI('/questions/'); 
//         appState.questions = questionsFromAPI || []; 
//         AdminElements.questionList.innerHTML = ''; 
//         if (appState.questions.length === 0) { AdminElements.questionList.innerHTML = '<p class="text-gray-500">Chưa có câu hỏi nào.</p>'; return; } 
//         appState.questions.forEach((q, index) => { 
//             const item = document.createElement('div'); 
//             item.classList.add('p-3', 'bg-gray-100', 'rounded-md', 'shadow-sm', 'flex', 'justify-between', 'items-center'); 
//             let answerPreview = 'N/A'; 
//             const qTypeCode = q.question_type_code || (appState.questionTypes.find(qt => qt.id === q.question_type) || {}).type_code;
//             const qOptions = q.options_mc || [];

//             if (qTypeCode === 'multiple-choice-single' && q.correct_answer_mc_single !== null && qOptions[q.correct_answer_mc_single] !== undefined) {
//                 const opt = qOptions[q.correct_answer_mc_single]; 
//                 answerPreview = typeof opt === 'string' ? opt : opt.text; 
//             } else if (qTypeCode === 'multiple-choice-multiple' && Array.isArray(q.correct_answers_mc_multiple)) { 
//                 answerPreview = q.correct_answers_mc_multiple.map(i => { const opt = qOptions[i]; return (typeof opt === 'string' ? opt : opt?.text) || `Lựa chọn ${i+1} lỗi`; }).join(', '); 
//             } else if (qTypeCode === 'true-false' && q.correct_answer_mc_single !== null) { 
//                 answerPreview = q.correct_answer_mc_single === 0 ? "Đúng" : "Sai"; 
//             } else if (qTypeCode === 'true-false-table' && q.statements_tf_table) { 
//                 answerPreview = `${q.statements_tf_table.length} khẳng định`; 
//             } else if (qTypeCode === 'drag-drop-match' && q.draggable_items_dd) { 
//                 answerPreview = `Ghép nối ${q.draggable_items_dd.length} mục`; 
//             }
            
//             const levelText = q.level_info ? ` [Cấp ${q.level_info.level_number}]` : (q.level ? ` [Cấp ID: ${q.level}]` : '');

//             item.innerHTML = `
//                 <div class="flex-grow">
//                     <p class="font-medium text-sm">${index + 1}. [${q.module_name || 'N/A'}]${levelText} - [${q.question_type_code || 'N/A'}] ${q.question_text ? q.question_text.substring(0,50) : 'Lỗi'}...</p>
//                     <p class="text-xs text-gray-600">Đáp án xem trước: ${answerPreview}</p>
//                 </div>
//                 <div class="flex-shrink-0">
//                     <button onclick="populateFormForEdit(${q.id})" class="btn btn-blue btn-sm py-1 px-2 mr-1 text-xs">Sửa</button>
//                     <button onclick="deleteQuestion(${q.id})" class="btn btn-red btn-sm py-1 px-2 text-xs">Xóa</button>
//                 </div>
//             `; 
//             AdminElements.questionList.appendChild(item); 
//         }); 
//     } catch (error) { 
//         AdminElements.questionList.innerHTML = '<p class="text-red-500">Lỗi tải danh sách câu hỏi.</p>'; 
//         console.error("Error rendering question list:", error);
//     } 
// }
// async function deleteQuestion(id) { if (confirm('Xóa câu hỏi này?')) { try { await fetchAPI(`/questions/${id}/`, { method: 'DELETE' }); alert('Câu hỏi đã xóa.'); await renderQuestionListAdmin(); } catch (error) { alert(`Lỗi xóa câu hỏi: ${error.message}`); } } }

// function downloadExcelTemplate() {
//     console.log("Attempting to download Excel template...");
//     try {
//         const templateData = [
//             ["Module", "Level", "QuestionType", "QuestionText", "options", "CorrectAnswer", "DraggableItems", "DropZoneLabels", "Statements", "CorrectAnswers_Table", "Explanation"],
//             [
//                 "Computing Fundamentals",
//                 "1",
//                 "multiple-choice-single",
//                 "CPU là viết tắt của cụm từ tiếng Anh nào?",
//                 "Central Processing Unit|Computer Personal Unit|Central Power Unit", // Changed to pipe-separated
//                 "1",
//                 "",
//                 "",
//                 "",
//                 "",
//                 "CPU là viết tắt của Central Processing Unit."
//             ],
//             [
//                 "Key Applications",
//                 "Level 1",
//                 "true-false",
//                 "Microsoft Word là phần mềm chính để tạo bảng tính phức tạp.",
//                 "",
//                 "1",
//                 "",
//                 "",
//                 "",
//                 "",
//                 "Sai. Microsoft Excel mới là phần mềm chính cho bảng tính. (0-Đúng, 1-Sai)"
//             ],
//             [
//                 "Living Online",
//                 "2",
//                 "multiple-choice-multiple",
//                 "Những hành động nào sau đây giúp tăng cường an toàn khi trực tuyến?",
//                 "Sử dụng mật khẩu mạnh và duy nhất|Chia sẻ mật khẩu với bạn thân|Nhấp vào mọi liên kết trong email|Cập nhật phần mềm thường xuyên", // Changed to pipe-separated
//                 "1,4",
//                 "",
//                 "",
//                 "",
//                 "",
//                 "Sử dụng mật khẩu mạnh và cập nhật phần mềm là quan trọng."
//             ],
//             [
//                 "Key Applications",
//                 "Level 2",
//                 "true-false-table",
//                 "Đánh giá các nhận định sau về ứng dụng văn phòng:",
//                 "",
//                 "",
//                 "",
//                 "",
//                 "Microsoft Word chủ yếu dùng để soạn thảo văn bản.\nMicrosoft Excel chủ yếu dùng để tạo bài thuyết trình.\nMicrosoft PowerPoint chủ yếu dùng để quản lý email.",
//                 "0,1,1",
//                 "Word soạn thảo, Excel bảng tính, PowerPoint trình chiếu, Outlook quản lý email."
//             ],
//             [
//                 "Computing Fundamentals",
//                 "Level 3",
//                 "drag-drop-match",
//                 "Ghép nối các thành phần máy tính với vai trò của chúng:",
//                 "",
//                 "",
//                 "CPU\nRAM\nỔ cứng SSD",
//                 "Bộ xử lý trung tâm\nBộ nhớ truy cập ngẫu nhiên\nThiết bị lưu trữ nhanh",
//                 "",
//                 "",
//                 "Đây là các vai trò cơ bản của các thành phần."
//             ],
//             [
//                 "Digital Citizenship",
//                 "1",
//                 "multiple-choice-single",
//                 "Hành vi nào sau đây thể hiện ý thức công dân số tốt?",
//                 "Sao chép bài của người khác và nộp|Tôn trọng bản quyền và sở hữu trí tuệ|Bắt nạt trực tuyến", // Changed to pipe-separated
//                 "2",
//                 "",
//                 "",
//                 "",
//                 "",
//                 "Tôn trọng bản quyền là một phần quan trọng của công dân số."
//             ]
//         ];
//         const ws = XLSX.utils.aoa_to_sheet(templateData);
//         const wb = XLSX.utils.book_new();
//         XLSX.utils.book_append_sheet(wb, ws, "QuestionsTemplate");
//         XLSX.writeFile(wb, "IC3_Spark_Questions_Template_v3.xlsx");
//         console.log("Excel template download initiated via XLSX.writeFile.");
//     } catch (error) {
//         console.error("Error in downloadExcelTemplate:", error);
//         alert("Đã có lỗi xảy ra khi cố gắng tạo file Excel mẫu. Vui lòng kiểm tra console của trình duyệt (F12).");
//     }
// }

// function showWordTemplateGuidance() { const guidance = `Hướng dẫn File Word (NÊN DÙNG EXCEL):\n\n**Module:** Tên Module (vd: Computing Fundamentals)\n**Level:** Số cấp độ (vd: 1) hoặc Tên Cấp độ (vd: IC3 Level 1)\n**QuestionType:** Mã Loại (vd: multiple-choice-single)\n... (các trường khác tương tự file Excel mẫu)`; alert(guidance); }

// async function handleFileUpload() {
//     const file = AdminElements.fileUpload.files[0];
//     if (!file) {
//         AdminElements.uploadStatus.textContent = "Vui lòng chọn một file.";
//         AdminElements.uploadStatus.className = "mt-3 text-sm text-red-600";
//         return;
//     }

//     // Validate Excel headers
//     const reader = new FileReader();
//     reader.onload = async (e) => {
//         try {
//             const data = new Uint8Array(e.target.result);
//             const workbook = XLSX.read(data, { type: 'array' });
//             const sheet = workbook.Sheets[workbook.SheetNames[0]];
//             const headers = XLSX.utils.sheet_to_json(sheet, { header: 1 })[0].map(h => h ? h.toString().trim().toLowerCase() : '');
//             const requiredHeaders = ['module', 'level', 'questiontype', 'questiontext', 'options'];
//             const missingHeaders = requiredHeaders.filter(h => !headers.includes(h.toLowerCase()));
//             if (missingHeaders.length > 0) {
//                 AdminElements.uploadStatus.textContent = `File Excel thiếu các cột bắt buộc: ${missingHeaders.join(', ')}. Vui lòng sử dụng mẫu mới nhất.`;
//                 AdminElements.uploadStatus.className = "mt-3 text-sm text-red-600";
//                 return;
//             }

//             AdminElements.uploadStatus.textContent = "Đang tải lên và xử lý...";
//             AdminElements.uploadStatus.className = "mt-3 text-sm text-blue-600";
//             const formData = new FormData();
//             formData.append('file', file);
//             try {
//                 const response = await fetchAPI('/questions/upload/', { method: 'POST', body: formData });
//                 AdminElements.uploadStatus.textContent = response.message || "Xử lý file hoàn tất.";
//                 AdminElements.uploadStatus.className = `mt-3 text-sm ${response.errors && response.errors.length > 0 ? 'text-yellow-600' : 'text-green-600'}`;
//                 if (response.errors) {
//                     console.warn("Lỗi khi tải lên file:", response.errors);
//                     let errorDetails = response.errors.map(err => `Dòng ${err.row || 'không rõ'}: ${err.error}`).join('\n');
//                     AdminElements.uploadStatus.textContent += `\nLỗi chi tiết:\n${errorDetails}`;
//                 }
//                 await renderQuestionListAdmin();
//             } catch (error) {
//                 AdminElements.uploadStatus.textContent = `Lỗi khi tải lên file: ${error.message}`;
//                 AdminElements.uploadStatus.className = "mt-3 text-sm text-red-600";
//             } finally {
//                 AdminElements.fileUpload.value = '';
//             }
//         } catch (error) {
//             AdminElements.uploadStatus.textContent = `Lỗi khi đọc file Excel: ${error.message}`;
//             AdminElements.uploadStatus.className = "mt-3 text-sm text-red-600";
//         }
//     };
//     reader.readAsArrayBuffer(file);
// }

// // --- STUDENT TEST FUNCTIONALITY ---
// async function startTest(levelId, moduleId, moduleNameForDisplay, mode, savedTestId = null) { 
//     appState.currentTest.testTakerId = "User" + Date.now().toString().slice(-5);
//     const levelObject = levelId ? appState.levels.find(l=>l.id === levelId) : null;
//     const levelName = levelObject ? levelObject.level_name : (levelId ? `Cấp độ ${levelId}`: "Tất cả Cấp độ");
//     appState.currentTest.testTitleString = `IC3 Spark - ${levelName} - ${moduleNameForDisplay} (${mode === 'Testing' ? 'Thi thử' : 'Luyện tập'})`;
//     appState.currentTest.minPassingScoreRaw = 0.7; 
//     const timePerQuestion = 90; 
//     let testQuestions; 
    
//     if (savedTestId) { 
//         const savedState = appState.savedTests.find(t => t.id === savedTestId); 
//         if (!savedState) { alert("Không tìm thấy bài đã lưu!"); return; } 
//         appState.currentTest = { ...savedState }; 
//         appState.currentTest.startTime = Date.now() - (appState.currentTest.timeLimit * 1000 - appState.currentTest.remainingTime * 1000);
//         appState.savedTests = appState.savedTests.filter(t => t.id !== savedTestId); saveTestsToStorage(); 
//         testQuestions = appState.currentTest.questions; 
//     } else {
//         let allFetchedQuestions;
//         try {
//             let endpoint = '/questions/?';
//             if (levelId) endpoint += `level_id=${levelId}&`;
//             if (moduleId) endpoint += `module_id=${moduleId}&`; 

//             allFetchedQuestions = await fetchAPI(endpoint.endsWith('&') || endpoint.endsWith('?') ? endpoint.slice(0,-1) : endpoint); 
//             console.log(`[startTest] Fetching for Level: ${levelId}, Module: ${moduleId}. Endpoint: ${endpoint.slice(0,-1)}. Received:`, allFetchedQuestions);
            
//             if (!allFetchedQuestions || allFetchedQuestions.length === 0) { 
//                 alert(moduleId ? `Không có câu hỏi cho chủ đề "${moduleNameForDisplay}" ở cấp độ "${levelName}".` : (levelId ? `Không có câu hỏi nào cho cấp độ "${levelName}".` : "Không có câu hỏi nào trong cơ sở dữ liệu."));
//                 return; 
//             }
//         } catch (error) { 
//             alert(`Lỗi khi tải câu hỏi: ${error.message}`); 
//             return; 
//         }

//         if (moduleNameForDisplay === 'Tổng hợp') {
//             let shuffledQuestions = [...allFetchedQuestions].sort(() => 0.5 - Math.random());
//             testQuestions = shuffledQuestions.slice(0, 30); 
//             if (testQuestions.length === 0 && allFetchedQuestions.length > 0) {
//                 testQuestions = allFetchedQuestions.slice(0, Math.min(30, allFetchedQuestions.length));
//             }
//             if (testQuestions.length === 0) {
//                  alert(`Không có câu hỏi nào phù hợp cho bài thi tổng hợp (Cấp độ: ${levelName}) sau khi lọc ngẫu nhiên.`);
//                  return;
//             }
//             console.log(`[startTest] Chế độ Tổng hợp (Level ${levelId}): Đã chọn ${testQuestions.length} câu hỏi ngẫu nhiên.`);
//              if (testQuestions.length > 0) {
//                 const receivedLevels = new Set(testQuestions.map(q => q.level)); 
//                 console.log(`[startTest] Levels of selected questions for Comprehensive: ${Array.from(receivedLevels).join(', ')}`);
//             }

//         } else { 
//             testQuestions = allFetchedQuestions; 
//             console.log(`[startTest] Chế độ Module (Level ${levelId}, Module ${moduleId}): Số câu hỏi: ${testQuestions.length}.`);
//             if (testQuestions.length > 0) {
//                 const receivedLevels = new Set(testQuestions.map(q => q.level));
//                 console.log(`[startTest] Levels of selected questions for Module: ${Array.from(receivedLevels).join(', ')}`);
//             }
//         }
        
//         appState.currentTest.questions = testQuestions;
//         appState.currentTest.userAnswers = testQuestions.map(q => { 
//             const typeCode = q.question_type_code || (appState.questionTypes.find(qt => qt.id === q.question_type) || {}).type_code;
//             if (typeCode === 'drag-drop-match' && q.drop_zone_labels_dd) return new Array(q.drop_zone_labels_dd.length).fill(null);
//             if (typeCode === 'multiple-choice-multiple') return [];
//             if (typeCode === 'true-false-table' && q.statements_tf_table) return new Array(q.statements_tf_table.length).fill(null);
//             return null; 
//         });
//         appState.currentTest.currentQuestionIndex = 0; 
//         appState.currentTest.mode = mode; 
//         appState.currentTest.moduleName = moduleNameForDisplay; 
//         appState.currentTest.levelId = levelId; 
//         appState.currentTest.startTime = Date.now(); 
//         appState.currentTest.timeLimit = testQuestions.length * timePerQuestion; 
//         appState.currentTest.totalTimeAllowedForDisplay = formatTime(testQuestions.length * timePerQuestion); 
//         appState.currentTest.timerInterval = null; 
//         appState.currentTest.markedForReview = new Array(testQuestions.length).fill(false); 
//         appState.currentTest.remainingTime = testQuestions.length * timePerQuestion;
//         appState.currentTest.checkedInTraining = new Array(testQuestions.length).fill(false); 
//     } 
//     StudentElements.testTitle.textContent = `${levelName} - ${moduleNameForDisplay} (${mode === 'Testing' ? 'Thi thử' : 'Luyện tập'})`; 
//     StudentElements.testModeInfo.textContent = `Chế độ: ${mode === 'Training' ? 'Luyện tập' : 'Thi thử'}`; 
//     showView(Views.student); 
//     Views.levelSelectionStudent.classList.add('hidden'); 
//     Views.testSelection.classList.add('hidden'); 
//     Views.testTaking.classList.remove('hidden'); 
//     Views.results.classList.add('hidden'); 
//     StudentElements.explanationArea.classList.add('hidden'); 
//     displayCurrentQuestion(); 
//     updateQuestionNavigator(); 
//     startTimer(); 
// }
// // ... (Các hàm còn lại như displayCurrentQuestion, render..., selectAnswer..., showExplanation, ... submitTest, displayReview, ... được giữ nguyên từ phiên bản trước)
// function saveTestProgress() { if (!appState.currentTest.questions || appState.currentTest.questions.length === 0) { alert("Không có bài thi nào đang diễn ra."); return; } let currentRemainingTime = appState.currentTest.remainingTime; if (appState.currentTest.mode === 'Testing' && appState.currentTest.timerInterval) {} else { currentRemainingTime = appState.currentTest.timeLimit - (Date.now() - appState.currentTest.startTime) / 1000; } const testToSave = { ...appState.currentTest, id: Date.now(), remainingTime: Math.max(0, currentRemainingTime) }; delete testToSave.timerInterval; const existingIndex = appState.savedTests.findIndex(t => t.moduleName === testToSave.moduleName && t.mode === testToSave.mode && t.levelId === testToSave.levelId); if (existingIndex > -1) appState.savedTests[existingIndex] = testToSave; else appState.savedTests.push(testToSave); saveTestsToStorage(); alert("Bài làm đã lưu!"); if (appState.currentTest.timerInterval) clearInterval(appState.currentTest.timerInterval); showView(Views.student); Views.levelSelectionStudent.classList.remove('hidden'); Views.testSelection.classList.add('hidden'); Views.testTaking.classList.add('hidden'); }
// function renderSavedTestsStudent() { StudentElements.savedTestsList.innerHTML = ''; if (appState.savedTests.length === 0) { StudentElements.savedTestsList.innerHTML = '<p class="text-gray-500">Không có bài thi nào được lưu.</p>'; return; } appState.savedTests.forEach(savedTest => { const item = document.createElement('div'); item.classList.add('p-3', 'bg-blue-50', 'rounded-md', 'shadow-sm', 'flex', 'justify-between', 'items-center'); const mins = Math.floor(savedTest.remainingTime / 60); const secs = Math.floor(savedTest.remainingTime % 60); let answeredCount = 0; if (Array.isArray(savedTest.userAnswers)) answeredCount = savedTest.userAnswers.filter(ans => (Array.isArray(ans) ? ans.some(subAns => subAns !== null) : ans !== null)).length; const levelName = savedTest.levelId ? (appState.levels.find(l=>l.id === savedTest.levelId)?.level_name || `Cấp độ ${savedTest.levelId}`) : "Tổng quát"; item.innerHTML = `<div><p class="font-medium">${levelName} - ${savedTest.moduleName} (${savedTest.mode === 'Training' ? 'Luyện tập' : 'Thi thử'})</p><p class="text-xs text-gray-600">Đã làm ${answeredCount}/${savedTest.questions.length} câu. Thời gian còn lại: ${mins}:${secs < 10 ? '0':''}${secs}</p></div><div><button onclick="startTest(${savedTest.levelId}, ${null}, '${savedTest.moduleName}', '${savedTest.mode}', ${savedTest.id})" class="btn btn-green text-sm py-1 px-3 mr-2">Tiếp tục</button><button onclick="deleteSavedTest(${savedTest.id})" class="btn btn-red text-sm py-1 px-3">Xóa</button></div>`; StudentElements.savedTestsList.appendChild(item); }); }
// function deleteSavedTest(id) { if (confirm("Xóa bài thi đã lưu này?")) { appState.savedTests = appState.savedTests.filter(t => t.id !== id); saveTestsToStorage(); renderSavedTestsStudent(); } }
// function displayCurrentQuestion() { 
//     const qIndex = appState.currentTest.currentQuestionIndex; const question = appState.currentTest.questions[qIndex];
//     if (!question) { console.error("Câu hỏi không xác định tại index:", qIndex); return; }
//     StudentElements.currentQuestionNumber.textContent = qIndex + 1; StudentElements.totalQuestions.textContent = appState.currentTest.questions.length; StudentElements.questionTextDisplay.textContent = question.question_text;
//     if (question.question_image) { StudentElements.questionImageDisplay.src = question.question_image; StudentElements.questionImageDisplay.classList.remove('hidden'); } 
//     else { StudentElements.questionImageDisplay.classList.add('hidden'); StudentElements.questionImageDisplay.src = '#'; }
//     StudentElements.optionsArea.innerHTML = ''; StudentElements.dragDropArea.classList.add('hidden'); StudentElements.trueFalseTableArea.classList.add('hidden'); StudentElements.trueFalseTableArea.innerHTML = ''; StudentElements.optionsArea.classList.remove('hidden'); 
//     const questionTypeCode = question.question_type_code || (appState.questionTypes.find(qt => qt.id === question.question_type) || {}).type_code; 
//     switch (questionTypeCode) {
//         case 'multiple-choice-single': case 'true-false': 
//             (question.options_mc || []).forEach((optionData, index) => { const optionText = typeof optionData === 'string' ? optionData : optionData.text; const optionImageUrl = typeof optionData === 'object' && optionData.image_url ? optionData.image_url : null; const optionDiv = document.createElement('div'); optionDiv.classList.add('question-option'); let optionHTML = `<label for="opt-${qIndex}-${index}" class="student-option-content w-full h-full block cursor-pointer p-0 m-0"><input type="radio" name="mcOption-${qIndex}" id="opt-${qIndex}-${index}" value="${index}" class="mr-2 sr-only"> ${optionText}`; if (optionImageUrl) { optionHTML += `<img src="${optionImageUrl}" alt="Lựa chọn ${index + 1}" class="option-image-student">`; } optionHTML += `</label>`; optionDiv.innerHTML = optionHTML; optionDiv.onclick = (event) => { event.stopPropagation(); selectAnswer(index); }; if (appState.currentTest.userAnswers[qIndex] === index) { optionDiv.classList.add('selected'); const radioInput = optionDiv.querySelector('input'); if(radioInput) radioInput.checked = true; } StudentElements.optionsArea.appendChild(optionDiv); }); break;
//         case 'multiple-choice-multiple':
//             (question.options_mc || []).forEach((optionData, index) => { const optionText = typeof optionData === 'string' ? optionData : optionData.text; const optionImageUrl = typeof optionData === 'object' && optionData.image_url ? optionData.image_url : null; const optionDiv = document.createElement('div'); optionDiv.classList.add('question-option'); const isSelected = Array.isArray(appState.currentTest.userAnswers[qIndex]) && appState.currentTest.userAnswers[qIndex].includes(index); let optionHTML = `<label for="opt-m-${qIndex}-${index}" class="student-option-content w-full h-full block cursor-pointer p-0 m-0"><input type="checkbox" id="opt-m-${qIndex}-${index}" value="${index}" class="mr-2 sr-only" ${isSelected ? 'checked' : ''}> ${optionText}`; if (optionImageUrl) { optionHTML += `<img src="${optionImageUrl}" alt="Lựa chọn ${index + 1}" class="option-image-student">`; } optionHTML += `</label>`; optionDiv.innerHTML = optionHTML; optionDiv.onclick = (event) => { event.stopPropagation(); selectAnswer(index, true); }; if (isSelected) optionDiv.classList.add('selected'); StudentElements.optionsArea.appendChild(optionDiv); }); break;
//         case 'true-false-table': StudentElements.optionsArea.classList.add('hidden'); StudentElements.trueFalseTableArea.classList.remove('hidden'); renderTrueFalseTableQuestion(question, qIndex); break;
//         case 'drag-drop-match': StudentElements.optionsArea.classList.add('hidden'); StudentElements.dragDropArea.classList.remove('hidden'); renderDragDropQuestion(question, qIndex); break;
//         default: StudentElements.optionsArea.innerHTML = "<p class='text-red-500'>Lỗi: Loại câu hỏi không xác định.</p>";
//     }
//     StudentElements.prevBtn.disabled = qIndex === 0; StudentElements.nextBtn.disabled = qIndex === appState.currentTest.questions.length - 1;
//     const markReviewBtn = StudentElements.markReviewBtn; markReviewBtn.textContent = appState.currentTest.markedForReview[qIndex] ? 'Bỏ đánh dấu' : 'Đánh dấu xem lại'; markReviewBtn.classList.toggle('bg-yellow-600', appState.currentTest.markedForReview[qIndex]); markReviewBtn.classList.toggle('bg-yellow-400', !appState.currentTest.markedForReview[qIndex]);
//     if (appState.currentTest.mode === 'Training') { StudentElements.checkAnswerBtn.classList.remove('hidden'); StudentElements.checkAnswerBtn.disabled = appState.currentTest.checkedInTraining[qIndex] || false; } else { StudentElements.checkAnswerBtn.classList.add('hidden'); }
//     if (appState.currentTest.mode === 'Training' && appState.currentTest.checkedInTraining[qIndex]) { showExplanation(qIndex); } else { StudentElements.explanationArea.classList.add('hidden'); }
//     updateQuestionNavigatorSelection(); 
// }
// function renderTrueFalseTableQuestion(question, qIndex) { const table = document.createElement('table'); table.className = 'w-full border-collapse'; const tbody = document.createElement('tbody'); (question.statements_tf_table || []).forEach((statement, stmtIndex) => { const row = tbody.insertRow(); row.className = 'true-false-statement-row border-b border-gray-200'; const cellStatement = row.insertCell(); cellStatement.textContent = statement; cellStatement.className = 'py-2 pr-4 text-sm'; const cellTrue = row.insertCell(); cellTrue.className = 'py-2 px-2 text-center'; const radioTrue = document.createElement('input'); radioTrue.type = 'radio'; radioTrue.name = `tf-stmt-${qIndex}-${stmtIndex}`; radioTrue.value = '0'; radioTrue.className = 'form-radio h-4 w-4 text-blue-600'; radioTrue.onclick = () => selectAnswerForTFTable(qIndex, stmtIndex, 0); if (appState.currentTest.userAnswers[qIndex] && appState.currentTest.userAnswers[qIndex][stmtIndex] === 0) radioTrue.checked = true; const labelTrue = document.createElement('label'); labelTrue.className = 'ml-1 text-sm cursor-pointer'; labelTrue.textContent = 'Đúng'; labelTrue.prepend(radioTrue); cellTrue.appendChild(labelTrue); const cellFalse = row.insertCell(); cellFalse.className = 'py-2 px-2 text-center'; const radioFalse = document.createElement('input'); radioFalse.type = 'radio'; radioFalse.name = `tf-stmt-${qIndex}-${stmtIndex}`; radioFalse.value = '1'; radioFalse.className = 'form-radio h-4 w-4 text-blue-600'; radioFalse.onclick = () => selectAnswerForTFTable(qIndex, stmtIndex, 1); if (appState.currentTest.userAnswers[qIndex] && appState.currentTest.userAnswers[qIndex][stmtIndex] === 1) radioFalse.checked = true; const labelFalse = document.createElement('label'); labelFalse.className = 'ml-1 text-sm cursor-pointer'; labelFalse.textContent = 'Sai'; labelFalse.prepend(radioFalse); cellFalse.appendChild(labelFalse); }); table.appendChild(tbody); StudentElements.trueFalseTableArea.appendChild(table); }
// function renderDragDropQuestion(question, qIndex) { StudentElements.dragSourceContainer.innerHTML = ''; StudentElements.dropZoneContainer.innerHTML = ''; StudentElements.dragSourceContainer.ondrop = handleDropOnSourceContainer; StudentElements.dragSourceContainer.ondragover = handleDragOver; if (!question.draggable_items_dd || !question.drop_zone_labels_dd) { StudentElements.dropZoneContainer.innerHTML = "<p class='text-red-500'>Lỗi cấu hình kéo thả.</p>"; return; } const currentAnswersInZones = appState.currentTest.userAnswers[qIndex] || new Array(question.drop_zone_labels_dd.length).fill(null); question.draggable_items_dd.forEach((itemText, originalItemIndex) => { const dragDiv = document.createElement('div'); dragDiv.id = `drag-${qIndex}-${originalItemIndex}`; dragDiv.textContent = itemText; dragDiv.classList.add('drag-option-source'); dragDiv.dataset.originalItemIndex = originalItemIndex; dragDiv.dataset.isSourceItem = "true"; if (currentAnswersInZones.includes(originalItemIndex)) { dragDiv.draggable = false; } else { dragDiv.draggable = true; } dragDiv.addEventListener('dragstart', handleDragStart); StudentElements.dragSourceContainer.appendChild(dragDiv); }); question.drop_zone_labels_dd.forEach((label, zoneIndex) => { const dropDiv = document.createElement('div'); dropDiv.id = `dropzone-${qIndex}-${zoneIndex}`; dropDiv.classList.add('drop-zone-target'); dropDiv.dataset.zoneIndex = zoneIndex; const droppedItemOriginalIndex = currentAnswersInZones[zoneIndex]; if (droppedItemOriginalIndex !== null && droppedItemOriginalIndex !== undefined && question.draggable_items_dd[droppedItemOriginalIndex] !== undefined) { dropDiv.textContent = question.draggable_items_dd[droppedItemOriginalIndex]; dropDiv.classList.add('dropped', 'bg-indigo-200', 'text-indigo-800', 'border-solid'); dropDiv.classList.remove('text-gray-500', 'border-dashed'); dropDiv.draggable = true; dropDiv.dataset.originalItemIndex = droppedItemOriginalIndex; dropDiv.dataset.currentZoneIndex = zoneIndex; dropDiv.addEventListener('dragstart', handleDragStartFromZone); } else { dropDiv.textContent = label; dropDiv.draggable = false; } dropDiv.addEventListener('dragover', handleDragOver); dropDiv.addEventListener('dragleave', handleDragLeave); dropDiv.addEventListener('drop', handleDrop); StudentElements.dropZoneContainer.appendChild(dropDiv); }); }
// function checkCurrentAnswer() { const qIndex = appState.currentTest.currentQuestionIndex; if (appState.currentTest.mode === 'Training' && !appState.currentTest.checkedInTraining[qIndex]) { showExplanation(qIndex); appState.currentTest.checkedInTraining[qIndex] = true; StudentElements.checkAnswerBtn.disabled = true; updateQuestionNavigator(); } }
// function selectAnswerForTFTable(qIndex, stmtIndex, choice) { if (!appState.currentTest.userAnswers[qIndex] || !Array.isArray(appState.currentTest.userAnswers[qIndex])) { const numStatements = appState.currentTest.questions[qIndex].statements_tf_table.length; appState.currentTest.userAnswers[qIndex] = new Array(numStatements).fill(null); } appState.currentTest.userAnswers[qIndex][stmtIndex] = choice; const radioButtonsInRow = document.querySelectorAll(`input[name="tf-stmt-${qIndex}-${stmtIndex}"]`); radioButtonsInRow.forEach(rb => rb.checked = (parseInt(rb.value) === choice)); updateQuestionNavigator(); }
// function selectAnswer(optionIndex, isMultiple = false) { const qIndex = appState.currentTest.currentQuestionIndex; const question = appState.currentTest.questions[qIndex]; const questionTypeCode = question.question_type_code || (appState.questionTypes.find(qt => qt.id === question.question_type) || {}).type_code; if (questionTypeCode === 'true-false-table') return; if (isMultiple) { if (!Array.isArray(appState.currentTest.userAnswers[qIndex])) { appState.currentTest.userAnswers[qIndex] = []; } let currentAnswers = appState.currentTest.userAnswers[qIndex]; const itemIndexInAnswers = currentAnswers.indexOf(optionIndex); if (itemIndexInAnswers > -1) { currentAnswers.splice(itemIndexInAnswers, 1); } else { currentAnswers.push(optionIndex); } appState.currentTest.userAnswers[qIndex] = currentAnswers; } else { appState.currentTest.userAnswers[qIndex] = optionIndex; } const optionDivs = StudentElements.optionsArea.querySelectorAll('.question-option'); optionDivs.forEach((div, idx) => { const input = div.querySelector('input'); let isSelected = false; if (isMultiple) { isSelected = Array.isArray(appState.currentTest.userAnswers[qIndex]) && appState.currentTest.userAnswers[qIndex].includes(idx); } else { isSelected = (idx === optionIndex); } div.classList.toggle('selected', isSelected); if(input) input.checked = isSelected; }); updateQuestionNavigator(); }
// function showExplanation(qIndex) { const question = appState.currentTest.questions[qIndex]; const userAnswer = appState.currentTest.userAnswers[qIndex]; const questionTypeCode = question.question_type_code || (appState.questionTypes.find(qt => qt.id === question.question_type) || {}).type_code; StudentElements.explanationArea.classList.add('hidden'); if (!question || userAnswer === null || (Array.isArray(userAnswer) && userAnswer.length === 0 && questionTypeCode !== 'drag-drop-match' && questionTypeCode !== 'true-false-table') || (questionTypeCode === 'true-false-table' && (!Array.isArray(userAnswer) || userAnswer.some(ans => ans === null)) ) ) { if (questionTypeCode !== 'drag-drop-match' && questionTypeCode !== 'true-false-table') return; if(questionTypeCode === 'true-false-table' && (!Array.isArray(userAnswer) || userAnswer.some(ans => ans === null))) return; } if (question.explanation) { StudentElements.explanationTextDisplay.textContent = question.explanation; StudentElements.explanationArea.classList.remove('hidden'); } if (questionTypeCode.startsWith('multiple-choice') || questionTypeCode === 'true-false') { const optionDivs = StudentElements.optionsArea.querySelectorAll('.question-option'); optionDivs.forEach((div, idx) => { div.classList.remove('correct', 'incorrect'); div.onclick = null; let isCorrectOption = questionTypeCode === 'multiple-choice-multiple' ? (question.correct_answers_mc_multiple || []).includes(idx) : (idx === question.correct_answer_mc_single); let isUserSelectedOption = questionTypeCode === 'multiple-choice-multiple' ? (userAnswer || []).includes(idx) : (idx === userAnswer); if (isCorrectOption) div.classList.add('correct'); else if (isUserSelectedOption && !isCorrectOption) div.classList.add('incorrect'); }); } else if (questionTypeCode === 'true-false-table') { const tableRows = StudentElements.trueFalseTableArea.querySelectorAll('.true-false-statement-row'); tableRows.forEach((row, stmtIndex) => { const userChoice = userAnswer[stmtIndex]; const correctChoice = question.correct_answers_tf_table[stmtIndex]; const cells = row.querySelectorAll('td'); const trueCell = cells[1]; const falseCell = cells[2]; trueCell.classList.remove('correct-cell', 'incorrect-cell'); falseCell.classList.remove('correct-cell', 'incorrect-cell'); trueCell.querySelectorAll('input').forEach(rb => rb.disabled = true); falseCell.querySelectorAll('input').forEach(rb => rb.disabled = true); if (userChoice === correctChoice) { if (correctChoice === 0) trueCell.classList.add('correct-cell'); else falseCell.classList.add('correct-cell'); } else { if (userChoice === 0) trueCell.classList.add('incorrect-cell'); else if (userChoice === 1) falseCell.classList.add('incorrect-cell'); if (correctChoice === 0) trueCell.classList.add('correct-cell'); else falseCell.classList.add('correct-cell'); } }); } else if (questionTypeCode === 'drag-drop-match') { const dropZones = StudentElements.dropZoneContainer.querySelectorAll('.drop-zone-target'); dropZones.forEach((zone, zoneIdx) => { zone.classList.remove('correct', 'incorrect'); const droppedItemOriginalIndex = userAnswer[zoneIdx]; const correctMapping = question.draggable_items_dd.map((_,i)=>i); const isZoneCorrect = (droppedItemOriginalIndex === correctMapping[zoneIdx]); if (droppedItemOriginalIndex !== null && droppedItemOriginalIndex !== undefined) { if (isZoneCorrect) zone.classList.add('correct'); else zone.classList.add('incorrect'); } zone.removeEventListener('dragover', handleDragOver); zone.removeEventListener('drop', handleDrop); zone.draggable = false; }); StudentElements.dragSourceContainer.querySelectorAll('.drag-option-source').forEach(s => s.draggable = false); } }
// function nextQuestion() { if (appState.currentTest.currentQuestionIndex < appState.currentTest.questions.length - 1) { appState.currentTest.currentQuestionIndex++; displayCurrentQuestion(); } }
// function prevQuestion() { if (appState.currentTest.currentQuestionIndex > 0) { appState.currentTest.currentQuestionIndex--; displayCurrentQuestion(); } }
// function markForReview() { const qIndex = appState.currentTest.currentQuestionIndex; appState.currentTest.markedForReview[qIndex] = !appState.currentTest.markedForReview[qIndex]; displayCurrentQuestion(); updateQuestionNavigator(); }
// function updateQuestionNavigator() { const navigator = StudentElements.questionNavigator; navigator.innerHTML = ''; appState.currentTest.questions.forEach((q, index) => { const btn = document.createElement('button'); btn.textContent = index + 1; btn.id = `nav-q-${index}`; btn.classList.add('p-2', 'border', 'rounded', 'text-sm', 'transition-colors', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-300'); let isAnswered = false; const currentAnswer = appState.currentTest.userAnswers[index]; const questionTypeCode = q.question_type_code || (appState.questionTypes.find(qt => qt.id === q.question_type) || {}).type_code; if (questionTypeCode === 'multiple-choice-multiple') isAnswered = Array.isArray(currentAnswer) && currentAnswer.length > 0; else if (questionTypeCode === 'drag-drop-match' || questionTypeCode === 'true-false-table') isAnswered = Array.isArray(currentAnswer) && currentAnswer.some(val => val !== null && val !== undefined); else isAnswered = currentAnswer !== null; if (index === appState.currentTest.currentQuestionIndex) btn.classList.add('bg-blue-500', 'text-white', 'border-blue-700'); else if (isAnswered) { if (appState.currentTest.mode === 'Training' && appState.currentTest.checkedInTraining[index]) { let isCorrect = false; const userAnswer = appState.currentTest.userAnswers[index]; const question = appState.currentTest.questions[index]; switch (questionTypeCode) { case 'multiple-choice-single': case 'true-false': isCorrect = userAnswer === question.correct_answer_mc_single; break; case 'multiple-choice-multiple': if(Array.isArray(userAnswer) && Array.isArray(question.correct_answers_mc_multiple)) isCorrect = userAnswer.length === question.correct_answers_mc_multiple.length && userAnswer.every(val => question.correct_answers_mc_multiple.includes(val)); break; case 'true-false-table': if(Array.isArray(userAnswer) && Array.isArray(question.correct_answers_tf_table)) isCorrect = userAnswer.every((val, i) => val === question.correct_answers_tf_table[i]) && userAnswer.length === question.correct_answers_tf_table.length && !userAnswer.some(ans => ans === null); break; case 'drag-drop-match': if(Array.isArray(userAnswer) && Array.isArray(question.draggable_items_dd)) { const correctMapping = question.draggable_items_dd.map((_,i)=>i); isCorrect = userAnswer.every((val, idx) => val === correctMapping[idx]); } break; } btn.classList.add(isCorrect ? 'bg-green-300' : 'bg-red-300'); } else btn.classList.add('bg-gray-300'); } else btn.classList.add('bg-white', 'hover:bg-gray-100'); if (appState.currentTest.markedForReview[index]) btn.classList.add('border-yellow-500', 'border-2'); else btn.classList.remove('border-yellow-500', 'border-2'); btn.onclick = () => { appState.currentTest.currentQuestionIndex = index; displayCurrentQuestion(); }; navigator.appendChild(btn); }); }
// function updateQuestionNavigatorSelection() { updateQuestionNavigator(); }
// function handleDragStart(e) { draggedItemElement = e.target; draggedItemData = { id: draggedItemElement.id, originalItemIndex: parseInt(draggedItemElement.dataset.originalItemIndex), sourceType: 'sourceList', textContent: draggedItemElement.textContent }; e.dataTransfer.setData('text/plain', draggedItemElement.id); e.dataTransfer.effectAllowed = 'move'; setTimeout(() => { if(draggedItemElement) draggedItemElement.classList.add('dragging'); }, 0); }
// function handleDragStartFromZone(e) { draggedItemElement = e.target; draggedItemData = { id: draggedItemElement.id, originalItemIndex: parseInt(draggedItemElement.dataset.originalItemIndex), sourceType: 'zone', sourceZoneIndex: parseInt(draggedItemElement.dataset.currentZoneIndex), textContent: draggedItemElement.textContent }; e.dataTransfer.setData('text/plain', draggedItemElement.id); e.dataTransfer.effectAllowed = 'move'; setTimeout(() => { if(draggedItemElement) draggedItemElement.classList.add('dragging'); }, 0); }
// function handleDragOver(e) { e.preventDefault(); const targetZone = e.target.closest('.drop-zone-target, #dragSourceContainer'); if (targetZone) targetZone.classList.add('over'); }
// function handleDragLeave(e) { const targetZone = e.target.closest('.drop-zone-target, #dragSourceContainer'); if (targetZone) targetZone.classList.remove('over'); }
// function handleDropOnSourceContainer(e) { e.preventDefault(); StudentElements.dragSourceContainer.classList.remove('over'); if (draggedItemData.sourceType === 'zone') { const qIndex = appState.currentTest.currentQuestionIndex; const sourceZoneIndex = draggedItemData.sourceZoneIndex; const originalItemIndexToReactivate = draggedItemData.originalItemIndex; appState.currentTest.userAnswers[qIndex][sourceZoneIndex] = null; const sourceDropZoneElement = document.getElementById(`dropzone-${qIndex}-${sourceZoneIndex}`); if (sourceDropZoneElement) { sourceDropZoneElement.textContent = appState.currentTest.questions[qIndex].drop_zone_labels_dd[sourceZoneIndex]; sourceDropZoneElement.classList.remove('dropped', 'bg-indigo-200', 'text-indigo-800', 'border-solid'); sourceDropZoneElement.classList.add('text-gray-500', 'border-dashed'); sourceDropZoneElement.draggable = false; delete sourceDropZoneElement.dataset.originalItemIndex; delete sourceDropZoneElement.dataset.currentZoneIndex; sourceDropZoneElement.removeEventListener('dragstart', handleDragStartFromZone); } const sourceListItem = document.getElementById(`drag-${qIndex}-${originalItemIndexToReactivate}`); if (sourceListItem) { sourceListItem.style.opacity = '1'; sourceListItem.draggable = true; } } if (draggedItemElement) draggedItemElement.classList.remove('dragging'); draggedItemElement = null; draggedItemData = {}; updateQuestionNavigator(); }
// function handleDrop(e) { e.preventDefault(); const targetDropZone = e.target.closest('.drop-zone-target'); if (!targetDropZone) { if (draggedItemElement) draggedItemElement.classList.remove('dragging'); draggedItemElement = null; draggedItemData = {}; return; } targetDropZone.classList.remove('over'); const qIndex = appState.currentTest.currentQuestionIndex; const question = appState.currentTest.questions[qIndex]; const targetZoneIndex = parseInt(targetDropZone.dataset.zoneIndex); const draggedOriginalItemIndex = draggedItemData.originalItemIndex; const sourceType = draggedItemData.sourceType; const sourceZoneIndexIfFromZone = draggedItemData.sourceZoneIndex; if (sourceType === 'zone' && sourceZoneIndexIfFromZone === targetZoneIndex) { if (draggedItemElement) draggedItemElement.classList.remove('dragging'); draggedItemElement = null; draggedItemData = {}; return; } const itemPreviouslyInTargetZoneOriginalIndex = appState.currentTest.userAnswers[qIndex][targetZoneIndex]; if (itemPreviouslyInTargetZoneOriginalIndex !== null && itemPreviouslyInTargetZoneOriginalIndex !== undefined && itemPreviouslyInTargetZoneOriginalIndex !== draggedOriginalItemIndex) { const prevSourceItemElement = document.getElementById(`drag-${qIndex}-${itemPreviouslyInTargetZoneOriginalIndex}`); if (prevSourceItemElement) { prevSourceItemElement.style.opacity = '1'; prevSourceItemElement.draggable = true; } } if (sourceType === 'zone' && sourceZoneIndexIfFromZone !== null && sourceZoneIndexIfFromZone !== targetZoneIndex) { appState.currentTest.userAnswers[qIndex][sourceZoneIndexIfFromZone] = null; const sourceDropZoneElement = document.getElementById(`dropzone-${qIndex}-${sourceZoneIndexIfFromZone}`); if (sourceDropZoneElement) { sourceDropZoneElement.textContent = question.drop_zone_labels_dd[sourceZoneIndexIfFromZone]; sourceDropZoneElement.classList.remove('dropped', 'bg-indigo-200', 'text-indigo-800', 'border-solid'); sourceDropZoneElement.classList.add('text-gray-500', 'border-dashed'); sourceDropZoneElement.draggable = false; delete sourceDropZoneElement.dataset.originalItemIndex; delete sourceDropZoneElement.dataset.currentZoneIndex; sourceDropZoneElement.removeEventListener('dragstart', handleDragStartFromZone); } } targetDropZone.textContent = question.draggable_items_dd[draggedOriginalItemIndex]; targetDropZone.classList.add('dropped', 'bg-indigo-200', 'text-indigo-800', 'border-solid'); targetDropZone.classList.remove('text-gray-500', 'border-dashed'); targetDropZone.draggable = true; targetDropZone.dataset.originalItemIndex = draggedOriginalItemIndex; targetDropZone.dataset.currentZoneIndex = targetZoneIndex; targetDropZone.removeEventListener('dragstart', handleDragStartFromZone); targetDropZone.addEventListener('dragstart', handleDragStartFromZone); appState.currentTest.userAnswers[qIndex][targetZoneIndex] = draggedOriginalItemIndex; const sourceListItem = document.getElementById(`drag-${qIndex}-${draggedOriginalItemIndex}`); if (sourceListItem) { sourceListItem.style.opacity = '0.3'; sourceListItem.draggable = false; } if (draggedItemElement) draggedItemElement.classList.remove('dragging'); draggedItemElement = null; draggedItemData = {}; updateQuestionNavigator(); }
// function startTimer() { const timerDisplay = StudentElements.timer; if (appState.currentTest.timerInterval) clearInterval(appState.currentTest.timerInterval); let timeLeft = appState.currentTest.remainingTime !== undefined ? appState.currentTest.remainingTime : appState.currentTest.timeLimit; function updateDisplay() { const minutes = Math.floor(timeLeft / 60); const seconds = Math.floor(timeLeft % 60); timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; } updateDisplay(); if (appState.currentTest.mode === 'Testing') { timerDisplay.classList.remove('hidden'); appState.currentTest.timerInterval = setInterval(() => { timeLeft--; appState.currentTest.remainingTime = timeLeft; updateDisplay(); if (timeLeft <= 0) { clearInterval(appState.currentTest.timerInterval); appState.currentTest.timerInterval = null; alert('Hết giờ làm bài!'); submitTest(); } }, 1000); } else { timerDisplay.textContent = "Không giới hạn"; } }
// function confirmEndTest() { Views.confirmEndTestModal.classList.remove('hidden'); }
// function closeConfirmEndTestModal() { Views.confirmEndTestModal.classList.add('hidden'); }
// function formatTime(totalSeconds) { if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00:00"; const hours = Math.floor(totalSeconds / 3600); const minutes = Math.floor((totalSeconds % 3600) / 60); const seconds = Math.floor(totalSeconds % 60); return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; }
// function submitTest() { closeConfirmEndTestModal(); if (appState.currentTest.timerInterval) { clearInterval(appState.currentTest.timerInterval); appState.currentTest.timerInterval = null; } appState.currentTest.endTime = new Date(); let score = 0; const moduleScores = {}; const moduleTotals = {}; appState.currentTest.questions.forEach(q => { const moduleKey = q.module_name || (appState.modules.find(m => m.id === q.module) || {}).module_name || "Không xác định"; if (!moduleScores[moduleKey]) { moduleScores[moduleKey] = 0; moduleTotals[moduleKey] = 0; } moduleTotals[moduleKey]++; }); try { appState.currentTest.questions.forEach((q, index) => { const userAnswer = appState.currentTest.userAnswers[index]; let isCorrect = false; const questionTypeCode = q.question_type_code || (appState.questionTypes.find(qt => qt.id === q.question_type) || {}).type_code; const moduleKey = q.module_name || (appState.modules.find(m => m.id === q.module) || {}).module_name || "Không xác định"; switch (questionTypeCode) { case 'multiple-choice-single': case 'true-false': isCorrect = userAnswer === q.correct_answer_mc_single; break; case 'multiple-choice-multiple': if (Array.isArray(userAnswer) && Array.isArray(q.correct_answers_mc_multiple)) { const sortedUser = [...userAnswer].sort((a,b)=>a-b); const sortedCorrect = [...q.correct_answers_mc_multiple].sort((a,b)=>a-b); isCorrect = sortedUser.length === sortedCorrect.length && sortedUser.every((val, i) => val === sortedCorrect[i]); } else isCorrect = false; break; case 'true-false-table': if (Array.isArray(userAnswer) && Array.isArray(q.correct_answers_tf_table) && q.statements_tf_table && userAnswer.length === q.statements_tf_table.length && q.correct_answers_tf_table.length === q.statements_tf_table.length) { isCorrect = userAnswer.every((ans, i) => ans === q.correct_answers_tf_table[i] && ans !== null); } else isCorrect = false; break; case 'drag-drop-match': if (Array.isArray(userAnswer) && Array.isArray(q.draggable_items_dd) && q.drop_zone_labels_dd) { const correctMapping = q.draggable_items_dd.map((_,i)=>i); isCorrect = userAnswer.every((droppedItemOriginalIndex, dropZoneIdx) => droppedItemOriginalIndex !== null && droppedItemOriginalIndex === correctMapping[dropZoneIdx]); if (isCorrect && userAnswer.length !== q.drop_zone_labels_dd.length) isCorrect = false; if (isCorrect && userAnswer.some(ans => ans === null)) isCorrect = false; } else isCorrect = false; break; } if (isCorrect) { score++; moduleScores[moduleKey]++; } }); } catch (error) { console.error("Lỗi tính điểm:", error); alert("Lỗi tính điểm. Kiểm tra console."); return; } appState.currentTest.calculatedModuleScores = moduleScores; appState.currentTest.calculatedModuleTotals = moduleTotals; const totalQ = appState.currentTest.questions.length; const percentage = totalQ > 0 ? (score / totalQ) * 100 : 0; const passed = percentage >= (appState.currentTest.minPassingScoreRaw * 100); StudentElements.resultViewTestTakerId.textContent = appState.currentTest.testTakerId; StudentElements.resultViewTestTitle.textContent = appState.currentTest.testTitleString; StudentElements.resultViewCategory.textContent = "IC3 GS6 Spark"; const timeUsedSeconds = Math.floor((appState.currentTest.endTime - appState.currentTest.startTime) / 1000); StudentElements.resultViewTimeUsed.textContent = formatTime(timeUsedSeconds); StudentElements.resultViewTotalTimeAllowed.textContent = appState.currentTest.totalTimeAllowedForDisplay; StudentElements.resultViewProduct.textContent = appState.currentTest.moduleName === "Tổng hợp" ? "Spark Level 1 (Tổng hợp)" : `Spark Level 1 (${appState.currentTest.moduleName})`; StudentElements.resultViewScore.textContent = `${score}/${totalQ}`; StudentElements.resultViewMode.textContent = appState.currentTest.mode === "Testing" ? "Testing" : "Training"; const minPassingQuestions = Math.ceil(appState.currentTest.minPassingScoreRaw * totalQ); StudentElements.resultViewMinPassingScore.textContent = `${minPassingQuestions}/${totalQ} (${appState.currentTest.minPassingScoreRaw * 100}%)`; StudentElements.resultViewDateFinished.textContent = appState.currentTest.endTime.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); StudentElements.resultViewPlaceholderId.textContent = `ID Bài thi: ${Date.now().toString().slice(-6)}`; StudentElements.resultViewOverallStatus.textContent = passed ? "ĐẠT" : "TRƯỢT"; StudentElements.resultViewOverallStatus.className = `text-2xl font-semibold ${passed ? 'text-green-600' : 'text-red-600'}`; StudentElements.resultViewMotivationalMessage.textContent = passed ? "Chúc mừng bạn!" : "Đừng bỏ cuộc, hãy cố gắng hơn nhé!"; try { displayReview(); } catch (error) { console.error("Lỗi hiển thị xem lại:", error); alert("Lỗi hiển thị xem lại. Kiểm tra console."); } showView(Views.student); Views.testTaking.classList.add('hidden'); Views.results.classList.remove('hidden'); }
// function displayReview() { StudentElements.resultViewBreakdown.innerHTML = ''; const moduleScores = appState.currentTest.calculatedModuleScores; const moduleTotals = appState.currentTest.calculatedModuleTotals; const modulesInThisTest = Object.keys(moduleTotals).sort(); if (modulesInThisTest.length === 0 && appState.currentTest.questions.length > 0) { const noBreakdownItem = document.createElement('div'); noBreakdownItem.className = 'breakdown-item text-sm text-gray-500'; noBreakdownItem.textContent = 'Không có phân tích điểm theo chủ đề cho bài thi này.'; StudentElements.resultViewBreakdown.appendChild(noBreakdownItem); } else if (appState.currentTest.questions.length === 0) { const noBreakdownItem = document.createElement('div'); noBreakdownItem.className = 'breakdown-item text-sm text-gray-500'; noBreakdownItem.textContent = 'Không có câu hỏi nào trong bài thi này để phân tích.'; StudentElements.resultViewBreakdown.appendChild(noBreakdownItem); } for (const moduleName of modulesInThisTest) { if (moduleTotals.hasOwnProperty(moduleName)) { const correct = moduleScores[moduleName] || 0; const totalInTestForModule = moduleTotals[moduleName]; const percentage = totalInTestForModule > 0 ? ((correct / totalInTestForModule) * 100).toFixed(0) : 0; const breakdownItem = document.createElement('div'); breakdownItem.className = 'breakdown-item text-sm'; breakdownItem.innerHTML = `<span>${moduleName}</span><span class="font-medium">${correct}/${totalInTestForModule} (${percentage}%)</span>`; StudentElements.resultViewBreakdown.appendChild(breakdownItem); } } StudentElements.resultViewQuestionReviewList.innerHTML = ''; try { appState.currentTest.questions.forEach((q, index) => { const reviewItem = document.createElement('div'); reviewItem.className = 'question-review-item'; const userAnswer = appState.currentTest.userAnswers[index]; let isCorrectOverall = false; let userAnswerDisplay = 'Chưa trả lời'; let correctAnswerDisplay = 'N/A'; const questionTypeCode = q.question_type_code || (appState.questionTypes.find(qt => qt.id === q.question_type) || {}).type_code; const moduleName = q.module_name || (appState.modules.find(m => m.id === q.module) || {}).module_name || "N/A"; switch (questionTypeCode) { case 'multiple-choice-single': case 'true-false': isCorrectOverall = userAnswer === q.correct_answer_mc_single; userAnswerDisplay = (userAnswer !== null && q.options_mc && q.options_mc[userAnswer] !== undefined) ? (typeof q.options_mc[userAnswer] === 'string' ? q.options_mc[userAnswer] : q.options_mc[userAnswer].text) : (userAnswer !== null ? "Lựa chọn không hợp lệ" : "Chưa trả lời"); correctAnswerDisplay = (q.options_mc && q.options_mc[q.correct_answer_mc_single] !== undefined) ? (typeof q.options_mc[q.correct_answer_mc_single] === 'string' ? q.options_mc[q.correct_answer_mc_single] : q.options_mc[q.correct_answer_mc_single].text) : "Đáp án không hợp lệ"; break; case 'multiple-choice-multiple': if (Array.isArray(userAnswer) && Array.isArray(q.correct_answers_mc_multiple) && q.options_mc) { const sortedUser = [...userAnswer].sort((a,b)=>a-b); const sortedCorrect = [...q.correct_answers_mc_multiple].sort((a,b)=>a-b); isCorrectOverall = sortedUser.length === sortedCorrect.length && sortedUser.every((val, i) => val === sortedCorrect[i]); userAnswerDisplay = sortedUser.map(i => { const opt = q.options_mc[i]; return (typeof opt === 'string' ? opt : opt?.text) || `Lựa chọn ${i} lỗi`; }).join(', ') || (userAnswer.length > 0 ? "Lựa chọn không hợp lệ" : 'Chưa trả lời'); correctAnswerDisplay = sortedCorrect.map(i => { const opt = q.options_mc[i]; return (typeof opt === 'string' ? opt : opt?.text) || `Đáp án ${i} lỗi`; }).join(', '); } else { userAnswerDisplay = (Array.isArray(userAnswer) && userAnswer.length > 0) ? userAnswer.map(i => `ID: ${i}`).join(', ') : 'Chưa trả lời'; correctAnswerDisplay = Array.isArray(q.correct_answers_mc_multiple) ? q.correct_answers_mc_multiple.map(i => `ID: ${i}`).join(', ') : 'Không có đáp án đúng'; } break; case 'true-false-table': userAnswerDisplay = '<table class="w-full text-sm mt-1 table-fixed">'; correctAnswerDisplay = ''; let allStmtsCorrectInTable = true; if (Array.isArray(userAnswer) && Array.isArray(q.correct_answers_tf_table) && Array.isArray(q.statements_tf_table) && userAnswer.length === q.statements_tf_table.length) { q.statements_tf_table.forEach((stmt, stmtIdx) => { const userAnsForStmt = userAnswer[stmtIdx]; const correctAnsForStmt = q.correct_answers_tf_table[stmtIdx]; const stmtCorrect = userAnsForStmt === correctAnsForStmt && userAnsForStmt !== null; if (!stmtCorrect && userAnsForStmt !== null) allStmtsCorrectInTable = false; else if (userAnsForStmt === null) allStmtsCorrectInTable = false; userAnswerDisplay += `<tr class="border-b last:border-b-0 ${userAnsForStmt === null ? '' : (stmtCorrect ? 'bg-green-50' : 'bg-red-50')}"><td class="py-1 pr-2 truncate" title="${stmt}">${stmtIdx + 1}. ${stmt}</td><td class="px-2 py-1 text-center w-20">${userAnsForStmt === 0 ? "Đúng" : (userAnsForStmt === 1 ? "Sai" : "-")}</td><td class="px-2 py-1 text-center w-20 font-semibold ${stmtCorrect && userAnsForStmt !== null ? 'text-green-700' : (userAnsForStmt !== null ? 'text-red-700' : '')}">${correctAnsForStmt === 0 ? "Đúng" : "Sai"}</td></tr>`; }); } else { userAnswerDisplay += '<tr><td>Lỗi dữ liệu trả lời cho bảng.</td></tr>'; allStmtsCorrectInTable = false; } userAnswerDisplay += '</table>'; isCorrectOverall = allStmtsCorrectInTable && (Array.isArray(userAnswer) && userAnswer.length === q.statements_tf_table.length && !userAnswer.some(ans => ans === null)); break; case 'drag-drop-match': if (Array.isArray(userAnswer) && Array.isArray(q.draggable_items_dd) && q.drop_zone_labels_dd) { const correctMapping = q.draggable_items_dd.map((_,i)=>i); isCorrectOverall = userAnswer.every((droppedItemOriginalIndex, dropZoneIdx) => droppedItemOriginalIndex !== null && droppedItemOriginalIndex === correctMapping[dropZoneIdx]) && userAnswer.length === q.drop_zone_labels_dd.length && !userAnswer.some(ans => ans === null); userAnswerDisplay = '<ul class="list-disc list-inside text-xs">'; q.drop_zone_labels_dd.forEach((label, dzIdx) => { const droppedItemOriginalIndex = userAnswer[dzIdx]; userAnswerDisplay += `<li>${label}: ${droppedItemOriginalIndex !== null && droppedItemOriginalIndex !== undefined && q.draggable_items_dd[droppedItemOriginalIndex] ? q.draggable_items_dd[droppedItemOriginalIndex] : '<em>Trống</em>'}</li>`; }); userAnswerDisplay += '</ul>'; correctAnswerDisplay = '<ul class="list-disc list-inside text-xs">'; q.drop_zone_labels_dd.forEach((label, dzIdx) => { const correctDraggableItemOriginalIndex = correctMapping[dzIdx]; correctAnswerDisplay += `<li>${label}: ${q.draggable_items_dd[correctDraggableItemOriginalIndex] || "Mục lỗi"}</li>`; }); correctAnswerDisplay += '</ul>'; } else { userAnswerDisplay = 'Dữ liệu trả lời không hợp lệ.'; correctAnswerDisplay = 'Không thể hiển thị đáp án đúng.'; } break; } const statusIcon = isCorrectOverall ? '<span class="status-icon correct"></span>' : '<span class="status-icon incorrect"></span>'; reviewItem.innerHTML = `<div class="flex items-start text-sm">${statusIcon}<span class="font-medium mr-2">${index + 1}.</span><span class="flex-1">${q.question_text || "Lỗi nội dung"} (${moduleName})</span></div>${q.question_image ? `<img src="${q.question_image}" alt="Hình ảnh câu hỏi" class="review-question-image ml-8">` : ''}${questionTypeCode !== 'true-false-table' ? `<div class="pl-8 mt-1 text-xs"><p>Lựa chọn của bạn: <span class="font-medium review-answer ${isCorrectOverall ? 'correct' : 'incorrect'}">${userAnswerDisplay}</span></p><p>Đáp án đúng: <span class="font-medium">${correctAnswerDisplay}</span></p></div>` : `<div class="pl-8 mt-1 text-xs">${userAnswerDisplay}</div>`}${q.explanation ? `<p class="pl-8 mt-1 text-xs text-gray-600"><em>Giải thích: ${q.explanation}</em></p>` : ''}`; StudentElements.resultViewQuestionReviewList.appendChild(reviewItem); }); } catch (error) { console.error("Lỗi trong displayReview loop:", error); StudentElements.resultViewQuestionReviewList.innerHTML = '<p class="text-red-500">Lỗi hiển thị xem lại. Kiểm tra console.</p>'; } }
//         function backToTestSelection() { showView(Views.student); Views.results.classList.add('hidden'); Views.levelSelectionStudent.classList.remove('hidden'); Views.testSelection.classList.add('hidden'); renderLevelSelectionButtons(); } 
//         document.addEventListener('DOMContentLoaded', initializeApp);

// script.js

// --- CONFIGURATION ---
const BASE_API_URL = 'http://127.0.0.1:8000/api'; 

// --- APPLICATION STATE ---
let appState = {
    currentUserRole: null, 
    questions: [], 
    modules: [], 
    questionTypes: [], 
    levels: [], 
    editingQuestionId: null, 
    currentStudentLevelId: null, 
    isAuthenticated: false, // NEW: Authentication status
    currentUser: null, // NEW: Store user details {id, username, email, is_staff}
    currentTest: { 
        questions: [], userAnswers: [], currentQuestionIndex: 0, mode: 'Training', moduleName: '', levelId: null, 
        startTime: null, endTime: null, timeLimit: 3000, totalTimeAllowedForDisplay: "00:50:00", 
        timerInterval: null, markedForReview: [], remainingTime: undefined,
        testTakerId: "User" + Date.now().toString().slice(-4), 
        testTitleString: "", minPassingScoreRaw: 0.7,
        calculatedModuleScores: {}, calculatedModuleTotals: {},
        checkedInTraining: [] 
    },
    savedTests: [] 
};

// --- DOM ELEMENTS ---
const Views = { 
    roleSelection: document.getElementById('roleSelectionView'), 
    admin: document.getElementById('adminView'), 
    student: document.getElementById('studentView'), 
    login: document.getElementById('loginView'), // NEW: Login view
    levelSelectionStudent: document.getElementById('levelSelectionStudentView'), 
    testSelection: document.getElementById('testSelectionView'), 
    testTaking: document.getElementById('testTakingView'), 
    results: document.getElementById('resultsViewStudent'), 
    confirmEndTestModal: document.getElementById('confirmEndTestModal') 
};
const AdminElements = {
    formTitle: document.getElementById('adminFormTitle'), 
    editingQuestionIdInput: document.getElementById('editingQuestionIdAdmin'), 
    saveOrUpdateBtn: document.getElementById('saveOrUpdateQuestionBtn'), 
    cancelEditBtn: document.getElementById('cancelEditBtnAdmin'), 
    questionModule: document.getElementById('questionModuleAdmin'), 
    questionType: document.getElementById('questionTypeAdmin'), 
    questionLevel: document.getElementById('questionLevelAdmin'), 
    questionText: document.getElementById('questionTextAdmin'),
    questionImageInput: document.getElementById('questionImageAdmin'), 
    questionImagePreview: document.getElementById('questionImagePreviewAdmin'), 
    mcFields: document.getElementById('mcFieldsAdmin'), optionsContainer: document.getElementById('optionsContainerAdmin'), correctAnswerMC: document.getElementById('correctAnswerAdminMC'),
    tfFields: document.getElementById('tfFieldsAdmin'), correctAnswerTF: document.getElementById('correctAnswerAdminTF'),
    tfTableFields: document.getElementById('tfTableFieldsAdmin'), statementsAdminTFTable: document.getElementById('statementsAdminTFTable'), correctAnswersAdminTFTable: document.getElementById('correctAnswersAdminTFTable'), 
    ddMatchFields: document.getElementById('ddMatchFieldsAdmin'), draggableItems: document.getElementById('draggableItemsAdmin'), dropZoneTargets: document.getElementById('dropZoneTargetsAdmin'),
    explanationText: document.getElementById('explanationTextAdmin'), questionListContainer: document.getElementById('questionListAdminContainer'), questionList: document.getElementById('questionListAdmin'),
    fileUpload: document.getElementById('fileUploadAdmin'), uploadStatus: document.getElementById('uploadStatusAdmin'),
    adminUsernameDisplay: document.getElementById('adminUsername') // NEW: For displaying admin username
};
const LoginFormElements = { // NEW
    form: document.getElementById('loginForm'),
    usernameInput: document.getElementById('username'),
    passwordInput: document.getElementById('password'),
    loginError: document.getElementById('loginError')
};

const StudentElements = {
    levelSelectionButtons: document.getElementById('levelSelectionButtons'), 
    testModuleButtons: document.getElementById('testModuleButtons'), 
    testTitle: document.getElementById('testTitleStudent'), testModeInfo: document.getElementById('testModeInfoStudent'), timer: document.getElementById('timer'),
    questionArea: document.getElementById('questionAreaStudent'), currentQuestionNumber: document.getElementById('currentQuestionNumberStudent'), totalQuestions: document.getElementById('totalQuestionsStudent'),
    questionImageDisplay: document.getElementById('questionImageDisplayStudent'), 
    questionTextDisplay: document.getElementById('questionTextDisplayStudent'), optionsArea: document.getElementById('optionsAreaStudent'), trueFalseTableArea: document.getElementById('trueFalseTableAreaStudent'), 
    dragDropArea: document.getElementById('dragDropAreaStudent'), dragSourceContainer: document.getElementById('dragSourceContainer'), dropZoneContainer: document.getElementById('dropZoneContainer'),
    explanationArea: document.getElementById('explanationAreaStudent'), explanationTextDisplay: document.getElementById('explanationTextDisplayStudent'),
    prevBtn: document.getElementById('prevBtnStudent'), nextBtn: document.getElementById('nextBtnStudent'), 
    checkAnswerBtn: document.getElementById('checkAnswerBtnStudent'), 
    markReviewBtn: document.getElementById('markReviewBtnStudent'), saveProgressBtn: document.getElementById('saveProgressBtnStudent'),
    questionNavigator: document.getElementById('questionNavigatorStudent'), savedTestsList: document.getElementById('savedTestsListStudent'),
    resultViewTestTakerId: document.getElementById('resultViewTestTakerId'), resultViewTestTitle: document.getElementById('resultViewTestTitle'), resultViewCategory: document.getElementById('resultViewCategory'), resultViewTimeUsed: document.getElementById('resultViewTimeUsed'), resultViewTotalTimeAllowed: document.getElementById('resultViewTotalTimeAllowed'), resultViewProduct: document.getElementById('resultViewProduct'), resultViewScore: document.getElementById('resultViewScore'), resultViewMode: document.getElementById('resultViewMode'), resultViewMinPassingScore: document.getElementById('resultViewMinPassingScore'), resultViewDateFinished: document.getElementById('resultViewDateFinished'), resultViewPlaceholderId: document.getElementById('resultViewPlaceholderId'), resultViewOverallStatus: document.getElementById('resultViewOverallStatus'), resultViewMotivationalMessage: document.getElementById('resultViewMotivationalMessage'), resultViewBreakdown: document.getElementById('resultViewBreakdown'), resultViewQuestionReviewList: document.getElementById('resultViewQuestionReviewList')
};
let draggedItemElement = null; 
let draggedItemData = {}; 

// --- CSRF Token Helper ---
let csrftoken = getCookie('csrftoken'); // Initial attempt to get cookie

function getCookie(name) { 
    let cookieValue = null; 
    if (document.cookie && document.cookie !== '') { 
        const cookies = document.cookie.split(';'); 
        for (let i = 0; i < cookies.length; i++) { 
            const cookie = cookies[i].trim(); 
            if (cookie.substring(0, name.length + 1) === (name + '=')) { 
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1)); 
                break; 
            } 
        } 
    } 
    return cookieValue; 
}

async function fetchCSRFToken() {
    if (!csrftoken) { // Only fetch if not already available (e.g. from previous Django-rendered page)
        try {
            const data = await fetchAPI('/auth/csrf/');
            if (data && data.csrfToken) {
                csrftoken = data.csrfToken;
                console.log("CSRF token fetched and set.");
                // Django's CsrfViewMiddleware should also set the cookie,
                // but having it in a variable is a fallback.
            }
        } catch (error) {
            console.error("Could not fetch CSRF token:", error);
        }
    }
}


// --- API HELPER ---
async function fetchAPI(endpoint, options = {}) { 
    const defaultHeaders = {}; 
    if (!['GET', 'HEAD', 'OPTIONS', 'TRACE'].includes(options.method?.toUpperCase())) { 
        // Re-check CSRF token from cookie before each non-safe request, as it might have been refreshed
        const currentCsrfToken = getCookie('csrftoken') || csrftoken;
        if (currentCsrfToken) { 
            defaultHeaders['X-CSRFToken'] = currentCsrfToken; 
        } else { 
            console.warn('CSRF token not found for request. Make sure Django sets it or it has been fetched.'); 
        } 
    } 
    if (!(options.body instanceof FormData)) { 
        defaultHeaders['Content-Type'] = 'application/json'; 
    } 
    options.headers = { ...defaultHeaders, ...options.headers }; 
    try { 
        const response = await fetch(`${BASE_API_URL}${endpoint}`, options); 
        if (!response.ok) { 
            let errorData;
            let responseText = await response.text(); 
            try {
                errorData = JSON.parse(responseText); 
            } catch (e) {
                errorData = { detail: `Lỗi HTTP ${response.status}: ${response.statusText}. Phản hồi từ server: ${responseText}` };
            }
            console.error(`API Error ${response.status}: ${endpoint}`, errorData); 
            
            let detailedMessage = `Lỗi ${response.status} khi gọi API.`;
            if (errorData && typeof errorData === 'object') {
                if (errorData.detail) { 
                    detailedMessage = errorData.detail;
                } else if (errorData.error) { 
                     detailedMessage = errorData.error;
                } else if (Array.isArray(errorData.errors)) { 
                    detailedMessage = `${errorData.message || 'Có lỗi với các dòng trong file'}:\n`;
                    errorData.errors.forEach(err => {
                        detailedMessage += `- Dòng ${err.row || 'không rõ'}: ${ (typeof err.error === 'string' ? err.error : JSON.stringify(err.error)) }\n`;
                    });
                } else { 
                    const fieldErrors = Object.entries(errorData)
                        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : String(value)}`)
                        .join('; \n');
                    if (fieldErrors) detailedMessage = fieldErrors;
                }
            }
            throw new Error(detailedMessage); 
        } 
        if (response.status === 204) return null; 
        return await response.json(); 
    } catch (error) { 
        console.error('Lỗi Fetch API:', error); 
        throw error; 
    } 
}

// --- AUTHENTICATION FUNCTIONS ---
async function loginUser(event) {
    event.preventDefault();
    LoginFormElements.loginError.textContent = '';
    const username = LoginFormElements.usernameInput.value;
    const password = LoginFormElements.passwordInput.value;

    try {
        const data = await fetchAPI('/auth/login/', {
            method: 'POST',
            body: JSON.stringify({ username, password })
        });
        if (data.user && data.user.is_staff) { // Chỉ cho phép admin đăng nhập
            appState.isAuthenticated = true;
            appState.currentUser = data.user;
            console.log("Admin logged in:", data.user);
            if(AdminElements.adminUsernameDisplay) AdminElements.adminUsernameDisplay.textContent = `Chào, ${data.user.username}!`;
            showView(Views.admin);
            await loadInitialAdminData(); // Tải dữ liệu cần thiết cho admin
            await renderQuestionListAdmin();
        } else {
            appState.isAuthenticated = false;
            appState.currentUser = null;
            const errorMessage = data.user && !data.user.is_staff ? "Tài khoản này không có quyền quản trị." : "Tên đăng nhập hoặc mật khẩu không đúng.";
            LoginFormElements.loginError.textContent = errorMessage;
            alert(errorMessage);
        }
    } catch (error) {
        LoginFormElements.loginError.textContent = error.message || "Lỗi đăng nhập. Vui lòng thử lại.";
        appState.isAuthenticated = false;
        appState.currentUser = null;
    }
}

async function logoutUser() {
    try {
        await fetchAPI('/auth/logout/', { method: 'POST' });
        appState.isAuthenticated = false;
        appState.currentUser = null;
        if(AdminElements.adminUsernameDisplay) AdminElements.adminUsernameDisplay.textContent = '';
        alert("Đăng xuất thành công.");
        showRoleSelection(); // Quay về màn hình chọn vai trò
    } catch (error) {
        alert(`Lỗi khi đăng xuất: ${error.message}`);
    }
}

async function checkAuthStatus() {
    try {
        const data = await fetchAPI('/auth/check/');
        if (data.is_authenticated && data.user && data.user.is_staff) {
            appState.isAuthenticated = true;
            appState.currentUser = data.user;
            if(AdminElements.adminUsernameDisplay) AdminElements.adminUsernameDisplay.textContent = `Chào, ${data.user.username}!`;
            console.log("User is authenticated as admin:", appState.currentUser);
            return true;
        } else {
            appState.isAuthenticated = false;
            appState.currentUser = null;
            if(AdminElements.adminUsernameDisplay) AdminElements.adminUsernameDisplay.textContent = '';
            console.log("User is not authenticated or not staff.");
            return false;
        }
    } catch (error) {
        console.error("Error checking auth status:", error);
        appState.isAuthenticated = false;
        appState.currentUser = null;
        if(AdminElements.adminUsernameDisplay) AdminElements.adminUsernameDisplay.textContent = '';
        return false;
    }
}


// --- INITIALIZATION & DATA LOADING ---
async function initializeApp() { 
    console.log("Initializing application..."); 
    showView(Views.roleSelection); 
    loadSavedTests(); 
    await fetchCSRFToken(); // Fetch CSRF token on initial load
    await checkAuthStatus(); // Check if already logged in

    try { 
        // Tải dữ liệu modules, types, levels bất kể vai trò nào, vì student cũng cần levels
        if(appState.modules.length === 0 || appState.questionTypes.length === 0 || appState.levels.length === 0) {
            await loadInitialAdminData(); 
        }
    } catch (error) { 
        console.error("Không thể tải dữ liệu ban đầu:", error); 
    } 

    if (AdminElements.questionImageInput) { 
        AdminElements.questionImageInput.addEventListener('change', previewQuestionImageAdmin); 
    }
    if (LoginFormElements.form) {
        LoginFormElements.form.addEventListener('submit', loginUser);
    }
    addOptionFieldAdmin(); 
    addOptionFieldAdmin(); 
    toggleQuestionTypeFields(); 
    console.log("Application initialized. Auth status:", appState.isAuthenticated); 
}
async function loadInitialAdminData() { 
    try { 
        const [modules, questionTypes, levels] = await Promise.all([ 
            fetchAPI('/modules/'), 
            fetchAPI('/question-types/'),
            fetchAPI('/levels/') 
        ]); 
        appState.modules = modules || []; 
        appState.questionTypes = questionTypes || []; 
        appState.levels = levels || []; 

        populateAdminDropdown(AdminElements.questionModule, appState.modules, 'id', 'module_name'); 
        populateAdminDropdown(AdminElements.questionType, appState.questionTypes, 'id', 'type_code', 'type_description');
        populateAdminDropdown(AdminElements.questionLevel, appState.levels, 'id', 'level_name', 'level_number'); 

        console.log("Admin initial data (modules, types, levels) loaded."); 
    } catch (error) { 
        console.error("Lỗi khi tải dữ liệu ban đầu cho admin:", error); 
        if (AdminElements.uploadStatus) { 
            AdminElements.uploadStatus.textContent = "Lỗi tải dữ liệu cần thiết cho trang quản trị."; 
            AdminElements.uploadStatus.className = "mt-3 text-sm text-red-600"; 
        }
    } 
}
function populateAdminDropdown(selectElement, data, valueField, textField, descriptionField = null) { 
    if (!selectElement) { console.warn("Dropdown element not found for", textField); return; }
    selectElement.innerHTML = ''; 
    const defaultOption = document.createElement('option');
    defaultOption.value = "";
    defaultOption.textContent = `--- Chọn ${textField.includes('module') ? 'Chủ đề' : (textField.includes('type') ? 'Loại câu hỏi' : 'Cấp độ')} ---`;
    defaultOption.disabled = true;
    // defaultOption.selected = true; // Không nên set selected cho default khi có thể populateFormForEdit
    selectElement.appendChild(defaultOption);

    (data || []).forEach(item => { 
        const option = document.createElement('option'); 
        option.value = item[valueField]; 
        option.textContent = descriptionField ? `${item[textField]} (Cấp ${item[descriptionField]})` : item[textField]; 
        selectElement.appendChild(option); 
    }); 
}

function renderLevelSelectionButtons() { 
    if (!StudentElements.levelSelectionButtons) return;
    StudentElements.levelSelectionButtons.innerHTML = '';
    if (!appState.levels || appState.levels.length === 0) {
        StudentElements.levelSelectionButtons.innerHTML = '<p class="text-gray-500 text-center col-span-full">Không có cấp độ nào được định nghĩa.</p>';
        return;
    }
    appState.levels.forEach(level => {
        const levelBtn = document.createElement('button');
        levelBtn.onclick = () => selectLevelForStudent(level.id);
        levelBtn.className = "btn btn-primary p-6 text-lg"; 
        levelBtn.textContent = level.level_name || `Cấp độ ${level.level_number}`;
        StudentElements.levelSelectionButtons.appendChild(levelBtn);
    });
}

function selectLevelForStudent(levelId) { 
    appState.currentStudentLevelId = levelId;
    const selectedLevel = appState.levels.find(l => l.id === levelId);
    console.log(`Student selected Level: ${selectedLevel?.level_name} (ID: ${levelId})`);
    
    if(Views.levelSelectionStudent) Views.levelSelectionStudent.classList.add('hidden');
    if(Views.testSelection) Views.testSelection.classList.remove('hidden'); 
    renderTestModuleButtons(levelId); 
}


function renderTestModuleButtons(levelId) { 
    if (!StudentElements.testModuleButtons) return;
    StudentElements.testModuleButtons.innerHTML = ''; 
    (appState.modules || []).forEach(module => { 
        const trainingBtn = document.createElement('button'); 
        trainingBtn.onclick = () => startTest(levelId, module.id, module.module_name, 'Training'); 
        trainingBtn.className = "btn bg-yellow-500 hover:bg-yellow-600 text-white p-6 text-lg"; 
        trainingBtn.textContent = `Luyện tập: ${module.module_name}`; 
        StudentElements.testModuleButtons.appendChild(trainingBtn); 
        const testingBtn = document.createElement('button'); 
        testingBtn.onclick = () => startTest(levelId, module.id, module.module_name, 'Testing'); 
        testingBtn.className = "btn btn-primary p-6 text-lg"; 
        testingBtn.textContent = `Thi thử: ${module.module_name}`; 
        StudentElements.testModuleButtons.appendChild(testingBtn); 
    }); 
    const comprehensiveTrainingBtn = document.createElement('button'); 
    comprehensiveTrainingBtn.onclick = () => startTest(levelId, null, 'Tổng hợp', 'Training'); 
    comprehensiveTrainingBtn.className = "btn bg-purple-500 hover:bg-purple-600 text-white p-6 text-lg"; 
    comprehensiveTrainingBtn.textContent = "Luyện tập: Tổng hợp"; 
    StudentElements.testModuleButtons.appendChild(comprehensiveTrainingBtn); 
    const comprehensiveTestingBtn = document.createElement('button'); 
    comprehensiveTestingBtn.onclick = () => startTest(levelId, null, 'Tổng hợp', 'Testing'); 
    comprehensiveTestingBtn.className = "btn btn-purple-700 hover:bg-purple-800 text-white p-6 text-lg"; 
    comprehensiveTestingBtn.textContent = "Thi thử: Tổng hợp"; 
    StudentElements.testModuleButtons.appendChild(comprehensiveTestingBtn); 
}
function loadSavedTests() { const stored = localStorage.getItem('ic3SparkSavedTests_v4_detailedResults'); if (stored) appState.savedTests = JSON.parse(stored); }
function saveTestsToStorage() { localStorage.setItem('ic3SparkSavedTests_v4_detailedResults', JSON.stringify(appState.savedTests)); }

// --- VIEW MANAGEMENT ---
function showView(viewToShow) { 
    [Views.roleSelection, Views.admin, Views.student, Views.confirmEndTestModal, Views.login, Views.levelSelectionStudent, Views.testSelection, Views.testTaking, Views.results].forEach(v => {
        if(v) v.classList.add('hidden'); 
    }); 
    if (viewToShow) viewToShow.classList.remove('hidden'); 
    if (viewToShow !== Views.testTaking && appState.currentTest.timerInterval) { 
        clearInterval(appState.currentTest.timerInterval); 
        appState.currentTest.timerInterval = null; 
    } 
}
async function selectRole(role) { 
    appState.currentUserRole = role; 
    if (role === 'admin') { 
        await checkAuthStatus(); // Kiểm tra lại trạng thái đăng nhập
        if (appState.isAuthenticated && appState.currentUser?.is_staff) {
            showView(Views.admin); 
            if(appState.modules.length === 0 || appState.questionTypes.length === 0 || appState.levels.length === 0) await loadInitialAdminData(); 
            await renderQuestionListAdmin(); 
        } else {
            showView(Views.login); // Hiển thị form đăng nhập nếu chưa đăng nhập hoặc không phải admin
        }
    } else { // student
        showView(Views.student); 
        if(appState.levels.length === 0) await loadInitialAdminData(); 
        if(Views.levelSelectionStudent) Views.levelSelectionStudent.classList.remove('hidden'); 
        if(Views.testSelection) Views.testSelection.classList.add('hidden'); 
        renderLevelSelectionButtons(); 
    } 
}
function showRoleSelection() { showView(Views.roleSelection); }
function showStudentLevelSelection() { 
    if(Views.testSelection) Views.testSelection.classList.add('hidden');
    if(Views.levelSelectionStudent) Views.levelSelectionStudent.classList.remove('hidden');
    renderLevelSelectionButtons();
}
function showTestSelection() { 
    if(Views.levelSelectionStudent) Views.levelSelectionStudent.classList.add('hidden'); 
    if(Views.testSelection) Views.testSelection.classList.remove('hidden'); 
    if(Views.testTaking) Views.testTaking.classList.add('hidden'); 
    if(Views.results) Views.results.classList.add('hidden'); 
    renderSavedTestsStudent(); 
}

// --- ADMIN FUNCTIONALITY ---
function toggleQuestionTypeFields() { const typeId = AdminElements.questionType.value; const typeObj = appState.questionTypes.find(t => t.id == typeId); const typeCode = typeObj ? typeObj.type_code : ''; if(AdminElements.mcFields) AdminElements.mcFields.classList.toggle('hidden', typeCode !== 'multiple-choice-single' && typeCode !== 'multiple-choice-multiple'); if(AdminElements.tfFields) AdminElements.tfFields.classList.toggle('hidden', typeCode !== 'true-false'); if(AdminElements.tfTableFields) AdminElements.tfTableFields.classList.toggle('hidden', typeCode !== 'true-false-table'); if(AdminElements.ddMatchFields) AdminElements.ddMatchFields.classList.toggle('hidden', typeCode !== 'drag-drop-match'); }
function addOptionFieldAdmin(optionData = { text: '', image_url: null }) { 
    const optionIndex = AdminElements.optionsContainer.children.length; 
    const div = document.createElement('div'); 
    div.classList.add('option-entry', 'flex', 'flex-col', 'sm:flex-row', 'items-start', 'space-y-2', 'sm:space-y-0', 'sm:space-x-2', 'mt-2', 'p-3', 'border', 'rounded-md', 'bg-gray-50'); 
    div.innerHTML = `
        <div class="option-text-input-group flex-grow">
            <label for="optionAdminText${optionIndex}" class="text-xs font-medium text-gray-600">Lựa chọn ${optionIndex + 1} - Văn bản:</label>
            <input type="text" id="optionAdminText${optionIndex}" name="optionsAdminText" class="w-full p-2 border border-gray-300 rounded-md shadow-sm" value="${optionData.text || ''}">
        </div>
        <div class="option-image-upload-group w-full sm:w-1/3">
            <label for="optionAdminImage${optionIndex}" class="text-xs font-medium text-gray-600">Ảnh Lựa chọn ${optionIndex + 1} (tùy chọn):</label>
            <input type="file" id="optionAdminImage${optionIndex}" name="option_image_${optionIndex}" accept="image/*" class="w-full text-xs text-gray-500 file:mr-2 file:py-1 file:px-2 file:rounded-md file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
            <img id="optionImagePreviewAdmin${optionIndex}" src="${optionData.image_url || '#'}" alt="Xem trước" class="mt-1 option-image-preview-admin ${optionData.image_url ? '' : 'hidden'}"/>
        </div>
        <div class="remove-option-btn-container">
            ${optionIndex > 0 ? `<button type="button" onclick="removeOptionFieldAdmin(this)" class="btn btn-red btn-sm py-1 px-2 text-xs self-center sm:self-end">Xóa</button>` : '<div class="w-16 h-8"></div>'} 
        </div>
    `; 
    AdminElements.optionsContainer.appendChild(div); 
    const imageInput = div.querySelector(`#optionAdminImage${optionIndex}`);
    const imagePreview = div.querySelector(`#optionImagePreviewAdmin${optionIndex}`);
    if (imageInput && imagePreview) {
        imageInput.addEventListener('change', (event) => {
            const reader = new FileReader();
            reader.onload = function() { imagePreview.src = reader.result; imagePreview.classList.remove('hidden'); };
            if (event.target.files[0]) { reader.readAsDataURL(event.target.files[0]); } 
            else { imagePreview.src = optionData.image_url || '#'; if (!optionData.image_url) { imagePreview.classList.add('hidden'); } }
        });
    }
}
function removeOptionFieldAdmin(button) { if (AdminElements.optionsContainer.children.length > 1) { button.closest('.option-entry').remove(); Array.from(AdminElements.optionsContainer.children).forEach((child, index) => { child.querySelector('label[for^="optionAdminText"]').textContent = `Lựa chọn ${index + 1} - Văn bản:`; child.querySelector('label[for^="optionAdminText"]').htmlFor = `optionAdminText${index}`; child.querySelector('input[name="optionsAdminText"]').id = `optionAdminText${index}`; child.querySelector('label[for^="optionAdminImage"]').textContent = `Ảnh Lựa chọn ${index + 1} (tùy chọn):`; child.querySelector('label[for^="optionAdminImage"]').htmlFor = `optionAdminImage${index}`; child.querySelector('input[name^="option_image_"]').id = `optionAdminImage${index}`; child.querySelector('input[name^="option_image_"]').name = `option_image_${index}`; child.querySelector('img[id^="optionImagePreviewAdmin"]').id = `optionImagePreviewAdmin${index}`; }); } else { alert("Câu hỏi trắc nghiệm phải có ít nhất 1 lựa chọn."); } }
function previewQuestionImageAdmin(event) { const reader = new FileReader(); reader.onload = function(){ AdminElements.questionImagePreview.src = reader.result; AdminElements.questionImagePreview.classList.remove('hidden'); }; if (event.target.files[0]) { reader.readAsDataURL(event.target.files[0]); } else { AdminElements.questionImagePreview.src = "#"; AdminElements.questionImagePreview.classList.add('hidden'); } }
        
function getQuestionPayloadAsObject() { 
    const moduleId = AdminElements.questionModule.value;
    const questionTypeId = AdminElements.questionType.value;
    const levelId = AdminElements.questionLevel.value; 
    const questionText = AdminElements.questionText.value.trim();
    const explanation = AdminElements.explanationText.value.trim();
    
    if (!moduleId) { alert("Vui lòng chọn Chủ đề."); return null; }
    if (!questionTypeId) { alert("Vui lòng chọn Loại câu hỏi."); return null; }
    if (!questionText) { alert("Vui lòng nhập nội dung câu hỏi."); return null; }

    let questionData = { 
        module: parseInt(moduleId), 
        question_type: parseInt(questionTypeId), 
        level: levelId ? parseInt(levelId) : null, 
        question_text: questionText, 
        explanation: explanation, 
        is_active: true 
    };

    const typeObj = appState.questionTypes.find(t => t.id == questionTypeId);
    if (!typeObj) { alert("Loại câu hỏi không hợp lệ (không tìm thấy typeObj)."); return null; }
    const typeCode = typeObj.type_code;

    if (typeCode === 'multiple-choice-single' || typeCode === 'multiple-choice-multiple' || typeCode === 'true-false') {
        const optionEntries = AdminElements.optionsContainer.querySelectorAll('.option-entry');
        let optionsMcData = [];
        optionEntries.forEach((entry) => {
            const textInput = entry.querySelector('input[name="optionsAdminText"]');
            optionsMcData.push({ text: textInput.value.trim() }); 
        });

        if (typeCode !== 'true-false' && optionsMcData.filter(opt => opt.text !== "").length < 2) { 
            alert('Trắc nghiệm cần ít nhất 2 lựa chọn có nội dung.'); return null; 
        }
        if (typeCode === 'true-false') {
            optionsMcData = [{text:"Đúng"}, {text:"Sai"}]; 
        }
        questionData.options_mc = optionsMcData; 

        const correctAnsStr = AdminElements.correctAnswerMC.value.trim();
         if (typeCode !== 'true-false' && !correctAnsStr) { alert('Nhập đáp án đúng.'); return null; }
        
        if (typeCode === 'multiple-choice-single') {
            const ansIndex = parseInt(correctAnsStr) - 1;
            if (isNaN(ansIndex) || ansIndex < 0 || ansIndex >= optionsMcData.length) { alert('Đáp án (chọn 1) không hợp lệ.'); return null; }
            questionData.correct_answer_mc_single = ansIndex;
        } else if (typeCode === 'multiple-choice-multiple') {
            questionData.correct_answers_mc_multiple = correctAnsStr.split(',').map(s => parseInt(s.trim()) - 1).filter(n => !isNaN(n) && n >= 0 && n < optionsMcData.length).sort((a,b) => a-b);
            if (questionData.correct_answers_mc_multiple.length === 0) { alert('Đáp án (chọn nhiều) không hợp lệ.'); return null; }
        } else if (typeCode === 'true-false') {
            questionData.correct_answer_mc_single = parseInt(AdminElements.correctAnswerTF.value);
        }
    } else if (typeCode === 'true-false-table') {
        questionData.statements_tf_table = AdminElements.statementsAdminTFTable.value.trim().split('\n').map(s => s.trim()).filter(s => s !== "");
        if (questionData.statements_tf_table.length === 0) { alert("Nhập ít nhất một khẳng định."); return null; }
        questionData.correct_answers_tf_table = AdminElements.correctAnswersAdminTFTable.value.trim().split(',').map(s => parseInt(s.trim())).filter(n => !isNaN(n) && (n === 0 || n === 1));
        if (questionData.statements_tf_table.length !== questionData.correct_answers_tf_table.length) { alert("Số lượng khẳng định và đáp án không khớp."); return null; }
    } else if (typeCode === 'drag-drop-match') {
        questionData.draggable_items_dd = AdminElements.draggableItems.value.trim().split('\n').map(s=>s.trim()).filter(s => s !== "");
        questionData.drop_zone_labels_dd = AdminElements.dropZoneTargets.value.trim().split('\n').map(s=>s.trim()).filter(s => s !== "");
        if (questionData.draggable_items_dd.length === 0 || questionData.draggable_items_dd.length !== questionData.drop_zone_labels_dd.length) { alert('Mục kéo và mục tiêu thả phải bằng nhau và không rỗng.'); return null; }
    }
    return questionData; 
}


async function saveOrUpdateQuestion() {
    const questionObject = getQuestionPayloadAsObject();
    if (!questionObject) return;

    const editingId = AdminElements.editingQuestionIdInput.value;
    let url = '/questions/';
    let method = 'POST';
    
    const formData = new FormData();
    
    for (const key in questionObject) {
        if (questionObject.hasOwnProperty(key)) {
            if (['options_mc', 'correct_answers_mc_multiple', 'statements_tf_table', 'correct_answers_tf_table', 'draggable_items_dd', 'drop_zone_labels_dd'].includes(key)) {
                if (questionObject[key] !== null && questionObject[key] !== undefined) {
                    formData.append(key, JSON.stringify(questionObject[key]));
                }
            } else if (questionObject[key] !== null && questionObject[key] !== undefined) {
                formData.append(key, questionObject[key]);
            }
        }
    }

    const questionImageFile = AdminElements.questionImageInput.files[0];
    if (questionImageFile) {
        formData.append('question_image', questionImageFile);
    } else if (editingId && AdminElements.questionImagePreview.src && !AdminElements.questionImagePreview.classList.contains('hidden') && AdminElements.questionImagePreview.src.startsWith(BASE_API_URL.split('/api')[0])) {
        // Editing, existing server image, no new file. Backend should keep existing image.
    } else if (editingId && AdminElements.questionImagePreview.classList.contains('hidden')) {
        // If editing and preview is hidden (meaning user wants to remove the image)
        formData.append('question_image', ''); // Signal to backend to clear the image
    }


    if (editingId) {
        url = `/questions/${editingId}/`;
        method = 'PUT'; 
    }
    
    try {
        await fetchAPI(url, { method: method, body: formData }); 
        alert(`Câu hỏi đã được ${editingId ? 'cập nhật' : 'lưu'} thành công!`);
        cancelEditQuestion(); 
        await renderQuestionListAdmin(); 
    } catch (error) {
        let detail = error.message;
        alert(`Lỗi khi ${editingId ? 'cập nhật' : 'lưu'} câu hỏi: ${detail}`);
        console.error("Full error object from saveOrUpdateQuestion:", error);
    }
}
        
function resetAdminForm() { 
    appState.editingQuestionId = null; 
    AdminElements.editingQuestionIdInput.value = ''; 
    AdminElements.formTitle.textContent = 'Thêm Câu hỏi Mới (Thủ công)';
    AdminElements.saveOrUpdateBtn.textContent = 'Lưu Câu hỏi';
    AdminElements.saveOrUpdateBtn.classList.replace('btn-blue', 'btn-green');
    AdminElements.cancelEditBtn.classList.add('hidden');

    AdminElements.questionText.value = ''; 
    AdminElements.explanationText.value = ''; 
    AdminElements.questionImageInput.value = ''; 
    AdminElements.questionImagePreview.src = '#';
    AdminElements.questionImagePreview.classList.add('hidden');

    AdminElements.optionsContainer.innerHTML = ''; 
    addOptionFieldAdmin(); addOptionFieldAdmin(); 
    AdminElements.correctAnswerMC.value = ''; 
    AdminElements.statementsAdminTFTable.value = ''; 
    AdminElements.correctAnswersAdminTFTable.value = ''; 
    AdminElements.draggableItems.value = ''; 
    AdminElements.dropZoneTargets.value = ''; 
    if(AdminElements.questionModule.options.length > 0) AdminElements.questionModule.selectedIndex = 0; 
    if(AdminElements.questionType.options.length > 0) AdminElements.questionType.selectedIndex = 0; 
    if(AdminElements.questionLevel && AdminElements.questionLevel.options.length > 0) AdminElements.questionLevel.selectedIndex = 0; 
    toggleQuestionTypeFields(); 
    AdminElements.uploadStatus.textContent = ''; 
}

async function populateFormForEdit(questionId) {
    AdminElements.uploadStatus.textContent = "Đang tải dữ liệu câu hỏi để sửa...";
    AdminElements.uploadStatus.className = "mt-3 text-sm text-blue-600";
    let question;
    try {
        question = await fetchAPI(`/questions/${questionId}/`); 
        if (!question) {
            alert("Không tìm thấy câu hỏi để sửa hoặc có lỗi khi tải.");
            AdminElements.uploadStatus.textContent = "Lỗi tải dữ liệu câu hỏi.";
            AdminElements.uploadStatus.className = "mt-3 text-sm text-red-600";
            return;
        }
    } catch (error) {
         alert(`Lỗi khi tải dữ liệu câu hỏi: ${error.message}`);
         AdminElements.uploadStatus.textContent = "Lỗi tải dữ liệu câu hỏi.";
         AdminElements.uploadStatus.className = "mt-3 text-sm text-red-600";
         return;
    }
    
    resetAdminForm(); 
    appState.editingQuestionId = question.id; 
    AdminElements.editingQuestionIdInput.value = question.id;
    AdminElements.formTitle.textContent = `Sửa Câu hỏi #${question.id}`;
    AdminElements.saveOrUpdateBtn.textContent = 'Cập nhật Câu hỏi';
    AdminElements.saveOrUpdateBtn.classList.replace('btn-green', 'btn-blue');
    AdminElements.cancelEditBtn.classList.remove('hidden');

    AdminElements.questionModule.value = question.module; 
    AdminElements.questionType.value = question.question_type; 
    AdminElements.questionLevel.value = question.level || ""; 
    toggleQuestionTypeFields(); 

    AdminElements.questionText.value = question.question_text;
    AdminElements.explanationText.value = question.explanation || '';

    if (question.question_image) {
        AdminElements.questionImagePreview.src = question.question_image; 
        AdminElements.questionImagePreview.classList.remove('hidden');
    } else {
        AdminElements.questionImagePreview.src = '#';
        AdminElements.questionImagePreview.classList.add('hidden');
    }
    AdminElements.questionImageInput.value = ''; 

    const typeCode = question.question_type_code; 

    if (typeCode === 'multiple-choice-single' || typeCode === 'multiple-choice-multiple') {
        AdminElements.optionsContainer.innerHTML = ''; 
        (question.options_mc || []).forEach(opt => {
            const optText = typeof opt === 'string' ? opt : (opt.text || '');
            const optImageUrl = typeof opt === 'object' ? opt.image_url : null;
            addOptionFieldAdmin({text: optText, image_url: optImageUrl }); 
        });
        if (typeCode === 'multiple-choice-single') {
            AdminElements.correctAnswerMC.value = question.correct_answer_mc_single !== null ? question.correct_answer_mc_single + 1 : '';
        } else {
            AdminElements.correctAnswerMC.value = (question.correct_answers_mc_multiple || []).map(idx => idx + 1).join(',');
        }
    } else if (typeCode === 'true-false') {
        AdminElements.correctAnswerAdminTF.value = question.correct_answer_mc_single !== null ? String(question.correct_answer_mc_single) : '0';
    } else if (typeCode === 'true-false-table') {
        AdminElements.statementsAdminTFTable.value = (question.statements_tf_table || []).join('\n');
        AdminElements.correctAnswersAdminTFTable.value = (question.correct_answers_tf_table || []).join(',');
    } else if (typeCode === 'drag-drop-match') {
        AdminElements.draggableItemsAdmin.value = (question.draggable_items_dd || []).join('\n');
        AdminElements.dropZoneTargetsAdmin.value = (question.drop_zone_labels_dd || []).join('\n');
    }
    AdminElements.uploadStatus.textContent = ""; 
    window.scrollTo({ top: AdminElements.formTitle.offsetTop - 20, behavior: 'smooth' });
}
        
function cancelEditQuestion() { resetAdminForm(); }
async function renderQuestionListAdmin() { 
    if (!AdminElements.questionList) { console.error("AdminElements.questionList is null"); return; }
    AdminElements.questionList.innerHTML = '<p class="text-gray-500">Đang tải...</p>'; 
    try { 
        const questionsFromAPI = await fetchAPI('/questions/'); 
        appState.questions = questionsFromAPI || []; 
        AdminElements.questionList.innerHTML = ''; 
        if (appState.questions.length === 0) { AdminElements.questionList.innerHTML = '<p class="text-gray-500">Chưa có câu hỏi nào.</p>'; return; } 
        appState.questions.forEach((q, index) => { 
            const item = document.createElement('div'); 
            item.classList.add('p-3', 'bg-gray-100', 'rounded-md', 'shadow-sm', 'flex', 'justify-between', 'items-center'); 
            let answerPreview = 'N/A'; 
            const qTypeCode = q.question_type_code || (appState.questionTypes.find(qt => qt.id === q.question_type) || {}).type_code;
            const qOptions = q.options_mc || [];

            if (qTypeCode === 'multiple-choice-single' && q.correct_answer_mc_single !== null && qOptions[q.correct_answer_mc_single] !== undefined) {
                const opt = qOptions[q.correct_answer_mc_single]; 
                answerPreview = typeof opt === 'string' ? opt : opt.text; 
            } else if (qTypeCode === 'multiple-choice-multiple' && Array.isArray(q.correct_answers_mc_multiple)) { 
                answerPreview = q.correct_answers_mc_multiple.map(i => { const opt = qOptions[i]; return (typeof opt === 'string' ? opt : opt?.text) || `Lựa chọn ${i+1} lỗi`; }).join(', '); 
            } else if (qTypeCode === 'true-false' && q.correct_answer_mc_single !== null) { 
                answerPreview = (qOptions[q.correct_answer_mc_single]) ? (typeof qOptions[q.correct_answer_mc_single] === 'string' ? qOptions[q.correct_answer_mc_single] : qOptions[q.correct_answer_mc_single].text) : (q.correct_answer_mc_single === 0 ? "Đúng" : "Sai");
            } else if (qTypeCode === 'true-false-table' && q.statements_tf_table) { 
                answerPreview = `${q.statements_tf_table.length} khẳng định`; 
            } else if (qTypeCode === 'drag-drop-match' && q.draggable_items_dd) { 
                answerPreview = `Ghép nối ${q.draggable_items_dd.length} mục`; 
            }
            
            const levelText = q.level_info ? ` [Cấp ${q.level_info.level_number}]` : (q.level ? ` [Cấp ID: ${q.level}]` : '');

            item.innerHTML = `
                <div class="flex-grow">
                    <p class="font-medium text-sm">${index + 1}. [${q.module_name || 'N/A'}]${levelText} - [${q.question_type_code || 'N/A'}] ${q.question_text ? q.question_text.substring(0,50) : 'Lỗi'}...</p>
                    <p class="text-xs text-gray-600">Đáp án xem trước: ${answerPreview}</p>
                </div>
                <div class="flex-shrink-0">
                    <button onclick="populateFormForEdit(${q.id})" class="btn btn-blue btn-sm py-1 px-2 mr-1 text-xs">Sửa</button>
                    <button onclick="deleteQuestion(${q.id})" class="btn btn-red btn-sm py-1 px-2 text-xs">Xóa</button>
                </div>
            `; 
            AdminElements.questionList.appendChild(item); 
        }); 
    } catch (error) { 
        AdminElements.questionList.innerHTML = '<p class="text-red-500">Lỗi tải danh sách câu hỏi.</p>'; 
        console.error("Error rendering question list:", error);
    } 
}
async function deleteQuestion(id) { if (confirm('Xóa câu hỏi này?')) { try { await fetchAPI(`/questions/${id}/`, { method: 'DELETE' }); alert('Câu hỏi đã xóa.'); await renderQuestionListAdmin(); } catch (error) { alert(`Lỗi xóa câu hỏi: ${error.message}`); } } }
function downloadExcelTemplate() { console.log("Attempting to download Excel template..."); try { const templateData = [ ["Module", "Level", "QuestionType", "QuestionText", "Option1", "Option2", "Option3", "Option4", "Option5", "CorrectAnswer", "DraggableItems", "DropZoneLabels", "Statements", "CorrectAnswers_Table", "Explanation"], ["Computing Fundamentals", "1", "multiple-choice-single", "CPU là viết tắt của cụm từ tiếng Anh nào?", "Central Processing Unit", "Computer Personal Unit", "Central Power Unit", "", "", "1", "", "", "", "", "CPU là viết tắt của Central Processing Unit."], ["Key Applications", "1", "true-false", "Microsoft Word là phần mềm chính để tạo bảng tính phức tạp.", "", "", "", "", "", "1", "", "", "", "", "Sai. Microsoft Excel mới là phần mềm chính cho bảng tính. (0-Đúng, 1-Sai)"], ["Living Online", "2", "multiple-choice-multiple", "Những hành động nào sau đây giúp tăng cường an toàn khi trực tuyến?", "Sử dụng mật khẩu mạnh và duy nhất", "Chia sẻ mật khẩu với bạn thân", "Nhấp vào mọi liên kết trong email", "Cập nhật phần mềm thường xuyên", "", "1,4", "", "", "", "", "Sử dụng mật khẩu mạnh và cập nhật phần mềm là quan trọng."], ["Key Applications", "2", "true-false-table", "Đánh giá các nhận định sau về ứng dụng văn phòng:", "", "", "", "", "", "", "", "Microsoft Word chủ yếu dùng để soạn thảo văn bản.\nMicrosoft Excel chủ yếu dùng để tạo bài thuyết trình.\nMicrosoft PowerPoint chủ yếu dùng để quản lý email.", "0,1,1", "Word soạn thảo, Excel bảng tính, PowerPoint trình chiếu, Outlook quản lý email."], ["Computing Fundamentals", "3", "drag-drop-match", "Ghép nối các thành phần máy tính với vai trò của chúng:", "", "", "", "", "", "CPU\nRAM\nỔ cứng SSD", "Bộ xử lý trung tâm\nBộ nhớ truy cập ngẫu nhiên\nThiết bị lưu trữ nhanh", "", "", "Đây là các vai trò cơ bản của các thành phần."], ["Digital Citizenship", "1", "multiple-choice-single", "Hành vi nào sau đây thể hiện ý thức công dân số tốt?", "Sao chép bài của người khác và nộp", "Tôn trọng bản quyền và sở hữu trí tuệ", "Bắt nạt trực tuyến", "", "", "2", "", "", "", "", "Tôn trọng bản quyền là một phần quan trọng của công dân số."] ]; const ws = XLSX.utils.aoa_to_sheet(templateData); const wb = XLSX.utils.book_new(); XLSX.utils.book_append_sheet(wb, ws, "QuestionsTemplate"); XLSX.writeFile(wb, "IC3_Spark_Questions_Template_v3.xlsx"); console.log("Excel template download initiated via XLSX.writeFile."); } catch (error) { console.error("Error in downloadExcelTemplate:", error); alert("Đã có lỗi xảy ra khi cố gắng tạo file Excel mẫu. Vui lòng kiểm tra console của trình duyệt (F12)."); } }
function showWordTemplateGuidance() { const guidance = `Hướng dẫn File Word (NÊN DÙNG EXCEL):\n\n**Module:** Tên Module (vd: Computing Fundamentals)\n**Level:** Số cấp độ (vd: 1) hoặc Tên Cấp độ (vd: IC3 Level 1)\n**QuestionType:** Mã Loại (vd: multiple-choice-single)\n... (các trường khác tương tự file Excel mẫu)`; alert(guidance); }
async function handleFileUpload() { const file = AdminElements.fileUpload.files[0]; if (!file) { AdminElements.uploadStatus.textContent = "Vui lòng chọn một file."; AdminElements.uploadStatus.className = "mt-3 text-sm text-red-600"; return; } AdminElements.uploadStatus.textContent = "Đang tải lên và xử lý..."; AdminElements.uploadStatus.className = "mt-3 text-sm text-blue-600"; const formData = new FormData(); formData.append('file', file); try { const response = await fetchAPI('/questions/upload/', { method: 'POST', body: formData }); AdminElements.uploadStatus.textContent = response.message || "Xử lý file hoàn tất."; AdminElements.uploadStatus.className = `mt-3 text-sm ${response.errors && response.errors.length > 0 ? 'text-yellow-600' : 'text-green-600'}`; if (response.errors) console.warn("Lỗi khi tải lên file:", response.errors); await renderQuestionListAdmin(); } catch (error) { AdminElements.uploadStatus.textContent = `Lỗi khi tải lên file: ${error.message}`; AdminElements.uploadStatus.className = "mt-3 text-sm text-red-600"; } finally { AdminElements.fileUpload.value = ''; } }
        
// --- STUDENT TEST FUNCTIONALITY ---
async function startTest(levelId, moduleId, moduleNameForDisplay, mode, savedTestId = null) { 
    appState.currentTest.testTakerId = "User" + Date.now().toString().slice(-5);
    const levelObject = levelId ? appState.levels.find(l=>l.id === levelId) : null;
    const levelName = levelObject ? levelObject.level_name : (levelId ? `Cấp độ ${levelId}`: "Tất cả Cấp độ");
    appState.currentTest.testTitleString = `IC3 Spark - ${levelName} - ${moduleNameForDisplay} (${mode === 'Testing' ? 'Thi thử' : 'Luyện tập'})`;
    appState.currentTest.minPassingScoreRaw = 0.7; 
    const timePerQuestion = 90; 
    let testQuestions; 
    
    if (savedTestId) { 
        const savedState = appState.savedTests.find(t => t.id === savedTestId); 
        if (!savedState) { alert("Không tìm thấy bài đã lưu!"); return; } 
        appState.currentTest = { ...savedState }; 
        appState.currentTest.startTime = Date.now() - (appState.currentTest.timeLimit * 1000 - appState.currentTest.remainingTime * 1000);
        appState.savedTests = appState.savedTests.filter(t => t.id !== savedTestId); saveTestsToStorage(); 
        testQuestions = appState.currentTest.questions; 
    } else {
        let allFetchedQuestions;
        try {
            let endpoint = '/questions/?';
            if (levelId) endpoint += `level_id=${levelId}&`;
            if (moduleId) endpoint += `module_id=${moduleId}&`; 

            allFetchedQuestions = await fetchAPI(endpoint.endsWith('&') || endpoint.endsWith('?') ? endpoint.slice(0,-1) : endpoint); 
            console.log(`[startTest] Fetching for Level: ${levelId}, Module: ${moduleId}. Endpoint: ${BASE_API_URL}${endpoint.slice(0,-1)}. Received:`, allFetchedQuestions);
            
            if (!allFetchedQuestions || allFetchedQuestions.length === 0) { 
                alert(moduleId ? `Không có câu hỏi cho chủ đề "${moduleNameForDisplay}" ở cấp độ "${levelName}".` : (levelId ? `Không có câu hỏi nào cho cấp độ "${levelName}".` : "Không có câu hỏi nào trong cơ sở dữ liệu."));
                return; 
            }
        } catch (error) { 
            alert(`Lỗi khi tải câu hỏi: ${error.message}`); 
            return; 
        }

        if (moduleNameForDisplay === 'Tổng hợp') {
            let shuffledQuestions = [...allFetchedQuestions].sort(() => 0.5 - Math.random());
            testQuestions = shuffledQuestions.slice(0, 30); 
            if (testQuestions.length === 0 && allFetchedQuestions.length > 0) {
                testQuestions = allFetchedQuestions.slice(0, Math.min(30, allFetchedQuestions.length));
            }
            if (testQuestions.length === 0) {
                 alert(`Không có câu hỏi nào phù hợp cho bài thi tổng hợp (Cấp độ: ${levelName}) sau khi lọc ngẫu nhiên.`);
                 return;
            }
            console.log(`[startTest] Chế độ Tổng hợp (Level ${levelId}): Đã chọn ${testQuestions.length} câu hỏi ngẫu nhiên.`);
             if (testQuestions.length > 0) {
                const receivedLevels = new Set(testQuestions.map(q => q.level)); 
                console.log(`[startTest] Levels of selected questions for Comprehensive: ${Array.from(receivedLevels).join(', ')}`);
            }

        } else { 
            testQuestions = allFetchedQuestions; 
            console.log(`[startTest] Chế độ Module (Level ${levelId}, Module ${moduleId}): Số câu hỏi: ${testQuestions.length}.`);
            if (testQuestions.length > 0) {
                const receivedLevels = new Set(testQuestions.map(q => q.level));
                console.log(`[startTest] Levels of selected questions for Module: ${Array.from(receivedLevels).join(', ')}`);
            }
        }
        
        appState.currentTest.questions = testQuestions;
        appState.currentTest.userAnswers = testQuestions.map(q => { 
            const typeCode = q.question_type_code || (appState.questionTypes.find(qt => qt.id === q.question_type) || {}).type_code;
            if (typeCode === 'drag-drop-match' && q.drop_zone_labels_dd) return new Array(q.drop_zone_labels_dd.length).fill(null);
            if (typeCode === 'multiple-choice-multiple') return [];
            if (typeCode === 'true-false-table' && q.statements_tf_table) return new Array(q.statements_tf_table.length).fill(null);
            return null; 
        });
        appState.currentTest.currentQuestionIndex = 0; 
        appState.currentTest.mode = mode; 
        appState.currentTest.moduleName = moduleNameForDisplay; 
        appState.currentTest.levelId = levelId; 
        appState.currentTest.startTime = Date.now(); 
        appState.currentTest.timeLimit = testQuestions.length * timePerQuestion; 
        appState.currentTest.totalTimeAllowedForDisplay = formatTime(testQuestions.length * timePerQuestion); 
        appState.currentTest.timerInterval = null; 
        appState.currentTest.markedForReview = new Array(testQuestions.length).fill(false); 
        appState.currentTest.remainingTime = testQuestions.length * timePerQuestion;
        appState.currentTest.checkedInTraining = new Array(testQuestions.length).fill(false); 
    } 
    StudentElements.testTitle.textContent = `${levelName} - ${moduleNameForDisplay} (${mode === 'Testing' ? 'Thi thử' : 'Luyện tập'})`; 
    StudentElements.testModeInfo.textContent = `Chế độ: ${mode === 'Training' ? 'Luyện tập' : 'Thi thử'}`; 
    showView(Views.student); 
    if(Views.levelSelectionStudent) Views.levelSelectionStudent.classList.add('hidden'); 
    if(Views.testSelection) Views.testSelection.classList.add('hidden'); 
    if(Views.testTaking) Views.testTaking.classList.remove('hidden'); 
    if(Views.results) Views.results.classList.add('hidden'); 
    StudentElements.explanationArea.classList.add('hidden'); 
    displayCurrentQuestion(); 
    updateQuestionNavigator(); 
    startTimer(); 
}
function saveTestProgress() { if (!appState.currentTest.questions || appState.currentTest.questions.length === 0) { alert("Không có bài thi nào đang diễn ra."); return; } let currentRemainingTime = appState.currentTest.remainingTime; if (appState.currentTest.mode === 'Testing' && appState.currentTest.timerInterval) {} else { currentRemainingTime = appState.currentTest.timeLimit - (Date.now() - appState.currentTest.startTime) / 1000; } const testToSave = { ...appState.currentTest, id: Date.now(), remainingTime: Math.max(0, currentRemainingTime) }; delete testToSave.timerInterval; const existingIndex = appState.savedTests.findIndex(t => t.moduleName === testToSave.moduleName && t.mode === testToSave.mode && t.levelId === testToSave.levelId); if (existingIndex > -1) appState.savedTests[existingIndex] = testToSave; else appState.savedTests.push(testToSave); saveTestsToStorage(); alert("Bài làm đã lưu!"); if (appState.currentTest.timerInterval) clearInterval(appState.currentTest.timerInterval); showView(Views.student); Views.levelSelectionStudent.classList.remove('hidden'); Views.testSelection.classList.add('hidden'); Views.testTaking.classList.add('hidden'); }
function renderSavedTestsStudent() { StudentElements.savedTestsList.innerHTML = ''; if (appState.savedTests.length === 0) { StudentElements.savedTestsList.innerHTML = '<p class="text-gray-500">Không có bài thi nào được lưu.</p>'; return; } appState.savedTests.forEach(savedTest => { const item = document.createElement('div'); item.classList.add('p-3', 'bg-blue-50', 'rounded-md', 'shadow-sm', 'flex', 'justify-between', 'items-center'); const mins = Math.floor(savedTest.remainingTime / 60); const secs = Math.floor(savedTest.remainingTime % 60); let answeredCount = 0; if (Array.isArray(savedTest.userAnswers)) answeredCount = savedTest.userAnswers.filter(ans => (Array.isArray(ans) ? ans.some(subAns => subAns !== null) : ans !== null)).length; const levelName = savedTest.levelId ? (appState.levels.find(l=>l.id === savedTest.levelId)?.level_name || `Cấp độ ${savedTest.levelId}`) : "Tổng quát"; item.innerHTML = `<div><p class="font-medium">${levelName} - ${savedTest.moduleName} (${savedTest.mode === 'Training' ? 'Luyện tập' : 'Thi thử'})</p><p class="text-xs text-gray-600">Đã làm ${answeredCount}/${savedTest.questions.length} câu. Thời gian còn lại: ${mins}:${secs < 10 ? '0':''}${secs}</p></div><div><button onclick="startTest(${savedTest.levelId}, ${null}, '${savedTest.moduleName}', '${savedTest.mode}', ${savedTest.id})" class="btn btn-green text-sm py-1 px-3 mr-2">Tiếp tục</button><button onclick="deleteSavedTest(${savedTest.id})" class="btn btn-red text-sm py-1 px-3">Xóa</button></div>`; StudentElements.savedTestsList.appendChild(item); }); }
function deleteSavedTest(id) { if (confirm("Xóa bài thi đã lưu này?")) { appState.savedTests = appState.savedTests.filter(t => t.id !== id); saveTestsToStorage(); renderSavedTestsStudent(); } }
function displayCurrentQuestion() { 
    const qIndex = appState.currentTest.currentQuestionIndex; const question = appState.currentTest.questions[qIndex];
    if (!question) { console.error("Câu hỏi không xác định tại index:", qIndex); return; }
    StudentElements.currentQuestionNumber.textContent = qIndex + 1; StudentElements.totalQuestions.textContent = appState.currentTest.questions.length; StudentElements.questionTextDisplay.textContent = question.question_text;
    if (question.question_image) { StudentElements.questionImageDisplay.src = question.question_image; StudentElements.questionImageDisplay.classList.remove('hidden'); } 
    else { StudentElements.questionImageDisplay.classList.add('hidden'); StudentElements.questionImageDisplay.src = '#'; }
    StudentElements.optionsArea.innerHTML = ''; StudentElements.dragDropArea.classList.add('hidden'); StudentElements.trueFalseTableArea.classList.add('hidden'); StudentElements.trueFalseTableArea.innerHTML = ''; StudentElements.optionsArea.classList.remove('hidden'); 
    const questionTypeCode = question.question_type_code || (appState.questionTypes.find(qt => qt.id === question.question_type) || {}).type_code; 
    switch (questionTypeCode) {
        case 'multiple-choice-single': case 'true-false': 
            (question.options_mc || []).forEach((optionData, index) => { const optionText = typeof optionData === 'string' ? optionData : optionData.text; const optionImageUrl = typeof optionData === 'object' && optionData.image_url ? optionData.image_url : null; const optionDiv = document.createElement('div'); optionDiv.classList.add('question-option'); let optionHTML = `<label for="opt-${qIndex}-${index}" class="student-option-content w-full h-full block cursor-pointer p-0 m-0"><input type="radio" name="mcOption-${qIndex}" id="opt-${qIndex}-${index}" value="${index}" class="mr-2 sr-only"> Lựa chọn ${index + 1}: ${optionText}`; if (optionImageUrl) { optionHTML += `<img src="${optionImageUrl}" alt="Lựa chọn ${index + 1}" class="option-image-student">`; } optionHTML += `</label>`; optionDiv.innerHTML = optionHTML; optionDiv.onclick = (event) => { event.stopPropagation(); selectAnswer(index); }; if (appState.currentTest.userAnswers[qIndex] === index) { optionDiv.classList.add('selected'); const radioInput = optionDiv.querySelector('input'); if(radioInput) radioInput.checked = true; } StudentElements.optionsArea.appendChild(optionDiv); }); break;
        case 'multiple-choice-multiple':
            (question.options_mc || []).forEach((optionData, index) => { const optionText = typeof optionData === 'string' ? optionData : optionData.text; const optionImageUrl = typeof optionData === 'object' && optionData.image_url ? optionData.image_url : null; const optionDiv = document.createElement('div'); optionDiv.classList.add('question-option'); const isSelected = Array.isArray(appState.currentTest.userAnswers[qIndex]) && appState.currentTest.userAnswers[qIndex].includes(index); let optionHTML = `<label for="opt-m-${qIndex}-${index}" class="student-option-content w-full h-full block cursor-pointer p-0 m-0"><input type="checkbox" id="opt-m-${qIndex}-${index}" value="${index}" class="mr-2 sr-only" ${isSelected ? 'checked' : ''}> Lựa chọn ${index + 1}: ${optionText}`; if (optionImageUrl) { optionHTML += `<img src="${optionImageUrl}" alt="Lựa chọn ${index + 1}" class="option-image-student">`; } optionHTML += `</label>`; optionDiv.innerHTML = optionHTML; optionDiv.onclick = (event) => { event.stopPropagation(); selectAnswer(index, true); }; if (isSelected) optionDiv.classList.add('selected'); StudentElements.optionsArea.appendChild(optionDiv); }); break;
        case 'true-false-table': StudentElements.optionsArea.classList.add('hidden'); StudentElements.trueFalseTableArea.classList.remove('hidden'); renderTrueFalseTableQuestion(question, qIndex); break;
        case 'drag-drop-match': StudentElements.optionsArea.classList.add('hidden'); StudentElements.dragDropArea.classList.remove('hidden'); renderDragDropQuestion(question, qIndex); break;
        default: StudentElements.optionsArea.innerHTML = "<p class='text-red-500'>Lỗi: Loại câu hỏi không xác định.</p>";
    }
    StudentElements.prevBtn.disabled = qIndex === 0; StudentElements.nextBtn.disabled = qIndex === appState.currentTest.questions.length - 1;
    const markReviewBtn = StudentElements.markReviewBtn; markReviewBtn.textContent = appState.currentTest.markedForReview[qIndex] ? 'Bỏ đánh dấu' : 'Đánh dấu xem lại'; markReviewBtn.classList.toggle('bg-yellow-600', appState.currentTest.markedForReview[qIndex]); markReviewBtn.classList.toggle('bg-yellow-400', !appState.currentTest.markedForReview[qIndex]);
    if (appState.currentTest.mode === 'Training') { StudentElements.checkAnswerBtn.classList.remove('hidden'); StudentElements.checkAnswerBtn.disabled = appState.currentTest.checkedInTraining[qIndex] || false; } else { StudentElements.checkAnswerBtn.classList.add('hidden'); }
    if (appState.currentTest.mode === 'Training' && appState.currentTest.checkedInTraining[qIndex]) { showExplanation(qIndex); } else { StudentElements.explanationArea.classList.add('hidden'); }
    updateQuestionNavigatorSelection(); 
}
function renderTrueFalseTableQuestion(question, qIndex) { const table = document.createElement('table'); table.className = 'w-full border-collapse'; const tbody = document.createElement('tbody'); (question.statements_tf_table || []).forEach((statement, stmtIndex) => { const row = tbody.insertRow(); row.className = 'true-false-statement-row border-b border-gray-200'; const cellStatement = row.insertCell(); cellStatement.textContent = statement; cellStatement.className = 'py-2 pr-4 text-sm'; const cellTrue = row.insertCell(); cellTrue.className = 'py-2 px-2 text-center'; const radioTrue = document.createElement('input'); radioTrue.type = 'radio'; radioTrue.name = `tf-stmt-${qIndex}-${stmtIndex}`; radioTrue.value = '0'; radioTrue.className = 'form-radio h-4 w-4 text-blue-600'; radioTrue.onclick = () => selectAnswerForTFTable(qIndex, stmtIndex, 0); if (appState.currentTest.userAnswers[qIndex] && appState.currentTest.userAnswers[qIndex][stmtIndex] === 0) radioTrue.checked = true; const labelTrue = document.createElement('label'); labelTrue.className = 'ml-1 text-sm cursor-pointer'; labelTrue.textContent = 'Đúng'; labelTrue.prepend(radioTrue); cellTrue.appendChild(labelTrue); const cellFalse = row.insertCell(); cellFalse.className = 'py-2 px-2 text-center'; const radioFalse = document.createElement('input'); radioFalse.type = 'radio'; radioFalse.name = `tf-stmt-${qIndex}-${stmtIndex}`; radioFalse.value = '1'; radioFalse.className = 'form-radio h-4 w-4 text-blue-600'; radioFalse.onclick = () => selectAnswerForTFTable(qIndex, stmtIndex, 1); if (appState.currentTest.userAnswers[qIndex] && appState.currentTest.userAnswers[qIndex][stmtIndex] === 1) radioFalse.checked = true; const labelFalse = document.createElement('label'); labelFalse.className = 'ml-1 text-sm cursor-pointer'; labelFalse.textContent = 'Sai'; labelFalse.prepend(radioFalse); cellFalse.appendChild(labelFalse); }); table.appendChild(tbody); StudentElements.trueFalseTableArea.appendChild(table); }
function renderDragDropQuestion(question, qIndex) { StudentElements.dragSourceContainer.innerHTML = ''; StudentElements.dropZoneContainer.innerHTML = ''; StudentElements.dragSourceContainer.ondrop = handleDropOnSourceContainer; StudentElements.dragSourceContainer.ondragover = handleDragOver; if (!question.draggable_items_dd || !question.drop_zone_labels_dd) { StudentElements.dropZoneContainer.innerHTML = "<p class='text-red-500'>Lỗi cấu hình kéo thả.</p>"; return; } const currentAnswersInZones = appState.currentTest.userAnswers[qIndex] || new Array(question.drop_zone_labels_dd.length).fill(null); question.draggable_items_dd.forEach((itemText, originalItemIndex) => { const dragDiv = document.createElement('div'); dragDiv.id = `drag-${qIndex}-${originalItemIndex}`; dragDiv.textContent = itemText; dragDiv.classList.add('drag-option-source'); dragDiv.dataset.originalItemIndex = originalItemIndex; dragDiv.dataset.isSourceItem = "true"; if (currentAnswersInZones.includes(originalItemIndex)) { dragDiv.draggable = false; } else { dragDiv.draggable = true; } dragDiv.addEventListener('dragstart', handleDragStart); StudentElements.dragSourceContainer.appendChild(dragDiv); }); question.drop_zone_labels_dd.forEach((label, zoneIndex) => { const dropDiv = document.createElement('div'); dropDiv.id = `dropzone-${qIndex}-${zoneIndex}`; dropDiv.classList.add('drop-zone-target'); dropDiv.dataset.zoneIndex = zoneIndex; const droppedItemOriginalIndex = currentAnswersInZones[zoneIndex]; if (droppedItemOriginalIndex !== null && droppedItemOriginalIndex !== undefined && question.draggable_items_dd[droppedItemOriginalIndex] !== undefined) { dropDiv.textContent = question.draggable_items_dd[droppedItemOriginalIndex]; dropDiv.classList.add('dropped', 'bg-indigo-200', 'text-indigo-800', 'border-solid'); dropDiv.classList.remove('text-gray-500', 'border-dashed'); dropDiv.draggable = true; dropDiv.dataset.originalItemIndex = droppedItemOriginalIndex; dropDiv.dataset.currentZoneIndex = zoneIndex; dropDiv.addEventListener('dragstart', handleDragStartFromZone); } else { dropDiv.textContent = label; dropDiv.draggable = false; } dropDiv.addEventListener('dragover', handleDragOver); dropDiv.addEventListener('dragleave', handleDragLeave); dropDiv.addEventListener('drop', handleDrop); StudentElements.dropZoneContainer.appendChild(dropDiv); }); }
function checkCurrentAnswer() { const qIndex = appState.currentTest.currentQuestionIndex; if (appState.currentTest.mode === 'Training' && !appState.currentTest.checkedInTraining[qIndex]) { showExplanation(qIndex); appState.currentTest.checkedInTraining[qIndex] = true; StudentElements.checkAnswerBtn.disabled = true; updateQuestionNavigator(); } }
function selectAnswerForTFTable(qIndex, stmtIndex, choice) { if (!appState.currentTest.userAnswers[qIndex] || !Array.isArray(appState.currentTest.userAnswers[qIndex])) { const numStatements = appState.currentTest.questions[qIndex].statements_tf_table.length; appState.currentTest.userAnswers[qIndex] = new Array(numStatements).fill(null); } appState.currentTest.userAnswers[qIndex][stmtIndex] = choice; const radioButtonsInRow = document.querySelectorAll(`input[name="tf-stmt-${qIndex}-${stmtIndex}"]`); radioButtonsInRow.forEach(rb => rb.checked = (parseInt(rb.value) === choice)); updateQuestionNavigator(); }
function selectAnswer(optionIndex, isMultiple = false) { const qIndex = appState.currentTest.currentQuestionIndex; const question = appState.currentTest.questions[qIndex]; const questionTypeCode = question.question_type_code || (appState.questionTypes.find(qt => qt.id === question.question_type) || {}).type_code; if (questionTypeCode === 'true-false-table') return; if (isMultiple) { if (!Array.isArray(appState.currentTest.userAnswers[qIndex])) { appState.currentTest.userAnswers[qIndex] = []; } let currentAnswers = appState.currentTest.userAnswers[qIndex]; const itemIndexInAnswers = currentAnswers.indexOf(optionIndex); if (itemIndexInAnswers > -1) { currentAnswers.splice(itemIndexInAnswers, 1); } else { currentAnswers.push(optionIndex); } appState.currentTest.userAnswers[qIndex] = currentAnswers; } else { appState.currentTest.userAnswers[qIndex] = optionIndex; } const optionDivs = StudentElements.optionsArea.querySelectorAll('.question-option'); optionDivs.forEach((div, idx) => { const input = div.querySelector('input'); let isSelected = false; if (isMultiple) { isSelected = Array.isArray(appState.currentTest.userAnswers[qIndex]) && appState.currentTest.userAnswers[qIndex].includes(idx); } else { isSelected = (idx === optionIndex); } div.classList.toggle('selected', isSelected); if(input) input.checked = isSelected; }); updateQuestionNavigator(); }
function showExplanation(qIndex) { const question = appState.currentTest.questions[qIndex]; const userAnswer = appState.currentTest.userAnswers[qIndex]; const questionTypeCode = question.question_type_code || (appState.questionTypes.find(qt => qt.id === question.question_type) || {}).type_code; StudentElements.explanationArea.classList.add('hidden'); if (!question || userAnswer === null || (Array.isArray(userAnswer) && userAnswer.length === 0 && questionTypeCode !== 'drag-drop-match' && questionTypeCode !== 'true-false-table') || (questionTypeCode === 'true-false-table' && (!Array.isArray(userAnswer) || userAnswer.some(ans => ans === null)) ) ) { if (questionTypeCode !== 'drag-drop-match' && questionTypeCode !== 'true-false-table') return; if(questionTypeCode === 'true-false-table' && (!Array.isArray(userAnswer) || userAnswer.some(ans => ans === null))) return; } if (question.explanation) { StudentElements.explanationTextDisplay.textContent = question.explanation; StudentElements.explanationArea.classList.remove('hidden'); } if (questionTypeCode.startsWith('multiple-choice') || questionTypeCode === 'true-false') { const optionDivs = StudentElements.optionsArea.querySelectorAll('.question-option'); optionDivs.forEach((div, idx) => { div.classList.remove('correct', 'incorrect'); div.onclick = null; let isCorrectOption = questionTypeCode === 'multiple-choice-multiple' ? (question.correct_answers_mc_multiple || []).includes(idx) : (idx === question.correct_answer_mc_single); let isUserSelectedOption = questionTypeCode === 'multiple-choice-multiple' ? (userAnswer || []).includes(idx) : (idx === userAnswer); if (isCorrectOption) div.classList.add('correct'); else if (isUserSelectedOption && !isCorrectOption) div.classList.add('incorrect'); }); } else if (questionTypeCode === 'true-false-table') { const tableRows = StudentElements.trueFalseTableArea.querySelectorAll('.true-false-statement-row'); tableRows.forEach((row, stmtIndex) => { const userChoice = userAnswer[stmtIndex]; const correctChoice = question.correct_answers_tf_table[stmtIndex]; const cells = row.querySelectorAll('td'); const trueCell = cells[1]; const falseCell = cells[2]; trueCell.classList.remove('correct-cell', 'incorrect-cell'); falseCell.classList.remove('correct-cell', 'incorrect-cell'); trueCell.querySelectorAll('input').forEach(rb => rb.disabled = true); falseCell.querySelectorAll('input').forEach(rb => rb.disabled = true); if (userChoice === correctChoice) { if (correctChoice === 0) trueCell.classList.add('correct-cell'); else falseCell.classList.add('correct-cell'); } else { if (userChoice === 0) trueCell.classList.add('incorrect-cell'); else if (userChoice === 1) falseCell.classList.add('incorrect-cell'); if (correctChoice === 0) trueCell.classList.add('correct-cell'); else falseCell.classList.add('correct-cell'); } }); } else if (questionTypeCode === 'drag-drop-match') { const dropZones = StudentElements.dropZoneContainer.querySelectorAll('.drop-zone-target'); dropZones.forEach((zone, zoneIdx) => { zone.classList.remove('correct', 'incorrect'); const droppedItemOriginalIndex = userAnswer[zoneIdx]; const correctMapping = question.draggable_items_dd.map((_,i)=>i); const isZoneCorrect = (droppedItemOriginalIndex === correctMapping[zoneIdx]); if (droppedItemOriginalIndex !== null && droppedItemOriginalIndex !== undefined) { if (isZoneCorrect) zone.classList.add('correct'); else zone.classList.add('incorrect'); } zone.removeEventListener('dragover', handleDragOver); zone.removeEventListener('drop', handleDrop); zone.draggable = false; }); StudentElements.dragSourceContainer.querySelectorAll('.drag-option-source').forEach(s => s.draggable = false); } }
function nextQuestion() { if (appState.currentTest.currentQuestionIndex < appState.currentTest.questions.length - 1) { appState.currentTest.currentQuestionIndex++; displayCurrentQuestion(); } }
function prevQuestion() { if (appState.currentTest.currentQuestionIndex > 0) { appState.currentTest.currentQuestionIndex--; displayCurrentQuestion(); } }
function markForReview() { const qIndex = appState.currentTest.currentQuestionIndex; appState.currentTest.markedForReview[qIndex] = !appState.currentTest.markedForReview[qIndex]; displayCurrentQuestion(); updateQuestionNavigator(); }
function updateQuestionNavigator() { const navigator = StudentElements.questionNavigator; navigator.innerHTML = ''; appState.currentTest.questions.forEach((q, index) => { const btn = document.createElement('button'); btn.textContent = index + 1; btn.id = `nav-q-${index}`; btn.classList.add('p-2', 'border', 'rounded', 'text-sm', 'transition-colors', 'focus:outline-none', 'focus:ring-2', 'focus:ring-blue-300'); let isAnswered = false; const currentAnswer = appState.currentTest.userAnswers[index]; const questionTypeCode = q.question_type_code || (appState.questionTypes.find(qt => qt.id === q.question_type) || {}).type_code; if (questionTypeCode === 'multiple-choice-multiple') isAnswered = Array.isArray(currentAnswer) && currentAnswer.length > 0; else if (questionTypeCode === 'drag-drop-match' || questionTypeCode === 'true-false-table') isAnswered = Array.isArray(currentAnswer) && currentAnswer.some(val => val !== null && val !== undefined); else isAnswered = currentAnswer !== null; if (index === appState.currentTest.currentQuestionIndex) btn.classList.add('bg-blue-500', 'text-white', 'border-blue-700'); else if (isAnswered) { if (appState.currentTest.mode === 'Training' && appState.currentTest.checkedInTraining[index]) { let isCorrect = false; const userAnswer = appState.currentTest.userAnswers[index]; const question = appState.currentTest.questions[index]; switch (questionTypeCode) { case 'multiple-choice-single': case 'true-false': isCorrect = userAnswer === question.correct_answer_mc_single; break; case 'multiple-choice-multiple': if(Array.isArray(userAnswer) && Array.isArray(question.correct_answers_mc_multiple)) isCorrect = userAnswer.length === question.correct_answers_mc_multiple.length && userAnswer.every(val => question.correct_answers_mc_multiple.includes(val)); break; case 'true-false-table': if(Array.isArray(userAnswer) && Array.isArray(question.correct_answers_tf_table)) isCorrect = userAnswer.every((val, i) => val === question.correct_answers_tf_table[i]) && userAnswer.length === question.correct_answers_tf_table.length && !userAnswer.some(ans => ans === null); break; case 'drag-drop-match': if(Array.isArray(userAnswer) && Array.isArray(question.draggable_items_dd)) { const correctMapping = question.draggable_items_dd.map((_,i)=>i); isCorrect = userAnswer.every((val, idx) => val === correctMapping[idx]); } break; } btn.classList.add(isCorrect ? 'bg-green-300' : 'bg-red-300'); } else btn.classList.add('bg-gray-300'); } else btn.classList.add('bg-white', 'hover:bg-gray-100'); if (appState.currentTest.markedForReview[index]) btn.classList.add('border-yellow-500', 'border-2'); else btn.classList.remove('border-yellow-500', 'border-2'); btn.onclick = () => { appState.currentTest.currentQuestionIndex = index; displayCurrentQuestion(); }; navigator.appendChild(btn); }); }
function updateQuestionNavigatorSelection() { updateQuestionNavigator(); }
function handleDragStart(e) { draggedItemElement = e.target; draggedItemData = { id: draggedItemElement.id, originalItemIndex: parseInt(draggedItemElement.dataset.originalItemIndex), sourceType: 'sourceList', textContent: draggedItemElement.textContent }; e.dataTransfer.setData('text/plain', draggedItemElement.id); e.dataTransfer.effectAllowed = 'move'; setTimeout(() => { if(draggedItemElement) draggedItemElement.classList.add('dragging'); }, 0); }
function handleDragStartFromZone(e) { draggedItemElement = e.target; draggedItemData = { id: draggedItemElement.id, originalItemIndex: parseInt(draggedItemElement.dataset.originalItemIndex), sourceType: 'zone', sourceZoneIndex: parseInt(draggedItemElement.dataset.currentZoneIndex), textContent: draggedItemElement.textContent }; e.dataTransfer.setData('text/plain', draggedItemElement.id); e.dataTransfer.effectAllowed = 'move'; setTimeout(() => { if(draggedItemElement) draggedItemElement.classList.add('dragging'); }, 0); }
function handleDragOver(e) { e.preventDefault(); const targetZone = e.target.closest('.drop-zone-target, #dragSourceContainer'); if (targetZone) targetZone.classList.add('over'); }
function handleDragLeave(e) { const targetZone = e.target.closest('.drop-zone-target, #dragSourceContainer'); if (targetZone) targetZone.classList.remove('over'); }
function handleDropOnSourceContainer(e) { e.preventDefault(); StudentElements.dragSourceContainer.classList.remove('over'); if (draggedItemData.sourceType === 'zone') { const qIndex = appState.currentTest.currentQuestionIndex; const sourceZoneIndex = draggedItemData.sourceZoneIndex; const originalItemIndexToReactivate = draggedItemData.originalItemIndex; appState.currentTest.userAnswers[qIndex][sourceZoneIndex] = null; const sourceDropZoneElement = document.getElementById(`dropzone-${qIndex}-${sourceZoneIndex}`); if (sourceDropZoneElement) { sourceDropZoneElement.textContent = appState.currentTest.questions[qIndex].drop_zone_labels_dd[sourceZoneIndex]; sourceDropZoneElement.classList.remove('dropped', 'bg-indigo-200', 'text-indigo-800', 'border-solid'); sourceDropZoneElement.classList.add('text-gray-500', 'border-dashed'); sourceDropZoneElement.draggable = false; delete sourceDropZoneElement.dataset.originalItemIndex; delete sourceDropZoneElement.dataset.currentZoneIndex; sourceDropZoneElement.removeEventListener('dragstart', handleDragStartFromZone); } const sourceListItem = document.getElementById(`drag-${qIndex}-${originalItemIndexToReactivate}`); if (sourceListItem) { sourceListItem.style.opacity = '1'; sourceListItem.draggable = true; } } if (draggedItemElement) draggedItemElement.classList.remove('dragging'); draggedItemElement = null; draggedItemData = {}; updateQuestionNavigator(); }
function handleDrop(e) { e.preventDefault(); const targetDropZone = e.target.closest('.drop-zone-target'); if (!targetDropZone) { if (draggedItemElement) draggedItemElement.classList.remove('dragging'); draggedItemElement = null; draggedItemData = {}; return; } targetDropZone.classList.remove('over'); const qIndex = appState.currentTest.currentQuestionIndex; const question = appState.currentTest.questions[qIndex]; const targetZoneIndex = parseInt(targetDropZone.dataset.zoneIndex); const draggedOriginalItemIndex = draggedItemData.originalItemIndex; const sourceType = draggedItemData.sourceType; const sourceZoneIndexIfFromZone = draggedItemData.sourceZoneIndex; if (sourceType === 'zone' && sourceZoneIndexIfFromZone === targetZoneIndex) { if (draggedItemElement) draggedItemElement.classList.remove('dragging'); draggedItemElement = null; draggedItemData = {}; return; } const itemPreviouslyInTargetZoneOriginalIndex = appState.currentTest.userAnswers[qIndex][targetZoneIndex]; if (itemPreviouslyInTargetZoneOriginalIndex !== null && itemPreviouslyInTargetZoneOriginalIndex !== undefined && itemPreviouslyInTargetZoneOriginalIndex !== draggedOriginalItemIndex) { const prevSourceItemElement = document.getElementById(`drag-${qIndex}-${itemPreviouslyInTargetZoneOriginalIndex}`); if (prevSourceItemElement) { prevSourceItemElement.style.opacity = '1'; prevSourceItemElement.draggable = true; } } if (sourceType === 'zone' && sourceZoneIndexIfFromZone !== null && sourceZoneIndexIfFromZone !== targetZoneIndex) { appState.currentTest.userAnswers[qIndex][sourceZoneIndexIfFromZone] = null; const sourceDropZoneElement = document.getElementById(`dropzone-${qIndex}-${sourceZoneIndexIfFromZone}`); if (sourceDropZoneElement) { sourceDropZoneElement.textContent = question.drop_zone_labels_dd[sourceZoneIndexIfFromZone]; sourceDropZoneElement.classList.remove('dropped', 'bg-indigo-200', 'text-indigo-800', 'border-solid'); sourceDropZoneElement.classList.add('text-gray-500', 'border-dashed'); sourceDropZoneElement.draggable = false; delete sourceDropZoneElement.dataset.originalItemIndex; delete sourceDropZoneElement.dataset.currentZoneIndex; sourceDropZoneElement.removeEventListener('dragstart', handleDragStartFromZone); } } targetDropZone.textContent = question.draggable_items_dd[draggedOriginalItemIndex]; targetDropZone.classList.add('dropped', 'bg-indigo-200', 'text-indigo-800', 'border-solid'); targetDropZone.classList.remove('text-gray-500', 'border-dashed'); targetDropZone.draggable = true; targetDropZone.dataset.originalItemIndex = draggedOriginalItemIndex; targetDropZone.dataset.currentZoneIndex = targetZoneIndex; targetDropZone.removeEventListener('dragstart', handleDragStartFromZone); targetDropZone.addEventListener('dragstart', handleDragStartFromZone); appState.currentTest.userAnswers[qIndex][targetZoneIndex] = draggedOriginalItemIndex; const sourceListItem = document.getElementById(`drag-${qIndex}-${draggedOriginalItemIndex}`); if (sourceListItem) { sourceListItem.style.opacity = '0.3'; sourceListItem.draggable = false; } if (draggedItemElement) draggedItemElement.classList.remove('dragging'); draggedItemElement = null; draggedItemData = {}; updateQuestionNavigator(); }
function startTimer() { const timerDisplay = StudentElements.timer; if (appState.currentTest.timerInterval) clearInterval(appState.currentTest.timerInterval); let timeLeft = appState.currentTest.remainingTime !== undefined ? appState.currentTest.remainingTime : appState.currentTest.timeLimit; function updateDisplay() { const minutes = Math.floor(timeLeft / 60); const seconds = Math.floor(timeLeft % 60); timerDisplay.textContent = `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`; } updateDisplay(); if (appState.currentTest.mode === 'Testing') { timerDisplay.classList.remove('hidden'); appState.currentTest.timerInterval = setInterval(() => { timeLeft--; appState.currentTest.remainingTime = timeLeft; updateDisplay(); if (timeLeft <= 0) { clearInterval(appState.currentTest.timerInterval); appState.currentTest.timerInterval = null; alert('Hết giờ làm bài!'); submitTest(); } }, 1000); } else { timerDisplay.textContent = "Không giới hạn"; } }
function confirmEndTest() { Views.confirmEndTestModal.classList.remove('hidden'); }
function closeConfirmEndTestModal() { Views.confirmEndTestModal.classList.add('hidden'); }
function formatTime(totalSeconds) { if (isNaN(totalSeconds) || totalSeconds < 0) return "00:00:00"; const hours = Math.floor(totalSeconds / 3600); const minutes = Math.floor((totalSeconds % 3600) / 60); const seconds = Math.floor(totalSeconds % 60); return `${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`; }
function submitTest() { closeConfirmEndTestModal(); if (appState.currentTest.timerInterval) { clearInterval(appState.currentTest.timerInterval); appState.currentTest.timerInterval = null; } appState.currentTest.endTime = new Date(); let score = 0; const moduleScores = {}; const moduleTotals = {}; appState.currentTest.questions.forEach(q => { const moduleKey = q.module_name || (appState.modules.find(m => m.id === q.module) || {}).module_name || "Không xác định"; if (!moduleScores[moduleKey]) { moduleScores[moduleKey] = 0; moduleTotals[moduleKey] = 0; } moduleTotals[moduleKey]++; }); try { appState.currentTest.questions.forEach((q, index) => { const userAnswer = appState.currentTest.userAnswers[index]; let isCorrect = false; const questionTypeCode = q.question_type_code || (appState.questionTypes.find(qt => qt.id === q.question_type) || {}).type_code; const moduleKey = q.module_name || (appState.modules.find(m => m.id === q.module) || {}).module_name || "Không xác định"; switch (questionTypeCode) { case 'multiple-choice-single': case 'true-false': isCorrect = userAnswer === q.correct_answer_mc_single; break; case 'multiple-choice-multiple': if (Array.isArray(userAnswer) && Array.isArray(q.correct_answers_mc_multiple)) { const sortedUser = [...userAnswer].sort((a,b)=>a-b); const sortedCorrect = [...q.correct_answers_mc_multiple].sort((a,b)=>a-b); isCorrect = sortedUser.length === sortedCorrect.length && sortedUser.every((val, i) => val === sortedCorrect[i]); } else isCorrect = false; break; case 'true-false-table': if (Array.isArray(userAnswer) && Array.isArray(q.correct_answers_tf_table) && q.statements_tf_table && userAnswer.length === q.statements_tf_table.length && q.correct_answers_tf_table.length === q.statements_tf_table.length) { isCorrect = userAnswer.every((ans, i) => ans === q.correct_answers_tf_table[i] && ans !== null); } else isCorrect = false; break; case 'drag-drop-match': if (Array.isArray(userAnswer) && Array.isArray(q.draggable_items_dd) && q.drop_zone_labels_dd) { const correctMapping = q.draggable_items_dd.map((_,i)=>i); isCorrect = userAnswer.every((droppedItemOriginalIndex, dropZoneIdx) => droppedItemOriginalIndex !== null && droppedItemOriginalIndex === correctMapping[dropZoneIdx]); if (isCorrect && userAnswer.length !== q.drop_zone_labels_dd.length) isCorrect = false; if (isCorrect && userAnswer.some(ans => ans === null)) isCorrect = false; } else isCorrect = false; break; } if (isCorrect) { score++; moduleScores[moduleKey]++; } }); } catch (error) { console.error("Lỗi tính điểm:", error); alert("Lỗi tính điểm. Kiểm tra console."); return; } appState.currentTest.calculatedModuleScores = moduleScores; appState.currentTest.calculatedModuleTotals = moduleTotals; const totalQ = appState.currentTest.questions.length; const percentage = totalQ > 0 ? (score / totalQ) * 100 : 0; const passed = percentage >= (appState.currentTest.minPassingScoreRaw * 100); StudentElements.resultViewTestTakerId.textContent = appState.currentTest.testTakerId; StudentElements.resultViewTestTitle.textContent = appState.currentTest.testTitleString; StudentElements.resultViewCategory.textContent = "IC3 GS6 Spark"; const timeUsedSeconds = Math.floor((appState.currentTest.endTime - appState.currentTest.startTime) / 1000); StudentElements.resultViewTimeUsed.textContent = formatTime(timeUsedSeconds); StudentElements.resultViewTotalTimeAllowed.textContent = appState.currentTest.totalTimeAllowedForDisplay; StudentElements.resultViewProduct.textContent = appState.currentTest.moduleName === "Tổng hợp" ? "Spark Level 1 (Tổng hợp)" : `Spark Level 1 (${appState.currentTest.moduleName})`; StudentElements.resultViewScore.textContent = `${score}/${totalQ}`; StudentElements.resultViewMode.textContent = appState.currentTest.mode === "Testing" ? "Testing" : "Training"; const minPassingQuestions = Math.ceil(appState.currentTest.minPassingScoreRaw * totalQ); StudentElements.resultViewMinPassingScore.textContent = `${minPassingQuestions}/${totalQ} (${appState.currentTest.minPassingScoreRaw * 100}%)`; StudentElements.resultViewDateFinished.textContent = appState.currentTest.endTime.toLocaleString('vi-VN', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: true }); StudentElements.resultViewPlaceholderId.textContent = `ID Bài thi: ${Date.now().toString().slice(-6)}`; StudentElements.resultViewOverallStatus.textContent = passed ? "ĐẠT" : "TRƯỢT"; StudentElements.resultViewOverallStatus.className = `text-2xl font-semibold ${passed ? 'text-green-600' : 'text-red-600'}`; StudentElements.resultViewMotivationalMessage.textContent = passed ? "Chúc mừng bạn!" : "Đừng bỏ cuộc, hãy cố gắng hơn nhé!"; try { displayReview(); } catch (error) { console.error("Lỗi hiển thị xem lại:", error); alert("Lỗi hiển thị xem lại. Kiểm tra console."); } showView(Views.student); Views.testTaking.classList.add('hidden'); Views.results.classList.remove('hidden'); }
function displayReview() { StudentElements.resultViewBreakdown.innerHTML = ''; const moduleScores = appState.currentTest.calculatedModuleScores; const moduleTotals = appState.currentTest.calculatedModuleTotals; const modulesInThisTest = Object.keys(moduleTotals).sort(); if (modulesInThisTest.length === 0 && appState.currentTest.questions.length > 0) { const noBreakdownItem = document.createElement('div'); noBreakdownItem.className = 'breakdown-item text-sm text-gray-500'; noBreakdownItem.textContent = 'Không có phân tích điểm theo chủ đề cho bài thi này.'; StudentElements.resultViewBreakdown.appendChild(noBreakdownItem); } else if (appState.currentTest.questions.length === 0) { const noBreakdownItem = document.createElement('div'); noBreakdownItem.className = 'breakdown-item text-sm text-gray-500'; noBreakdownItem.textContent = 'Không có câu hỏi nào trong bài thi này để phân tích.'; StudentElements.resultViewBreakdown.appendChild(noBreakdownItem); } for (const moduleName of modulesInThisTest) { if (moduleTotals.hasOwnProperty(moduleName)) { const correct = moduleScores[moduleName] || 0; const totalInTestForModule = moduleTotals[moduleName]; const percentage = totalInTestForModule > 0 ? ((correct / totalInTestForModule) * 100).toFixed(0) : 0; const breakdownItem = document.createElement('div'); breakdownItem.className = 'breakdown-item text-sm'; breakdownItem.innerHTML = `<span>${moduleName}</span><span class="font-medium">${correct}/${totalInTestForModule} (${percentage}%)</span>`; StudentElements.resultViewBreakdown.appendChild(breakdownItem); } } StudentElements.resultViewQuestionReviewList.innerHTML = ''; try { appState.currentTest.questions.forEach((q, index) => { const reviewItem = document.createElement('div'); reviewItem.className = 'question-review-item'; const userAnswer = appState.currentTest.userAnswers[index]; let isCorrectOverall = false; let userAnswerDisplay = 'Chưa trả lời'; let correctAnswerDisplay = 'N/A'; const questionTypeCode = q.question_type_code || (appState.questionTypes.find(qt => qt.id === q.question_type) || {}).type_code; const moduleName = q.module_name || (appState.modules.find(m => m.id === q.module) || {}).module_name || "N/A"; switch (questionTypeCode) { case 'multiple-choice-single': case 'true-false': isCorrectOverall = userAnswer === q.correct_answer_mc_single; userAnswerDisplay = (userAnswer !== null && q.options_mc && q.options_mc[userAnswer] !== undefined) ? (typeof q.options_mc[userAnswer] === 'string' ? q.options_mc[userAnswer] : q.options_mc[userAnswer].text) : (userAnswer !== null ? "Lựa chọn không hợp lệ" : "Chưa trả lời"); correctAnswerDisplay = (q.options_mc && q.options_mc[q.correct_answer_mc_single] !== undefined) ? (typeof q.options_mc[q.correct_answer_mc_single] === 'string' ? q.options_mc[q.correct_answer_mc_single] : q.options_mc[q.correct_answer_mc_single].text) : "Đáp án không hợp lệ"; break; case 'multiple-choice-multiple': if (Array.isArray(userAnswer) && Array.isArray(q.correct_answers_mc_multiple) && q.options_mc) { const sortedUser = [...userAnswer].sort((a,b)=>a-b); const sortedCorrect = [...q.correct_answers_mc_multiple].sort((a,b)=>a-b); isCorrectOverall = sortedUser.length === sortedCorrect.length && sortedUser.every((val, i) => val === sortedCorrect[i]); userAnswerDisplay = sortedUser.map(i => { const opt = q.options_mc[i]; return (typeof opt === 'string' ? opt : opt?.text) || `Lựa chọn ${i} lỗi`; }).join(', ') || (userAnswer.length > 0 ? "Lựa chọn không hợp lệ" : 'Chưa trả lời'); correctAnswerDisplay = sortedCorrect.map(i => { const opt = q.options_mc[i]; return (typeof opt === 'string' ? opt : opt?.text) || `Đáp án ${i} lỗi`; }).join(', '); } else { userAnswerDisplay = (Array.isArray(userAnswer) && userAnswer.length > 0) ? userAnswer.map(i => `ID: ${i}`).join(', ') : 'Chưa trả lời'; correctAnswerDisplay = Array.isArray(q.correct_answers_mc_multiple) ? q.correct_answers_mc_multiple.map(i => `ID: ${i}`).join(', ') : 'Không có đáp án đúng'; } break; case 'true-false-table': userAnswerDisplay = '<table class="w-full text-sm mt-1 table-fixed">'; correctAnswerDisplay = ''; let allStmtsCorrectInTable = true; if (Array.isArray(userAnswer) && Array.isArray(q.correct_answers_tf_table) && Array.isArray(q.statements_tf_table) && userAnswer.length === q.statements_tf_table.length) { q.statements_tf_table.forEach((stmt, stmtIdx) => { const userAnsForStmt = userAnswer[stmtIdx]; const correctAnsForStmt = q.correct_answers_tf_table[stmtIdx]; const stmtCorrect = userAnsForStmt === correctAnsForStmt && userAnsForStmt !== null; if (!stmtCorrect && userAnsForStmt !== null) allStmtsCorrectInTable = false; else if (userAnsForStmt === null) allStmtsCorrectInTable = false; userAnswerDisplay += `<tr class="border-b last:border-b-0 ${userAnsForStmt === null ? '' : (stmtCorrect ? 'bg-green-50' : 'bg-red-50')}"><td class="py-1 pr-2 truncate" title="${stmt}">${stmtIdx + 1}. ${stmt}</td><td class="px-2 py-1 text-center w-20">${userAnsForStmt === 0 ? "Đúng" : (userAnsForStmt === 1 ? "Sai" : "-")}</td><td class="px-2 py-1 text-center w-20 font-semibold ${stmtCorrect && userAnsForStmt !== null ? 'text-green-700' : (userAnsForStmt !== null ? 'text-red-700' : '')}">${correctAnsForStmt === 0 ? "Đúng" : "Sai"}</td></tr>`; }); } else { userAnswerDisplay += '<tr><td>Lỗi dữ liệu trả lời cho bảng.</td></tr>'; allStmtsCorrectInTable = false; } userAnswerDisplay += '</table>'; isCorrectOverall = allStmtsCorrectInTable && (Array.isArray(userAnswer) && userAnswer.length === q.statements_tf_table.length && !userAnswer.some(ans => ans === null)); break; case 'drag-drop-match': if (Array.isArray(userAnswer) && Array.isArray(q.draggable_items_dd) && q.drop_zone_labels_dd) { const correctMapping = q.draggable_items_dd.map((_,i)=>i); isCorrectOverall = userAnswer.every((droppedItemOriginalIndex, dropZoneIdx) => droppedItemOriginalIndex !== null && droppedItemOriginalIndex === correctMapping[dropZoneIdx]) && userAnswer.length === q.drop_zone_labels_dd.length && !userAnswer.some(ans => ans === null); userAnswerDisplay = '<ul class="list-disc list-inside text-xs">'; q.drop_zone_labels_dd.forEach((label, dzIdx) => { const droppedItemOriginalIndex = userAnswer[dzIdx]; userAnswerDisplay += `<li>${label}: ${droppedItemOriginalIndex !== null && droppedItemOriginalIndex !== undefined && q.draggable_items_dd[droppedItemOriginalIndex] ? q.draggable_items_dd[droppedItemOriginalIndex] : '<em>Trống</em>'}</li>`; }); userAnswerDisplay += '</ul>'; correctAnswerDisplay = '<ul class="list-disc list-inside text-xs">'; q.drop_zone_labels_dd.forEach((label, dzIdx) => { const correctDraggableItemOriginalIndex = correctMapping[dzIdx]; correctAnswerDisplay += `<li>${label}: ${q.draggable_items_dd[correctDraggableItemOriginalIndex] || "Mục lỗi"}</li>`; }); correctAnswerDisplay += '</ul>'; } else { userAnswerDisplay = 'Dữ liệu trả lời không hợp lệ.'; correctAnswerDisplay = 'Không thể hiển thị đáp án đúng.'; } break; } const statusIcon = isCorrectOverall ? '<span class="status-icon correct"></span>' : '<span class="status-icon incorrect"></span>'; reviewItem.innerHTML = `<div class="flex items-start text-sm">${statusIcon}<span class="font-medium mr-2">${index + 1}.</span><span class="flex-1">${q.question_text || "Lỗi nội dung"} (${moduleName})</span></div>${q.question_image ? `<img src="${q.question_image}" alt="Hình ảnh câu hỏi" class="review-question-image ml-8">` : ''}${questionTypeCode !== 'true-false-table' ? `<div class="pl-8 mt-1 text-xs"><p>Lựa chọn của bạn: <span class="font-medium review-answer ${isCorrectOverall ? 'correct' : 'incorrect'}">${userAnswerDisplay}</span></p><p>Đáp án đúng: <span class="font-medium">${correctAnswerDisplay}</span></p></div>` : `<div class="pl-8 mt-1 text-xs">${userAnswerDisplay}</div>`}${q.explanation ? `<p class="pl-8 mt-1 text-xs text-gray-600"><em>Giải thích: ${q.explanation}</em></p>` : ''}`; StudentElements.resultViewQuestionReviewList.appendChild(reviewItem); }); } catch (error) { console.error("Lỗi trong displayReview loop:", error); StudentElements.resultViewQuestionReviewList.innerHTML = '<p class="text-red-500">Lỗi hiển thị xem lại. Kiểm tra console.</p>'; } }
        function backToTestSelection() { showView(Views.student); Views.results.classList.add('hidden'); Views.levelSelectionStudent.classList.remove('hidden'); Views.testSelection.classList.add('hidden'); renderLevelSelectionButtons(); } 
        document.addEventListener('DOMContentLoaded', initializeApp);
