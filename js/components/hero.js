document.addEventListener('DOMContentLoaded', () => {
    const heroTitle = document.querySelector('.hero-title');
    if (heroTitle) {
        // 添加发光效果
        heroTitle.setAttribute('data-text', heroTitle.textContent);
        
        // 添加鼠标移动效果
        document.addEventListener('mousemove', (e) => {
            const { clientX, clientY } = e;
            const x = Math.round((clientX / window.innerWidth) * 100);
            const y = Math.round((clientY / window.innerHeight) * 100);
            
            heroTitle.style.backgroundImage = `linear-gradient(${x}deg, #4f46e5, #7c3aed)`;
        });
    }
}); 