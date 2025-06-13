let JOBSHOW = true;

// Example data
let jobDescriptions = [3894997641, 3906224875, 3884830401, 3901943436];
let resumes = [
    { jobCategory: "INFORMATION-TECHNOLOGY", cvId: "16899268" },
    { jobCategory: "TEACHER", cvId: "10504237" },
    { jobCategory: "ENGINEERING", cvId: "27756469" },
    { jobCategory: "ACCOUNTANT", cvId: "11759079" },
]

// Initialize UI components and event listeners
document.addEventListener('DOMContentLoaded', () => {
    let textArea = document.getElementById('textarea');
    let form = document.getElementById('form');
    let btnJob = document.getElementById('btn-job');
    let btnResume = document.getElementById('btn-resume');

    textArea.addEventListener('input', () => textAreaResize(textArea));
    form.addEventListener('submit', (event) => submitButton(event, textArea));

    btnJob.addEventListener('click', (event) => {event.preventDefault(); showJob(btnJob, btnResume); });
    btnResume.addEventListener('click', (event) => {event.preventDefault(); showResume(btnJob, btnResume);});

    document.querySelectorAll('#examples .square').forEach((square) => {
        square.addEventListener('click', (event) => {showExamples(event)});
    });        

    // Add window resize handler
    window.addEventListener('resize', handleResize);
    
    // Initial call to handle responsive layout
    handleResize();

    showJob(btnJob, btnResume);
});

// Handle responsive layout adjustments
function handleResize() {
    const container = document.getElementById('container');
    const examples = document.getElementById('examples');
    const titleExample = document.getElementById('title-examples');
    const subTitle = document.getElementById('subTitle');
    
    // Adjust container position based on screen size
    if (window.innerWidth <= 768) {
        if (container.classList.contains('move-down')) {
            container.style.bottom = '20px';
        }
    } else {
        if (container.classList.contains('move-down')) {
            container.style.bottom = '40px';
        }
    }
    
    // Adjust examples layout
    if (window.innerWidth <= 480) {
        examples.style.flexDirection = 'column';
        examples.style.alignItems = 'center';
    } else {
        examples.style.flexDirection = 'row';
        examples.style.alignItems = 'stretch';
    }
}

// Auto-resize textarea based on content
function textAreaResize(textArea){
    textArea.style.height = 'auto';
    textArea.style.height = (textArea.scrollHeight) + 'px';
}

// Switch to job matching mode
function showJob(btnJob, btnResume) {
    const indicator = document.getElementById('toggle-indicator');
    const subTitle = document.getElementById('subTitle');
    const uploadButton = document.getElementById("upload-button");
    const textarea = document.getElementById('textarea');
    const container = document.getElementById('container');
    const examples = document.getElementById('examples');
    const titleExample = document.getElementById('title-examples');

    btnJob.classList.add('active');
    btnResume.classList.remove('active');
    indicator.style.left = '0';
    
    subTitle.textContent = 'Welcome! Type your job ad to find the most qualified candidates';
    subTitle.style.marginTop = '100px';

    textarea.value = '';
    textarea.style.height = 'auto';

    uploadButton.style.display = "none";
    uploadButton.value = '';

    container.classList.remove('move-down');

    examples.style.display = 'flex';
    titleExample.style.display = 'flex';

    JOBSHOW = true;
}

// Switch to resume classification mode
function showResume(btnJob, btnResume) {
    const indicator = document.getElementById('toggle-indicator');
    const subTitle = document.getElementById('subTitle');
    const uploadButton = document.getElementById("upload-button");
    const textarea = document.getElementById('textarea');
    const examples = document.getElementById('examples');
    const titleExample = document.getElementById('title-examples');

    btnResume.classList.add('active');
    btnJob.classList.remove('active');
    indicator.style.left = '50%';
    
    subTitle.textContent = 'Welcome! Type your CV or upload it and find your job category';
    subTitle.style.marginTop = '100px';
    
    textarea.value = '';
    textarea.style.height = 'auto';

    uploadButton.style.display = "inline-block";
    uploadButton.value = '';
    
    container.classList.remove('move-down');

    examples.style.display = 'flex';
    titleExample.style.display = 'flex';

    JOBSHOW = false;
}

// Load example content based on selected square
async function showExamples(event){
    const id = event.currentTarget.getAttribute('data-id');

    if(JOBSHOW){
        // Fetch and display job description example
        try {
            const response = await fetch(`/get-job-description/${jobDescriptions[id]}`);
            if (!response.ok) throw new Error('HTTP error! Status: ' + response.status);
            const data = await response.json();
            
            const textArea = document.getElementById('textarea');
            textArea.value = data.description;
            textArea.style.height = 'auto';
            textArea.style.height = (textArea.scrollHeight) + 'px';
        } catch (error) {
            console.error('Error fetching job description:', error);
        }
    } else {
        // Load and simulate CV file upload
        const jobCategory = resumes[id].jobCategory;
        const cvId = resumes[id].cvId;
        const safeJob = jobCategory.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
        const safeId = String(cvId).replace(/[^a-zA-Z0-9]/g, '');
        const fetchUrl = `/download-cv/${encodeURIComponent(safeJob)}/${encodeURIComponent(safeId)}`;
    
        fetch(fetchUrl)
            .then(response => response.blob())
            .then(blob => {
                const file = new File([blob], `${jobCategory}_${cvId}.pdf`, { type: 'application/pdf' });
                const dataTransfer = new DataTransfer();
                dataTransfer.items.add(file);
                const input = document.getElementById("upload-button");
                input.files = dataTransfer.files;
            })
            .catch(error => console.error("Error uploading the file:", error));
    }
}

