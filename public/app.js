document.getElementById("submitButton").addEventListener("click", async () => {
  const jobTitle = document.getElementById("jobTitle").value.trim();
  const userResponse = document.getElementById("userResponse").value.trim();
  const chatDisplay = document.getElementById("chatDisplay");

  if (!jobTitle) {
    alert("Please enter a job title.");
    return;
  }

  if (!userResponse) {
    alert("Please type your response.");
    return;
  }

  // Update the chat display with the user's response
  chatDisplay.innerHTML += `<p><strong>You:</strong> ${userResponse}</p>`;
  document.getElementById("userResponse").value = ""; // Clear input field

  // Build conversation history from chat display
  const conversationHistory = Array.from(chatDisplay.children).map((el) => {
    const role = el.querySelector("strong").textContent.includes("You")
      ? "user"
      : "model";
    return {
      role,
      parts: [{ text: el.textContent.replace(/^.*?:/, "").trim() }],
    };
  });

  try {
    const response = await fetch("http://localhost:3000/interview", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ jobTitle, userResponse, conversationHistory }),
    });

    if (!response.ok) {
      throw new Error("Failed to communicate with the server.");
    }

    const data = await response.json();

    if (data.aiResponse) {
      chatDisplay.innerHTML += `<p><strong>Interviewer:</strong> ${data.aiResponse}</p>`;
      chatDisplay.scrollTop = chatDisplay.scrollHeight; // Auto-scroll to the bottom
    } else {
      chatDisplay.innerHTML += `<p style="color: red;"><strong>Error:</strong> AI did not respond.</p>`;
    }
  } catch (error) {
    console.error(error);
    chatDisplay.innerHTML += `<p style="color: red;"><strong>Error:</strong> Unable to connect to AI.</p>`;
  }
});
