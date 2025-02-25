import './components/upload.js';
import './components/editor.js';
import './components/hero.js';
import './components/how-it-works.js';
import './components/key-features.js';
import './components/faq.js';
import Presets from './components/presets.js';
import Uploader from './components/upload.js';
import Editor from './components/editor.js';
import HowItWorks from './components/how-it-works.js';
import KeyFeatures from './components/key-features.js';
import FAQ from './components/faq.js';
import PlatformPresets from './components/platform-presets.js';

// 初始化组件
document.addEventListener('DOMContentLoaded', () => {
    const presets = new Presets();
    const howItWorks = new HowItWorks();
    const keyFeatures = new KeyFeatures();
    const faq = new FAQ();
    
    // 只在主页初始化上传和编辑器组件
    if (document.getElementById('uploadZone')) {
        const uploader = new Uploader();
        const editor = new Editor();
    }
    
    // 初始化平台预设
    if (document.getElementById('platformPresetsSection')) {
        console.log('Initializing platform presets');
        new PlatformPresets();
    }
}); 