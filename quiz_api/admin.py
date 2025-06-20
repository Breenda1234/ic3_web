from django.contrib import admin
from .models import Module, QuestionType, Question, Level

# >>> BẮT ĐẦU PHẦN THÊM MỚI/SỬA ĐỔI <<<
@admin.register(Level)
class LevelAdmin(admin.ModelAdmin):
    list_display = ('level_name', 'level_number', 'description')
    ordering = ('level_number',)
# >>> KẾT THÚC PHẦN THÊM MỚI/SỬA ĐỔI <<<

@admin.register(Module)
class ModuleAdmin(admin.ModelAdmin):
    list_display = ('module_name', 'id')
    search_fields = ('module_name',)

@admin.register(QuestionType)
class QuestionTypeAdmin(admin.ModelAdmin):
    list_display = ('type_code', 'type_description', 'id')
    search_fields = ('type_code', 'type_description')

@admin.register(Question)
class QuestionAdmin(admin.ModelAdmin):
    # >>> SỬA ĐỔI list_display và list_filter <<<
    list_display = ('question_text_short', 'module', 'level', 'question_type', 'is_active', 'created_at')
    list_filter = ('module', 'level', 'question_type', 'is_active') 
    # >>> KẾT THÚC PHẦN SỬA ĐỔI <<<
    search_fields = ('question_text', 'explanation')      
    list_per_page = 25 

    fieldsets = (
        (None, {
            # >>> THÊM 'level' vào fields <<<
            'fields': ('question_text', 'module', 'level', 'question_type', 'question_image', 'explanation', 'is_active')
            # >>> KẾT THÚC PHẦN SỬA ĐỔI <<<
        }),
        ('Trắc nghiệm & Đúng/Sai đơn', {
            'classes': ('collapse',), 
            'fields': ('options_mc', 'correct_answer_mc_single', 'correct_answers_mc_multiple'),
        }),
        ('Đúng/Sai Bảng', {
            'classes': ('collapse',),
            'fields': ('statements_tf_table', 'correct_answers_tf_table'),
        }),
        ('Kéo thả', {
            'classes': ('collapse',),
            'fields': ('draggable_items_dd', 'drop_zone_labels_dd'),
        }),
    )

    def question_text_short(self, obj):
        return obj.question_text[:75] + '...' if len(obj.question_text) > 75 else obj.question_text
    question_text_short.short_description = 'Nội dung Câu Hỏi'