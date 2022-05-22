import './App.css';
import { useState, useEffect } from 'react';

const OPENAI_SECRET = process.env.REACT_APP_OPENAI_SECRET;
const URL = 'https://api.openai.com/v1/engines/text-curie-001/completions';

function App() {
	const [responses, setResponses] = useState([]);
	const [formData, setFormData] = useState({ prompt: '' });
	const [isLoading, setIsLoading] = useState(false);

	useEffect(() => {
		const localData = JSON.parse(localStorage.getItem('responses') || '[]');
		setResponses(localData);
	}, []);

	// Needed to provide a workaround in order to save the responses to localStorage without resetting them on refresh|re-visit
	useEffect(() => {
		if (responses.length > 0) {
			saveResponses();
		}
	}, [responses]);

	const handleInput = (e) => {
		setFormData({ ...formData, prompt: e.target.value });
		// console.log(e.target.name);
		// console.log(e.target.value);
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setIsLoading(true);

		const openAIResponse = await fetchFromOpenAI(formData.prompt);

		// console.log(openAIResponse.choices[0].text);
		// console.log(openAIResponse);

		const openAIResponseObj = {
			userPrompt: formData.prompt,
			promptResponse: openAIResponse.choices[0].text,
			created: openAIResponse.created,
		};

		setFormData({ prompt: '' });
		setResponses([openAIResponseObj, ...responses]);
		setIsLoading(false);
		return;
	};

	// Save current responses to localStorage
	const saveResponses = () => {
		localStorage.setItem('responses', JSON.stringify(responses));
	};

	// Clear the responses from localStorage
	const resetResponses = () => {
		setResponses([]);
		localStorage.setItem('responses', '[]');
	};

	return (
		<main className="App">
			<h1>Ask OpenAI</h1>
			<form onSubmit={handleSubmit}>
				<label htmlFor="prompt" id="prompt-label">
					Enter Prompt
				</label>
				<textarea
					name="prompt"
					onChange={(e) => handleInput(e)}
					value={formData.prompt}
					required
					placeholder="Ask OpenAI a question or for an opinion about something..."
				/>

				{isLoading ? (
					<>
						<button className="disabled" type="submit" name="submit" disabled>
							Submit
						</button>
						<div className="loader">
							<span>Fetching OpenAI's Response...</span>
						</div>
					</>
				) : (
					<button type="submit">Submit</button>
				)}
			</form>

			<section className="responses-section">
				<h1 className="responses-header">Responses</h1>
				{responses.length === 0 && <h5>No recent responses to display...</h5>}
				<ul>
					{responses?.map((response, i) => (
						<li key={i}>
							<div className="left">
								<h5>Prompt: </h5>
								<h5>Response: </h5>
							</div>
							<div className="right">
								<p>{response.userPrompt}</p>
								<p>{response.promptResponse}</p>
							</div>
						</li>
					))}
				</ul>
				{responses.length > 0 && (
					<button onClick={resetResponses} className="reset" name="reset">
						Reset
					</button>
				)}
			</section>
		</main>
	);
}

export default App;

const fetchFromOpenAI = async (prompt) => {
	const data = {
		prompt: prompt,
		temperature: 0.5,
		max_tokens: 64,
		top_p: 1.0,
		frequency_penalty: 0.0,
		presence_penalty: 0.0,
	};

	const res = await fetch(URL, {
		method: 'POST',
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${OPENAI_SECRET}`,
		},
		body: JSON.stringify(data),
	});

	return await res.json();
};
