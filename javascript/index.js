document.addEventListener("DOMContentLoaded", async () => {
  // Define the live API endpoint URL hosted on Render
  const API_URL = "https://booknest-backend-fastapi-1.onrender.com/api/booknest-stats";

  try {
    const response = await fetch(API_URL);
    if (!response.ok) throw new Error("Network response was not ok");
    
    const data = await response.json();
    
    // Function to animate numbers counting up from zero
    const animateValue = (id, endValue) => {
      const obj = document.getElementById(id);
      const duration = 1500; // Animation duration in milliseconds
      const startTime = performance.now();

      const step = (currentTime) => {
        const progress = Math.min((currentTime - startTime) / duration, 1);
        const currentCount = Math.floor(progress * endValue);
        
        // Update the text content with a '+' sign
        obj.textContent = `${currentCount}+`;
        
        if (progress < 1) {
          window.requestAnimationFrame(step);
        } else {
          // Ensure the final value is exactly the fetched data
          obj.textContent = `${endValue}+`;
        }
      };
      
      window.requestAnimationFrame(step);
    };

    // Trigger animations with the fetched database statistics
    animateValue("stat-books", data.books);
    animateValue("stat-readers", data.readers);
    animateValue("stat-genres", data.genres);

  } catch (error) {
    console.error("Error fetching stats:", error);
    
    // Fallback values in case the server is offline or fetch fails
    document.getElementById("stat-books").textContent = "0+";
    document.getElementById("stat-readers").textContent = "0+";
    document.getElementById("stat-genres").textContent = "0+";
  }
});