// Handle form submission
async function submitButton(event, textArea){
    event.preventDefault();

    if(JOBSHOW){
        // Job matching mode submission
        const text = textArea.value;
        if(text == '') {
            alert('Please enter something before submitting!');
            return;
        }

        try {
            // Send job description for matching
            const response = await fetch('/jobResumeMatch', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ text })
            });

            if (!response.ok) throw new Error('HTTP error! Status: ' + response.status);
            const data = await response.json();

            updateUIForResults(data['similarity'], 'jobResumeMatching');
        } catch (error) {
            console.error('Error during fetch or response parsing: ', error);
            alert('There was a problem processing your request. Please try again.');
        }
    } else {
        // Resume classification mode submission
        const uploadButton = document.getElementById('upload-button');
        const file = uploadButton.files[0];
        const text = textArea.value;
        
        if(text == '' && uploadButton.files.length === 0) {
            alert('Please enter or upload something before submitting!');
            return;
        }

        try {
            let options = { method: 'POST' };

            // Prepare request based on input type (file or text)
            if(file && text == '') {
                const formData = new FormData();
                formData.append('file', file);
                options.body = formData;
            } else if(text !== '' && uploadButton.files.length === 0) {
                options.headers = { 'Content-Type': 'application/json' };
                options.body = JSON.stringify({ text });
            } else {
                alert('Please provide either a file or text, not both!');
                return;
            }   

            // Send resume for classification
            const response = await fetch('/resumeClassification', options);
            if (!response.ok) throw new Error('HTTP error! Status: ' + response.status);
            const data = await response.json();
            
            updateUIForResults(data['top_predictions'], 'resumeClassification');
        } catch (error) {
            console.error('Error during fetch or response parsing: ', error);
            alert('There was a problem processing your request. Please try again.');
        }
    }
}

// Update UI after receiving results
function updateUIForResults(results, type) {
    const examples = document.getElementById('examples');
    const titleExample = document.getElementById('title-examples');
    const container = document.getElementById('container');
    const subTitle = document.getElementById('subTitle');

    examples.style.display = 'none';
    titleExample.style.display = 'none';
    container.classList.add('move-down');
    subTitle.innerHTML = '';

    createTable(results, subTitle, type);
    subTitle.style.marginTop = type === 'resumeClassification' ? '100px' : '50px';
}

// Create and display results table
function createTable(results, subTitle, type){
    const table = document.createElement('table');
    table.className = 'results-table';
    if (type === 'resumeClassification') {
        table.classList.add('resume-classification');
    }

    // Add responsive wrapper for table
    const tableWrapper = document.createElement('div');
    tableWrapper.className = 'results-table-wrapper';
    tableWrapper.appendChild(table);

    const headerRow = document.createElement('tr');
    if(type == 'jobResumeMatching'){
        ['Rank', 'Job Category', 'Similarity', 'Similarity', 'Download CV'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
    }
    else if(type == 'resumeClassification') {
        ['Rank', 'Job Category', 'Probability'].forEach(headerText => {
            const th = document.createElement('th');
            th.textContent = headerText;
            headerRow.appendChild(th);
        });
    }

    table.appendChild(headerRow);

    results.forEach(entry => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = entry.rank;
        row.appendChild(nameCell);

        let prettyCategory = entry.category.toLowerCase().replace(/-/g, ' ');
        prettyCategory = prettyCategory.charAt(0).toUpperCase() + prettyCategory.slice(1);
        const positionCell = document.createElement('td');
        positionCell.textContent = prettyCategory;
        row.appendChild(positionCell);

        const scoreCell = document.createElement('td');
        scoreCell.textContent = (entry.score * 100).toFixed(2) + '%';
        row.appendChild(scoreCell);

        if(type == 'jobResumeMatching') {
            const scoreCell = document.createElement('td');
            const content = document.createElement('div')
            const similarityText = getSimilarityText(entry.score); // Function to convert value to text
            content.textContent = similarityText.text;
            content.classList.add('similarity-cell', similarityText.class); // Add classes for styling
            row.appendChild(scoreCell);
            scoreCell.appendChild(content);
            
            const downloadCell = document.createElement('td');
            const btn = document.createElement('button');
            btn.textContent = 'Download';
            btn.className = 'download-btn';
            btn.addEventListener('click', () => downloadCV(entry.category, entry.cv_id));
            downloadCell.appendChild(btn);
            row.appendChild(downloadCell);
        }

        table.appendChild(row);
    });

    table.classList.add('results-table');
    subTitle.appendChild(tableWrapper);

    requestAnimationFrame(() => {table.classList.add('visible');});
}

// Convert similarity score to text and class
function getSimilarityText(value) {
    let text = '';
    let className = '';

    if (value < 0.34) {
        text = 'Low';
        className = 'low-similarity';
    } else if (value >= 0.34 && value <= 0.66) {
        text = 'Medium';
        className = 'medium-similarity';
    } else {
        text = 'High';
        className = 'high-similarity';
    }

    return { text, class: className };
}

// Download CV file
function downloadCV(jobCategory, cvId) {
    const safeJob = jobCategory.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const safeId = String(cvId).replace(/[^a-zA-Z0-9]/g, '');
    const downloadUrl = `/download-cv/${encodeURIComponent(safeJob)}/${encodeURIComponent(safeId)}`;

    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${jobCategory}_${cvId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}