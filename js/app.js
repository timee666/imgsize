// 初始化全局 App 对象
window.App = {
    init() {
        this.upload = {
            hint: document.getElementById('uploadHint'),
            preview: document.getElementById('uploadPreview'),
            zone: document.getElementById('uploadZone')
        };
        return this;
    }
};

export default window.App; 