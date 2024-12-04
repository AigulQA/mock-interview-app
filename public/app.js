const jobTitleInput = document.getElementById('jobTitle');
const transcriptDiv = document.getElementById('transcript');
const responseInput = document.getElementById('response');
const submitButton = document.getElementById('submit');

let conversation = [
    { speaker: "AI", text: "Tell me about yourself" } // Initial AI question
];

// Display conversation in the transcript area
const updateTranscript = () => {
    transcriptDiv.innerHTML = conversation
        .map(entry => `<p><strong>${entry.speaker}:</strong> ${entry.text}</p>`)
        .join('');
};

// Initialize the transcript with the first question
updateTranscript();

// Handle Submit button click
submitButton.addEventListener('click', async () => {
    const jobTitle = jobTitleInput.value.trim();
    const userResponse = responseInput.value.trim();

    if (!jobTitle) {
        alert("Please enter a job title.");
        return;
    }

    if (!userResponse) {
        alert("Please enter your response.");
        return;
    }

    // Add the user's response to the conversation
    conversation.push({ speaker: "User", text: userResponse });
    updateTranscript();

    // Clear the response input field
    responseInput.value = '';

    try {
        // Send the job title, user response, and conversation to the backend
        const response = await fetch('http://localhost:3000/interview', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ jobTitle, userResponse, conversation })
        });

        if (!response.ok) {
            throw new Error("Failed to communicate with the server.");
        }

        const data = await response.json();

        // Add the AI's response to the conversation
        conversation.push({ speaker: "AI", text: data.reply });
        updateTranscript();
    } catch (error) {
        console.error(error);
        alert("An error occurred. Please try again later.");
    }
});
