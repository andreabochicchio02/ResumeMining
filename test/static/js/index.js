let resize = true;

let JOBSHOW = true;

document.addEventListener('DOMContentLoaded', () => {
    let textarea = document.getElementById('textarea');
    let form = document.getElementById('form');
    let btnJob = document.getElementById('btn-job');
    let btnResume = document.getElementById('btn-resume');

    textarea.addEventListener('input', () => textAreaResize(textarea));
    form.addEventListener('submit', (event) => submitButton(event, textarea));


    btnJob.addEventListener('click', (event) => {event.preventDefault(); showJob(btnJob, btnResume); });
    btnResume.addEventListener('click', (event) => {event.preventDefault(); showResume(btnJob, btnResume);});

    showJob(btnJob, btnResume);
});

function showJob(btnJob, btnResume) {
    const indicator = document.getElementById('toggle-indicator');
    const subTitle = document.getElementById('subTitle');
    const uploadButton = document.getElementById("upload-button");
    btnJob.classList.add('active');
    btnResume.classList.remove('active');
    indicator.style.left = '0';
    subTitle.textContent = 'Welcome! Type your job ad to find the most qualified candidates';
    uploadButton.style.display = "none";
    JOBSHOW = true;
}

function showResume(btnJob, btnResume) {
    const indicator = document.getElementById('toggle-indicator');
    const subTitle = document.getElementById('subTitle');
    const uploadButton = document.getElementById("upload-button");
    btnResume.classList.add('active');
    btnJob.classList.remove('active');
    indicator.style.left = '50%';
    subTitle.textContent = 'Welcome! Type your CV or upload it and find your job category';
    uploadButton.style.display = "inline-block";
    JOBSHOW = false;
}

function textAreaResize(textarea){
    if (resize) {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    }
}

async function submitButton(event, textarea){
    event.preventDefault();

    const uploadButton = document.getElementById('upload-button');
    const file = uploadButton.files[0];

    const container = document.getElementById('container');
    textarea.style.paddingRight = '0.5em';
    textarea.style.paddingLeft = '0.5em';
    textarea.style.width = '90%';

    resize = false;
    
    container.classList.add('move-down');

    if(JOBSHOW){
        container.style.height = '80px';
        textarea.style.height = '50px';
    }

    const text = document.getElementById('textarea').value;

    const response = await fetch('/jobResumeMatch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({text})
    });

    const data = await response.json();

    let results = data['similarity'];
    console.log(results);

    const subTitle = document.getElementById('subTitle');

    // Pulisci eventuali risultati precedenti
    subTitle.innerHTML = '';

    // Crea la tabella
    const table = document.createElement('table');
    table.className = 'results-table';

    // Crea l'intestazione
    const headerRow = document.createElement('tr');
    ['Rank', 'Job Category', 'Similarity', 'Download CV'].forEach(headerText => {
        const th = document.createElement('th');
        th.textContent = headerText;
        headerRow.appendChild(th);
    });
    table.appendChild(headerRow);

    // Inserisci i dati
    results.forEach(entry => {
        const row = document.createElement('tr');

        const nameCell = document.createElement('td');
        nameCell.textContent = entry.rank;
        row.appendChild(nameCell);

        let prettyCategory = entry.cv_category.toLowerCase().replace(/-/g, ' ');
        prettyCategory = prettyCategory.charAt(0).toUpperCase() + prettyCategory.slice(1);
        const positionCell = document.createElement('td');
        positionCell.textContent = prettyCategory;
        row.appendChild(positionCell);

        const scoreCell = document.createElement('td');
        scoreCell.textContent = (entry.similarity_score * 100).toFixed(2) + '%';
        row.appendChild(scoreCell);

        // Download CV
        const downloadCell = document.createElement('td');
        const btn = document.createElement('button');
        btn.textContent = 'Download';
        btn.className = 'download-btn';

        btn.addEventListener('click', () =>
            downloadCv(entry.cv_category, entry.cv_id, entry.cv_category)
        );

        downloadCell.appendChild(btn);
        row.appendChild(downloadCell);

        table.appendChild(row);
    });

    table.classList.add('results-table');  // non ha ancora 'visible'

    // 2) la appendiamo
    subTitle.appendChild(table);

    // 3) nel prossimo frame aggiungiamo la classe che fa partire la transition
    requestAnimationFrame(() => {
        table.classList.add('visible');
    });  

    subTitle.style.marginTop = '80px';
}

function downloadCv(jobCategory, cvId, entryName) {
    // Normalizza esattamente come nel backend
    const safeJob = jobCategory
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");
    const safeId = String(cvId).replace(/[^a-zA-Z0-9]/g, '');
    const downloadUrl = `/download-cv/${encodeURIComponent(safeJob)}/${encodeURIComponent(safeId)}`;

    // Crea e clicka un <a> fittizio
    const link = document.createElement('a');
    link.href = downloadUrl;
    link.download = `${entryName}_${cvId}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}