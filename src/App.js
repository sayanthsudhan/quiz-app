import React, { Component } from "react";
import "bootstrap/dist/css/bootstrap.min.css";
import Question from "./Components/Question";
import Score from "./Components/Score";
import "./App.css";
import axios from "axios";

class App extends Component {
    constructor(props) {
        super(props);
        this.state = {
            questionBank: [],
            currentQuestion: 0,
            selectedOption: "",
            score: 0,
            quizEnd: false,
            timeRemaining: 60, // Timer set to 60 seconds
            feedback: "",
            showFeedback: false,
            highScore: 0,
            loading: true,
        };
        this.timer = null;
        this.maxTime = 60; // Maximum time for each question
    }

    componentDidMount() {
        this.fetchQuestions();
        this.startTimer();
    }

    componentWillUnmount() {
        clearInterval(this.timer);
    }

    // Fetch questions from the OpenTDB API
    fetchQuestions = async () => {
        try {
            const response = await axios.get(
                "https://opentdb.com/api.php?amount=15"
            );
            const formattedQuestions = response.data.results.map((question, index) => ({
                id: index + 1,
                question: this.decodeHtml(question.question),
                options: [...question.incorrect_answers, question.correct_answer].sort(() => 0.5 - Math.random()),
                answer: question.correct_answer,
            }));
            this.setState({ questionBank: formattedQuestions, loading: false });
        } catch (error) {
            console.error("Error fetching questions: ", error);
        }
    };

    // Decode HTML entities in the API response
    decodeHtml = (html) => {
        const txt = document.createElement("textarea");
        txt.innerHTML = html;
        return txt.value;
    };

    startTimer = () => {
        this.timer = setInterval(() => {
            this.setState((prevState) => {
                if (prevState.timeRemaining > 0) {
                    return { timeRemaining: prevState.timeRemaining - 1 };
                } else {
                    this.handleFormSubmit();
                    return { timeRemaining: this.maxTime }; // Reset timer for the next question
                }
            });
        }, 1000);
    };

    handleOptionChange = (e) => {
        this.setState({ selectedOption: e.target.value });
    };

    handleFormSubmit = (e) => {
        e && e.preventDefault();
        this.checkAnswer();
        this.setState({
            showFeedback: true,
        });

        if (this.state.feedback !== "Incorrect") {
            setTimeout(this.handleNextQuestion, 2000); // Delay before moving to the next question
        }
    };

    checkAnswer = () => {
        const { questionBank, currentQuestion, selectedOption, score } = this.state;
        const correctAnswer = questionBank[currentQuestion].answer;
        if (selectedOption === correctAnswer) {
            this.setState({
                score: score + 1,
                feedback: "Correct! Well done.",
            });
        } else {
            this.setState({
                feedback: `Incorrect. The correct answer was: ${correctAnswer}`,
                quizEnd: true,
            });
            clearInterval(this.timer);
        }
    };

    handleNextQuestion = () => {
        const { questionBank, currentQuestion } = this.state;
        if (currentQuestion + 1 < questionBank.length) {
            this.setState((prevState) => ({
                currentQuestion: prevState.currentQuestion + 1,
                selectedOption: "",
                timeRemaining: this.maxTime,
                showFeedback: false,
            }));
        } else {
            this.setState({ quizEnd: true });
            clearInterval(this.timer);
            this.updateHighScore();
        }
    };

    updateHighScore = () => {
        const { score, highScore } = this.state;
        if (score > highScore) {
            this.setState({ highScore: score });
        }
    };

    handlePlayAgain = () => {
        this.setState({
            currentQuestion: 0,
            selectedOption: "",
            score: 0,
            quizEnd: false,
            timeRemaining: this.maxTime,
            feedback: "",
            showFeedback: false,
            loading: true,
        });
        this.fetchQuestions();
        this.startTimer();
    };

    render() {
        const { questionBank, currentQuestion, selectedOption, score, quizEnd, timeRemaining, feedback, showFeedback, highScore, loading } = this.state;

        if (loading) {
            return <div>Loading...</div>; // Display loading while questions are being fetched
        }

        // Calculate the overall quiz progress
        const progressPercentage = (currentQuestion / questionBank.length) * 100;

        // Calculate the timer progress (percentage of remaining time)
        const timerProgress = (timeRemaining / this.maxTime) * 100;

        return (
            <div className="App d-flex flex-column align-items-center justify-content-center">
                <h1 className="app-title font-weight-bold">QUIZ APP</h1>
                {!quizEnd ? (
                    <div>
                        <h3>Time Remaining: {timeRemaining}s</h3>

                        {/* Timer Progress Bar */}
                        <div className="progress mb-2" style={{ width: "100%" }}>
                            <div
                                className="progress-bar bg-danger"
                                role="progressbar"
                                style={{ width: `${timerProgress}%` }}
                                aria-valuenow={timerProgress}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                            </div>
                        </div>

                        {/* Quiz Progress Bar */}
                        <div className="progress mb-4" style={{ width: "100%" }}>
                            <div
                                className="progress-bar"
                                role="progressbar"
                                style={{ width: `${progressPercentage}%` }}
                                aria-valuenow={progressPercentage}
                                aria-valuemin="0"
                                aria-valuemax="100"
                            >
                                {Math.floor(progressPercentage)}%
                            </div>
                        </div>

                        <Question
                            question={questionBank[currentQuestion]}
                            selectedOption={selectedOption}
                            onOptionChange={this.handleOptionChange}
                            onSubmit={this.handleFormSubmit}
                        />

                        {showFeedback && <div className="feedback mt-3">{feedback}</div>}
                    </div>
                ) : (
                    <div>
                        <Score score={score} totalQuestions={questionBank.length} />
                        <h3>High Score: {highScore}</h3>
                        <button className="btn btn-primary" onClick={this.handlePlayAgain}>
                            Play Again
                        </button>
                    </div>
                )}
            </div>
        );
    }
}

export default App;
