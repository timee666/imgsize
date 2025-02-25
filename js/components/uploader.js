export default class Uploader {
    constructor() {
        this.uploadZone = document.getElementById('uploadZone');
        this.editorPanel = document.getElementById('editorPanel');
        this.initUploader();
    }

    initUploader() {
        // 阻止默认拖放行为
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadZone.addEventListener(eventName, this.preventDefaults);
        });

        // 添加拖放效果
        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadZone.addEventListener(eventName, () => {
                this.uploadZone.classList.add('drag-over');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadZone.addEventListener(eventName, () => {
                this.uploadZone.classList.remove('drag-over');
            });
        });

        // 处理文件拖放
        this.uploadZone.addEventListener('drop', this.handleDrop.bind(this));
        
        // 处理点击上传
        this.uploadZone.addEventListener('click', () => {
            const input = document.createElement('input');
            input.type = 'file';
            input.accept = 'image/*';
            input.onchange = (e) => this.handleFiles(e.target.files);
            input.click();
        });
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const dt = e.dataTransfer;
        const files = dt.files;
        this.handleFiles(files);
    }

    handleFiles(files) {
        if (files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) {
            alert('请上传图片文件');
            return;
        }

        // 创建图片预览
        const reader = new FileReader();
        reader.onload = (e) => {
            const img = new Image();
            img.onload = () => {
                // 触发图片加载完成事件
                const event = new CustomEvent('image:loaded', {
                    detail: {
                        width: img.width,
                        height: img.height,
                        src: img.src
                    }
                });
                document.dispatchEvent(event);
                
                // 显示编辑面板
                this.editorPanel.hidden = false;
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }
} 