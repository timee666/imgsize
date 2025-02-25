export default class Uploader {
    constructor() {
        // 检查是否存在上传区域
        if (!document.getElementById('uploadZone')) {
            return;
        }
        this.initElements();
        this.initEvents();
    }

    initElements() {
        this.uploadZone = document.getElementById('uploadZone');
        this.fileInput = document.getElementById('fileInput');
        this.uploadHint = document.getElementById('uploadHint');
        this.uploadPreview = document.getElementById('uploadPreview');
        this.previewCanvas = document.getElementById('previewCanvas');
    }

    initEvents() {
        if (!this.uploadZone) {
            return;
        }
        // 拖放事件
        ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
            this.uploadZone.addEventListener(eventName, this.preventDefaults);
        });

        ['dragenter', 'dragover'].forEach(eventName => {
            this.uploadZone.addEventListener(eventName, () => {
                this.uploadZone.classList.add('dragover');
            });
        });

        ['dragleave', 'drop'].forEach(eventName => {
            this.uploadZone.addEventListener(eventName, () => {
                this.uploadZone.classList.remove('dragover');
            });
        });

        // 文件处理
        this.uploadZone.addEventListener('drop', this.handleDrop.bind(this));
        this.uploadZone.addEventListener('click', this.handleClick.bind(this));
        this.fileInput.addEventListener('change', this.handleFileSelect.bind(this));
    }

    preventDefaults(e) {
        e.preventDefault();
        e.stopPropagation();
    }

    handleDrop(e) {
        const files = e.dataTransfer.files;
        this.processFiles(files);
    }

    handleClick() {
        this.fileInput.click();
    }

    handleFileSelect(e) {
        const files = e.target.files;
        this.processFiles(files);
    }

    processFiles(files) {
        console.log('Handling files:', files);
        if (files.length === 0) return;

        const file = files[0];
        if (!file.type.startsWith('image/')) {
            console.warn('Invalid file type:', file.type);
            alert('请上传图片文件');
            return;
        }

        console.log('Reading file:', file.name);
        const reader = new FileReader();
        reader.onload = (e) => {
            console.log('File read complete');
            const img = new Image();
            img.onload = () => {
                console.log('Image loaded:', {
                    width: img.width,
                    height: img.height
                });
                
                // 显示编辑器面板
                document.getElementById('editorPanel').hidden = false;
                
                // 显示预设面板
                const platformPresetsSection = document.getElementById('platformPresetsSection');
                if (platformPresetsSection) {
                    platformPresetsSection.hidden = false;
                    console.log('Platform presets section displayed');
                } else {
                    console.error('Platform presets section not found');
                }
                
                // 触发图片加载事件
                const event = new CustomEvent('image:loaded', {
                    detail: {
                        width: img.width,
                        height: img.height,
                        src: e.target.result
                    }
                });
                document.dispatchEvent(event);
            };
            img.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    validateFile(file) {
        // 检查文件类型
        const allowedTypes = [
            'image/jpeg', 
            'image/png', 
            'image/gif', 
            'image/webp',
            'image/avif',
            'image/svg+xml',
            'image/bmp',
            'image/tiff'
        ];
        if (!allowedTypes.includes(file.type)) {
            alert('Please upload JPG, PNG, GIF, WebP, AVIF, SVG, BMP or TIFF images');
            return false;
        }

        // 检查文件大小（50MB）
        const maxSize = 50 * 1024 * 1024; // 50MB
        if (file.size > maxSize) {
            alert('Image size cannot exceed 50MB');
            return false;
        }

        return true;
    }

    readFile(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const image = new Image();
            image.onload = () => {
                this.showPreview(image);
                this.triggerImageLoaded(image, file);
            };
            image.src = e.target.result;
        };
        reader.readAsDataURL(file);
    }

    showPreview(image) {
        // 显示预览
        this.uploadHint.hidden = true;
        this.uploadPreview.hidden = false;

        // 设置画布尺寸
        const ctx = this.previewCanvas.getContext('2d');
        const maxSize = 300;
        const scale = Math.min(maxSize / image.width, maxSize / image.height);
        
        this.previewCanvas.width = image.width * scale;
        this.previewCanvas.height = image.height * scale;
        
        ctx.drawImage(image, 0, 0, this.previewCanvas.width, this.previewCanvas.height);
    }

    triggerImageLoaded(image, file) {
        console.log('Triggering image loaded event:', image.width, 'x', image.height);
        const event = new CustomEvent('image:loaded', {
            detail: {
                width: image.width,
                height: image.height,
                src: image.src,
                fileSize: file.size
            }
        });
        document.dispatchEvent(event);
        
        // 显示编辑器面板
        const editorPanel = document.getElementById('editorPanel');
        if (editorPanel) {
            editorPanel.hidden = false;
        }
        
        // 显示预设面板
        const platformPresetsSection = document.getElementById('platformPresetsSection');
        if (platformPresetsSection) {
            platformPresetsSection.hidden = false;
        }
    }

    handleImageLoad(img, file) {
        // 绘制预览图
        this.drawPreview(img);

        // 立即显示编辑器面板
        const editorPanel = document.getElementById('editorPanel');
        if (editorPanel) {
            editorPanel.hidden = false;
        }

        // 触发图片加载事件
        const event = new CustomEvent('image:loaded', {
            detail: {
                width: img.width,
                height: img.height,
                src: img.src,
                fileSize: file.size
            }
        });
        document.dispatchEvent(event);
    }
} 