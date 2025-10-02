const PEXELS_API_KEY = "HWula36Un5gdmwcoBG4Ap6Zxo4GELMndKLm7zowXwmo05k3Pq7ZxzgU1"; 

const userInput = document.getElementById('userInput');
const submitButton = document.getElementById('submitButton');
const resultsDiv = document.getElementById('results');

async function fetchData() {
    const searchQuery = userInput.value.trim();

    if (searchQuery.length < 2) {
        resultsDiv.innerHTML = `<p style="color: red;"> Please enter a search query (2 or more characters).</p>`;
        return;
    }
    
    if (!PEXELS_API_KEY) {
        resultsDiv.innerHTML = `<p style="color: red;">API KEY ERROR: The PEXELS_API_KEY variable is missing or empty. Please get an API key from Pexels and insert it.</p>`;
        return;
    }

    resultsDiv.innerHTML = `<p>⏳ Searching Pexels for "${searchQuery}"...</p>`;

    const apiUrl = `https://api.pexels.com/videos/search?query=${encodeURIComponent(searchQuery)}&per_page=5`;

    try {
        const response = await fetch(apiUrl, {
            headers: {
                'Authorization': PEXELS_API_KEY 
            }
        });

        if (!response.ok) {
            if (response.status === 401) {
                 throw new Error(`Authentication Failed. Please check your API Key's spelling and validity.`);
            }
            throw new Error(`HTTP error! Status: ${response.status} (${response.statusText || 'Unknown Error'})`);
        }

        const data = await response.json();

        if (data.videos && data.videos.length > 0) {
            let resultsHtml = `<p>Result Found: ${data.videos.length} relevant videos:</p>`;
            
            data.videos.forEach((video, index) => {
               
                const playableFile = video.video_files.find(file => 
                    file.quality === 'medium' && file.file_type === 'video/mp4'
                ) || video.video_files[0]; 

                if (playableFile) {
                    resultsHtml += `
                        <div class="video-result">
                            <strong>Video #${index + 1}: ${video.photographer}</strong>
                            <p>Duration: ${video.duration} seconds</p>
                            <video controls class="video-player">
                                <source src="${playableFile.link}" type="${playableFile.file_type}">
                                Your browser does not support the video tag.
                            </video>
                            <p><a href="${video.url}" target="_blank">View on Pexels (Original Page)</a></p>
                        </div>
                    `;
                } else {
                    resultsHtml += `
                        <div class="video-result">
                            <strong>Video #${index + 1}: ${video.photographer}</strong>
                            <p>No playable video file found for this video.</p>
                            <p><a href="${video.url}" target="_blank">View on Pexels (Original Page)</a></p>
                        </div>
                    `;
                }
            });

            resultsDiv.innerHTML = resultsHtml;

        } else {
            resultsDiv.innerHTML = `<p>No videos found for "${searchQuery}". Try a different search term.</p>`;
        }

    } catch (error) {
        resultsDiv.innerHTML = `<p style="color: red;">Error fetching data:${error.message}</p>`;
    }
}

submitButton.addEventListener('click', fetchData);

userInput.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        fetchData();
    }
});
