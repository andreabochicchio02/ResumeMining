let resize = true;

document.addEventListener('DOMContentLoaded', () => {
    let textarea = document.getElementById('textarea');
    let form = document.getElementById('form');

    textarea.addEventListener('input', () => textAreaResize(textarea));
    form.addEventListener('submit', (event) => submitButton(event, textarea));
});


function textAreaResize(textarea){
    if (resize) {
        textarea.style.height = 'auto';
        textarea.style.height = (textarea.scrollHeight) + 'px';
    }
}

async function submitButton(event, textarea){
    event.preventDefault();

    const container = document.getElementById('container');
    textarea.style.paddingRight = '0.5em';
    textarea.style.paddingLeft = '0.5em';
    textarea.style.width = '90%';

    resize = false;
    
    container.classList.add('move-down');
    container.style.height = '100px';
    textarea.style.height = '70px';

    const text = document.getElementById('textarea').value;

    const response = await fetch('/jobResumeMatch', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({text})
    });

    const data = await response.json();

    console.log(data);
    //document.getElementById('risultato').innerHTML = `<strong>Risultato:</strong> ${data.similarity}`;
}