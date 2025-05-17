let JOBSHOW = true;

let jobDescriptions = [
    "We're seeking a proactive IT Support Specialist to join our tech team. You will be responsible for diagnosing hardware/software issues, maintaining internal systems, and ensuring smooth IT operations across departments. Familiarity with Windows, macOS, networking basics, and ticketing systems (e.g., Jira, Zendesk) is required.",
    "We are hiring a passionate English Teacher to lead engaging, student-centered classes at the high school level. You will be responsible for developing lesson plans, assessing student progress, and promoting critical thinking and communication skills. Experience with modern educational technology is a plus.",
    "Join our engineering department as a Mechanical Engineer, working on the design and development of precision mechanical components and systems. The ideal candidate has experience with CAD software (SolidWorks or AutoCAD), FEA tools, and knowledge of manufacturing processes.",
    "We are looking for a detail-oriented Financial Accountant to manage general ledger activities, monthly closings, and financial reporting. The role requires solid knowledge of IFRS/GAAP standards and proficiency in ERP systems such as SAP or Oracle."
]

let resumes = [
    { jobCategory: "INFORMATION-TECHNOLOGY", cvId: "10089434" },
    { jobCategory: "TEACHER", cvId: "10504237" },
    { jobCategory: "ENGINEERING", cvId: "10030015" },
    { jobCategory: "ACCOUNTANT", cvId: "10554236" },
]

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

    showJob(btnJob, btnResume);
});

function textAreaResize(textArea){
    textArea.style.height = 'auto';
    textArea.style.height = (textArea.scrollHeight) + 'px';
}

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

    textarea.textContent = '';
    textarea.style.height = 'auto';

    uploadButton.style.display = "none";
    uploadButton.value = '';

    container.classList.remove('move-down');

    examples.style.display = 'flex';
    titleExample.style.display = 'flex';

    JOBSHOW = true;
}

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
    
    textarea.textContent = '';
    textarea.style.height = 'auto';

    uploadButton.style.display = "inline-block";
    uploadButton.value = '';
    
    container.classList.remove('move-down');

    examples.style.display = 'flex';
    titleExample.style.display = 'flex';

    JOBSHOW = false;
}

function showExamples(event){
    const id = event.currentTarget.getAttribute('data-id');

    if(JOBSHOW){
        const textArea = document.getElementById('textarea');
        textArea.textContent = jobDescriptions[id];
        textArea.style.height = 'auto';
        textArea.style.height = (textArea.scrollHeight) + 'px';
    }
    else{
        jobCategory = resumes[id].jobCategory;
        cvId = resumes[id].cvId;
    
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
            .catch(error => {
                console.error("Error uploading the file:", error);
            });
    }
}

//const uploadButton = document.getElementById('upload-button');
//    const file = uploadButton.files[0];

async function submitButton(event, textArea){
    event.preventDefault();

    if(JOBSHOW){
        const text = textArea.value;

        if(text == ''){
            alert('Please enter something before submitting!');
            return;
        }

        try {
            const response = await fetch('/jobResumeMatch', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ text })
            });

            if (!response.ok) {
                throw new Error('HTTP error! Status: ' + response.status);
            }

            const data = await response.json();

            const examples = document.getElementById('examples');
            const titleExample = document.getElementById('title-examples');
            examples.style.display = 'none';
            titleExample.style.display = 'none';
            container.classList.add('move-down');

            const subTitle = document.getElementById('subTitle');
            subTitle.innerHTML = '';

            createTable(data['similarity'], subTitle, 'jobResumeMatching');

            subTitle.style.marginTop = '50px';

        } catch (error) {
            console.error('Error during fetch or response parsing: ', error);
            alert('There was a problem processing your request. Please try again.');
            return;
        }
    }
    else{
        const uploadButton = document.getElementById('upload-button');
        const file = uploadButton.files[0];
        const text = textArea.value;
        
        if(text == '' && uploadButton.files.length === 0){
            alert('Please enter or upload something before submitting!');
            return;
        }

        try {
            let options = {
                method: 'POST',
            };

            if(file && text == ''){
                const formData = new FormData();
                formData.append('file', file);
                options.body = formData;
            }
            else if(text !== '' && uploadButton.files.length === 0){
                options.headers = {
                    'Content-Type': 'application/json'
                };
                options.body = JSON.stringify({ text });
            }
            else{
                alert('Please provide either a file or text, not both!');
                return;
            }   

            const response = await fetch('/resumeClassification', options);

            if (!response.ok) {
                throw new Error('HTTP error! Status: ' + response.status);
            }

            const data = await response.json();
            
            const examples = document.getElementById('examples');
            const titleExample = document.getElementById('title-examples');
            examples.style.display = 'none';
            titleExample.style.display = 'none';
            container.classList.add('move-down');

            const subTitle = document.getElementById('subTitle');
            subTitle.innerHTML = '';

            createTable(data['top_predictions'], subTitle, 'resumeClassification');

            subTitle.style.marginTop = '100px';

        } catch (error) {
            console.error('Error during fetch or response parsing: ', error);
            alert('There was a problem processing your request. Please try again.');
            return;
        }
    }
}

function createTable(results, subTitle, type){
    const table = document.createElement('table');
    table.className = 'results-table';

    const headerRow = document.createElement('tr');
    if(type == 'jobResumeMatching'){
        ['Rank', 'Job Category', 'Similarity', 'Download CV', 'Similarity'].forEach(headerText => {
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
        scoreCell.textContent = (entry.value * 100).toFixed(2) + '%';
        row.appendChild(scoreCell);

        if(type == 'jobResumeMatching') {
            const scoreCell = document.createElement('td');
            const content = document.createElement('div')
            const similarityText = getSimilarityText(entry.value); // Function to convert value to text
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
    subTitle.appendChild(table);

    requestAnimationFrame(() => {table.classList.add('visible');});
}

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