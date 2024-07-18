const form = document.getElementById('upload-form');
const progressContainer = document.getElementById('progress-container');
const progressBar = document.getElementById('progress');
const statusElement = document.getElementById('status');

form.addEventListener('submit', async (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    const file = formData.get('video');

    if (!file) {
        alert('Please select a video file');
        return;
    }

    if (file.size > 501 * 1024 * 1024) { // 500MB in bytes
        alert('The file size exceeds 500MB. Please upload a smaller file.');
        return;
    }

    progressContainer.style.display = 'block';
    statusElement.textContent = 'Uploading...';

    try {
        await uploadFileInChunks(file);
        statusElement.textContent = 'Upload successful!';
    } catch (error) {
        console.error('Error:', error);
        statusElement.textContent = 'Upload failed. Please try again.';
    }
});

async function uploadFileInChunks(file) {
    const chunkSize = 10 * 1024 * 1024; // 10MB chunks
    const chunks = Math.ceil(file.size / chunkSize);

    for (let start = 0; start < file.size; start += chunkSize) {
        const chunk = file.slice(start, start + chunkSize);
        const formData = new FormData();
        formData.append('video', chunk, file.name);
        formData.append('chunk', Math.floor(start / chunkSize));
        formData.append('totalChunks', chunks);
        formData.append('originalname', file.name);

        const response = await fetch('http://localhost:3000/api/upload', {
            method: 'POST',
            body: formData,
        });

        if (!response.ok) {
            throw new Error('Chunk upload failed');
        }

        const progress = ((start + chunk.size) / file.size) * 100;
        progressBar.style.width = `${progress}%`;
        statusElement.textContent = `Uploading... ${Math.round(progress)}%`;
    }
}