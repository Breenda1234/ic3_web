# quiz_api/views.py
from django.shortcuts import render
# quiz_api/views.py
from rest_framework import generics, status, views
from rest_framework.response import Response
from rest_framework.parsers import MultiPartParser, JSONParser, FormParser
from rest_framework.permissions import IsAuthenticated, AllowAny # Thêm AllowAny
from django.contrib.auth import authenticate, login, logout
from django.middleware.csrf import get_token # Để lấy CSRF token cho frontend nếu cần

from .models import Module, QuestionType, Question, Level
from .serializers import ModuleSerializer, QuestionTypeSerializer, QuestionSerializer, LevelSerializer
import openpyxl 
import logging
import json

logger = logging.getLogger(__name__)

# --- Authentication Views ---
class LoginView(views.APIView):
    permission_classes = [AllowAny] # Ai cũng có thể thử đăng nhập

    def post(self, request, format=None):
        username = request.data.get('username')
        password = request.data.get('password')
        user = authenticate(request, username=username, password=password)
        if user is not None:
            login(request, user)
            # Trả về thông tin người dùng cơ bản (an toàn)
            return Response({
                "message": "Đăng nhập thành công.",
                "user": {
                    "id": user.id,
                    "username": user.username,
                    "email": user.email,
                    "is_staff": user.is_staff # Quan trọng để frontend biết đây là admin
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({"error": "Tên đăng nhập hoặc mật khẩu không đúng."}, status=status.HTTP_400_BAD_REQUEST)

class LogoutView(views.APIView):
    permission_classes = [IsAuthenticated] # Chỉ người đã đăng nhập mới có thể đăng xuất

    def post(self, request, format=None):
        logout(request)
        return Response({"message": "Đăng xuất thành công."}, status=status.HTTP_200_OK)

class CheckAuthView(views.APIView):
    permission_classes = [AllowAny] # Cho phép kiểm tra mà không cần đăng nhập trước

    def get(self, request, format=None):
        if request.user.is_authenticated:
            return Response({
                "is_authenticated": True,
                "user": {
                    "id": request.user.id,
                    "username": request.user.username,
                    "email": request.user.email,
                    "is_staff": request.user.is_staff
                }
            }, status=status.HTTP_200_OK)
        else:
            return Response({"is_authenticated": False}, status=status.HTTP_200_OK)

class CSRFTokenView(views.APIView):
    permission_classes = [AllowAny]
    def get(self, request, format=None):
        return Response({'csrfToken': get_token(request)})


# --- Model Views (Thêm permission_classes) ---
class LevelListView(generics.ListAPIView):
    queryset = Level.objects.all()
    serializer_class = LevelSerializer
    permission_classes = [AllowAny] # Cho phép xem level mà không cần đăng nhập

class ModuleListView(generics.ListAPIView):
    queryset = Module.objects.all()
    serializer_class = ModuleSerializer
    permission_classes = [AllowAny] # Cho phép xem module mà không cần đăng nhập

class QuestionTypeListView(generics.ListAPIView):
    queryset = QuestionType.objects.all()
    serializer_class = QuestionTypeSerializer
    permission_classes = [AllowAny] # Cho phép xem loại câu hỏi mà không cần đăng nhập

class QuestionListCreateView(generics.ListCreateAPIView):
    queryset = Question.objects.filter(is_active=True).select_related('module', 'question_type', 'level')
    serializer_class = QuestionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser] 
    
    def get_permissions(self):
        """
        Instantiates and returns the list of permissions that this view requires.
        GET (list) có thể cho phép AllowAny, POST (create) yêu cầu IsAuthenticated.
        """
        if self.request.method == 'GET':
            return [AllowAny()]
        return [IsAuthenticated()]


    def get_queryset(self):
        queryset = super().get_queryset()
        module_id = self.request.query_params.get('module_id')
        question_type_id = self.request.query_params.get('question_type_id')
        level_id = self.request.query_params.get('level_id')

        if module_id:
            queryset = queryset.filter(module_id=module_id)
        if question_type_id:
            queryset = queryset.filter(question_type_id=question_type_id)
        if level_id:
            queryset = queryset.filter(level_id=level_id)
        return queryset

    def perform_create(self, serializer):
        # Gán người tạo nếu cần, hoặc các logic khác khi tạo câu hỏi
        # if self.request.user.is_authenticated:
        #     serializer.save(created_by=self.request.user) # Giả sử có trường created_by
        # else:
        serializer.save()


class QuestionRetrieveUpdateDestroyView(generics.RetrieveUpdateDestroyAPIView):
    queryset = Question.objects.all()
    serializer_class = QuestionSerializer
    parser_classes = [MultiPartParser, FormParser, JSONParser] 
    permission_classes = [IsAuthenticated] # Yêu cầu đăng nhập để sửa/xóa/xem chi tiết

    def perform_destroy(self, instance):
        if instance.question_image:
            instance.question_image.delete(save=False) 
        instance.delete()

class QuestionUploadView(views.APIView):
    parser_classes = [MultiPartParser] 
    permission_classes = [IsAuthenticated] # Yêu cầu đăng nhập để upload

    def post(self, request, format=None):
        file_obj = request.FILES.get('file')
        if not file_obj:
            return Response({"error": "Không có file nào được tải lên."}, status=status.HTTP_400_BAD_REQUEST)

        logger.info(f"Processing uploaded file: {file_obj.name} by user {request.user}")
        try:
            workbook = openpyxl.load_workbook(file_obj)
            sheet = workbook.active
            
            header_row_values = [cell.value for cell in sheet[1]] 
            logger.info(f"Raw headers from Excel: {header_row_values}")

            headers_from_file = [str(cell.value).strip().lower() if cell.value is not None else "" for cell in sheet[1]]
            logger.info(f"Processed headers (lowercase, stripped): {headers_from_file}")
            
            header_map = self._map_headers(headers_from_file)
            logger.info(f"Header map result: {header_map}")

            required_keys = ['module', 'question_type_code', 'question_text']
            missing_mapped_keys = [key for key in required_keys if header_map.get(key) is None]
            
            if missing_mapped_keys:
                missing_original_headers = []
                header_definitions_for_error = self._get_header_definitions()
                for key in missing_mapped_keys:
                    missing_original_headers.append(header_definitions_for_error.get(key, [key])[0]) 
                error_msg = f"Thiếu các cột bắt buộc trong file Excel hoặc tên cột không được nhận dạng: {', '.join(missing_original_headers)}. Vui lòng kiểm tra file mẫu."
                logger.error(error_msg)
                return Response({"error": error_msg}, status=status.HTTP_400_BAD_REQUEST)

            questions_to_create = []
            errors_parsing = []

            for i, row_cells in enumerate(sheet.iter_rows(min_row=2)): 
                row_values = [cell.value for cell in row_cells]
                if all(val is None for val in row_values): continue 

                raw_data = {}
                for key, mapped_index_val in header_map.items():
                    if key == 'option_indices': 
                        continue
                    if mapped_index_val is not None and isinstance(mapped_index_val, int) and mapped_index_val < len(row_values):
                        raw_data[key] = str(row_values[mapped_index_val]).strip() if row_values[mapped_index_val] is not None else ""
                    else: raw_data[key] = "" 
                
                raw_data['options_from_cols'] = []
                if header_map.get('option_indices') and isinstance(header_map.get('option_indices'), list): 
                    for idx_col_option in header_map['option_indices']:
                         if isinstance(idx_col_option, int) and idx_col_option < len(row_values) and row_values[idx_col_option] is not None and str(row_values[idx_col_option]).strip() != "":
                            raw_data['options_from_cols'].append(str(row_values[idx_col_option]).strip())
                
                logger.debug(f"Raw data from Excel row {i+2}: {raw_data}")
                parsed_q_data = self._parse_excel_row(raw_data, i + 2) 
                if parsed_q_data.get("error"):
                    errors_parsing.append({"row": i + 2, "error": parsed_q_data["error"], "data": raw_data})
                    logger.warning(f"Parsing error on row {i+2}: {parsed_q_data['error']}")
                else:
                    questions_to_create.append(parsed_q_data)
            
            if not questions_to_create and errors_parsing:
                 return Response({"message": "Không có câu hỏi nào được xử lý thành công từ file.", "errors": errors_parsing}, status=status.HTTP_400_BAD_REQUEST)

            successful_saves = 0; final_errors = list(errors_parsing) 
            for q_data in questions_to_create:
                serializer = QuestionSerializer(data=q_data)
                if serializer.is_valid():
                    try: serializer.save(); successful_saves += 1
                    except Exception as e: logger.error(f"Error saving question to DB: {q_data}, Error: {str(e)}"); final_errors.append({"data": q_data, "error": f"Lỗi khi lưu vào DB: {str(e)}"})
                else: logger.warning(f"Serializer validation error: {q_data}, Errors: {serializer.errors}"); final_errors.append({"data": q_data, "error": serializer.errors})
            
            if successful_saves > 0 and final_errors: return Response({ "message": f"Đã thêm {successful_saves} câu hỏi. Có {len(final_errors)} lỗi.", "errors": final_errors }, status=status.HTTP_202_ACCEPTED) 
            elif successful_saves > 0: return Response({"message": f"Đã thêm thành công {successful_saves} câu hỏi từ file Excel."}, status=status.HTTP_201_CREATED)
            else: return Response({ "message": "Không thể thêm câu hỏi nào từ file do lỗi.", "errors": final_errors }, status=status.HTTP_400_BAD_REQUEST)
        except Exception as e:
            logger.exception("Unhandled error during file upload processing:") 
            return Response({"error": f"Lỗi xử lý file không xác định: {str(e)}"}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    def _get_header_definitions(self):
        return {
            'module': ["module", "chủ đề"],
            'level_identifier': ["level", "cấp độ"], 
            'question_type_code': ["questiontype", "question type", "loại câu hỏi", "type"],
            'question_text': ["questiontext", "question text", "nội dung câu hỏi", "yêu cầu chung", "question"],
            'options_str': ["options", "option", "lựa chọn"], 
            'correct_answer_str': ["correctanswer", "correct answer", "đáp án đúng", "answer"],
            'statements_str': ["statements", "các câu khẳng định"], 
            'correct_answers_table_str': ["correctanswers_table", "đáp án đúng cho bảng", "table answers"], 
            'draggable_items_str': ["draggableitems", "các mục kéo", "drag items"], 
            'drop_zone_labels_str': ["dropzonelabels", "các mục tiêu thả", "drop zones"], 
            'explanation': ["explanation", "giải thích"]
        }

    def _map_headers(self, headers_from_file):
        header_map = {}
        header_definitions = self._get_header_definitions()
        option_indices = []
        for key, possible_names in header_definitions.items():
            found = False
            for name_variant in possible_names:
                try:
                    normalized_name_variant = name_variant.strip().lower()
                    idx = headers_from_file.index(normalized_name_variant)
                    header_map[key] = idx; found = True; logger.debug(f"Mapped header for '{key}': '{normalized_name_variant}' at index {idx}"); break 
                except ValueError: continue
            if not found: logger.warning(f"Header for '{key}' not found. Expected: {possible_names}"); header_map[key] = None 
        for idx, header_name in enumerate(headers_from_file):
            if header_name.startswith("option") and header_name[len("option"):].isdigit():
                option_indices.append(idx); logger.debug(f"Found Option column: '{header_name}' at index {idx}")
        header_map['option_indices'] = sorted(option_indices)
        return header_map

    def _parse_excel_row(self, raw_data, row_number):
        question_data = {}
        
        try:
            level_identifier_str = raw_data.get('level_identifier')
            level_instance = None
            if level_identifier_str:
                logger.info(f"Row {row_number}: Attempting to parse Level identifier '{level_identifier_str}'")
                if level_identifier_str.isdigit():
                    level_instance = Level.objects.get(level_number=int(level_identifier_str))
                else: 
                    level_name_to_search = level_identifier_str
                    parsed_level_num = None
                    if level_identifier_str.lower().startswith("level "):
                        try: parsed_level_num = int(level_identifier_str.split(" ")[1])
                        except: pass
                    elif level_identifier_str.lower().startswith("ic3 level "):
                        try: parsed_level_num = int(level_identifier_str.split(" ")[2])
                        except: pass
                    if parsed_level_num is not None:
                        level_instance = Level.objects.get(level_number=parsed_level_num)
                    else: 
                        level_instance = Level.objects.get(level_name__iexact=level_name_to_search)
                question_data['level'] = level_instance.id
                logger.info(f"Row {row_number}: Found Level ID {level_instance.id} for identifier '{level_identifier_str}'")
            # else: Level is optional, no error if not provided
        except Level.DoesNotExist:
            all_levels_db_name = list(Level.objects.values_list('level_name', flat=True))
            all_levels_db_num = list(Level.objects.values_list('level_number', flat=True))
            logger.error(f"Row {row_number}: Level with identifier '{level_identifier_str}' DOES NOT EXIST in DB. Available names: {all_levels_db_name}, Available numbers: {all_levels_db_num}")
            return {"error": f"Dòng {row_number}: Cấp độ '{level_identifier_str}' không tồn tại. Các tên cấp độ có sẵn: {all_levels_db_name}. Các số cấp độ có sẵn: {all_levels_db_num}."}
        except ValueError:
             logger.error(f"Row {row_number}: Value for Level '{level_identifier_str}' is not a valid number for direct lookup and did not match name patterns.")
             return {"error": f"Dòng {row_number}: Giá trị Cấp độ '{level_identifier_str}' không hợp lệ."}
        except Exception as e:
            logger.error(f"Row {row_number}: Error finding Level '{level_identifier_str}': {str(e)}")
            return {"error": f"Dòng {row_number}: Lỗi khi tìm Cấp độ (Level): {str(e)}"}
        
        try:
            module_name = raw_data.get('module')
            if not module_name: return {"error": f"Dòng {row_number}: Thiếu tên Module."}
            module_instance = Module.objects.get(module_name__iexact=module_name)
            question_data['module'] = module_instance.id
        except Module.DoesNotExist:
            all_modules_db = list(Module.objects.values_list('module_name', flat=True))
            return {"error": f"Dòng {row_number}: Module '{module_name}' không tồn tại. Các module có sẵn: {all_modules_db}"}
        except Exception as e: return {"error": f"Dòng {row_number}: Lỗi Module '{module_name}': {str(e)}"}

        qt_instance = None 
        try:
            type_code_from_file = raw_data.get('question_type_code')
            logger.info(f"Row {row_number}: Attempting to find QuestionType with code '{type_code_from_file}'")
            if not type_code_from_file: return {"error": f"Dòng {row_number}: Thiếu mã Loại Câu Hỏi."}
            qt_instance = QuestionType.objects.get(type_code__iexact=type_code_from_file)
            question_data['question_type'] = qt_instance.id
            logger.info(f"Row {row_number}: Found QuestionType ID: {qt_instance.id} for code '{type_code_from_file}'")
        except QuestionType.DoesNotExist:
            all_types_db = list(QuestionType.objects.values_list('type_code', flat=True))
            logger.error(f"Row {row_number}: QuestionType with code '{type_code_from_file}' DOES NOT EXIST. Available: {all_types_db}")
            return {"error": f"Dòng {row_number}: Loại câu hỏi '{type_code_from_file}' không tồn tại. Mã hợp lệ: {all_types_db}"}
        except Exception as e: return {"error": f"Dòng {row_number}: Lỗi Loại Câu Hỏi '{type_code_from_file}': {str(e)}"}

        question_data['question_text'] = raw_data.get('question_text', "")
        if not question_data['question_text']: return {"error": f"Dòng {row_number}: Thiếu nội dung câu hỏi."}
        question_data['explanation'] = raw_data.get('explanation', "")
        
        type_code = qt_instance.type_code 

        if type_code == 'multiple-choice-single' or type_code == 'multiple-choice-multiple':
            options = raw_data.get('options_from_cols', [])
            if not options and raw_data.get('options_str'): options = [opt.strip() for opt in raw_data.get('options_str').split('|') if opt.strip()]
            if not options or len(options) < 2 : return {"error": f"Dòng {row_number}: Trắc nghiệm cần >= 2 lựa chọn."}
            # Frontend sẽ gửi options_mc dưới dạng JSON string khi dùng FormData
            # Backend serializer sẽ parse nó. Ở đây ta chuẩn bị Python list.
            question_data['options_mc'] = options 
            
            correct_answer_str = raw_data.get('correct_answer_str', "")
            if not correct_answer_str: return {"error": f"Dòng {row_number}: Thiếu đáp án đúng."}
            if type_code == 'multiple-choice-single':
                try: ans_index = int(correct_answer_str) - 1;  assert 0 <= ans_index < len(options); question_data['correct_answer_mc_single'] = ans_index
                except: return {"error": f"Dòng {row_number}: Đáp án chọn 1 không hợp lệ ('{correct_answer_str}')."}
            else: 
                try: correct_indices = [int(s.strip()) - 1 for s in correct_answer_str.split(',') if s.strip()]; valid_indices = [idx for idx in correct_indices if 0 <= idx < len(options)]; assert valid_indices; question_data['correct_answers_mc_multiple'] = sorted(list(set(valid_indices))) 
                except: return {"error": f"Dòng {row_number}: Đáp án chọn nhiều không hợp lệ ('{correct_answer_str}')."}
        
        elif type_code == 'true-false':
            question_data['options_mc'] = ["Đúng", "Sai"]; 
            correct_answer_str = raw_data.get('correct_answer_str', "")
            if correct_answer_str.lower() == 'đúng' or correct_answer_str == '0': question_data['correct_answer_mc_single'] = 0
            elif correct_answer_str.lower() == 'sai' or correct_answer_str == '1': question_data['correct_answer_mc_single'] = 1
            else: return {"error": f"Dòng {row_number}: Đáp án Đúng/Sai đơn phải là 0, 1, 'Đúng', hoặc 'Sai'."}
        
        elif type_code == 'true-false-table':
            statements = [s.strip() for s in raw_data.get('statements_str', "").split('\n') if s.strip()];
            if not statements: return {"error": f"Dòng {row_number}: Thiếu khẳng định cho Đúng/Sai bảng."}
            question_data['statements_tf_table'] = statements
            correct_answers_str = raw_data.get('correct_answers_table_str', "");
            if not correct_answers_str: return {"error": f"Dòng {row_number}: Thiếu đáp án cho Đúng/Sai bảng."}
            try: 
                correct_answers = []
                for s_ans in correct_answers_str.split(','):
                    s_ans_clean = s_ans.strip().lower()
                    if s_ans_clean == '0' or s_ans_clean == 'đúng': correct_answers.append(0)
                    elif s_ans_clean == '1' or s_ans_clean == 'sai': correct_answers.append(1)
                    else: raise ValueError("Invalid T/F table answer")
                assert len(correct_answers) == len(statements); 
                question_data['correct_answers_tf_table'] = correct_answers
            except: return {"error": f"Dòng {row_number}: Đáp án/Số lượng cho Đúng/Sai bảng không hợp lệ ('{correct_answers_str}')."}
        
        elif type_code == 'drag-drop-match':
            draggable_items = [s.strip() for s in raw_data.get('draggable_items_str', "").split('\n') if s.strip()]
            drop_zone_labels = [s.strip() for s in raw_data.get('drop_zone_labels_str', "").split('\n') if s.strip()]
            if not draggable_items or not drop_zone_labels or len(draggable_items) != len(drop_zone_labels): return {"error": f"Dòng {row_number}: Mục kéo/thả cho Kéo thả không hợp lệ."}
            question_data['draggable_items_dd'] = draggable_items; question_data['drop_zone_labels_dd'] = drop_zone_labels
        
        return question_data



def frontend_view(request):
    return render(request, 'quiz_api/index.html') # Hoặc chỉ 'index.html' nếu đặt trực tiếp trong templates/