export default class PlatformPresets {
    constructor() {
        console.log('PlatformPresets initialized');
        this.processedPlatforms = new Set();
        this.currentProcessing = null;
        this.previewCache = new Map();
        this.initElements();
        this.initEvents();
        this.initIntersectionObserver();
    }

    initElements() {
        this.platformOptions = document.querySelectorAll('.platform-option input');
        this.presetGroups = document.querySelectorAll('.preset-group');
        this.presetItems = document.querySelectorAll('.preset-item');
        this.previewImages = document.querySelectorAll('.preview-image');
        this.platformPresetsSection = document.getElementById('platformPresetsSection');
    }

    initIntersectionObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const previewBox = entry.target;
                    if (this.currentImage) {
                        this.generatePreview(previewBox);
                    }
                }
            });
        }, {
            rootMargin: '50px 0px',
            threshold: 0.1
        });

        document.querySelectorAll('.preview-box').forEach(box => {
            this.observer.observe(box);
        });
    }

    generatePreview(previewBox) {
        const presetItem = previewBox.closest('.preset-item');
        if (!presetItem) return;

        const size = presetItem.dataset.size;
        const [width, height] = size.split('x').map(Number);
        const previewImage = previewBox.querySelector('.preview-image');

        const cacheKey = `${width}x${height}`;
        if (this.previewCache.has(cacheKey)) {
            previewImage.src = this.previewCache.get(cacheKey);
            return;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        const scale = Math.max(width / this.currentImage.width, height / this.currentImage.height);
        const scaledWidth = this.currentImage.width * scale;
        const scaledHeight = this.currentImage.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = 0;

        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(this.currentImage, x, y, scaledWidth, scaledHeight);

        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        this.previewCache.set(cacheKey, dataUrl);
        previewImage.src = dataUrl;
    }

    initEvents() {
        // 平台切换事件
        this.platformOptions.forEach(option => {
            option.addEventListener('change', (e) => {
                console.log('Platform changed to:', e.target.value);
                this.showPlatformPresets(e.target.value);
            });
        });

        // 监听图片加载事件
        document.addEventListener('image:loaded', (e) => {
            console.log('Image loaded event received:', e.detail);
            this.currentImage = new Image();
            this.currentImage.onload = () => {
                // 立即显示预设区域
                if (this.platformPresetsSection) {
                    this.platformPresetsSection.hidden = false;
                }
                
                // 获取可见的预览框
                const visiblePreviews = Array.from(document.querySelectorAll('.preview-box')).filter(box => {
                    const rect = box.getBoundingClientRect();
                    return rect.top < window.innerHeight && rect.bottom > 0;
                });

                // 分批处理可见的预览框
                this.processBatch(visiblePreviews);
            };
            this.currentImage.src = e.detail.src;
        });

        // 下载按钮点击事件
        document.querySelectorAll('.btn-download-all').forEach(btn => {
            const platform = btn.dataset.platform;
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                this.handleBatchDownload(platform);
            });
        });

        document.querySelectorAll('.btn-download').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const presetItem = e.target.closest('.preset-item');
                const platform = presetItem.closest('.preset-section').dataset.platform;
                const [width, height] = presetItem.dataset.size.split('x').map(Number);
                this.downloadResizedImage(platform, width, height);
            });
        });
    }

    processBatch(elements, index = 0) {
        if (index >= elements.length) return;

        const batchSize = 3;
        const batch = elements.slice(index, index + batchSize);

        batch.forEach(previewBox => {
            this.generatePreview(previewBox);
        });

        if (index + batchSize < elements.length) {
            setTimeout(() => {
                this.processBatch(elements, index + batchSize);
            }, 100);
        }
    }

    async handleBatchDownload(platform) {
        const downloadBtn = document.querySelector(`[data-platform="${platform}"] .btn-download-all`);
        try {
            // downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 打包中...';
            downloadBtn.disabled = true;

            const zip = new JSZip();
            const tasks = [];

            // 收集所有预览图片
            const previewImages = document.querySelectorAll(`[data-platform="${platform}"] .preview-image`);
            previewImages.forEach(img => {
                if (img.src) {
                    const type = img.closest('.preset-item').querySelector('.btn-download').dataset.type;
                    const size = img.closest('.preset-item').dataset.size;
                    tasks.push(this.addImageToZip(zip, img.src, `${platform}_${type}_${size}.jpg`));
                }
            });

            await Promise.all(tasks);
            
            const content = await zip.generateAsync({ type: 'blob' });
            const url = URL.createObjectURL(content);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${platform}-images.zip`;
            document.body.appendChild(a);
            a.click();
            URL.revokeObjectURL(url);
            document.body.removeChild(a);

        } catch (error) {
            console.error('Download error:', error);
            alert('Download failed, please try again');
        } finally {
            // downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载全部尺寸';
            downloadBtn.disabled = false;
        }
    }

    async addImageToZip(zip, imgSrc, filename) {
        try {
            const response = await fetch(imgSrc);
            const blob = await response.blob();
            zip.file(filename, blob);
        } catch (error) {
            console.error(`Error adding ${filename} to zip:`, error);
        }
    }

    showPlatformPresets(platform) {
        // 隐藏所有预设组
        this.presetGroups.forEach(group => {
            group.classList.remove('active');
        });

        // 显示选中的预设组
        const activeGroup = document.querySelector(`.preset-group[data-platform="${platform}"]`);
        if (activeGroup) {
            activeGroup.classList.add('active');
        }

        // 如果已有图片，更新新显示的预设组的预览
        if (this.currentImage) {
            this.updatePreviews();
        }
    }

    updatePreviews() {
        if (!this.currentImage) return;
        
        this.previewImages.forEach((img, index) => {
            const presetItem = img.closest('.preset-item');
            if (!presetItem) return;
            
            const [width, height] = presetItem.dataset.size.split('x').map(Number);
            
            // 创建临时画布
            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;
            const ctx = canvas.getContext('2d');
            
            // 计算缩放比例
            const scale = Math.max(width / this.currentImage.width, height / this.currentImage.height);
            
            // 计算裁剪后的尺寸
            const scaledWidth = this.currentImage.width * scale;
            const scaledHeight = this.currentImage.height * scale;
            
            // 居中并从顶部开始裁剪
            const x = (width - scaledWidth) / 2;
            const y = 0; // 从顶部开始
            
            // 绘制图片
            ctx.fillStyle = 'white';
            ctx.fillRect(0, 0, width, height);
            ctx.drawImage(this.currentImage, x, y, scaledWidth, scaledHeight);
            
            // 设置预览图片
            img.src = canvas.toDataURL('image/jpeg', 0.9);
        });
    }

    downloadResizedImage(platform, width, height) {
        if (!this.currentImage) return;

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');

        // 计算缩放和位置
        const scale = Math.min(width / this.currentImage.width, height / this.currentImage.height);
        const scaledWidth = this.currentImage.width * scale;
        const scaledHeight = this.currentImage.height * scale;
        const x = (width - scaledWidth) / 2;
        const y = (height - scaledHeight) / 2;

        // 绘制图片
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, width, height);
        ctx.drawImage(this.currentImage, x, y, scaledWidth, scaledHeight);

        // 创建下载链接，简化文件名格式
        const link = document.createElement('a');
        link.download = `${platform}_${width}x${height}.jpg`;
        link.href = canvas.toDataURL('image/jpeg', 0.9);
        link.click();
    }

    async processPlatform(platform, section) {
        if (this.currentProcessing) return;
        
        this.currentProcessing = platform;
        console.log(`Processing platform: ${platform}`);
        
        try {
            // 添加加载状态
            section.querySelectorAll('.preview-box').forEach(box => {
                box.classList.add('loading');
            });

            // 处理每个预设项
            const items = section.querySelectorAll('.preset-item');
            for (const item of items) {
                const size = item.dataset.size;
                const [width, height] = size.split('x').map(Number);
                const previewBox = item.querySelector('.preview-box');
                const previewImage = previewBox.querySelector('.preview-image');

                try {
                    // 创建预览图
                    const canvas = document.createElement('canvas');
                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');

                    // 绘制背景
                    ctx.fillStyle = '#f5f5f5';
                    ctx.fillRect(0, 0, width, height);

                    // 绘制尺寸文本
                    ctx.fillStyle = '#666';
                    ctx.font = '14px Arial';
                    const text = `${width} × ${height}`;
                    const textWidth = ctx.measureText(text).width;
                    ctx.fillText(text, (width - textWidth) / 2, height / 2);

                    // 设置预览图片
                    previewImage.src = canvas.toDataURL();
                    previewBox.classList.remove('loading');
                } catch (error) {
                    console.error(`Error processing preview for ${platform}:`, error);
                    previewBox.classList.add('error');
                }
            }

            // 标记平台已处理
            this.processedPlatforms.add(platform);
            
        } catch (error) {
            console.error(`Error processing platform ${platform}:`, error);
            section.querySelectorAll('.preview-box').forEach(box => {
                box.classList.remove('loading');
                box.classList.add('error');
            });
        } finally {
            this.currentProcessing = null;
        }
    }
} 