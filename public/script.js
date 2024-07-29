document.addEventListener('DOMContentLoaded', () => {
    const quizForm = document.getElementById('quiz-form');
    const addQuestionButton = document.getElementById('add-question');
    const questionsContainer = document.getElementById('questions-container');

    // Function to add a question field
    const addQuestionField = () => {
        const questionDiv = document.createElement('div');
        questionDiv.classList.add('question');

        const questionInput = document.createElement('input');
        questionInput.type = 'text';
        questionInput.classList.add('question-text');
        questionInput.placeholder = 'Question';
        questionInput.required = true;
        questionDiv.appendChild(questionInput);

        for (let i = 1; i <= 4; i++) {
            const optionInput = document.createElement('input');
            optionInput.type = 'text';
            optionInput.classList.add('option');
            optionInput.placeholder = `Option ${i}`;
            optionInput.required = true;
            questionDiv.appendChild(optionInput);
        }

        const correctAnswerInput = document.createElement('input');
        correctAnswerInput.type = 'text';
        correctAnswerInput.classList.add('correct-answer');
        correctAnswerInput.placeholder = 'Correct Answer';
        correctAnswerInput.required = true;
        questionDiv.appendChild(correctAnswerInput);

        questionsContainer.appendChild(questionDiv);
    };

    // Add initial question field
    addQuestionField();

    // Event listener to add more question fields
    addQuestionButton.addEventListener('click', addQuestionField);

    // Event listener to handle form submission
    quizForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const quizTitle = document.getElementById('quiz-title').value;
        const questions = [];
        const questionElements = document.querySelectorAll('.question');

        questionElements.forEach(questionElement => {
            const questionText = questionElement.querySelector('.question-text').value;
            const options = Array.from(questionElement.querySelectorAll('.option')).map(option => option.value);
            const correctAnswer = questionElement.querySelector('.correct-answer').value;

            questions.push({ question: questionText, options, answer: correctAnswer });
        });

        const newQuiz = {
            id: Date.now(),
            title: quizTitle,
            questions
        };

        fetch('/add-quiz', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(newQuiz)
        })
        .then(response => response.json())
        .then(data => {
            alert('Quiz created successfully!');
            quizForm.reset();
            questionsContainer.innerHTML = '';
            addQuestionField(); // Add one question field by default
        })
        .catch(error => {
            console.error('Error:', error);
        });
    });
});
