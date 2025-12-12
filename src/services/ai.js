import axios from "axios";

const MODEL = "google/flan-t5-large"; 
// You can replace with faster/stronger models like:
// "HuggingFaceH4/zephyr-7b-beta"
// "tiiuae/falcon-7b-instruct"
// "google/flan-t5-base"

export async function scoreResume(resumeText, jobDescriptionText) {
  const prompt = `
You are an assistant that scores resumes vs a job description.

Return strictly valid JSON only:

{
  "score": number(0-100),
  "reason": "string",
  "skillsMatched": ["string"]
}

Job Description:
${jobDescriptionText}

Resume:
${resumeText}
`;

  try {
    const response = await axios.post(
      `https://api-inference.huggingface.co/models/${MODEL}`,
      {
        inputs: prompt,
        parameters: {
          max_new_tokens: 350,
          temperature: 0.1
        }
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.HF_API_KEY}`,
          "Content-Type": "application/json"
        }
      }
    );

    const text = response.data?.[0]?.generated_text || "";

    // Try parsing JSON from model output
    try {
      const json = JSON.parse(text);
      return json;
    } catch (e) {
      console.error("JSON parse failed:", text);
      return {
        score: 50,
        reason: "LLM returned unstructured output",
        skillsMatched: []
      };
    }
  } catch (err) {
    console.error("HuggingFace API error:", err.response?.data || err);
    return {
      score: 0,
      reason: "HuggingFace API call failed",
      skillsMatched: []
    };
  }
}
