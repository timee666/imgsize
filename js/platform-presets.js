class PlatformPresetsLoader {
    constructor() {
        this.processedPlatforms = new Set();
        this.currentProcessing = null;
        this.initObserver();
        // 立即处理Facebook预设
        this.processFacebookFirst();
    }

    async processFacebookFirst() {
        const facebookSection = document.querySelector('.preset-section[data-platform="facebook"]');
        if (facebookSection && !this.processedPlatforms.has('facebook')) {
            await this.processPlatform('facebook', facebookSection);
            // Facebook处理完后初始化其他平台的观察器
            this.initOtherPlatformsObserver();
        }
    }

    initOtherPlatformsObserver() {
        this.observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    const section = entry.target;
                    const platform = section.dataset.platform;
                    
                    // 跳过已处理的平台（包括Facebook）
                    if (!this.processedPlatforms.has(platform)) {
                        this.processPlatform(platform, section);
                    }
                }
            });
        }, {
            rootMargin: '200px 0px'
        });

        // 只观察非Facebook平台
        document.querySelectorAll('.preset-section:not([data-platform="facebook"])').forEach(section => {
            this.observer.observe(section);
        });
    }

    async processPlatform(platform, section) {
        if (this.currentProcessing) return;

        this.currentProcessing = platform;
        
        try {
            section.querySelectorAll('.preview-box').forEach(box => {
                box.classList.add('loading');
            });

            const items = section.querySelectorAll('.preset-item');
            
            for (const item of items) {
                const size = item.dataset.size;
                const type = item.querySelector('.btn-download').dataset.type;
                const previewBox = item.querySelector('.preview-box');
                const img = previewBox.querySelector('.preview-image');

                try {
                    const response = await fetch(`/generate-preview/${platform}/${type}/${size}`);
                    if (response.ok) {
                        const imageUrl = await response.text();
                        img.src = imageUrl;
                        previewBox.classList.remove('loading');
                    }
                } catch (error) {
                    console.error(`Error processing image for ${platform}/${type}:`, error);
                    previewBox.classList.remove('loading');
                    previewBox.classList.add('error');
                }

                // 每张图片处理完后暂停100ms
                await new Promise(resolve => setTimeout(resolve, 100));
            }

            this.processedPlatforms.add(platform);

        } finally {
            this.currentProcessing = null;
        }
    }
}

// 添加批量下载处理函数
async function handleBatchDownload(platform) {
    try {
        // 显示加载状态
        const downloadBtn = document.querySelector(`[data-platform="${platform}"] .btn-download-all`);
        downloadBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 打包中...';
        downloadBtn.disabled = true;

        // 调用后端API打包下载
        const response = await fetch(`/download-all/${platform}`, {
            method: 'POST'
        });

        if (response.ok) {
            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${platform}-images.zip`;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            document.body.removeChild(a);
        } else {
            throw new Error('Download failed');
        }
    } catch (error) {
        console.error('Download error:', error);
        alert('下载失败，请重试');
    } finally {
        // 恢复按钮状态
        const downloadBtn = document.querySelector(`[data-platform="${platform}"] .btn-download-all`);
        downloadBtn.innerHTML = '<i class="fas fa-download"></i> 下载全部尺寸';
        downloadBtn.disabled = false;
    }
}

// 添加事件监听
document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('.btn-download-all').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const platform = btn.dataset.platform;
            handleBatchDownload(platform);
        });
    });
});

// 页面加载完成后初始化
document.addEventListener('DOMContentLoaded', () => {
    // 只有当上传了图片后才初始化预设加载器
    const uploadForm = document.getElementById('upload-form');
    uploadForm.addEventListener('upload-complete', () => {
        new PlatformPresetsLoader();
    });
}); 