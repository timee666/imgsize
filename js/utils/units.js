const DPI = 96; // 默认显示DPI

export function convertUnits(width, height, fromUnit, toUnit) {
    // 先转换为像素
    let pixelWidth, pixelHeight;
    
    switch(fromUnit) {
        case 'pixel':
            pixelWidth = width;
            pixelHeight = height;
            break;
        case 'percent':
            pixelWidth = originalWidth * (width / 100);
            pixelHeight = originalHeight * (height / 100);
            break;
        case 'cm':
            pixelWidth = cmToPixel(width);
            pixelHeight = cmToPixel(height);
            break;
        case 'inch':
            pixelWidth = inchToPixel(width);
            pixelHeight = inchToPixel(height);
            break;
    }

    // 从像素转换为目标单位
    switch(toUnit) {
        case 'pixel':
            return [pixelWidth, pixelHeight];
        case 'percent':
            return [
                (pixelWidth / originalWidth) * 100,
                (pixelHeight / originalHeight) * 100
            ];
        case 'cm':
            return [
                pixelToCm(pixelWidth),
                pixelToCm(pixelHeight)
            ];
        case 'inch':
            return [
                pixelToInch(pixelWidth),
                pixelToInch(pixelHeight)
            ];
    }
}

function cmToPixel(cm) {
    return (cm * DPI) / 2.54;
}

function pixelToCm(pixel) {
    return (pixel * 2.54) / DPI;
}

function inchToPixel(inch) {
    return inch * DPI;
}

function pixelToInch(pixel) {
    return pixel / DPI;
}

export function calculateAspectRatio(width, height) {
    return width / height;
} 