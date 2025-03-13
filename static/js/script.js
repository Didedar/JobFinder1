AOS.init({
    duration: 800,
    once: true
});

// Инициализация Swiper
new Swiper('.swiper-container', {
    slidesPerView: 1,
    spaceBetween: 40,
    pagination: {
        el: '.swiper-pagination',
        clickable: true
    },
    breakpoints: {
        768: { slidesPerView: 2 },
        1024: { slidesPerView: 3 }
    }
});

// Навигация
document.querySelectorAll('.nav-links a, .footer-links a').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
        e.preventDefault();
    });
});

// Загрузка резюме
const uploadArea = document.getElementById('uploadArea');
const resumeInput = document.getElementById('resumeInput');
const jobCardsContainer = document.getElementById('jobCardsContainer');
const jobCardTemplate = document.getElementById('jobCardTemplate');
const jobListingsSection = document.getElementById('jobListingsSection');

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', handleDrop);
resumeInput.addEventListener('change', handleFileChange);

function handleDrop(e) {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        uploadResume(files[0]);
    }
}

function handleFileChange() {
    if (resumeInput.files.length > 0) {
        uploadResume(resumeInput.files[0]);
    }
}

function uploadResume(file) {
    uploadArea.classList.add('uploading');
    const formData = new FormData();
    formData.append('resume', file);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.json())
    .then(data => {
        uploadArea.classList.remove('uploading');
        if (data.error) {
            alert(`Upload error: ${data.error}`);
        } else {
            alert(`Resume uploaded successfully! Profession detected: ${data.profession.profession_ru}`);
            displayVacancies(data.vacancies);
            jobListingsSection.style.display = 'block'; // Показать секцию с вакансиями
        }
    })
    .catch(error => {
        uploadArea.classList.remove('uploading');
        console.error('Error:', error);
        alert('Error uploading resume.');
    });
}

function displayVacancies(vacancies) {
    jobCardsContainer.innerHTML = ''; // Очистить контейнер вакансий

    if (!vacancies || vacancies.length === 0) {
        jobCardsContainer.innerHTML = '<p>No job opportunities found.</p>';
        return;
    }

    vacancies.forEach(vacancy => {
        const jobCard = jobCardTemplate.cloneNode(true);
        jobCard.style.display = 'block'; // Показать карточку
        jobCard.querySelector('.job-title').textContent = vacancy.title;
        jobCard.querySelector('.job-company').textContent = vacancy.company || 'Company not specified';
        jobCard.querySelector('.job-details').textContent = `${vacancy.employment_type} | ${vacancy.salary ? formatSalary(vacancy.salary) : 'Salary not specified'}`;
        jobCard.querySelector('.job-apply-btn').href = vacancy.url;
        jobCard.querySelector('.job-similarity').textContent = `${Math.round(vacancy.similarity_score * 100)}%`; // Отображаем схожесть
        
       

        jobCardsContainer.appendChild(jobCard);
    });
}

function formatSalary(salary) {
    if (!salary) return 'Salary not specified';
    let salary_str = '';
    if (salary.from) salary_str += `от ${salary.from}`;
    if (salary.to) salary_str += ` до ${salary.to}`;
    if (salary.currency) salary_str += ` ${salary.currency}`;
    return salary_str.trim();
}

// Скрыть секцию вакансий при загрузке страницы
document.addEventListener('DOMContentLoaded', function() {
    jobListingsSection.style.display = 'none';
});