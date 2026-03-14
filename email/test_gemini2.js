const apiKey = "AIzaSyAdAATln74eX3He_x5nH76T_Ff9Xzw_naA";
async function run() {
  try {
    const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
    const data = await res.json();
    if (data.error) {
       console.log("API_ERROR:", data.error.message);
    } else {
       const models = data.models.map(m => m.name);
       console.log("AVAILABLE_MODELS_COUNT:", models.length);
       console.log("HAS_FLASH:", models.includes("models/gemini-1.5-flash"));
       console.log("FIRST_5:", models.slice(0, 5));
    }
  } catch (e) {
    console.error("Error:", e);
  }
}
run();
