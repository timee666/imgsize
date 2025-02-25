export default class Presets {
    constructor() {
        this.initPresets();
    }

    initPresets() {
        // 获取所有预设按钮
        const presetButtons = document.querySelectorAll('[data-preset]');
        
        // 为每个按钮添加点击事件
        presetButtons.forEach(button => {
            button.addEventListener('click', () => {
                const preset = button.dataset.preset;
                const dimensions = this.getPresetDimensions(preset);
                
                // 触发自定义事件
                const event = new CustomEvent('preset:selected', {
                    detail: dimensions
                });
                document.dispatchEvent(event);
            });
        });
    }

    getPresetDimensions(preset) {
        // 预设尺寸配置
        const presets = {
            'wechat': { width: 1080, height: 1080 },
            'moments': { width: 1080, height: 1920 },
            'official': { width: 900, height: 500 },
            'xiaohongshu': { width: 1080, height: 1440 },
            'note': { width: 1080, height: 1080 },
            'story': { width: 1080, height: 1920 }
        };

        return presets[preset] || { width: 1080, height: 1080 };
    }
} 