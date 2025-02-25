export default class Editor {
    constructor() {
        this.initElements();
        this.initEvents();
        this.initState();
    }

    // 初始化所有需要的DOM元素
    initElements() {
        // Resize Mode
        this.resizeModeInputs = document.querySelectorAll('input[name="resizeMode"]');
        this.dimensionsMode = document.querySelector('.dimensions-mode');
        this.percentageMode = document.querySelector('.percentage-mode');

        // Dimension Inputs
        this.widthInput = document.getElementById('widthInput');
        this.heightInput = document.getElementById('heightInput');
        this.dimensionUnits = document.querySelectorAll('.dimension-unit');
        this.lockRatioBtn = document.getElementById('lockRatio');

        // Percentage Controls
        this.scaleSlider = document.getElementById('scaleSlider');
        this.scaleValue = document.querySelector('.scale-value');
        this.sizeInfo = document.querySelector('.size-info');

        // Export Settings
        this.formatSelect = document.getElementById('formatSelect');
        this.qualitySlider = document.getElementById('qualitySlider');
        this.qualityValue = document.querySelector('.quality-value');
        this.resolutionSelect = document.getElementById('resolutionSelect');
        this.customDpiInput = document.getElementById('customDpi');

        // Action Buttons
        this.resetBtn = document.querySelector('.btn-secondary');
        this.downloadBtn = document.querySelector('.btn-primary');

        // Information Elements
        this.originalInfo = document.getElementById('originalInfo');
        this.modifiedInfo = document.getElementById('modifiedInfo');
    }

    // 初始化所有事件监听
    initEvents() {
        // Resize Mode Change
        this.resizeModeInputs.forEach(input => {
            input.addEventListener('change', this.handleResizeModeChange.bind(this));
        });

        // Dimension Inputs
        this.widthInput?.addEventListener('input', this.handleDimensionChange.bind(this));
        this.heightInput?.addEventListener('input', this.handleDimensionChange.bind(this));
        this.lockRatioBtn?.addEventListener('click', this.toggleLockRatio.bind(this));

        // Unit Change
        this.dimensionUnits.forEach(select => {
            select.addEventListener('change', this.handleUnitChange.bind(this));
        });

        // Percentage Controls
        this.scaleSlider?.addEventListener('input', this.handleScaleChange.bind(this));

        // Export Settings
        this.formatSelect?.addEventListener('change', this.handleFormatChange.bind(this));
        this.qualitySlider?.addEventListener('input', this.handleQualityChange.bind(this));
        this.resolutionSelect?.addEventListener('change', this.handleResolutionChange.bind(this));
        this.customDpiInput?.addEventListener('input', this.handleCustomDpiChange.bind(this));

        // Action Buttons
        this.resetBtn?.addEventListener('click', this.handleReset.bind(this));
        this.downloadBtn?.addEventListener('click', this.handleDownload.bind(this));

        // Image Load
        document.addEventListener('image:loaded', this.handleImageLoad.bind(this));
    }

    // 初始化状态
    initState() {
        this.state = {
            originalWidth: 0,
            originalHeight: 0,
            width: 0,
            height: 0,
            lockRatio: true,
            scale: 100,
            format: 'original',
            quality: 85,
            resolution: 72,
            image: null,
            currentUnit: 'px'
        };
    }

    // 处理调整模式切换
    handleResizeModeChange(e) {
        const mode = e.target.value;
        this.dimensionsMode.hidden = mode !== 'dimensions';
        this.percentageMode.hidden = mode !== 'percentage';
    }

    // 处理维度变化
    handleDimensionChange(e) {
        const input = e.target;
        const isWidth = input.id === 'widthInput';
        const value = parseFloat(input.value);

        if (isNaN(value)) return;

        // 转换为像素
        const valueInPixels = Math.round(this.convertToPixels(value, this.state.currentUnit));

        if (this.state.lockRatio) {
            const ratio = this.state.originalWidth / this.state.originalHeight;
            if (isWidth) {
                this.state.width = valueInPixels;
                this.state.height = Math.round(valueInPixels / ratio);
                this.heightInput.value = this.convertFromPixels(this.state.height, this.state.currentUnit);
            } else {
                this.state.height = valueInPixels;
                this.state.width = Math.round(valueInPixels * ratio);
                this.widthInput.value = this.convertFromPixels(this.state.width, this.state.currentUnit);
            }
        } else {
            if (isWidth) {
                this.state.width = valueInPixels;
            } else {
                this.state.height = valueInPixels;
            }
        }

        this.updateModifiedInfo();
    }

    // 处理比例变化
    handleScaleChange(e) {
        const scale = parseInt(e.target.value);
        this.state.scale = scale;
        this.scaleValue.textContent = `${scale}%`;

        this.state.width = Math.round(this.state.originalWidth * scale / 100);
        this.state.height = Math.round(this.state.originalHeight * scale / 100);

        this.updateSizeInfo();
        this.updateModifiedInfo();
    }

    // 处理格式变化
    handleFormatChange(e) {
        this.state.format = e.target.value;
        this.updateQualityControl();
    }

    // 处理质量变化
    handleQualityChange(e) {
        this.state.quality = parseInt(e.target.value);
        this.qualityValue.textContent = `${this.state.quality}%`;
    }

    // 处理分辨率变化
    handleResolutionChange(e) {
        const value = e.target.value;
        this.customDpiInput.hidden = value !== 'custom';
        
        if (value !== 'custom') {
            this.state.resolution = parseInt(value);
            this.updatePhysicalSize();
        }
    }

    // 处理自定义DPI变化
    handleCustomDpiChange(e) {
        const value = parseInt(e.target.value);
        if (value > 0) {
            this.state.resolution = value;
            this.updatePhysicalSize();
        }
    }

    // 处理单位变化
    handleUnitChange(e) {
        const newUnit = e.target.value;
        
        // 同步所有单位选择器
        this.dimensionUnits.forEach(select => {
            select.value = newUnit;
        });

        // 转换输入框的值
        const width = this.convertToPixels(this.widthInput.value, this.state.currentUnit);
        const height = this.convertToPixels(this.heightInput.value, this.state.currentUnit);

        this.state.currentUnit = newUnit;

        this.widthInput.value = this.convertFromPixels(width, newUnit);
        this.heightInput.value = this.convertFromPixels(height, newUnit);
    }

    // 处理锁定比例
    toggleLockRatio() {
        this.state.lockRatio = !this.state.lockRatio;
        this.lockRatioBtn.classList.toggle('active', this.state.lockRatio);
    }

    // 处理重置
    handleReset() {
        this.state.width = this.state.originalWidth;
        this.state.height = this.state.originalHeight;
        this.state.scale = 100;
        this.state.format = 'original';
        this.state.quality = 85;
        this.state.resolution = 72;
        this.state.currentUnit = 'px';

        // 重置UI
        this.widthInput.value = this.state.width;
        this.heightInput.value = this.state.height;
        this.scaleSlider.value = 100;
        this.scaleValue.textContent = '100%';
        this.formatSelect.value = 'original';
        this.qualitySlider.value = 85;
        this.qualityValue.textContent = '85%';
        this.resolutionSelect.value = '72';
        this.customDpiInput.hidden = true;
        this.dimensionUnits.forEach(select => select.value = 'px');

        this.updateModifiedInfo();
        this.updatePhysicalSize();
        this.updateQualityControl();
    }

    // 处理下载
    async handleDownload() {
        const downloadBtn = document.querySelector('.btn-primary');
        downloadBtn.disabled = true;
        downloadBtn.textContent = 'Processing...';

        console.log('开始处理下载:', {
            currentWidth: this.state.width,
            currentHeight: this.state.height,
            originalWidth: this.state.originalWidth,
            originalHeight: this.state.originalHeight,
            format: this.state.format
        });

        try {
            const needsProcessing = 
                this.state.width !== this.state.originalWidth ||
                this.state.height !== this.state.originalHeight ||
                this.state.format !== 'original';

            if (!needsProcessing) {
                // 直接使用原图
                const response = await fetch(this.state.image);
                const blob = await response.blob();
                this.downloadBlob(blob, 'original');
                return;
            }

            // 创建 canvas 进行处理
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d', {
                alpha: true,  // SVG 需要透明度支持
                willReadFrequently: false
            });

            canvas.width = this.state.width;
            canvas.height = this.state.height;

            // SVG 特殊处理
            if (this.state.isSVG) {
                // 如果选择保持原格式或输出 SVG
                if (this.state.format === 'original' || this.state.format === 'svg') {
                    // 获取原始 SVG 数据
                    const response = await fetch(this.state.image);
                    const svgText = await response.text();
                    
                    // 创建新的 SVG 文档
                    const parser = new DOMParser();
                    const doc = parser.parseFromString(svgText, 'image/svg+xml');
                    const svgElement = doc.documentElement;
                    
                    // 更新 SVG 的尺寸
                    svgElement.setAttribute('width', this.state.width);
                    svgElement.setAttribute('height', this.state.height);
                    
                    // 转换回字符串
                    const serializer = new XMLSerializer();
                    const modifiedSvgText = serializer.serializeToString(svgElement);
                    
                    // 创建 blob
                    const blob = new Blob([modifiedSvgText], { type: 'image/svg+xml' });
                    this.downloadBlob(blob, 'svg');
                    return;
                } else {
                    // 如果需要转换为其他格式
                    const canvas = document.createElement('canvas');
                    // ... 转换为其他格式的代码
                }
            }

            // 根据输出格式设置绘制参数
            if (this.getOutputFormat() === 'image/png') {
                // PNG 特殊处理
                ctx.imageSmoothingEnabled = false;  // 禁用平滑
            } else {
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
            }

            // 加载图片
            const image = new Image();
            image.src = this.state.image;
            await new Promise(resolve => image.onload = resolve);

            // 绘制图片
            ctx.drawImage(image, 0, 0, canvas.width, canvas.height);

            // 获取输出格式
            const outputFormat = this.getOutputFormat();
            
            // 转换为blob
            const blob = await new Promise(resolve => {
                const quality = this.needsQuality(outputFormat) ? this.state.quality / 100 : undefined;
                canvas.toBlob(resolve, outputFormat, quality);
            });

            console.log('处理完成:', {
                originalSize: await this.getFileSize(this.state.image),
                processedSize: blob.size,
                format: outputFormat,
                width: canvas.width,
                height: canvas.height
            });

            this.downloadBlob(blob, this.state.format);

        } catch (error) {
            console.error('下载处理错误:', error);
            alert('Failed to process image. Please try again.');
        } finally {
            downloadBtn.disabled = false;
            downloadBtn.textContent = 'Download';
        }
    }

    // 获取文件大小的辅助方法
    async getFileSize(dataUrl) {
        const response = await fetch(dataUrl);
        const blob = await response.blob();
        return blob.size;
    }

    // 处理图片加载
    handleImageLoad(e) {
        const { width, height, src } = e.detail;
        
        // 检查是否是 SVG
        const isSVG = src.includes('image/svg+xml');
        
        if (isSVG) {
            // SVG 特殊处理
            this.handleSVGImage(src, width, height);
            return;
        }

        // 更新状态
        this.state.originalWidth = width;
        this.state.originalHeight = height;
        this.state.width = width;
        this.state.height = height;
        this.state.image = src;

        // 更新UI
        this.widthInput.value = width;
        this.heightInput.value = height;
        this.originalInfo.textContent = `${width} x ${height} px`;
        this.updateModifiedInfo();
        this.updatePhysicalSize();

        // 显示编辑器面板
        const editorPanel = document.getElementById('editorPanel');
        if (editorPanel) {
            editorPanel.hidden = false;
        }
    }

    // 添加 SVG 处理方法
    async handleSVGImage(src, originalWidth, originalHeight) {
        // 更新状态
        this.state.originalWidth = originalWidth;
        this.state.originalHeight = originalHeight;
        this.state.width = originalWidth;
        this.state.height = originalHeight;
        this.state.image = src;
        this.state.isSVG = true;

        // 更新 UI
        this.widthInput.value = originalWidth;
        this.heightInput.value = originalHeight;
        this.originalInfo.textContent = `${originalWidth} x ${originalHeight} px (SVG)`;
    }

    // 辅助方法
    convertToPixels(value, fromUnit) {
        if (fromUnit === 'cm') {
            return value * 37.7952755906;
        } else if (fromUnit === 'in') {
            return value * 96;
        }
        return value;
    }

    convertFromPixels(pixels, toUnit) {
        if (toUnit === 'cm') {
            return (pixels / 37.7952755906).toFixed(2);
        } else if (toUnit === 'in') {
            return (pixels / 96).toFixed(2);
        }
        return Math.round(pixels);
    }

    updateModifiedInfo() {
        this.modifiedInfo.textContent = `${this.state.width} x ${this.state.height} px`;
    }

    updateSizeInfo() {
        this.sizeInfo.textContent = `${this.state.width} x ${this.state.height} px`;
    }

    updatePhysicalSize() {
        const widthInInches = this.state.width / this.state.resolution;
        const heightInInches = this.state.height / this.state.resolution;
        
        const physicalSize = document.querySelector('.physical-size');
        if (physicalSize) {
            physicalSize.textContent = 
                `Physical size: ${widthInInches.toFixed(2)}" × ${heightInInches.toFixed(2)}"` +
                ` (${(widthInInches * 2.54).toFixed(2)}cm × ${(heightInInches * 2.54).toFixed(2)}cm)`;
        }
    }

    updateQualityControl() {
        const qualityControl = this.qualitySlider.closest('.quality-control');
        const supportsQuality = ['jpg', 'webp'].includes(this.state.format);
        
        qualityControl.classList.toggle('disabled', !supportsQuality);
        this.qualitySlider.disabled = !supportsQuality;
    }

    getOutputFormat() {
        if (this.state.format === 'original') {
            return this.getOriginalMimeType().mimeType;
        }
        return this.state.format === 'jpg' ? 'image/jpeg' : `image/${this.state.format}`;
    }

    needsQuality(format) {
        return format === 'image/jpeg' || format === 'image/webp';
    }

    getOriginalMimeType() {
        const mimeType = this.state.image.split(';')[0].split(':')[1];
        const extension = mimeType.split('/')[1];
        return { mimeType, extension };
    }

    downloadBlob(blob, format) {
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        const extension = format === 'original' ? this.getOriginalMimeType().extension : format;
        link.download = `resized_image.${extension}`;
        link.href = url;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
        URL.revokeObjectURL(url);
    }
} 