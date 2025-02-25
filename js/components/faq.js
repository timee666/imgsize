export default class FAQ {
    constructor() {
        this.initAccordion();
    }

    initAccordion() {
        const questions = document.querySelectorAll('.faq-item');
        
        questions.forEach(question => {
            const header = question.querySelector('.faq-question');
            const content = question.querySelector('.faq-answer');
            
            header.addEventListener('click', () => {
                const isOpen = question.classList.contains('open');
                
                // 关闭所有其他问题
                questions.forEach(q => {
                    q.classList.remove('open');
                    q.querySelector('.faq-answer').style.maxHeight = null;
                });
                
                // 如果当前不是打开状态，则打开
                if (!isOpen) {
                    question.classList.add('open');
                    content.style.maxHeight = content.scrollHeight + 'px';
                }
            });
        });
    }
} 