console.log('home.js loaded');

import App from '../app.js';
import Uploader from '../components/upload.js';
import PlatformPresets from '../components/platform-presets.js';

let platformPresets = null;
let defaultPlatform = null;

// 添加调试函数
function debugElement(selector, message) {
    const element = document.querySelector(selector);
    console.log(`${message}:`, element ? 'Found' : 'Not found', element);
    return element;
}

document.addEventListener('DOMContentLoaded', () => {
    console.log('DOM Content Loaded');
    
    // 初始化 App
    App.init();
    
    // 检查关键元素
    debugElement('#uploadZone', 'Upload zone');
    debugElement('#presetsPanel', 'Presets panel');
    debugElement('.platform-presets', 'Platform presets');
    debugElement('.preset-sizes', 'Preset sizes');
    
    // 初始化上传器
    const uploader = new Uploader();
    console.log('Uploader initialized');
    
    // 根据语言选择默认平台
    const currentLocale = document.documentElement.lang;
    defaultPlatform = currentLocale === 'zh' ? 'wechat' : 'facebook';
});

// 全局监听图片加载事件
document.addEventListener('image:loaded', (e) => {
    console.log('Global image:loaded event received', e.detail);
    
    // 显示预设面板
    const platformPresetsSection = document.getElementById('platformPresetsSection');
    if (platformPresetsSection) {
        platformPresetsSection.hidden = false;
    }
    
    // 如果还没有初始化预设面板，则初始化
    if (!platformPresets) {
        console.log('Initializing platform presets with platform:', defaultPlatform);
        platformPresets = new PlatformPresets(defaultPlatform);
    }
});

// 监听预设选择事件
document.addEventListener('preset:selected', (e) => {
    console.log('Preset selected:', e.detail);
    const { width, height } = e.detail;
    // 更新编辑器尺寸
    if (window.editor) {
        console.log('Updating editor dimensions:', width, height);
        window.editor.setDimensions(width, height);
    } else {
        console.warn('Editor not found');
    }
}); 