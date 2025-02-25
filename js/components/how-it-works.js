export default class HowItWorks {
    constructor() {
        this.initAnimation();
    }

    initAnimation() {
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('animate');
                }
            });
        }, {
            threshold: 0.1
        });

        document.querySelectorAll('.step-item').forEach(item => {
            observer.observe(item);
        });
    }
} 