let canvas, ctx;
let originalWidth, originalHeight;

export function setupCanvas(image) {
    canvas = document.getElementById('previewCanvas');
    ctx = canvas.getContext('2d');

    // 保存原始尺寸
    originalWidth = image.width;
    originalHeight = image.height;

    // 设置初始尺寸
    canvas.width = image.width;
    canvas.height = image.height;

    // 绘制图片
    ctx.drawImage(image, 0, 0);

    // 显示编辑面板
    document.getElementById('editorPanel').hidden = false;
}

export function resizeImage(width, height) {
    if (!canvas) return;

    const tempCanvas = document.createElement('canvas');
    const tempCtx = tempCanvas.getContext('2d');

    tempCanvas.width = width;
    tempCanvas.height = height;

    // 绘制调整后的图片
    tempCtx.drawImage(canvas, 0, 0, width, height);

    // 更新主画布
    canvas.width = width;
    canvas.height = height;
    ctx.drawImage(tempCanvas, 0, 0);
}

export function getCanvas() {
    return canvas;
}

export function getOriginalDimensions() {
    return {
        width: originalWidth,
        height: originalHeight
    };
} 