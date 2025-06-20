# quiz_api/serializers.py
from rest_framework import serializers
from .models import Module, QuestionType, Question, Level
import json # Đảm bảo đã import json

class LevelSerializer(serializers.ModelSerializer):
    class Meta:
        model = Level
        fields = ['id', 'level_number', 'level_name', 'description']

class ModuleSerializer(serializers.ModelSerializer):
    class Meta:
        model = Module
        fields = ['id', 'module_name']

class QuestionTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = QuestionType
        fields = ['id', 'type_code', 'type_description']

class QuestionSerializer(serializers.ModelSerializer):
    module_name = serializers.CharField(source='module.module_name', read_only=True)
    question_type_code = serializers.CharField(source='question_type.type_code', read_only=True)
    level_info = LevelSerializer(source='level', read_only=True, allow_null=True) # Hiển thị thông tin Level

    # Các trường JSONField này sẽ được xử lý để chấp nhận cả Python list/dict và JSON string
    options_mc = serializers.JSONField(required=False, allow_null=True)
    correct_answers_mc_multiple = serializers.JSONField(required=False, allow_null=True)
    statements_tf_table = serializers.JSONField(required=False, allow_null=True)
    correct_answers_tf_table = serializers.JSONField(required=False, allow_null=True)
    draggable_items_dd = serializers.JSONField(required=False, allow_null=True)
    drop_zone_labels_dd = serializers.JSONField(required=False, allow_null=True)

    class Meta:
        model = Question
        fields = [
            'id', 'module', 'module_name', 
            'question_type', 'question_type_code', 
            'level', 'level_info', # Thêm 'level' và 'level_info'
            'question_text', 'question_image', 'explanation',
            'options_mc', 'correct_answer_mc_single', 'correct_answers_mc_multiple',
            'statements_tf_table', 'correct_answers_tf_table',
            'draggable_items_dd', 'drop_zone_labels_dd',
            'is_active', 'created_at', 'updated_at'
        ]
        extra_kwargs = {
            'module': {'write_only': True, 'allow_null': False, 'required': True},
            'question_type': {'write_only': True, 'allow_null': False, 'required': True},
            'level': {'write_only': True, 'allow_null': True, 'required': False}, # Level có thể không bắt buộc
            'question_image': {'required': False, 'allow_null': True} 
        }

    def _parse_json_field_from_data(self, data, field_name, is_list=True):
        """
        Helper để parse một trường có thể là JSON string từ data (thường từ FormData).
        Nếu đã là list/dict rồi thì trả về luôn.
        """
        field_value = data.get(field_name)
        if isinstance(field_value, str):
            if not field_value.strip(): # Nếu là chuỗi rỗng sau khi strip
                return [] if is_list else {} # Trả về list/dict rỗng thay vì lỗi
            try:
                parsed_value = json.loads(field_value)
                # Gán lại vào data để các bước validate sau sử dụng giá trị đã parse
                data[field_name] = parsed_value 
                return parsed_value
            except json.JSONDecodeError:
                raise serializers.ValidationError({field_name: f"Giá trị không phải là JSON hợp lệ: '{field_value}'"})
        # Nếu field_value đã là list/dict (vd: từ request application/json) hoặc None, cứ trả về
        return field_value


    def validate(self, data):
        # 1. Parse các trường JSON nếu chúng được gửi dưới dạng chuỗi (từ FormData)
        # Frontend sẽ gửi các key trùng tên với model field (ví dụ: 'options_mc')
        json_fields_to_parse = [
            ('options_mc', True), ('correct_answers_mc_multiple', True),
            ('statements_tf_table', True), ('correct_answers_tf_table', True),
            ('draggable_items_dd', True), ('drop_zone_labels_dd', True)
        ]
        for field_name, is_list_type in json_fields_to_parse:
            if field_name in data: # Chỉ parse nếu field được gửi lên
                data[field_name] = self._parse_json_field_from_data(data, field_name, is_list_type)

        # 2. Lấy question_type instance để xác định type_code
        question_type_instance = data.get('question_type') 
        if not question_type_instance: # Khi update, field này có thể không có trong data
            if self.instance: # Nếu là update, lấy từ instance hiện tại
                question_type_instance = self.instance.question_type
            else: # Tạo mới mà thiếu thì lỗi (đã có required=True ở extra_kwargs)
                 raise serializers.ValidationError({"question_type": "Loại câu hỏi là bắt buộc."})
        
        if not question_type_instance: # Vẫn kiểm tra lại phòng trường hợp đặc biệt
             raise serializers.ValidationError({"question_type": "Không thể xác định Loại câu hỏi."})

        type_code = question_type_instance.type_code
        
        # 3. Lấy các giá trị đã được parse (hoặc giá trị gốc nếu không phải string JSON)
        # Hoặc lấy từ instance nếu là update và field không có trong data
        options_mc = data.get('options_mc', getattr(self.instance, 'options_mc', None) if self.instance else None)
        correct_answer_mc_single = data.get('correct_answer_mc_single', getattr(self.instance, 'correct_answer_mc_single', None) if self.instance else None)
        correct_answers_mc_multiple = data.get('correct_answers_mc_multiple', getattr(self.instance, 'correct_answers_mc_multiple', None) if self.instance else None)
        statements_tf_table = data.get('statements_tf_table', getattr(self.instance, 'statements_tf_table', None) if self.instance else None)
        correct_answers_tf_table = data.get('correct_answers_tf_table', getattr(self.instance, 'correct_answers_tf_table', None) if self.instance else None)
        draggable_items_dd = data.get('draggable_items_dd', getattr(self.instance, 'draggable_items_dd', None) if self.instance else None)
        drop_zone_labels_dd = data.get('drop_zone_labels_dd', getattr(self.instance, 'drop_zone_labels_dd', None) if self.instance else None)

        # 4. Validate dữ liệu bắt buộc dựa trên type_code
        # Và xóa các trường không liên quan để đảm bảo dữ liệu sạch
        # (Lưu ý: 'level' là trường chung, không xóa)
        
        if type_code == 'multiple-choice-single':
            if not options_mc or not isinstance(options_mc, list) or len(options_mc) < 2:
                raise serializers.ValidationError({"options_mc": "Trắc nghiệm chọn 1 cần ít nhất 2 lựa chọn."})
            if correct_answer_mc_single is None or not isinstance(correct_answer_mc_single, int):
                raise serializers.ValidationError({"correct_answer_mc_single": "Đáp án cho trắc nghiệm chọn 1 là bắt buộc và phải là số nguyên (chỉ số)."})
            if not (0 <= correct_answer_mc_single < len(options_mc)):
                raise serializers.ValidationError({"correct_answer_mc_single": f"Chỉ số đáp án '{correct_answer_mc_single + 1}' không hợp lệ cho số lượng lựa chọn là {len(options_mc)}."})
            data['correct_answers_mc_multiple'] = None; data['statements_tf_table'] = None; data['correct_answers_tf_table'] = None; data['draggable_items_dd'] = None; data['drop_zone_labels_dd'] = None

        elif type_code == 'multiple-choice-multiple':
            if not options_mc or not isinstance(options_mc, list) or len(options_mc) < 2:
                raise serializers.ValidationError({"options_mc": "Trắc nghiệm chọn nhiều cần ít nhất 2 lựa chọn."})
            if not correct_answers_mc_multiple or not isinstance(correct_answers_mc_multiple, list) or not correct_answers_mc_multiple:
                raise serializers.ValidationError({"correct_answers_mc_multiple": "Đáp án cho trắc nghiệm chọn nhiều là bắt buộc và phải là một danh sách các chỉ số."})
            for idx in correct_answers_mc_multiple:
                if not isinstance(idx, int) or not (0 <= idx < len(options_mc)):
                    raise serializers.ValidationError({"correct_answers_mc_multiple": f"Chỉ số đáp án '{idx + 1}' không hợp lệ cho trắc nghiệm chọn nhiều."})
            data['correct_answer_mc_single'] = None; data['statements_tf_table'] = None; data['correct_answers_tf_table'] = None; data['draggable_items_dd'] = None; data['drop_zone_labels_dd'] = None

        elif type_code == 'true-false':
            data['options_mc'] = ["Đúng", "Sai"] # Tự động đặt options
            if correct_answer_mc_single is None or correct_answer_mc_single not in [0, 1]:
                raise serializers.ValidationError({"correct_answer_mc_single": "Với Đúng/Sai đơn, đáp án phải là 0 (Đúng) hoặc 1 (Sai)."})
            data['correct_answers_mc_multiple'] = None; data['statements_tf_table'] = None; data['correct_answers_tf_table'] = None; data['draggable_items_dd'] = None; data['drop_zone_labels_dd'] = None
            
        elif type_code == 'true-false-table':
            if not statements_tf_table or not isinstance(statements_tf_table, list) or not statements_tf_table:
                raise serializers.ValidationError({"statements_tf_table": "Cần có danh sách các khẳng định cho Đúng/Sai bảng."})
            if not correct_answers_tf_table or not isinstance(correct_answers_tf_table, list) or not correct_answers_tf_table:
                raise serializers.ValidationError({"correct_answers_tf_table": "Cần có danh sách đáp án cho Đúng/Sai bảng."})
            if len(statements_tf_table) != len(correct_answers_tf_table):
                raise serializers.ValidationError("Số lượng khẳng định và đáp án cho Đúng/Sai bảng phải bằng nhau.")
            for ans in correct_answers_tf_table:
                if ans not in [0, 1]:
                    raise serializers.ValidationError("Mỗi đáp án trong Đúng/Sai bảng phải là 0 (Đúng) hoặc 1 (Sai).")
            data['options_mc'] = None; data['correct_answer_mc_single'] = None; data['correct_answers_mc_multiple'] = None; data['draggable_items_dd'] = None; data['drop_zone_labels_dd'] = None

        elif type_code == 'drag-drop-match':
            if not draggable_items_dd or not isinstance(draggable_items_dd, list) or not draggable_items_dd:
                raise serializers.ValidationError({"draggable_items_dd": "Cần có danh sách các mục kéo cho câu hỏi Kéo thả."})
            if not drop_zone_labels_dd or not isinstance(drop_zone_labels_dd, list) or not drop_zone_labels_dd:
                raise serializers.ValidationError({"drop_zone_labels_dd": "Cần có danh sách các nhãn vùng thả cho câu hỏi Kéo thả."})
            if len(draggable_items_dd) != len(drop_zone_labels_dd):
                raise serializers.ValidationError("Số lượng mục kéo và nhãn vùng thả phải bằng nhau.")
            data['options_mc'] = None; data['correct_answer_mc_single'] = None; data['correct_answers_mc_multiple'] = None; data['statements_tf_table'] = None; data['correct_answers_tf_table'] = None
        
        else:
            # Loại câu hỏi không xác định, có thể xóa tất cả các trường đặc thù hoặc báo lỗi
            # Hiện tại, nếu không khớp các loại trên, các trường đặc thù sẽ không được validate và không bị xóa
            # Bạn có thể thêm logic ở đây nếu muốn xử lý chặt chẽ hơn
            pass

        return data

    def create(self, validated_data):
        # Xử lý các trường JSON đã được parse trong validate (nếu chúng được gửi dưới dạng chuỗi)
        # và gán cho các trường model tương ứng trước khi gọi super().create
        # (Hiện tại, logic parse đã cập nhật trực tiếp validated_data trong hàm validate)
        return super().create(validated_data)

    def update(self, instance, validated_data):
        # Tương tự như create
        # (Hiện tại, logic parse đã cập nhật trực tiếp validated_data trong hàm validate)
        
        # Xử lý xóa ảnh nếu question_image được gửi là chuỗi rỗng từ FormData
        # DRF ImageField xử lý việc này: nếu giá trị mới là None/False/'' và field có allow_null=True, nó sẽ clear.
        if 'question_image' in validated_data and not validated_data['question_image']:
             if instance.question_image: # Nếu có ảnh cũ
                 instance.question_image.delete(save=False) # Xóa file cũ
             validated_data['question_image'] = None # Đặt là None để CSDL lưu null

        return super().update(instance, validated_data)
